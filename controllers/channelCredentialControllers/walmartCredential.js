import { walmartCredModel } from "../../models/channelCredentialModel/walmartModel.js";
import jwt  from "jsonwebtoken";
export const walmartCredential=async(req,res)=>{
     const {nickname,walmartid,walmartsecret}=req.body
     const marketplacename = "Walmart"
     console.log("req.headers",req.headers)
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
        var existChannel = await walmartCredModel.findOneAndUpdate({ userid: userIdd }, {
            nickname: nickname,walmartsecret:walmartsecret,
            walmartid: walmartid }, null, function (err, docs) {
            if (err) {
                console.log(err)
            }
            else {
                console.log("complete");
        
            }
        }).clone().catch(function (err) { console.log(err) })

        if(existChannel == null){
            const doc = new walmartCredModel({
                marketplacename: marketplacename,
                nickname: nickname,
                walmartid:walmartid,
                walmartsecret: walmartsecret,
                userid: userIdd,
                flag:1
            })
            await doc.save();
           
           res.send({ "status": "succes", "message": "Connection succesfully", "result": doc });
        }
        else{
            res.send({ "status": "succes", "message": "Updated succesfully", "result": existChannel});
        }
    }catch (error) {
            console.log(error);
        }
    
} else {
         res.send("provide token");
    }
}


