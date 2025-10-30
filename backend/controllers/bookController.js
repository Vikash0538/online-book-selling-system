const Book = require('../models/Book');

exports.getBooks = async (req, res) => {
  try {
    const { 
      category, 
      condition, 
      minPrice, 
      maxPrice, 
      search, 
      sort,
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (condition) {
      query.condition = condition;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    query.isAvailable = true;

    let sortOption = {};
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      sortOption[sortField] = sortOrder;
    } else {
      sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const books = await Book.find(query)
      .populate('seller', 'name email')
      .sort(sortOption)
      .limit(Number(limit))
      .skip(skip);

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error.message
    });
  }
};

exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('seller', 'name email phone');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    book.views += 1;
    await book.save();

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching book',
      error: error.message
    });
  }
};

exports.createBook = async (req, res) => {
  try {
    req.body.seller = req.user.id;

    const book = await Book.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating book',
      error: error.message
    });
  }
};

exports.updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (book.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this book'
      });
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error.message
    });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (book.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this book'
      });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
};

exports.getSellerBooks = async (req, res) => {
  try {
    const books = await Book.find({ seller: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching seller books',
      error: error.message
    });
  }
};