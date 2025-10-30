# Online Book Purchasing and Selling Platform - Backend

## Project Overview
This is the backend API for an online book purchasing and selling platform built with Node.js, Express, and MongoDB.

## Features
- User authentication (Register/Login)
- JWT-based authorization
- Role-based access control (Buyer, Seller, Admin)
- Book CRUD operations
- Order management
- Search and filter books
- User profile management

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Encryption**: bcryptjs
- **Environment Variables**: dotenv

## Project Structure
```
backend/
├── controllers/
│   ├── authController.js
│   ├── bookController.js
│   ├── orderController.js
│   └── userController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   ├── Book.js
│   └── Order.js
├── routes/
│   ├── auth.js
│   ├── books.js
│   ├── orders.js
│   └── users.js
├── .env.example
├── server.js
├── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

4. **Start the server**
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/me` | Get current user | Private |
| PUT | `/updatedetails` | Update user details | Private |
| PUT | `/updatepassword` | Update password | Private |

### Book Routes (`/api/books`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all books (with filters) | Public |
| GET | `/:id` | Get single book | Public |
| POST | `/` | Create new book | Seller/Admin |
| PUT | `/:id` | Update book | Seller/Admin |
| DELETE | `/:id` | Delete book | Seller/Admin |
| GET | `/seller/mybooks` | Get seller's books | Seller/Admin |

### Order Routes (`/api/orders`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create new order | Private |
| GET | `/myorders` | Get user's orders | Private |
| GET | `/:id` | Get order by ID | Private |
| GET | `/` | Get all orders | Admin |
| PUT | `/:id/status` | Update order status | Admin/Seller |

### User Routes (`/api/users`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all users | Admin |
| GET | `/:id` | Get single user | Admin |
| PUT | `/:id` | Update user | Admin |
| DELETE | `/:id` | Delete user | Admin |

## Request Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer",
  "phone": "1234567890"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Book (Seller)
```bash
POST /api/books
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "description": "A classic novel",
  "price": 299,
  "condition": "new",
  "category": "Fiction",
  "stock": 10,
  "publisher": "Scribner",
  "publicationYear": 1925,
  "pages": 180
}
```

### Get Books with Filters
```bash
GET /api/books?category=Fiction&minPrice=100&maxPrice=500&sort=-price&page=1&limit=10
```

### Create Order
```bash
POST /api/orders
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "orderItems": [
    {
      "book": "book_id_here",
      "quantity": 2,
      "price": 299
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "card",
  "totalPrice": 598
}
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. After login/register, you'll receive a token. Include it in your requests:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling
All errors return a JSON response:
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (development only)"
}
```

## Security Features
- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based authorization
- Input validation
- CORS enabled

## Testing
```bash
npm test
```

## Deployment

### Heroku
```bash
heroku create your-app-name
git push heroku main
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
```

### AWS/DigitalOcean
1. Set up your server
2. Install Node.js and MongoDB
3. Clone your repository
4. Install dependencies
5. Set environment variables
6. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name bookstore-api
```

## Future Enhancements
- File upload for book images
- Payment gateway integration
- Email notifications
- Review and rating system
- Wishlist functionality
- Advanced search with Elasticsearch
- Caching with Redis
- API rate limiting

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License

## Contact
For any queries, please contact: your-email@example.com