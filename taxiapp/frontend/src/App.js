import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import axios from 'axios';

// Set the base URL for API requests
axios.defaults.baseURL = 'http://localhost:4000';

function App() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: ''
  });

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  // Handle register
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      setUser({ id: res.data.userId });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', loginData);
      localStorage.setItem('token', res.data.token);
      setUser({ id: res.data.userId });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle add product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/products', productForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProducts([...products, res.data]);
      setProductForm({ name: '', price: '', description: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/">Home</Link>
          {!user ? (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </>
          ) : (
            <button onClick={() => {
              localStorage.removeItem('token');
              setUser(null);
            }}>Logout</button>
          )}
        </nav>

        <Route path="/" exact>
          <h1>Products</h1>
          <ul>
            {products.map(product => (
              <li key={product._id}>
                <h3>{product.name}</h3>
                <p>${product.price}</p>
                <p>{product.description}</p>
              </li>
            ))}
          </ul>

          {user && (
            <form onSubmit={handleAddProduct}>
              <h2>Add Product</h2>
              <input
                type="text"
                placeholder="Name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
              <button type="submit">Add Product</button>
            </form>
          )}
        </Route>

        <Route path="/register">
          <h1>Register</h1>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button type="submit">Register</button>
          </form>
        </Route>

        <Route path="/login">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
            <button type="submit">Login</button>
          </form>
        </Route>
      </div>
    </Router>
  );
}

export default App;