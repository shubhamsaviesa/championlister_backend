import mongoose from 'mongoose';
// defining schema
const bookcommerceSchema = new mongoose.Schema({
    tags: {
        type: Array,
        required: true
    },
    userid: { type: String, required: false, trim: true },
    Templatename: { type: String, required: false, trim: true },
    abbrevation: { type: String, required: false, trim: true },
    category: { type: String, required: false, trim: true },
    subcategory: { type: String, required: false, trim: true },
    templatefile: { type: String, required: false, trim: true },
    sku: { type: String, required: false, trim: true },
    status: { type: String, required: false, trim: true }
})
//model 
export const BookCommerceModel = mongoose.model("seller_template", bookcommerceSchema)
