import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true, trim: true },
  lastname: { type: String, required: true, trim: true },
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  mobilenumber: { type: Number, required: true, trim: true },
  companyname: { type: String, required: false, trim: true },
  city: { type: String, required: false, trim: true },
  state: { type: String, required: false, trim: true },
  country: { type: String, required: false, trim: true },
  postalcode: { type: String, required: false, trim: true },
  profile_pic_url: { type: String, required: false, trim: true },

  shippinginfo: [
    {
      firstname: { type: String, required: false, trim: true },
      lastname: { type: String, required: false, trim: true },
      street: { type: String, required: false, trim: true },
      city: { type: String, required: false, trim: true },
      state: { type: String, required: false, trim: true },
      country: { type: String, required: false, trim: true },
      postalcode: { type: String, required: false, trim: true },
    },
  ],
  billinginfo: [
    {
      firstname: { type: String, required: false, trim: true },
      lastname: { type: String, required: false, trim: true },
      country: { type: String, required: false, trim: true },
      street: { type: String, required: false, trim: true },
      state: { type: String, required: false, trim: true },
      city: { type: String, required: false, trim: true },
      postalcode: { type: String, required: false, trim: true },
    },
  ],
});
//model
export const userModel = mongoose.model("userData", userSchema);

// firstname: { type: String, required: true, trim: true },
// lastname: { type: String, required: true, trim: true },
// username: { type: String, required: true, trim: true },
// email: { type: String, required: true, trim: true },
// password: { type: String, required: true, trim: true },
// mobilenumber: { type: Number, required: true, trim: true },
// userid: { type: String, required: false, trim: true },
// accountinfo: [{
//     street: { type: String, required: false, trim: true },
//     city: { type: String, required: false, trim: true },
//     state: { type: String, required: false, trim: true },
//     country: { type: String, required: false, trim: true },
//     postalcode: { type: String, required: false, trim: true },
// }],
// shippinginfo: [{
//     firstname: { type: String, required: false, trim: true },
//     lastname: { type: String, required: false, trim: true },
//     street: { type: String, required: false, trim: true },
//     city: { type: String, required: false, trim: true },
//     state: { type: String, required: false, trim: true },
//     country: { type: String, required: false, trim: true },
//     postalcode: { type: String, required: false, trim: true },
// }],
