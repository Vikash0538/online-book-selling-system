const Stripe = require('stripe');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY environment variable. Stripe operations will fail.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

exports.createPaymentIntent = async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(500).json({ success: false, message: 'Stripe not configured on server. Please set STRIPE_SECRET_KEY.' });
    }

    const { amount, currency = 'inr', metadata, description, orderId, shipping_address, customer_name } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const paymentDescription = description || 'Book purchase from BookMart';

    const processedMetadata = {};
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        const value = metadata[key];
        if (typeof value === 'string') {
          processedMetadata[key] = value;
        } else {
          processedMetadata[key] = JSON.stringify(value);
        }
      });
    }
    if (orderId) {
      processedMetadata.orderId = orderId;
    }

    const paymentIntentParams = {
      amount,
      currency,
      description: paymentDescription,
      metadata: processedMetadata,
      automatic_payment_methods: { enabled: true },
    };

    const shippingAddr = shipping_address || (metadata && metadata.shipping_address);
    if (shippingAddr) {
      paymentIntentParams.shipping = {
        name: customer_name || (metadata && metadata.customer_name) || 'Customer',
        address: {
          line1: shippingAddr.street,
          city: shippingAddr.city,
          state: shippingAddr.state,
          postal_code: shippingAddr.zipCode,
          country: shippingAddr.country || 'IN'
        }
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};


exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    if (!stripe) {
      console.error('Stripe client not configured. Cannot verify webhook.');
      return res.status(500).send('Stripe not configured on server.');
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing STRIPE_WEBHOOK_SECRET. Cannot verify webhook signatures.');
      return res.status(500).send('Webhook secret not configured on server.');
    }

    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log('Processing event type:', event.type);
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;

        await Payment.findOneAndUpdate(
          { provider: 'stripe', providerPaymentId: pi.id },
          {
            provider: 'stripe',
            providerPaymentId: pi.id,
            amount: pi.amount_received || pi.amount,
            currency: pi.currency,
            status: pi.status,
            method: pi.payment_method_types ? pi.payment_method_types[0] : undefined,
            raw: pi,
            metadata: pi.metadata || {}
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (pi.metadata && pi.metadata.orderId) {
          const orderId = pi.metadata.orderId;
          const order = await Order.findById(orderId);
          if (order && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = new Date();
            order.paymentResult = {
              id: pi.id,
              status: pi.status,
              update_time: new Date().toISOString(),
              email_address: (pi.charges && pi.charges.data[0] && pi.charges.data[0].billing_details && pi.charges.data[0].billing_details.email) || ''
            };
            await order.save();
          }
        }

        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        await Payment.findOneAndUpdate(
          { provider: 'stripe', providerPaymentId: pi.id },
          {
            provider: 'stripe',
            providerPaymentId: pi.id,
            amount: pi.amount || 0,
            currency: pi.currency,
            status: pi.status,
            raw: pi,
            metadata: pi.metadata || {}
          },
          { upsert: true }
        );
        break;
      }
      case 'charge.succeeded': {
        const ch = event.data.object;
        await Payment.findOneAndUpdate(
          { provider: 'stripe', providerPaymentId: ch.payment_intent || ch.id },
          {
            provider: 'stripe',
            providerPaymentId: ch.payment_intent || ch.id,
            amount: ch.amount || 0,
            currency: ch.currency,
            status: ch.status,
            receipt_url: ch.receipt_url,
            raw: ch,
            metadata: ch.metadata || {}
          },
          { upsert: true }
        );

        console.log('Charge succeeded for payment_intent:', ch, ch.payment_intent, ch.metadata);
        if (ch.metadata && ch.metadata.orderId) {
          try {
            const orderId = ch.metadata.orderId;
            const order = await Order.findById(orderId);
            if (order) {
              if (!order.isPaid) {
                order.isPaid = true;
                order.paidAt = new Date();
              }

              order.paymentResult = order.paymentResult || {};
              order.paymentResult.receipt_url = ch.receipt_url || order.paymentResult.receipt_url;
              order.paymentResult.id = order.paymentResult.id || (ch.payment_intent || ch.id);
              order.paymentResult.status = order.paymentResult.status || ch.status;

              await order.save();
            }
          } catch (err) {
            console.error('Failed to update order with receipt URL:', err);
          }
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (err) {
    console.error('Error processing webhook event:', err);
    return res.status(500).send('Internal Server Error');
  }

  res.json({ received: true });
};
