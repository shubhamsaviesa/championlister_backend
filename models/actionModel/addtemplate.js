import mongoose from "mongoose";

const addtempSchema = new mongoose.Schema({
  tags: {
    type: Array,
    required: true,
  },
  userid: { type: String, required: false, trim: true },
  tempName: { type: String, required: false, trim: true },
  abbrevation: { type: String, required: false, trim: true },
  category: { type: String, required: false, trim: true },
  subcategory: { type: String, required: false, trim: true },
  templatefile: { type: String, required: false, trim: true },
  sku: { type: String, required: false, trim: true },
  status: { type: String, required: false, trim: true },
});
//model
export const AddtemplateModel = mongoose.model("add_template", addtempSchema);
