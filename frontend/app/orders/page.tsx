"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Loader as Loader2, ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    const response = await api.get<Order[]>('/orders/myorders');
    if (response.success && response.data) {
      setOrders(response.data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">No orders yet</h1>
          <p className="text-gray-600 mb-8">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Button asChild size="lg">
            <Link href="/books">Browse Books</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Order #{order._id.slice(-8)}</CardTitle>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(order.orderStatus)}>
                  {order.orderStatus.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item, index) => {
                  const book = typeof item.book === 'object' ? item.book : null;
                  return (
                    <div key={index} className="flex items-center space-x-4 pb-4 border-b last:border-0">
                      <div className="h-16 w-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="h-6 w-6 text-blue-300" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {book ? book.title : 'Book'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <p className="text-sm text-gray-600">Shipping Address</p>
                    <p className="text-sm">
                      {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                      {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold">₹{order.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
