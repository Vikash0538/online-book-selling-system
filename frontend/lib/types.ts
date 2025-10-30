export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  createdAt: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  condition: 'new' | 'used' | 'like-new';
  category: string;
  stock: number;
  seller: User | string;
  images?: string[];
  isbn?: string;
  publisher?: string;
  publicationYear?: number;
  pages?: number;
  language?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  book: Book | string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  user: User | string;
  orderItems: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  totalPrice: number;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  isPaid: boolean;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
