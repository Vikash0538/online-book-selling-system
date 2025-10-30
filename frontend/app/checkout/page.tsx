"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader as Loader2, CreditCard, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface CartItem {
  book: any;
  quantity: number;
  price: number;
}

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    paymentMethod: 'card',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartData.length === 0) {
      router.push('/cart');
      return;
    }
    setCart(cartData);
  }, [isAuthenticated]);

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getShipping = () => 50;

  const getTotal = () => getSubtotal() + getShipping();

  function CardPaymentForm({ onSuccess }: { onSuccess: (paymentResult: any) => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [cardError, setCardError] = useState<string | null>(null);
    const [cardComplete, setCardComplete] = useState(false);

    const validateForm = () => {
      if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
        toast.error('Please fill in all shipping address fields');
        return false;
      }
      if (!cardComplete) {
        toast.error('Please enter complete card details');
        return false;
      }
      return true;
    };

    const handlePayButtonClick = () => {
      if (!validateForm()) return;
      setShowConfirmDialog(true);
    };

    const handleCardPayment = async () => {
      if (!stripe || !elements) {
        toast.error('Payment system not ready');
        return;
      }

      setProcessing(true);
      setShowConfirmDialog(false);

      try {
        const amountInPaise = Math.round(getTotal() * 100);
        
        const bookTitles = cart.map(item => item.book.title).slice(0, 3); 
        const description = cart.length > 3 
          ? `Book purchase - ${bookTitles.join(', ')} and ${cart.length - 3} more books`
          : `Book purchase - ${bookTitles.join(', ')}`;
        
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const requestBody = {
          amount: amountInPaise,
          currency: 'inr',
          description: description.substring(0, 200),
          orderId,
          customer_name: user?.name || user?.email || 'Guest',
          shipping_address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          }
        };
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create payment intent');

        const clientSecret = data.clientSecret || data.client_secret || data.data?.clientSecret;
        if (!clientSecret) throw new Error('No client secret from server');

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error('Card element not found');

        const confirmRes = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { 
            card: cardElement, 
            billing_details: { 
              name: user?.name || user?.email,
              address: {
                line1: formData.street,
                city: formData.city,
                state: formData.state,
                postal_code: formData.zipCode,
                country: 'IN'
              }
            } 
          },
        });

        if (confirmRes.error) {
          throw new Error(confirmRes.error.message || 'Payment confirmation failed');
        }

        if (confirmRes.paymentIntent && confirmRes.paymentIntent.status === 'succeeded') {
          const charge = (confirmRes.paymentIntent as any).charges?.data?.[0];
          const receiptUrl = charge?.receipt_url || charge?.receiptUrl || null;
          toast.success('Payment successful!');
          onSuccess({ id: confirmRes.paymentIntent.id, status: confirmRes.paymentIntent.status, receiptUrl, charge });
        } else {
          throw new Error('Payment not successful');
        }
      } catch (err: any) {
        toast.error(err.message || 'Payment failed');
      } finally {
        setProcessing(false);
      }
    };

    const cardElementOptions = {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
          padding: '12px',
        },
        invalid: {
          color: '#9e2146',
        },
      },
      hidePostalCode: true,
    };

    return (
      <>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Secure Payment</span>
            </div>
            <p className="text-xs text-blue-700">Your payment information is encrypted and secure</p>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Card Details
            </Label>
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <CardElement 
                options={cardElementOptions}
                onChange={(event) => {
                  setCardError(event.error ? event.error.message : null);
                  setCardComplete(event.complete);
                }}
              />
            </div>
            {cardError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {cardError}
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount</span>
              <span className="text-green-600">₹{getTotal().toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Including shipping charges</p>
          </div>

          <Button 
            type="button" 
            onClick={handlePayButtonClick} 
            disabled={!stripe || processing || !cardComplete} 
            className="w-full h-12 text-lg"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Pay ₹{getTotal().toFixed(2)}
              </>
            )}
          </Button>
        </div>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>You are about to pay <strong>₹{getTotal().toFixed(2)}</strong> for your book order.</p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p><strong>Items:</strong> {cart.length} book(s)</p>
                  <p><strong>Shipping to:</strong> {formData.city}, {formData.state}</p>
                  <p><strong>Payment method:</strong> Credit/Debit Card</p>
                </div>
                <p className="text-xs text-gray-600">
                  By confirming, you agree to proceed with the payment. This action cannot be undone.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleCardPayment}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? 'Processing...' : 'Confirm Payment'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      orderItems: cart.map((item) => ({
        book: item.book._id,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      },
      paymentMethod: formData.paymentMethod,
      totalPrice: getTotal(),
    };

    const response = await api.post('/orders', orderData);

    if (response.success) {
      localStorage.removeItem('cart');
      toast.success('Order placed successfully!');
      router.push('/orders');
    } else {
      toast.error(response.message || 'Failed to place order');
    }

    setLoading(false);
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="netbanking">Net Banking</SelectItem>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.paymentMethod === 'card' ? (
                  <Elements stripe={stripePromise}>
                      <CardPaymentForm
                      onSuccess={async (paymentResult) => {
                        const orderData = {
                          orderItems: cart.map((item) => ({ book: item.book._id, quantity: item.quantity, price: item.price })),
                          shippingAddress: {
                            street: formData.street,
                            city: formData.city,
                            state: formData.state,
                            zipCode: formData.zipCode,
                            country: formData.country,
                          },
                          paymentMethod: formData.paymentMethod,
                          totalPrice: getTotal(),
                          paymentResult,
                        } as any;

                        setLoading(true);
                        const response = await api.post('/orders', orderData);
                        if (response.success) {
                          localStorage.removeItem('cart');
                          try { window.dispatchEvent(new Event('cartUpdated')); } catch (e) {}
                          setCart([]);
                          const receiptUrl = paymentResult?.receiptUrl || paymentResult?.charge?.receipt_url || paymentResult?.charge?.receiptUrl;
                          if (receiptUrl) {
                            try { window.open(receiptUrl, '_blank'); } catch (e) {}
                            toast.success(
                              'Order placed successfully! Receipt opened in a new tab.'
                            );
                          } else {
                            toast.success('Order placed successfully!');
                          }
                          router.push('/orders');
                        } else {
                          toast.error(response.message || 'Failed to place order');
                        }
                        setLoading(false);
                      }}
                    />
                  </Elements>
                ) : (
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.book._id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.book.title} x {item.quantity}
                      </span>
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">₹{getShipping().toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">₹{getTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
