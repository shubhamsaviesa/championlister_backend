import { ListingsModel } from '../../models/actionModel/Listing.js';
import jwt from 'jsonwebtoken';



async function tokenverify(req, res) {
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization.split(' ')[1],
            decoded;
        try {
            // console.log(authorization);
            decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
        var userIdd = decoded.userId;
        return userIdd
    }
    else {
        return res.send("provide token")

    }
}

class Channellisting {
     static walmartlisting = async (req, res, next) => {

         var useralibirslistings = await ListingsModel.find({ userid: await tokenverify(req, res), marketplacename: "Walmart" })
         console.log("useralibirslistings", useralibirslistings)
         var riversarray = [];
         var dataarray = useralibirslistings
         var start = dataarray.length - 1;
         console.log(start);
         for (var i = start; i >= 0; i--) {
             // console.log(dataarray[i]);
             riversarray.push(dataarray[i])
         }
         res.send({ "status": "succes", "message": "Walmart listings", "listings": riversarray });

     }
     static ebaylisting = async (req, res, next) => {

         var useralibirslistings = await ListingsModel.find({ userid: await tokenverify(req, res), marketplacename: "Ebay" })
         console.log("useralibirslistings", useralibirslistings)
         var riversarray = [];
         var dataarray = useralibirslistings
         var start = dataarray.length - 1;
         console.log(start);
         for (var i = start; i >= 0; i--) {
             // console.log(dataarray[i]);
             riversarray.push(dataarray[i])
         }
         res.send({ "status": "succes", "message": "Ebay listings", "listings": riversarray });

     }
     static amazonlisting = async (req, res, next) => {

        var useralibirslistings = await ListingsModel.find({ userid: await tokenverify(req, res), marketplacename: "Amazon" })
        var riversarray = [];
        var dataarray = useralibirslistings
        var start = dataarray.length - 1;
        console.log(start);
        for (var i = start; i >= 0; i--) {
            riversarray.push(dataarray[i])
        }
        res.send({ "status": "succes", "message": "Amazon listings", "listings": riversarray });

    }

 }

export default Channellisting
