import { BulkFileModel } from "../models/bulkuploadfile.js";
import { AddtemplateModel } from "../models/actionModel/addtemplate.js";
// import path from "path";
// import XLSX from "xlsx";
// import jwt from "jsonwebtoken";

// export const UploadFile = async (req, res) => {
//   if (req.headers && req.headers.authorization) {
//     var authorization = req.headers.authorization.split(" ")[1],
//       decoded;
//     try {
//       decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
//     } catch (e) {
//       return res.status(401).send("unauthorized");
//     }
//     var userIdd = decoded.userId;
//     const { tempName } = req.body;
//     const templatefile = req.file.filename;
//     if (templatefile) {
//       try {
//         var templatname = await AddtemplateModel.findOne({
//           userid: userIdd,
//           Templatename: tempName,
//         });
//         if (templatname == null) {
//           res.send({ status: "failed", message: "Please do mapping properly" });
//         }
//         var columnA = templatname.tags;
//         var dataid = [];
//         var workbook = XLSX.readFile(req.file.path);

//         var sheet_namelist = workbook.SheetNames;

//         let worksheet = workbook.Sheets[sheet_namelist[0]];
//         var xlData = XLSX.utils.sheet_to_json(worksheet);
//         const replaceKeys = (arr, obj) => {
//           const keys = Object.keys(obj);
//           const res = {};
//           console.log("arr keys", obj);
//           for (let a in arr) {
//             // const key = arr[a].toLowerCase();
//             const key = arr[a];

//             console.log(1111111, key, obj[key], obj[key + "*"]);
//             res[arr[a]] =
//               obj[key] ||
//               obj[key + "*"] ||
//               obj[key.toLowerCase()] ||
//               obj[key.toLowerCase() + "*"];
//             obj[arr[a]] =
//               obj[key] ||
//               obj[key + "*"] ||
//               obj[key.toLowerCase()] ||
//               obj[key.toLowerCase() + "*"];
//             if (key === "costprice") {
//               res[arr[a]] = obj["cost_price"] || obj["cost_price*"];
//             }
//             if (key === "Productname") {
//               res[arr[a]] = obj["Productname"] || obj["Productname*"];
//             }
//             if (key === "itemcondition") {
//               res[arr[a]] = obj["item_condition"] || obj["item_condition*"];
//             }
//           }
//         };

//         for (var i = 0; i < xlData.length; i++) {
//           replaceKeys(columnA, xlData[i]);
//         }
//         console.log(333333333333, xlData);
//         try {
//           BulkFileModel.insertMany(xlData, (err, data) => {
//             if (err) {
//               res.send({
//                 status: "failed",
//                 message: "mapping field are not properly matched",
//               });
//             } else {
//               for (var i = 0; i < data.length; i++) {
//                 var dati = data[i]._id;
//                 dataid.push(dati);
//               }

//               res.send({
//                 status: "succes",
//                 message: "Inserted succesfully",
//                 data: data,
//                 id: dataid,
//               });
//             }
//           });
//         } catch (error) {
//           console.log("error: ", error);
//         }
//       } catch (error) {
//         console.log("error", error);
//       }
//     } else {
//       res.send({ status: "fail", message: "give file" });
//     }
//   } else {
//     console.log("provide token");
//   }
// };


// const BulkFileModel = require('../models/bulkuploadfile.js');
// const BookCommerceModel = require('../models/bookcotemplate.js');
var path = require('path');
var XLSX = require('xlsx');
const jwt = require('jsonwebtoken');

const uploadfile = async (req, res, next) => {
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization.split(' ')[1],
            decoded;
        try {
            console.log(authorization);
            decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
        var userIdd = decoded.userId;
        console.log(userIdd);
    const {tempname} = req.body
    console.log(tempname);
    const templatefile = req.file.filename;
    if (templatefile) {
        
        try {
            var templatname = await AddtemplateModel.findOne({ userid: userIdd, Templatename:tempname })
            if (templatname == null) {
                res.send({ "status": "failed", "message": "Please do mapping properly" })
            }
            var columnA = templatname.tags;
            console.log("ar", columnA);
            
            

            var dataid = []
            // var workbook = XLSX.readFile(req.file.path, { sheetRows: 1 });
            var workbook = XLSX.readFile(req.file.path);
            // console.log("workbook",workbook);
            var sheet_namelist = workbook.SheetNames;
            let worksheet = workbook.Sheets[sheet_namelist[0]];
            
        
            var xlData = XLSX.utils.sheet_to_json(worksheet);
            console.log("xlData", xlData);
            const replaceKeys = (arr, obj) => {
                const keys = Object.keys(obj);
                const res = {};
                for (let a in arr) {
                    res[arr[a]] = obj[keys[a]];
                    obj[arr[a]] = obj[keys[a]];
                    delete obj[keys[a]];
                };
                
            };
            for(var i = 0; i < xlData.length; i++){
                replaceKeys(columnA, xlData[i]);
                console.log(xlData[i]);
                
            }
            
            try {
                    BulkFileModel.insertMany(xlData, (err, data) => {
                            if (err) {
                                console.log(err);
                                res.send({ "status": "failed", "message": "mapping field are not properly matched" })
                            } else {
                                // console.log(data);

                                for (var i = 0; i < data.length; i++) {
                                    var dati = data[i]._id;
                                    dataid.push(dati);
                                }
                                // var dati = data[1]._id;
                                console.log(dataid);

                                res.send({ "status": "succes", "message": "Inserted succesfully", "result": data,"id": dataid});

                            }

                        })
                    } catch (error) {
                        console.log("error: ", error);
                    }

            
        } catch (error) {
            console.log("error",error);
        }
    
    }
    else{
        res.send({ "status": "fail", "message": "give file" });

    }
}else{
    console.log("provide token");
}
}
module.exports={uploadfile}