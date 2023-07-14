import mongoose from "mongoose";

const ebaycredSchema = new mongoose.Schema({
    marketplacename: { type: String, required: false, trim: true },
    nickname: { type: String, required: false, trim: true },
    ebayclientid: { type: String, required: false, trim: true },
    ebayclientsecret: { type: String, required: false, trim: true },
    code: { type: String, required: false, trim: true },
    devId: { type: String, required: false, trim: true },
    redirect_uri: { type: String, required: false, trim: true },
    refresh_token: { type: String, required: false, trim: true },
    userid: { type: String, required: false, trim: true },
    flag: { type: Boolean, required: false, trim: true },
})

export const ebaycredModel = mongoose.model("ebaycredentials", ebaycredSchema)


