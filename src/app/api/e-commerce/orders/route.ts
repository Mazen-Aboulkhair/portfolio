import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

interface OrderQuery {
  user: string;
  status?: string;
}

interface OrderUpdate {
  status?: string;
  paymentStatus?: string;
  trackingNumber?: string;
  [key: string]: string | undefined;  // Add index signature
}

interface ProductDocument {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  stock: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Build query
    const query: OrderQuery = { user };
    if (status) {
      query.status = status;
    }

    // Get orders with pagination
    const orders = await Order.find(query)
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v');

    // Get total count for pagination
    const total = await Order.countDocuments(query);
    
    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, shippingAddress, paymentMethod } = await request.json();
    
    if (!user || !shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: 'User, shipping address, and payment method are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Get user's cart
    const cart = await Cart.findOne({ user })
      .populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Verify stock availability and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product as ProductDocument;
      
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for ${product.name}` },
          { status: 400 }
        );
      }

      const price = product.discount 
        ? product.price * (1 - product.discount / 100)
        : product.price;

      totalAmount += price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price
      });

      // Update product stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Create order
    const order = new Order({
      user,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    await order.save();

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // Populate order details
    await order.populate('items.product', 'name image');
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    const allowedUpdates = ['status', 'paymentStatus', 'trackingNumber'] as const;
    type AllowedUpdateKey = typeof allowedUpdates[number];
    
    const filteredUpdates = Object.keys(updates)
      .filter((key): key is AllowedUpdateKey => allowedUpdates.includes(key as AllowedUpdateKey))
      .reduce<OrderUpdate>((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: filteredUpdates },
      { new: true }
    ).populate('items.product', 'name image');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 