import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  qty: Number,
  price: Number,
  thumbnail: String,
}, { _id: false });

const historySchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String, default: '' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  at: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [itemSchema],
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'COD' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  statusHistory: [historySchema],
  shipping: {
    name: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String,
  },
  dispatch: {
    courierPartner: { type: String, default: '' },
    trackingId: { type: String, default: '' },
    dispatchDate: Date,
    estimatedDeliveryDate: Date,
  },
}, { timestamps: true });

orderSchema.pre('save', function statusHistoryDefault(next) {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: this.status, note: 'Order created' });
  }
  next();
});

export default mongoose.model('Order', orderSchema);
