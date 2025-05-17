import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

interface CartItem {
  product: string;
  quantity: number;
}

// Helper function to calculate cart total
async function calculateCartTotal(items: CartItem[]) {
  const productIds = items.map(item => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  
  return items.reduce((total, item) => {
    const product = products.find(p => p._id.toString() === item.product);
    if (!product) return total;
    
    const price = product.discount 
      ? product.price * (1 - product.discount / 100)
      : product.price;
    
    return total + (price * item.quantity);
  }, 0);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const cart = await Cart.findOne({ user })
      .populate('items.product', 'name price image discount stock')
      .select('-__v');

    if (!cart) {
      return NextResponse.json({ items: [], totalAmount: 0 });
    }
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, productId, quantity } = await request.json();
    
    if (!user || !productId || !quantity) {
      return NextResponse.json(
        { error: 'User, product ID, and quantity are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Check if product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Not enough stock available' },
        { status: 400 }
      );
    }

    // Find or create cart
    let cart = await Cart.findOne({ user });
    if (!cart) {
      cart = new Cart({ user, items: [], totalAmount: 0 });
    }

    // Update cart items
    const existingItemIndex = cart.items.findIndex(
      (item: CartItem) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity = quantity;
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity });
    }

    // Calculate new total
    cart.totalAmount = await calculateCartTotal(cart.items);
    await cart.save();

    // Populate product details
    await cart.populate('items.product', 'name price image discount stock');
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const productId = searchParams.get('productId');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const cart = await Cart.findOne({ user });
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    if (productId) {
      // Remove specific product
      cart.items = cart.items.filter(
        (item: CartItem) => item.product.toString() !== productId
      );
    } else {
      // Clear entire cart
      cart.items = [];
    }

    // Recalculate total
    cart.totalAmount = await calculateCartTotal(cart.items);
    await cart.save();

    // Populate product details
    await cart.populate('items.product', 'name price image discount stock');
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
} 