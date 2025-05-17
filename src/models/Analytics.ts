import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  date: Date;
  activeUsers: number;
  newUsers: number;
  revenue: number;
  subscriptions: {
    basic: number;
    pro: number;
    enterprise: number;
  };
  metrics: {
    pageViews: number;
    uniqueVisitors: number;
    averageSessionDuration: number;
  };
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    activeUsers: {
      type: Number,
      required: true,
      default: 0,
    },
    newUsers: {
      type: Number,
      required: true,
      default: 0,
    },
    revenue: {
      type: Number,
      required: true,
      default: 0,
    },
    subscriptions: {
      basic: {
        type: Number,
        default: 0,
      },
      pro: {
        type: Number,
        default: 0,
      },
      enterprise: {
        type: Number,
        default: 0,
      },
    },
    metrics: {
      pageViews: {
        type: Number,
        default: 0,
      },
      uniqueVisitors: {
        type: Number,
        default: 0,
      },
      averageSessionDuration: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

// Create a compound index on date for efficient querying
AnalyticsSchema.index({ date: 1 });

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema); 