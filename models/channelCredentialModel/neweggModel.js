import mongoose from "mongoose";

const neweggcredSchema = new mongoose.Schema({

    nickname: { type: String, required: true, trim: true },
    neweggsellerid: { type: String, required: true, trim: true },
    neweggapikey:{ type: String, required: true, trim: true },
    neweggSecretkey:{ type: String, required: true, trim: true },
    marketplacename:{type: String, required: true, trim: true},
    userid: { type: String, required: false, trim: true },
    flag: { type: Boolean, required: false, trim: true },
})
//model 
export const neweggCredModel = mongoose.model("neweggcredentials", neweggcredSchema)