import Link from 'next/link';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">BookMart</span>
            </div>
            <p className="text-sm">
              Your one-stop platform for buying and selling books online.
              Find your next great read or sell your old books easily.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/books" className="hover:text-blue-400 transition">
                  Browse Books
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-400 transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">For Sellers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register" className="hover:text-blue-400 transition">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="hover:text-blue-400 transition">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/seller-guide" className="hover:text-blue-400 transition">
                  Seller Guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span>support@bookmart.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span>123 Book Street, Library City, 110001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} BookMart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
