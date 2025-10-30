const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDatabase = async () => {
  try {
    await User.deleteMany();
    await Book.deleteMany();
    await Order.deleteMany();

    console.log('Cleared existing data...');

    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@bookstore.com',
        password: 'admin123',
        role: 'admin',
        phone: '9876543210',
        isVerified: true
      },
      {
        name: 'John Seller',
        email: 'seller@bookstore.com',
        password: 'seller123',
        role: 'seller',
        phone: '9876543211',
        address: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        isVerified: true
      },
      {
        name: 'Jane Buyer',
        email: 'buyer@bookstore.com',
        password: 'buyer123',
        role: 'buyer',
        phone: '9876543212',
        address: {
          street: '456 Park Ave',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India'
        },
        isVerified: true
      },
      {
        name: 'Sarah Seller',
        email: 'sarah@bookstore.com',
        password: 'sarah123',
        role: 'seller',
        phone: '9876543213',
        isVerified: true
      }
    ]);

    console.log('Users created...');

    const books = await Book.create([
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        description: 'A classic American novel set in the Jazz Age, exploring themes of decadence, idealism, and social upheaval.',
        price: 299,
        condition: 'new',
        category: 'Fiction',
        language: 'English',
        publisher: 'Scribner',
        publicationYear: 1925,
        pages: 180,
        seller: users[1]._id,
        stock: 15,
  images: ['https://picsum.photos/seed/the-great-gatsby/400/600'],
        ratings: { average: 4.5, count: 120 }
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780061120084',
        description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
        price: 350,
        condition: 'like-new',
        category: 'Fiction',
        language: 'English',
        publisher: 'Harper Perennial',
        publicationYear: 1960,
        pages: 324,
        seller: users[1]._id,
        stock: 10,
  images: ['https://picsum.photos/seed/to-kill-a-mockingbird/400/600'],
        ratings: { average: 4.8, count: 250 }
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451524935',
        description: 'A dystopian social science fiction novel and cautionary tale about totalitarianism.',
        price: 275,
        condition: 'good',
        category: 'Fiction',
        language: 'English',
        publisher: 'Signet Classic',
        publicationYear: 1949,
        pages: 328,
        seller: users[3]._id,
        stock: 8,
  images: ['https://picsum.photos/seed/1984/400/600'],
        ratings: { average: 4.6, count: 180 }
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        description: 'A handbook of agile software craftsmanship. Essential reading for any developer.',
        price: 899,
        condition: 'new',
        category: 'Technology',
        language: 'English',
        publisher: 'Prentice Hall',
        publicationYear: 2008,
        pages: 464,
        seller: users[1]._id,
        stock: 20,
  images: ['https://picsum.photos/seed/clean-code/400/600'],
        ratings: { average: 4.7, count: 95 }
      },
      {
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        isbn: '9780262033848',
        description: 'Comprehensive introduction to algorithms and data structures. Perfect for computer science students.',
        price: 1299,
        condition: 'new',
        category: 'Technology',
        language: 'English',
        publisher: 'MIT Press',
        publicationYear: 2009,
        pages: 1312,
        seller: users[3]._id,
        stock: 12,
  images: ['https://picsum.photos/seed/introduction-to-algorithms/400/600'],
        ratings: { average: 4.9, count: 150 }
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt, David Thomas',
        isbn: '9780135957059',
        description: 'Your journey to mastery in software development. Timeless best practices.',
        price: 799,
        condition: 'like-new',
        category: 'Technology',
        language: 'English',
        publisher: 'Addison-Wesley',
        publicationYear: 2019,
        pages: 352,
        seller: users[1]._id,
        stock: 7,
  images: ['https://picsum.photos/seed/the-pragmatic-programmer/400/600'],
        ratings: { average: 4.8, count: 88 }
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        isbn: '9780062316110',
        description: 'An exploration of how Homo sapiens came to dominate the world.',
        price: 499,
        condition: 'new',
        category: 'History',
        language: 'English',
        publisher: 'Harper',
        publicationYear: 2015,
        pages: 443,
        seller: users[3]._id,
        stock: 18,
  images: ['https://picsum.photos/seed/sapiens/400/600'],
        ratings: { average: 4.6, count: 320 }
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        isbn: '9780735211292',
        description: 'An easy and proven way to build good habits and break bad ones.',
        price: 399,
        condition: 'new',
        category: 'Self-Help',
        language: 'English',
        publisher: 'Avery',
        publicationYear: 2018,
        pages: 320,
        seller: users[1]._id,
        stock: 25,
  images: ['https://picsum.photos/seed/atomic-habits/400/600'],
        ratings: { average: 4.7, count: 410 }
      },
      {
        title: 'Harry Potter and the Philosopher\'s Stone',
        author: 'J.K. Rowling',
        isbn: '9780439708180',
        description: 'The first book in the magical Harry Potter series.',
        price: 450,
        condition: 'good',
        category: 'Children',
        language: 'English',
        publisher: 'Scholastic',
        publicationYear: 1997,
        pages: 309,
        seller: users[3]._id,
        stock: 14,
  images: ['https://picsum.photos/seed/harry-potter-philosophers-stone/400/600'],
        ratings: { average: 4.9, count: 500 }
      },
      {
        title: 'The Art of Computer Programming',
        author: 'Donald E. Knuth',
        isbn: '9780201896831',
        description: 'The bible of computer programming. Comprehensive and authoritative.',
        price: 2499,
        condition: 'new',
        category: 'Technology',
        language: 'English',
        publisher: 'Addison-Wesley',
        publicationYear: 2011,
        pages: 672,
        seller: users[1]._id,
        stock: 5,
  images: ['https://picsum.photos/seed/art-of-computer-programming/400/600'],
        ratings: { average: 4.8, count: 65 }
      },
      {
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        isbn: '9780374533557',
        description: 'A groundbreaking tour of the mind explaining the two systems that drive the way we think.',
        price: 549,
        condition: 'like-new',
        category: 'Non-Fiction',
        language: 'English',
        publisher: 'Farrar, Straus and Giroux',
        publicationYear: 2011,
        pages: 499,
        seller: users[3]._id,
        stock: 9,
  images: ['https://picsum.photos/seed/thinking-fast-and-slow/400/600'],
        ratings: { average: 4.5, count: 220 }
      },
      {
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        isbn: '9780062315007',
        description: 'A magical fable about following your dreams and listening to your heart.',
        price: 299,
        condition: 'acceptable',
        category: 'Fiction',
        language: 'English',
        publisher: 'HarperOne',
        publicationYear: 1988,
        pages: 208,
        seller: users[1]._id,
        stock: 11,
  images: ['https://picsum.photos/seed/the-alchemist/400/600'],
        ratings: { average: 4.3, count: 380 }
      },
      {
        title: 'Steve Jobs',
        author: 'Walter Isaacson',
        isbn: '9781451648539',
        description: 'The exclusive biography of Steve Jobs, based on extensive interviews.',
        price: 699,
        condition: 'new',
        category: 'Biography',
        language: 'English',
        publisher: 'Simon & Schuster',
        publicationYear: 2011,
        pages: 656,
        seller: users[3]._id,
        stock: 13,
  images: ['https://picsum.photos/seed/steve-jobs/400/600'],
        ratings: { average: 4.6, count: 175 }
      },
      {
        title: 'The Lean Startup',
        author: 'Eric Ries',
        isbn: '9780307887894',
        description: 'How today\'s entrepreneurs use continuous innovation to create radically successful businesses.',
        price: 499,
        condition: 'good',
        category: 'Business',
        language: 'English',
        publisher: 'Crown Business',
        publicationYear: 2011,
        pages: 336,
        seller: users[1]._id,
        stock: 16,
  images: ['https://picsum.photos/seed/the-lean-startup/400/600'],
        ratings: { average: 4.4, count: 140 }
      },
      {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        isbn: '9780547928227',
        description: 'A great modern classic and the prelude to The Lord of the Rings.',
        price: 399,
        condition: 'new',
        category: 'Fiction',
        language: 'English',
        publisher: 'Mariner Books',
        publicationYear: 1937,
        pages: 366,
        seller: users[3]._id,
        stock: 19,
  images: ['https://picsum.photos/seed/the-hobbit/400/600'],
        ratings: { average: 4.7, count: 290 }
      }
    ]);

    console.log('Books created...');

    console.log('\n========================================');
    console.log('Database seeded successfully!');
    console.log('========================================');
    console.log('\nTest Users Created:');
    console.log('-------------------');
    console.log('1. Admin:');
    console.log('   Email: admin@bookstore.com');
    console.log('   Password: admin123');
    console.log('\n2. Seller:');
    console.log('   Email: seller@bookstore.com');
    console.log('   Password: seller123');
    console.log('\n3. Buyer:');
    console.log('   Email: buyer@bookstore.com');
    console.log('   Password: buyer123');
    console.log('\n4. Another Seller:');
    console.log('   Email: sarah@bookstore.com');
    console.log('   Password: sarah123');
    console.log('\nTotal Books Created: ' + books.length);
    console.log('Total Orders Created: 1');
    console.log('========================================\n');

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();