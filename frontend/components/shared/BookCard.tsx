import Link from 'next/link';
import { Book } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ShoppingCart } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onAddToCart?: (book: Book) => void;
}

export default function BookCard({ book, onAddToCart }: BookCardProps) {
  const conditionColors = {
    'new': 'bg-green-100 text-green-800',
    'like-new': 'bg-blue-100 text-blue-800',
    'used': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <div className="aspect-[4/4] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4 overflow-hidden">
        {book.images && Array.isArray(book.images) && book.images.length > 0 ? (
          <img
            src={book.images[0]}
            alt={book.title}
            className="w-full h-full object-contain rounded"
          />
        ) : (
          <BookOpen className="h-20 w-20 md:h-24 md:w-24 text-blue-300" />
        )}
      </div>

      <CardContent className="flex-1 p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge className={conditionColors[book.condition]}>
            {book.condition}
          </Badge>
          {book.stock < 5 && book.stock > 0 && (
            <Badge variant="outline" className="text-orange-600">
              Only {book.stock} left
            </Badge>
          )}
        </div>

        <Link href={`/books/${book._id}`}>
          <h3 className="font-semibold text-lg line-clamp-2 hover:text-blue-600 transition mb-1">
            {book.title}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 mb-2">{book.author}</p>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {book.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            ₹{book.price}
          </span>
          {book.category && (
            <Badge variant="secondary">{book.category}</Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {book.stock > 0 ? (
          <Button
            className="w-full"
            onClick={() => onAddToCart?.(book)}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        ) : (
          <Button className="w-full" disabled>
            Out of Stock
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
