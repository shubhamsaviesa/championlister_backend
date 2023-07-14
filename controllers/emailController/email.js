import { tokenverify } from "../../helper/tokenverify.js";
import { EmailSettingModel } from "../../models/emailModel/emailModel.js";

export const emailSetingpost = async (req,res) =>{
    console.log("from email settings",req.body)
    const {confirmsub,confirmmsg,cancelsub,cancelmsg} = req.body;
    const emaildata = await EmailSettingModel.findOne({ userid: await tokenverify(req, res) });
    if(emaildata == null) {
        const emaildetails = new EmailSettingModel({
            confirmmailSubject: confirmsub,
            confirmmailMessage: confirmmsg,
            cancelmmailSubject: cancelsub,
            cancelmailMessage: cancelmsg,
            userid: await tokenverify(req, res)
        })
        await emaildetails.save();

        console.log(emaildata);
        res.send(emaildata)
    }
    else{
        EmailSettingModel.updateOne({ userid: await tokenverify(req, res) }, { $set: { confirmmailSubject: confirmsub, confirmmailMessage: confirmmsg, cancelmailSubject: cancelsub, cancelmailMessage: cancelmsg } },function (err, p) {
            if (err) {
                console.log(err);
            }
            console.log(p);
            res.send({"status":"updated successfully","message":p,"emaildata":emaildata})
        })
        console.log("update")
    }
    
}

export const emailsettingget = async (req, res) => {
    const emaildata = await EmailSettingModel.findOne({ userid: await tokenverify(req, res) });
    // const link = 'link'
    // let info = await transporter.sendMail({
    //     from: 'jigarprajapati24012001@gmail.com',
    //     to: 'jigarprajapati1678@gmail.com',
    //     subject: "SmallOfficer - Password Reset Link",
    //     html: `<a href=${link}>Click Here</a> to Reset Your Password`
    // })
    // console.log("info",info)
    res.send({"emailsettingData":emaildata})


}
