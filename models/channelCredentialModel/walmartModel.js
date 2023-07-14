import mongoose from "mongoose";

const walmartcredSchema = new mongoose.Schema({

    nickname: { type: String, required: true, trim: true },
    walmartid: { type: String, required: true, trim: true },
    walmartsecret: { type: String, required: true, trim: true },
    marketplacename:{ type: String, required: true, trim: true },
    userid: { type: String, required: false, trim: true },
    flag: { type: Boolean, required: false, trim: true },
})
//model 
export const walmartCredModel = mongoose.model("Walmartcredentials", walmartcredSchema)



