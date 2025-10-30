"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface CartItem {
  book: any;
  quantity: number;
  price: number;
}

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cartData);
  };

  const updateQuantity = (bookId: string, change: number) => {
    const updatedCart = cart.map((item) => {
      if (item.book._id === bookId) {
        const newQuantity = Math.max(1, Math.min(item.book.stock, item.quantity + change));
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    try { window.dispatchEvent(new Event('cartUpdated')); } catch (e) {}
  };

  const removeItem = (bookId: string) => {
    const updatedCart = cart.filter((item) => item.book._id !== bookId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    try { window.dispatchEvent(new Event('cartUpdated')); } catch (e) {}
    toast.success('Item removed from cart');
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed with checkout');
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any books to your cart yet.
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
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.book._id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="h-24 w-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="h-10 w-10 text-blue-300" />
                  </div>

                  <div className="flex-1">
                    <Link href={`/books/${item.book._id}`}>
                      <h3 className="font-semibold text-lg hover:text-blue-600 transition">
                        {item.book.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-2">{item.book.author}</p>
                    <p className="text-lg font-bold text-gray-900">₹{item.price}</p>

                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.book._id, -1)}
                          disabled={item.quantity === 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.book._id, 1)}
                          disabled={item.quantity >= item.book.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.book._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">₹50.00</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">₹{(getTotalPrice() + 50).toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>

              <Button variant="outline" className="w-full mt-3" asChild>
                <Link href="/books">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
