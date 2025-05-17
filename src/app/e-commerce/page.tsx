'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShoppingCart, 
  FaFilter, 
  FaSearch, 
  FaStar, 
  FaDatabase,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaHeart,
  FaRegHeart,
  FaMinus,
  FaPlus,
  FaTrash,
  FaSpinner
} from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  reviews: number;
  featured: boolean;
  discount?: number;
  tags: string[];
}

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface Cart {
  items: CartItem[];
  totalAmount: number;
}

const categories = [
  { id: 'electronics', name: 'Electronics', icon: '💻' },
  { id: 'furniture', name: 'Furniture', icon: '🪑' },
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'books', name: 'Books', icon: '📚' }
];

const sortOptions = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Rating' },
  { value: '-reviewCount', label: 'Most Reviewed' }
];

type FilterSection = 'category' | 'price' | 'rating';

// Add this CSS class to handle aspect ratio
const aspectRatioClass = "relative w-full pt-[100%]"; // This creates a 1:1 aspect ratio

export default function ECommerce() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<Cart>({ items: [], totalAmount: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<Record<FilterSection, boolean>>({
    category: true,
    price: true,
    rating: true
  });
  const [wishlist, setWishlist] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt'
  });

  // Update filters when search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.sort) queryParams.append('sort', filters.sort);
        
        const response = await fetch(`/api/e-commerce/products?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        // For demo purposes, using a static user ID
        const userId = 'demo-user';
        const response = await fetch(`/api/e-commerce/cart?user=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch cart');
        
        const data = await response.json();
        // Calculate subtotals for each item
        const itemsWithSubtotals = data.items.map((item: CartItem) => ({
          ...item,
          subtotal: item.product.price * item.quantity * (1 - (item.product.discount || 0) / 100)
        }));
        
        // Calculate total amount
        const totalAmount = itemsWithSubtotals.reduce((sum: number, item: CartItem) => sum + item.subtotal, 0);
        
        setCart({
          items: itemsWithSubtotals,
          totalAmount
        });
      } catch (err) {
        console.error('Error fetching cart:', err);
      }
    };

    fetchCart();
  }, []);

  const addToCart = async (productId: string) => {
    try {
      const userId = 'demo-user';
      const response = await fetch('/api/e-commerce/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userId,
          productId,
          quantity: 1
        })
      });

      if (!response.ok) throw new Error('Failed to add to cart');
      
      const updatedCart = await response.json();
      // Calculate subtotals for each item
      const itemsWithSubtotals = updatedCart.items.map((item: CartItem) => ({
        ...item,
        subtotal: item.product.price * item.quantity * (1 - (item.product.discount || 0) / 100)
      }));
      
      // Calculate total amount
      const totalAmount = itemsWithSubtotals.reduce((sum: number, item: CartItem) => sum + item.subtotal, 0);
      
      setCart({
        items: itemsWithSubtotals,
        totalAmount
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart');
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const userId = 'demo-user';
      const response = await fetch(`/api/e-commerce/cart?user=${userId}&productId=${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to remove from cart');
      
      const updatedCart = await response.json();
      // Calculate subtotals for each item
      const itemsWithSubtotals = updatedCart.items.map((item: CartItem) => ({
        ...item,
        subtotal: item.product.price * item.quantity * (1 - (item.product.discount || 0) / 100)
      }));
      
      // Calculate total amount
      const totalAmount = itemsWithSubtotals.reduce((sum: number, item: CartItem) => sum + item.subtotal, 0);
      
      setCart({
        items: itemsWithSubtotals,
        totalAmount
      });
    } catch (err) {
      console.error('Error removing from cart:', err);
      alert('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      const userId = 'demo-user';
      const response = await fetch('/api/e-commerce/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userId,
          productId,
          quantity
        })
      });

      if (!response.ok) throw new Error('Failed to update cart');
      
      const updatedCart = await response.json();
      // Calculate subtotals for each item
      const itemsWithSubtotals = updatedCart.items.map((item: CartItem) => ({
        ...item,
        subtotal: item.product.price * item.quantity * (1 - (item.product.discount || 0) / 100)
      }));
      
      // Calculate total amount
      const totalAmount = itemsWithSubtotals.reduce((sum: number, item: CartItem) => sum + item.subtotal, 0);
      
      setCart({
        items: itemsWithSubtotals,
        totalAmount
      });
    } catch (err) {
      console.error('Error updating cart:', err);
      alert('Failed to update item quantity');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleFilterSection = (section: FilterSection) => {
    setExpandedFilters(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sort: '-createdAt'
    });
    setSearchQuery('');
  };

  const filteredProducts = products.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.minPrice && product.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && product.price > Number(filters.maxPrice)) return false;
    return true;
  });

  const handleSeedProducts = async () => {
    if (!confirm('Are you sure you want to seed the database with sample products? This will clear existing products.')) {
      return;
    }

    setSeeding(true);
    try {
      const response = await fetch('/api/e-commerce/seed', {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to seed products');
      
      const data = await response.json();
      alert(`Successfully seeded ${data.count} products!`);
      
      // Refresh the products list
      const productsResponse = await fetch('/api/e-commerce/products');
      if (!productsResponse.ok) throw new Error('Failed to fetch products');
      const productsData = await productsResponse.json();
      setProducts(productsData.products);
    } catch (err) {
      console.error('Error seeding products:', err);
      alert('Failed to seed products. Please try again.');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              E-Commerce Store
        </Link>
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:block relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                <FaFilter className="w-5 h-5" />
              </button>

              {/* Seed Products Button */}
              <button
                onClick={handleSeedProducts}
                disabled={seeding}
                className={`hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                  seeding
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <FaDatabase className="mr-2" />
                {seeding ? 'Seeding...' : 'Seed Products'}
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <FaShoppingCart className="w-5 h-5" />
                {cart.items.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  >
                    {cart.items.length}
                  </motion.span>
                )}
            </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-4 md:hidden">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`w-full md:w-64 space-y-6 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
      </div>
      
              {/* Category Filter */}
              <div className="mb-6">
                <button
                  onClick={() => toggleFilterSection('category')}
                  className="flex items-center justify-between w-full mb-2"
                >
                  <span className="font-medium">Category</span>
                  {expandedFilters.category ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                {expandedFilters.category && (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={filters.category === category.id}
                          onChange={() => handleFilterChange('category', category.id)}
                          className="form-radio text-blue-600"
                        />
                        <span className="flex items-center">
                          <span className="mr-2">{category.icon}</span>
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <button
                  onClick={() => toggleFilterSection('price')}
                  className="flex items-center justify-between w-full mb-2"
                >
                  <span className="font-medium">Price Range</span>
                  {expandedFilters.price ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                {expandedFilters.price && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Min Price</label>
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Min"
                      />
                    </div>
                <div>
                      <label className="block text-sm text-gray-600 mb-1">Max Price</label>
                  <input 
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Max"
                  />
                </div>
                  </div>
                )}
              </div>

              {/* Rating Filter */}
              <div>
                <button
                  onClick={() => toggleFilterSection('rating')}
                  className="flex items-center justify-between w-full mb-2"
                >
                  <span className="font-medium">Rating</span>
                  {expandedFilters.rating ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                {expandedFilters.rating && (
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <label
                        key={rating}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="rating"
                          className="form-radio text-blue-600"
                        />
                        <span className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">& Up</span>
                        </span>
                      </label>
                    ))}
                </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {filteredProducts.length} products
              </p>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
        </div>
        
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative">
                      <div className={aspectRatioClass}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={product.featured}
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          quality={85}
                        />
                      </div>
                      {product.discount && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                          {product.discount}% OFF
                        </div>
                      )}
                      <button
                        onClick={() => toggleWishlist(product._id)}
                        className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
                      >
                        {wishlist.includes(product._id) ? (
                          <FaHeart className="w-5 h-5 text-red-500" />
                        ) : (
                          <FaRegHeart className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                        {product.name}
                      </h3>
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          <FaStar className="text-yellow-400 w-5 h-5" />
                          <span className="ml-1 text-sm text-gray-600">
                            {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>
                      </div>
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            {product.discount ? (
                              <div>
                                <span className="text-xl font-bold text-gray-900">
                                  ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                                </span>
                                <span className="ml-2 text-sm text-gray-500 line-through">
                                  ${product.price.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xl font-bold text-gray-900">
                                ${product.price.toFixed(2)}
                              </span>
                            )}
                    </div>
                  </div>
                        <button
                          onClick={() => addToCart(product._id)}
                          disabled={product.stock === 0}
                          className={`w-full py-2.5 rounded-full text-sm font-medium transition-colors ${
                            product.stock === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                        {product.stock > 0 && product.stock <= 5 && (
                          <p className="text-sm text-orange-500 text-center">
                            Only {product.stock} left in stock!
                          </p>
                        )}
                </div>
              </div>
                  </motion.div>
            ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
            >
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-xl font-bold">Shopping Cart</h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {cart.items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <FaShoppingCart className="w-16 h-16 mb-4" />
                      <p className="text-lg">Your cart is empty</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.items.map((item) => (
                        <motion.div
                          key={item.product._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4"
                        >
                          <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              sizes="96px"
                              className="object-cover"
                              quality={85}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {item.product.name}
                            </h3>
                            <div className="mt-1 flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <FaMinus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                              >
                                <FaPlus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="mt-1 text-sm font-medium">
                              ${item.subtotal.toFixed(2)}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product._id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FaTrash className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.items.length > 0 && (
                  <div className="border-t p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-lg font-bold">${cart.totalAmount.toFixed(2)}</span>
                    </div>
                    <Link
                      href="/checkout"
                      className="w-full bg-blue-500 text-white py-3 px-4 rounded-full text-center font-medium hover:bg-blue-600 transition-colors"
                    >
                      Proceed to Checkout
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 