// import { tokenverify } from "../../helper/tokenverify";
import jwt from "jsonwebtoken"
import { BillingSettingModel } from "../../models/settingModel.js/billingSettingsModel.js";

export const billingSettingpost = async (req, res) => {
    if (req.headers && req.headers.authorization) {
      var authorization = req.headers.authorization.split(" ")[1],
        decoded;
      try {
        console.log(authorization);
        decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
      var userIdd = decoded.userId;
      const {cardNumber,expiry,cvv,cardholdername,email}=req.body;
      console.log("fim",req.body)
      console.log(req.body)
      const doc = new BillingSettingModel({
        cvv:cvv,
        expirydate:expiry,
        cardnumber:cardNumber,
        cardholdername:cardholdername,
        email:email,
        userid:userIdd
      })
      await doc.save()
      res.send({"status":"success","message":"card details saved successfully"})
    }else{
        console.log('provide token')
    }
}

