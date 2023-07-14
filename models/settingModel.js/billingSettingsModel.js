import mongoose from 'mongoose';
// defining schema
const BillingSettingSchema = new mongoose.Schema({
    email: { type: String, required: true, trim: true },
    cardholdername: { type: String, required: false, trim: true },
    cardnumber:{type: String, required: true, trim: true},
    expirydate: { type: String, required: true, trim: true },
    cvv:{ type: Number, required: true, trim: true },
    userid: { type: String, required: false, trim: true },
})
//model 
export const BillingSettingModel = mongoose.model("BillingSettingModel", BillingSettingSchema)




