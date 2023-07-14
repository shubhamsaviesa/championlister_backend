import {bigcommercecredModel} from "../../models/channelCredentialModel/bigcommerceModel.js"
import  jwt  from "jsonwebtoken"

export const bigcommercecredential = async (req,res)=>{
    const { nickname, country } = req.body
    console.log("bigcommerce reqbody",req.body)
    const marketplacename = "bigcommerce"  
    if (req.headers && req.headers.authorization) {
       var authorization = req.headers.authorization.split(' ')[1],
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
        var userIdd = decoded.userId;
        try {
               if (bigcommerceconnectvalue || marketplacename) {
                const doc = new bigcommercecredModel({
                    marketplacename: marketplacename,
                    bigcommerceconnectvalue: nickname,
                    country: country,
                    userid: userIdd,
                    flag:1
                })
                await doc.save();

                //    var userabelistings = await ListingsModel.find({ userid: userIdd, marketplacename: marketplacename })
                res.send({ "status": "succes", "message": "Connection succesfully", "result": doc });
            }
        } catch (error) {
            res.send({ "status": "failed", "message": "Connection failed"});
            console.log(error);
        }

    } else {
        res.send("provide token");
    }
}