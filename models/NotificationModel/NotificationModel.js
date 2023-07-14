import mongoose from 'mongoose'
// defining schema
const notificationSchema = new mongoose.Schema({
    actionType: { type: String, required: false, trim: true },
    actionName: { type: String, required: false, trim: true },
    description: { type: String, required: false, trim: true },
    status: { type: String, required: false, trim: true },
    date: { type: String, required: false, trim: true },
    userid: { type: String, required: false, trim: true },
})

export const NotificationModel = mongoose.model("Notification",notificationSchema)