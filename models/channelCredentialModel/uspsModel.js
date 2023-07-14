import mongoose from "mongoose";

const uspscredSchema = new mongoose.Schema({
    marketplacename: { type: String, required: true, trim: true },
    Uspsid: { type: String,required: true, trim: true },
    Uspspassword: { type: String,required: true,  trim: true },
    flag: { type: Boolean, required: false, trim: true },
    
})

export const uspscredModel = mongoose.model("uspscredentials", uspscredSchema)