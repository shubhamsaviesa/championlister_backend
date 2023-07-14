import mongoose from "mongoose";

export const emailsettingSchema = new mongoose.Schema({

    confirmmailSubject: { type: String, required: false, trim: true },
    confirmmailMessage: { type: String, required: false, trim: true },
    cancelmmailSubject: { type: String, required: false, trim: true },
    cancelmailMessage: { type: String, required: false, trim: true },
    // userid: { type: String, required: false, trim: true },
})

export const EmailSettingModel = mongoose.model("Emailsettings", emailsettingSchema)
