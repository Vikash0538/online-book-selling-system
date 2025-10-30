"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Book } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, CreditCard as Edit, Trash2, Package, DollarSign, BookOpen, Loader as Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SellerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'seller' && user.role !== 'admin') {
        toast.error('Access denied. Only sellers can access this page.');
        router.push('/');
      } else {
        fetchBooks();
      }
    }
  }, [user, authLoading]);

  const fetchBooks = async () => {
    const response = await api.get<Book[]>('/books/seller/mybooks');
    if (response.success && response.data) {
      setBooks(response.data);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteBookId) return;

    const response = await api.delete(`/books/${deleteBookId}`);
    if (response.success) {
      toast.success('Book deleted successfully');
      setBooks(books.filter((book) => book._id !== deleteBookId));
    } else {
      toast.error(response.message || 'Failed to delete book');
    }
    setDeleteBookId(null);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalBooks = books.length;
  const totalStock = books.reduce((sum, book) => sum + book.stock, 0);
  const totalValue = books.reduce((sum, book) => sum + book.price * book.stock, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <Button asChild>
          <Link href="/seller/add-book">
            <Plus className="mr-2 h-4 w-4" />
            Add New Book
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBooks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Books</CardTitle>
        </CardHeader>
        <CardContent>
          {books?.length > 0 ? (
            <div className="space-y-4">
              {books.map((book) => (
                <div
                  key={book._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="h-16 w-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-blue-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{book.title}</h3>
                      <p className="text-sm text-gray-600">{book.author}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={book.stock > 0 ? 'default' : 'destructive'}>
                          Stock: {book.stock}
                        </Badge>
                        <Badge variant="outline">₹{book.price}</Badge>
                        <Badge variant="secondary">{book.condition}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/seller/edit-book/${book._id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteBookId(book._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-4">No books listed yet</p>
              <Button asChild>
                <Link href="/seller/add-book">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Book
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteBookId} onOpenChange={() => setDeleteBookId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the book from your listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
