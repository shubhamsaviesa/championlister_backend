import mongoose from 'mongoose';
// defining schema
const wiskToken = new mongoose.Schema({
    access_token: { type: String, required: false, trim: true },
    scopes: [{ type: String, required: false, trim: true }],
    merchant_id: { type: String, required: false, trim: true },
    expiry_time: { type: String, required: false, trim: true },
    refresh_token: { type: String, required: false, trim: true },
    client_id: { type: String, required: false, trim: true },
    client_secret: { type: String, required: false, trim: true },
    userid: { type: String, required: false, trim: true },
})
//model 
export const wishtoken = mongoose.model("wiskToken", wiskToken)

