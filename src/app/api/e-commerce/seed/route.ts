import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

const sampleProducts = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
    price: 299.99,
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    stock: 50,
    rating: 4.5,
    reviewCount: 128,
    featured: true,
    discount: 10,
    tags: ['audio', 'wireless', 'headphones']
  },
  {
    name: 'Smart LED TV 55"',
    description: '4K Ultra HD Smart TV with HDR and built-in streaming apps.',
    price: 799.99,
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80',
    stock: 25,
    rating: 4.8,
    reviewCount: 89,
    featured: true,
    tags: ['tv', 'smart', '4k']
  },
  {
    name: 'Modern Leather Sofa',
    description: 'Contemporary leather sofa with premium cushioning and durable frame.',
    price: 1299.99,
    category: 'furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    stock: 15,
    rating: 4.6,
    reviewCount: 45,
    featured: true,
    discount: 15,
    tags: ['furniture', 'living room', 'leather']
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Adjustable office chair with lumbar support and breathable mesh back.',
    price: 249.99,
    category: 'furniture',
    image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80',
    stock: 30,
    rating: 4.4,
    reviewCount: 67,
    tags: ['office', 'ergonomic', 'chair']
  },
  {
    name: 'Men\'s Casual Denim Jacket',
    description: 'Classic denim jacket with modern fit and premium quality.',
    price: 89.99,
    category: 'clothing',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80',
    stock: 40,
    rating: 4.3,
    reviewCount: 92,
    tags: ['men', 'jacket', 'denim']
  },
  {
    name: 'Women\'s Running Shoes',
    description: 'Lightweight running shoes with responsive cushioning and breathable mesh.',
    price: 129.99,
    category: 'clothing',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    stock: 35,
    rating: 4.7,
    reviewCount: 156,
    featured: true,
    discount: 20,
    tags: ['women', 'shoes', 'running']
  },
  {
    name: 'Bestselling Fiction Novel',
    description: 'Award-winning fiction novel that has captured readers worldwide.',
    price: 19.99,
    category: 'books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
    stock: 100,
    rating: 4.9,
    reviewCount: 234,
    featured: true,
    tags: ['fiction', 'novel', 'bestseller']
  },
  {
    name: 'Programming Guide 2024',
    description: 'Comprehensive guide to modern programming languages and frameworks.',
    price: 39.99,
    category: 'books',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    stock: 45,
    rating: 4.6,
    reviewCount: 78,
    discount: 5,
    tags: ['programming', 'education', 'technology']
  }
];

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Clear existing products
    await Product.deleteMany({});
    
    // Insert new products
    const result = await Product.insertMany(sampleProducts);
    
    return NextResponse.json({
      message: 'Database seeded successfully',
      count: result.length
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
} 