import mongoose from "mongoose";

const bigcommercecredSchema = new mongoose.Schema({
    bigcommerceconnectvalue: { type: String, required: true, trim: true },
    marketplacename: { type: String, required: true, trim: true },
    userid: { type: String, required: false, trim: true },
    flag: { type: Boolean, required: false, trim: true },
})

export const bigcommercecredModel = mongoose.model("bigcommercecredentials", bigcommercecredSchema)