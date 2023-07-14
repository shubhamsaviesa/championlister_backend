import mongoose from "mongoose";

const shopifycredSchema = new mongoose.Schema({
    apiKey: { type: String, required: true, trim: true },
    apiSecretKey: { type: String, required: true, trim: true },
    adminApiAccessToken: { type: String, required: true, trim: true },
    shop: { type: String, required: true, trim: true },
    nickName: { type: String, required: true, trim: true },
    marketplacename: { type: String, required: true, trim: true },
    userid: { type: String, required: false, trim: true },
    flag: { type: Boolean, required: false, trim: true },
})

export const shopifycredModel = mongoose.model("shopifycredentials", shopifycredSchema)