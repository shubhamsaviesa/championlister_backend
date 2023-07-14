import { searsCredModel } from "../../models/channelCredentialModel/searsModel.js";
import jwt  from "jsonwebtoken";

export const searsCredential=async(req,res)=>{
     const {nickname,searssellerid,searsapikey,searsemail,locationid}=req.body
     const marketplacename = "Sears"
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
        var existChannel = await searsCredModel.findOneAndUpdate({ userid: userIdd }, {
            nickname: nickname,searssellerid:searssellerid,searsemail:searsemail,locationid:locationid,
            searsapikey: searsapikey }, null, function (err, docs) {
            if (err) {
                console.log(err)
            }
            else {
                console.log("complete");
        
            }
        }).clone().catch(function (err) { console.log(err) })

       if (existChannel == null) {
            const doc = new searsCredModel({
                marketplacename: marketplacename,
                nickname: nickname,
                searssellerid:searssellerid,
                searsapikey: searsapikey,
                searsemail:searsemail,
                locationid:locationid,
                userid: userIdd,
                flag: 1
            })
            await doc.save();
           res.send({ "status": "succes", "message": "Connection succesfully", "result": doc });
        }  else{
            res.send({ "status": "succes", "message": "Updated succesfully", "result": existChannel});
        }
    }catch (error) {
            console.log(error);
        }
    
} else {
         res.send("provide token");
    }
}