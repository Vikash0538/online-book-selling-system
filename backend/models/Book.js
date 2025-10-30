const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a book title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Please provide author name'],
    trim: true
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'acceptable', 'poor'],
    required: [true, 'Please specify book condition']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: [
      'Fiction',
      'Non-Fiction',
      'Science',
      'Technology',
      'History',
      'Biography',
      'Self-Help',
      'Business',
      'Comics',
      'Children'
    ]
  },
  language: {
    type: String,
    default: 'English'
  },
  publisher: {
    type: String,
    trim: true
  },
  publicationYear: {
    type: Number,
    min: [1900, 'Publication year must be after 1900'],
    max: [new Date().getFullYear(), 'Publication year cannot be in the future']
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1']
  },
  images: [{
    type: String
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 1,
    min: [0, 'Stock cannot be negative']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

bookSchema.index({ title: 'text', author: 'text', description: 'text' });

module.exports = mongoose.model('Book', bookSchema);