const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getSellerBooks
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getBooks);
router.get('/:id', getBook);
router.post('/', protect, authorize('seller', 'admin'), createBook);
router.put('/:id', protect, authorize('seller', 'admin'), updateBook);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteBook);
router.get('/seller/mybooks', protect, authorize('seller', 'admin'), getSellerBooks);

module.exports = router;