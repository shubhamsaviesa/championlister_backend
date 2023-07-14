import mongoose from "mongoose";

const addInventorySchema = new mongoose.Schema({
  productname: { type: String, required: false, trim: true },
  description: { type: String, required: false, trim: true },
  identifiertype: { type: String, required: false, trim: true },
  identifier: { type: String, required: false, trim: true },
  category: { type: String, required: false, trim: true },
  condition: { type: String, required: false, trim: true },
  brand: { type: String, required: false, trim: true },
  availableqty: { type: Number, required: false, trim: true },
  manufacturer: { type: String, required: false, trim: true },
  manufacturernumber: { type: String, required: false, trim: true },
  lisrtprice: { type: Number, required: false, trim: true },
  mapprice: { type: Number, required: false, trim: true },
  lbs: { type: Number, required: false, trim: true },
  upc: { type: String, required: false, trim: true },
  gstin: { type: String, required: false, trim: true },
  sku: { type: String, required: true, trim: true },
  other: { type: String, required: false, trim: true },
  costprice: { type: Number, required: false, trim: true },
  profitprice: { type: Number, required: false, trim: true },
  marketplacecommision: { type: Number, required: false, trim: true },
  weight: { type: Number, required: false, trim: true },
  length: { type: Number, required: false, trim: true },
  width: { type: Number, required: false, trim: true },
  height: { type: Number, required: false, trim: true },
  add_modify_delete: { type: String, required: false, trim: true },
  product_code_type: { type: Number, required: false, trim: true },
  token: { type: String, required: false, trim: true },
  date: { type: Date, required: false, trim: true },
  userid: { type: String, required: false, trim: true },
  wishProductId: { type: String, required: false, trim: true },
  neweggProductId: { type: String, required: false, trim: true },
  ShopifyProductId: { type: String, required: false, trim: true },
  imageupload1: { type: String, required: false, trim: true },
  imageupload3: { type: String, required: false, trim: true },
  imageupload2: { type: String, required: false, trim: true },
});
//model
export const addInventoryModel = mongoose.model(
  "addinventory",
  addInventorySchema
);
