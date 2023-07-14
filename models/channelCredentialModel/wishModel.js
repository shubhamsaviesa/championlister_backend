import mongoose from "mongoose";

const wishcredSchema = new mongoose.Schema({

    nickname: { type: String, required: true, trim: true },
    wishid: { type: String, required: true, trim: true },
    wishwarehouseid: { type: String, required: true, trim: true },
    wishsecret: { type: String, required: true, trim: true },
    wishcode: { type: String, required: true, trim: true },
    marketplacename:{ type: String, required: true, trim: true },
    userid: { type: String, required: false, trim: true },
    flag: { type: Boolean, required: false, trim: true },
})
//model 
export const wishCredModel = mongoose.model("wishcredentials", wishcredSchema)
