"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  ShoppingCart,
  User,
  LogOut,
  Package,
  LayoutDashboard,
  Menu
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(Array.isArray(cart) ? cart.reduce((s: number, item: any) => s + (item.quantity || 0), 0) : 0);
      } catch (e) {
        setCartCount(0);
      }

      const storageHandler = (e: StorageEvent) => {
        if (e.key === 'cart') {
          try {
            const cart = JSON.parse(e.newValue || '[]');
            setCartCount(Array.isArray(cart) ? cart.reduce((s: number, item: any) => s + (item.quantity || 0), 0) : 0);
          } catch (err) {
            setCartCount(0);
          }
        }
      };

      const cartUpdatedHandler = () => {
        try {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          setCartCount(Array.isArray(cart) ? cart.reduce((s: number, item: any) => s + (item.quantity || 0), 0) : 0);
        } catch (err) {
          setCartCount(0);
        }
      };

      window.addEventListener('storage', storageHandler);
      window.addEventListener('cartUpdated', cartUpdatedHandler as EventListener);
      return () => {
        window.removeEventListener('storage', storageHandler);
        window.removeEventListener('cartUpdated', cartUpdatedHandler as EventListener);
      };
    }
  }, []);

  const showAuthButtons = !isAuthenticated && pathname !== '/login' && pathname !== '/register';

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="rounded-md bg-gradient-to-br from-blue-50 to-indigo-50 p-1">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <span className="text-xl font-semibold text-gray-900">BookMart</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/books"
              className={`text-sm transition px-2 py-1 rounded ${pathname === '/books' ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700 hover:text-blue-600'}`}
            >
              Browse
            </Link>

            {user?.role === 'seller' && (
              <Link
                href="/seller/dashboard"
                className={`text-sm transition px-2 py-1 rounded ${pathname?.startsWith('/seller') ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700 hover:text-blue-600'}`}
              >
                Dashboard
              </Link>
            )}

            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-gray-700 hover:text-blue-600" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 inline-flex items-center justify-center w-5 h-5 rounded-full bg-black text-white text-xs font-medium border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'seller' && (
                    <DropdownMenuItem asChild>
                      <Link href="/seller/dashboard" className="cursor-pointer flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Seller Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              showAuthButtons ? (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </div>
              ) : null
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-6">
                <Link href="/books" className="text-lg py-2" onClick={() => setOpen(false)}>
                  Browse
                </Link>
                <Link href="/cart" className="text-lg py-2 flex items-center" onClick={() => setOpen(false)}>
                  Cart
                  {cartCount > 0 && (
                    <span className="ml-3 inline-flex items-center justify-center w-5 h-5 rounded-full bg-black text-white text-xs font-medium">
                      {cartCount}
                    </span>
                  )}
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link href="/profile" className="text-lg py-2" onClick={() => setOpen(false)}>
                      Profile
                    </Link>
                    <Link href="/orders" className="text-lg py-2" onClick={() => setOpen(false)}>
                      My Orders
                    </Link>
                    {user?.role === 'seller' && (
                      <Link href="/seller/dashboard" className="text-lg py-2" onClick={() => setOpen(false)}>
                        Seller Dashboard
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  showAuthButtons ? (
                    <>
                      <Button variant="outline" asChild>
                        <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/register" onClick={() => setOpen(false)}>Sign Up</Link>
                      </Button>
                    </>
                  ) : null
                  )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
