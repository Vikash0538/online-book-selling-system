"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BookCard from '@/components/shared/BookCard';
import { api } from '@/lib/api';
import { Book, PaginatedResponse } from '@/lib/types';
import { Search, BookOpen, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const categories: string[] = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Technology',
  'History',
  'Biography',
  'Self-Help',
  'Business',
  'Comics',
  'Children',
];

export default function HomePage() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedBooks();
  }, []);

  const fetchFeaturedBooks = async () => {
    const response = await api.get<PaginatedResponse<Book> | Book[]>('/books?limit=8&sort=-createdAt');
    if (response.success && response.data) {
      if (Array.isArray(response.data)) {
        setFeaturedBooks(response.data as Book[]);
      } else if ((response.data as any).data) {
        setFeaturedBooks((response.data as any).data as Book[]);
      } else {
        setFeaturedBooks(response.data as unknown as Book[]);
      }
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/books?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleAddToCart = (book: Book) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.book._id === book._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ book, quantity: 1, price: book.price });
    }

  localStorage.setItem('cart', JSON.stringify(cart));
  try { window.dispatchEvent(new Event('cartUpdated')); } catch (e) {}
  toast.success('Book added to cart!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                Discover, Buy & Sell Books
              </h1>
              <p className="text-lg text-gray-600 max-w-xl">
                India’s friendliest marketplace for book lovers — find your next read or
                turn your shelf into cash. Fast listing, trusted community, and great prices.
              </p>

              <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
                <Input
                  type="text"
                  placeholder="Search books, authors or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-14 rounded-lg shadow-sm"
                />
                <Button type="submit" size="lg" className="h-14">
                  <Search className="h-5 w-5" />
                </Button>
              </form>

              <div className="flex items-center space-x-4">
                <Button asChild>
                  <Link href="/books">Browse Books</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/seller/add-book">Sell a Book</Link>
                </Button>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Browse by category</h4>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/books?category=${encodeURIComponent(cat)}`}
                      className="px-3 py-1.5 bg-white text-sm rounded-full shadow-sm text-gray-700 hover:shadow-md whitespace-nowrap"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Thousands of titles</h3>
                    <p className="mt-2 text-blue-100">Curated picks updated daily</p>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-36 h-36 rounded-lg bg-white/10">
                    <BookOpen className="h-12 w-12 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h4 className="font-semibold">Easy Listings</h4>
                    <p className="text-sm text-blue-100 mt-1">List in minutes and manage your inventory</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h4 className="font-semibold">Trusted Buyers</h4>
                    <p className="text-sm text-blue-100 mt-1">Secure transactions & community reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 -mt-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Books</h2>
            <Button variant="outline" asChild>
              <Link href="/books">View All</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 animate-pulse shadow-sm">
                  <div className="aspect-[3/4] bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : featuredBooks && featuredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <div key={book._id} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                  <BookCard book={book} onAddToCart={handleAddToCart} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No featured books available right now.</p>
            </div>
          )}
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-lg">Search & Discover</h3>
              <p className="text-sm text-gray-600 mt-2">Find books by title, author or category with powerful filters and curated picks.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-lg">Buy with Confidence</h3>
              <p className="text-sm text-gray-600 mt-2">Secure payments, verified sellers and easy returns for a trusted purchase experience.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-lg">Sell Your Books</h3>
              <p className="text-sm text-gray-600 mt-2">List your books quickly with great visibility and fast payouts to sellers.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">Ready to share your books?</h3>
            <p className="text-indigo-100/80 mt-2">Create a seller account and reach thousands of buyers.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/register">Create Account</Link>
            </Button>
            <Button variant="outline" className="border-white text-black" asChild>
              <Link href="/seller/add-book">List a Book</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
