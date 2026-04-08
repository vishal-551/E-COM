import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  qty: Number,
  price: Number,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [itemSchema],
  total: { type: Number, required: true },
  status: { type: String, default: 'Order placed' },
  shipping: {
    name: String,
    address: String,
    phone: String,
  },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
