import mongoose from "mongoose";

const amazoncredSchema = new mongoose.Schema({
    marketplacename: { type: String, required: false, trim: true },
    amazonemailid: { type: String, required: false, trim: true },
    amazonpassword: { type: String, required: false, trim: true },
    amazonsellerid: { type: String, required: false, trim: true },
    userid: { type: String, required: false, trim: true },
    flag: { type: Boolean, required: false, trim: true },
})

export const amazoncredModel = mongoose.model("amazoncredentials", amazoncredSchema)
