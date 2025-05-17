import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Analytics from '@/models/Analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // Default to 7 days
    
    await connectToDatabase();
    
    // Calculate the start date based on the period
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    // Fetch analytics data for the period
    const analytics = await Analytics.find({
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    // Calculate summary statistics
    const summary = {
      totalRevenue: analytics.reduce((sum, a) => sum + a.revenue, 0),
      totalUsers: analytics.reduce((sum, a) => sum + a.newUsers, 0),
      averageActiveUsers: analytics.reduce((sum, a) => sum + a.activeUsers, 0) / analytics.length || 0,
      subscriptionBreakdown: {
        basic: analytics.reduce((sum, a) => sum + a.subscriptions.basic, 0),
        pro: analytics.reduce((sum, a) => sum + a.subscriptions.pro, 0),
        enterprise: analytics.reduce((sum, a) => sum + a.subscriptions.enterprise, 0),
      },
    };
    
    return NextResponse.json({
      analytics,
      summary,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    // Create or update analytics for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const analytics = await Analytics.findOneAndUpdate(
      { date: today },
      { $set: body },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(analytics, { status: 201 });
  } catch (error) {
    console.error('Error updating analytics:', error);
    return NextResponse.json(
      { error: 'Failed to update analytics' },
      { status: 500 }
    );
  }
} 