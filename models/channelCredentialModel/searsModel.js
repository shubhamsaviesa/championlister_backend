import mongoose from "mongoose";

const searscredSchema = new mongoose.Schema({

    nickname: { type: String, required: true, trim: true },
    searsemail: { type: String, required: true, trim: true },
    searssellerid: { type: String, required: true, trim: true },
    searsapikey:{ type: String, required: true, trim: true },
    locationid:{ type: String, required: true, trim: true },
    marketplacename:{type: String, required: true, trim: true},
    userid: { type: String, required: false, trim: true },
    flag: { type: Boolean, required: false, trim: true },
})
//model 
export const searsCredModel = mongoose.model("searscredentials", searscredSchema)