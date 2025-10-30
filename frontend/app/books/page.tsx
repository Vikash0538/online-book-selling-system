"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BookCard from '@/components/shared/BookCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Book, PaginatedResponse } from '@/lib/types';
import { Search, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
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

const conditions = ['new', 'like-new', 'good', 'acceptable', 'poor'];

export default function BooksPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    condition: 'all',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchBooks();
  }, [filters, pagination.page, user]);

  const fetchBooks = async () => {
    setLoading(true);
    const queryParams = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
      sort: filters.sort,
    });

    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category && filters.category !== 'all') queryParams.append('category', filters.category);
    if (filters.condition && filters.condition !== 'all') queryParams.append('condition', filters.condition);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);

    const response = await api.get<PaginatedResponse<Book>>(`/books?${queryParams}`);
    if (response.success && response.data) {
      let fetched: Book[] = [];

      if (Array.isArray(response.data)) {
        fetched = response.data as Book[];
      } else if ((response.data as any).data) {
        fetched = (response.data as any).data as Book[];
      }

      if (user && (user.role === 'seller' || user.role === 'admin')) {
        const myResp = await api.get<Book[]>('/books/seller/mybooks');
        if (myResp.success && myResp.data) {
          const myBooks: Book[] = Array.isArray(myResp.data)
            ? (myResp.data as Book[])
            : ((myResp.data as any).data as Book[]) || [];
          const ids = new Set(myBooks.map((b: Book) => b._id));
          const merged = [...myBooks, ...fetched.filter((b: Book) => !ids.has(b._id))];
          fetched = merged;
        }
      }

      setBooks(fetched);

      if (!(Array.isArray(response.data)) && (response.data as any).pagination) {
        const paginationData = (response.data as any).pagination;
        setPagination((prev) => ({ ...prev, ...paginationData }));
      }
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchBooks();
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Books</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search books..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.condition}
              onValueChange={(value) => setFilters({ ...filters, condition: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                {conditions.map((cond) => (
                  <SelectItem key={cond} value={cond}>
                    {cond}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />

            <Input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />

            <Select
              value={filters.sort}
              onValueChange={(value) => setFilters({ ...filters, sort: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-createdAt">Newest First</SelectItem>
                <SelectItem value="createdAt">Oldest First</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="-price">Price: High to Low</SelectItem>
                <SelectItem value="title">Title: A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : books?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book._id} book={book} onAddToCart={handleAddToCart} />
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No books found</p>
        </div>
      )}
    </div>
  );
}
