// import { AddorderModel } from '../../models/orderModel/AddorderModel.js';
// import { EmailSettingModel } from '../../models/emailModel/emailModel.js';
// import { tokenverify } from '../../helper/tokenverify.js';
// import transporter from '../../config/test/connectEmail.js';


// export const confimmailsent = async (req, res,id) => {
//     const emaildata = await EmailSettingModel.findOne({ userid: await tokenverify(req, res) })
//     const saved_user = await AddorderModel.find({ _id: id })
//     console.log("email", emaildata);
//     let info = await transporter.sendMail({
//         from: 'jigarprajapati24012001@gmail.com',
//         to: saved_user[0].BuyerEmail,
//         subject: emaildata.confirmmailSubject,
//         text: emaildata.confirmmailMessage
//     })
//     console.log("info", info)
// }

// export const cancelmailsent = async (req, res, id) => {
//     const emaildata = await EmailSettingModel.findOne({ userid: await tokenverify(req, res) })
//     const saved_user = await AddorderModel.find({ _id: id })
//     console.log("email", emaildata);
//     let info = await transporter.sendMail({
//         from: 'jigarprajapati24012001@gmail.com',
//         to: saved_user[0].BuyerEmail,
//         subject: emaildata.cancelmmailSubject,
//         text: emaildata.cancelmailMessage
//     })
//     console.log("info", info)
// }
