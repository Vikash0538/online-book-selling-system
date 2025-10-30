"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Book, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen, ShoppingCart, Store, Package, Calendar, FileText, Loader as Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.id) {
      fetchBook();
    }
  }, [params.id]);

  const fetchBook = async () => {
    const response = await api.get<Book>(`/books/${params.id}`);
    if (response.success && response.data) {
      setBook(response.data);
    } else {
      toast.error('Book not found');
      router.push('/books');
    }
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (!book) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.book._id === book._id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ book, quantity, price: book.price });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    try { window.dispatchEvent(new Event('cartUpdated')); } catch (e) {}
  toast.success(`${quantity} book(s) added to cart!`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!book) {
    return null;
  }

  const conditionColors = {
    'new': 'bg-green-100 text-green-800',
    'like-new': 'bg-blue-100 text-blue-800',
    'used': 'bg-yellow-100 text-yellow-800',
  };

  const seller = typeof book.seller === 'object' ? book.seller : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="aspect-[4/4] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center p-6 sticky top-24 overflow-hidden">
            {book.images && Array.isArray(book.images) && book.images.length > 0 ? (
              <img
                src={book.images[0]}
                alt={book.title}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <BookOpen className="h-36 w-36 md:h-48 md:w-48 text-blue-300" />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Badge className={`${conditionColors[book.condition]} mb-3`}>
              {book.condition.toUpperCase()}
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-blue-600">₹{book.price}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="text-gray-700 leading-relaxed">{book.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            {book.category && (
              <div className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{book.category}</p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-2">
              <Package className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Stock Available</p>
                <p className="font-medium">{book.stock} units</p>
              </div>
            </div>

            {book.publisher && (
              <div className="flex items-start space-x-2">
                <Store className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Publisher</p>
                  <p className="font-medium">{book.publisher}</p>
                </div>
              </div>
            )}

            {book.publicationYear && (
              <div className="flex items-start space-x-2">
                <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Publication Year</p>
                  <p className="font-medium">{book.publicationYear}</p>
                </div>
              </div>
            )}

            {book.pages && (
              <div className="flex items-start space-x-2">
                <BookOpen className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Pages</p>
                  <p className="font-medium">{book.pages}</p>
                </div>
              </div>
            )}

            {book.isbn && (
              <div className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">ISBN</p>
                  <p className="font-medium text-sm">{book.isbn}</p>
                </div>
              </div>
            )}
          </div>

          {seller && (
            <>
              <Separator />
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Seller Information</h3>
                  <p className="text-gray-600">Name: {seller.name}</p>
                  {seller.phone && <p className="text-gray-600">Phone: {seller.phone}</p>}
                </CardContent>
              </Card>
            </>
          )}

          <Separator />

          {book.stock > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          ) : (
            <Button size="lg" className="w-full" disabled>
              Out of Stock
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
