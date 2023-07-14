import {uspscredModel} from "../../models/channelCredentialModel/uspsModel.js"
import  jwt  from "jsonwebtoken"

export const uspscecredential = async (req,res)=>{
    const { Uspsid, Uspspassword } = req.body
    console.log("usps reqbody",req.body)

    const marketplacename = "USPS"  
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
            var existChannel = await uspscredModel.findOneAndUpdate({ userid: userIdd }, {
                Uspsid: Uspsid,Uspspassword:Uspspassword }, null, function (err, docs) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log("complete");
            
                }
            }).clone().catch(function (err) { console.log(err) })

               if (existChannel == null) {
                const doc = new uspscredModel({
                    Uspsid:  Uspsid,
                    Uspspassword:Uspspassword,
                    userid: userIdd,
                    marketplacename: marketplacename,
                    flag:1
                })
                await doc.save();
                res.send({ "status": "succes", "message": "Connection succesfully", "result": doc });
            }else{
                res.send({ "status": "succes", "message": "Updated succesfully", "result": existChannel});
            }
        } catch (error) {
            res.send({ "status": "failed", "message": "Connection failed"});
            console.log(error);
        }

    } else {
        res.send("provide token");
    }
}