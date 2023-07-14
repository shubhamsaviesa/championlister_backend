import mongoose from "mongoose";

const shippingModalSchema = new mongoose.Schema({
  orderDate: { type: String, required: false, trim: true },
  orderId: { type: String, required: false, trim: true },
  productId: { type: String, required: false, trim: true },
  productName: { type: String, required: false, trim: true },
  uspsId: { type: String, required: false, trim: true },
  marketplaces: { type: String, required: false, trim: true },
  firstName: { type: String, required: false, trim: true },
  lastName: { type: String, required: false, trim: true },
  phoneNumber: { type: String, required: false, trim: true },
  address: { type: String, required: false, trim: true },
  city: { type: String, required: false, trim: true },
  state: { type: String, required: false, trim: true },
  country: { type: String, required: false, trim: true },
  postalCode: { type: String, required: false, trim: true },
  packageWeight: { type: Number, required: false, trim: true },
  lbs: { type: Number, required: false, trim: true },
  length: { type: Number, required: false, trim: true },
  width: { type: Number, required: false, trim: true },
  height: { type: Number, required: false, trim: true },
  userid: { type: String, required: false, trim: true },
  shippinDate: { type: String, required: false, trim: true },
  cancelDate: { type: String, required: false, trim: true },
  shippingStatus: { type: String, required: false, trim: true, default: "In progress" },
  disable: { type: Boolean, required: false, default: false},
});

export const shippingModal = mongoose.model("shippingDetails", shippingModalSchema);
