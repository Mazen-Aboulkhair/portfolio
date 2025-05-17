import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
  user: string;
  items: {
    product: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  totalAmount: number;
  lastUpdated: Date;
}

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: String,
      required: [true, 'Please provide user information'],
      unique: true,
    },
    items: [{
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
    }],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create index for better query performance
CartSchema.index({ user: 1 });

// Middleware to update lastUpdated timestamp
CartSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

export default mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema); 