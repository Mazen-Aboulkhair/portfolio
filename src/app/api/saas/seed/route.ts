import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Analytics from '@/models/Analytics';

// Sample user data
const sampleUsers = [
  {
    name: 'John Smith',
    email: 'john@example.com',
    plan: 'enterprise',
    status: 'active',
    joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    lastLogin: new Date(),
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    plan: 'pro',
    status: 'active',
    joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    lastLogin: new Date(),
  },
  {
    name: 'Michael Brown',
    email: 'michael@example.com',
    plan: 'basic',
    status: 'active',
    joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    lastLogin: new Date(),
  },
  {
    name: 'Emily Davis',
    email: 'emily@example.com',
    plan: 'pro',
    status: 'inactive',
    joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    name: 'David Wilson',
    email: 'david@example.com',
    plan: 'enterprise',
    status: 'suspended',
    joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
];

// Generate analytics data for the last 30 days
function generateAnalyticsData() {
  const analytics = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate random but realistic data
    const activeUsers = Math.floor(Math.random() * 50) + 20; // 20-70 active users
    const newUsers = Math.floor(Math.random() * 10) + 1; // 1-10 new users
    const revenue = Math.floor(Math.random() * 5000) + 1000; // $1000-$6000 revenue
    const basicSubs = Math.floor(Math.random() * 30) + 10;
    const proSubs = Math.floor(Math.random() * 20) + 5;
    const enterpriseSubs = Math.floor(Math.random() * 10) + 2;

    analytics.push({
      date,
      activeUsers,
      newUsers,
      revenue,
      subscriptions: {
        basic: basicSubs,
        pro: proSubs,
        enterprise: enterpriseSubs,
      },
      metrics: {
        pageViews: Math.floor(Math.random() * 1000) + 500,
        uniqueVisitors: Math.floor(Math.random() * 300) + 200,
        averageSessionDuration: Math.floor(Math.random() * 20) + 10,
      },
    });
  }

  return analytics;
}

export async function POST() {
  try {
    await connectToDatabase();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Analytics.deleteMany({}),
    ]);

    // Insert new users
    const users = await User.insertMany(sampleUsers);

    // Insert analytics data
    const analyticsData = generateAnalyticsData();
    await Analytics.insertMany(analyticsData);

    return NextResponse.json({
      message: 'Database seeded successfully',
      usersCreated: users.length,
      analyticsCreated: analyticsData.length,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
} 