import mongoose from 'mongoose';
// defining schema
const bulkuploadSchema = new mongoose.Schema({
    bulkuploadfile: { type: String, required: false, trim: true },
    ProductName: { type: String, required: false, trim: true },
    Description: { type: String, required: false, trim: true },
    SKU: { type: String, required: false, trim: true },
    UPC: { type: String, required: false, trim: true },
    Brand: { type: String, required: false, trim: true },
    Height: { type: Number, required: false, trim: true },
    Length: { type: Number, required: false, trim: true },
    Width: { type: Number, required: false, trim: true },
    Manufracturer: { type: String, required: false, trim: true },
    CostPrice: { type: Number, required: false, trim: true },
    ImageUrl: { type: String, required: false, trim: true },
    ManufracturerPartNum: { type: String, required: false, trim: true },   
    Quantity: { type: Number, required: false, trim: true },
    SellingPrice: { type: Number, required: false, trim: true },
    Weight: { type: Number, required: false, trim: true },
    ASIN: { type: String, required: false, trim: true },
    add_modify_delete: { type: String, required: false, trim: true },
    product_code_type: { type: String, required: false, trim: true },
})
//model 
export const BulkFileModel = mongoose.model("bulkuploadfile", bulkuploadSchema)

