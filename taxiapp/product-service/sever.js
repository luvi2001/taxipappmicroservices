require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// MongoDB Connection
mongoose.connect(`mongodb://${process.env.MONGO_PRODUCT_SERVICE_HOST}:27017/products`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Product Service DB Connected'))
.catch(err => console.log(err));

// Product Model
const Product = mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String }
}));

// Routes
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.post('/products', async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const product = new Product({ name, price, description });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`Product Service running on port ${PORT}`));