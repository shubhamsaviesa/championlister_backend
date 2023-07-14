// import jwt from 'jsonwebtoken'
// import { AddtemplateModel } from '../../models/actionModel/addtemplate.js';
// var output = []
// async function searchStringInArray(str, temparray, name) {
//     for (var j = 0; j <= temparray.length; j++) {
//         if (temparray[j].match(str)) {
//             var outputvalue = `${name} : ${temparray[j]}`
//             output.push(outputvalue);
//             temparray[j] = name;
//             return console.log(temparray[j]);
//         }

//     }
//     return console.log("not in array");
// }

// const mapTemplate = async (req, res, next) => {
//      if (req.headers && req.headers.authorization) {
//         var Manufactureization = req.headers.authorization.split(' ')[1],
//             decoded;
//         try {
//             console.log(Manufactureization);
//             decoded = jwt.verify(Manufactureization, process.env.JWT_SECRET_KEY);
//         } catch (e) {
//             return res.status(401).send('unManufactureized');
//         }
//         var userIdd = decoded.userId;
//         var { Productname,
//         SKU,
//         UPC,
//         ASIN,
//         ManufracturerPartNum,
//         Description,
//         Quantity,
//         SellingPrice,
//         CostPrice,
//         Brand,
//         ImageUrl,
//         Weight,
//         Length,
//         Height,
//         Width,
//         Manufracturer } = req.body;
//         console.log("vaidik",req.body)
//         var usertempid = req.params.id
//          try {
//             const usertemp = await AddtemplateModel.findOne({ _id: usertempid })
//             var usertemparray = usertemp
//             var templatename = usertemp
//             console.log(usertemparray, "usertemparray", templatename, "and", usertempid)
//             if (!Productname == "" && Productname != "Productname") {
//                 var value = 'Productname'
//                 console.log(value);
//                 searchStringInArray(Productname, usertemparray, value)
//             }
//             if (!Description == "" && Description != "Description") {
//                 var value = 'Description'
//                 console.log(value);
//                 await searchStringInArray(Description, usertemparray, value)
//             }
//             if (!SKU == "" && SKU != "SKU") {
//                 var value = 'SKU'
//                 console.log(value);
//                 await searchStringInArray(SKU, usertemparray, value)
//             }
//             if (!UPC == "" && UPC != "UPC") {
//                 var value = 'UPC'
//                 console.log(value);
//                 await searchStringInArray(UPC, usertemparray, value)
//             }
//             if (!Brand == "" && Brand != "Brand") {
//                 var value = 'Brand'
//                 console.log(value);
//                 await searchStringInArray(Brand, usertemparray, value)
//             }
//             if (!Quantity == "" && Quantity != "Quantity") {
//                 var value = 'Quantity'
//                 console.log(value);
//                 await searchStringInArray(Quantity, usertemparray, value)
//             }
//             if (!CostPrice == "" && CostPrice != "CostPrice") {
//                 var value = 'CostPrice'
//                 console.log(value);
//                 await searchStringInArray(CostPrice, usertemparray, value)
//             }
//             if (!SellingPrice == "" && SellingPrice != "SellingPrice") {
//                 var value = 'SellingPrice'
//                 console.log(value);
//                 await searchStringInArray(SellingPrice, usertemparray, value)
//             }
//             if (!ImageUrl == "" &&  ImageUrl != " ImageUrl") {
//                 var value = ' ImageUrl'
//                 console.log(value);
//                 await searchStringInArray( ImageUrl, usertemparray, value)
//             }
//             if (!ManufracturerPartNum == "" && ManufracturerPartNum != "ManufracturerPartNum") {
//                 var value = 'ManufracturerPartNum'
//                 console.log(value);
//                 await searchStringInArray(ManufracturerPartNum, usertemparray, value)
//             }
//             if (!Manufracturer == "" && Manufracturer != "Manufracturer") {
//                 var value = 'Manufracturer'
//                 console.log(value);
//                 await searchStringInArray(Manufracturer, usertemparray, value)
//             }
//             if (!Width == "" && Width != "Width") {
//                 var value = 'Width'
//                 console.log(value);
//                 await searchStringInArray(Width, usertemparray, value)
//             }
//             if (!ASIN == "" && ASIN != "ASIN") {
//                 var value = 'ASIN'
//                 console.log(value);
//                 await searchStringInArray(ASIN, usertemparray, value)
//             }
//             if (!Weight == "" && Weight != "Weight") {
//                 var value = 'Weight'
//                 console.log(value);
//                 await searchStringInArray(Weight, usertemparray, value)
//             }
//             if (!Length == "" && Length != "Length") {
//                 var value = 'Length'
//                 console.log(value);
//                 await searchStringInArray(Length, usertemparray, value)
//             }
//             if (!Height == "" && Height != "Height") {
//                 var value = 'Height'
//                 console.log(value);
//                 await searchStringInArray(Height, usertemparray, value)
//             }
//             console.log(usertemp);
//             console.log(output);
//             AddtemplateModel.updateOne({ tempName: templatename }, {
//                 $set: { tags: usertemp.tags, status: "Mapped" }
//             }, function (err, p) {
//                 if (err) {
//                     console.log(err);
//                 }
//                 console.log(p);
//             })
//             var templatedetails = await AddtemplateModel.find({ userid: userIdd });
//             var tempname = [];
//             var dataarray = templatedetails
//             var start = dataarray.length - 1;
//             console.log("vaidik from mapping",start);
//             for (var i = start; i >= 0; i--) {
//                 tempname.push(dataarray[i].Templatename)
//             }
//             res.send({ "status": "succes", "message": "Final mapping", "result": output, "after maping final template": usertemp, "tempname": tempname });
//             // console.log("vaidik from mapping output ",output)
//             // console.log("vaidik from mapping usertemp ",usertemp)
//             // console.log("vaiidk from tempname",tempname)

//         } catch (error) {
//             console.log("error", error);
//             res.send({ "status": "fail" });
//         }
//     } else {
//         console.log("provide token");
//     }
// }

// export default mapTemplate

import jwt from "jsonwebtoken";
import { AddtemplateModel } from "../../models/actionModel/addtemplate.js";
var output = [];
async function searchStringInArray(str, temparray, name) {
  for (var j = 0; j <= temparray.length; j++) {
    if (temparray[j].match(str)) {
      var outputvalue = `${name} : ${temparray[j]}`;
      output.push(outputvalue);
      temparray[j] = name;
      return console.log(temparray[j]);
    }
  }
  return console.log("not in array");
}

const mapTemplate = async (req, res, next) => {
  console.log("mapTemplate", req.body);
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
    var {
      ProductName,
      SKU,
      UPC,
      ASIN,
      ManufracturerPartNum,
      Description,
      Quantity,
      SellingPrice,
      CostPrice,
      Brand,
      ImageUrl,
      Weight,
      Length,
      Height,
      Width,
      Manufracturer,
    } = req.body;
    var usertempid = req.params.id;
    try {
      const usertemp = await AddtemplateModel.findOne({ _id: usertempid });
      var usertemparray = usertemp.tags;
      var templatename = usertemp.tempName;
      console.log("");
      if (!ProductName == "" && ProductName != "ProductName") {
        var value = "ProductName";
        console.log(value);
        searchStringInArray(ProductName, usertemparray, value);
      }
      if (!Description == "" && Description != "Description") {
        var value = "Description";
        console.log(value);
        await searchStringInArray(Description, usertemparray, value);
      }
      if (!SKU == "" && SKU != "SKU") {
        var value = "SKU";
        console.log(value);
        await searchStringInArray(SKU, usertemparray, value);
      }
      if (!UPC == "" && UPC != "UPC") {
        var value = "UPC";
        console.log(value);
        await searchStringInArray(UPC, usertemparray, value);
      }
      if (!Quantity == "" && Quantity != "Quantity") {
        var value = "Quantity";
        console.log(value);
        await searchStringInArray(Quantity, usertemparray, value);
      }
      if (!SellingPrice == "" && SellingPrice != "SellingPrice") {
        var value = "SellingPrice";
        console.log(value);
        await searchStringInArray(SellingPrice, usertemparray, value);
      }
      if (!CostPrice == "" && CostPrice != "CostPrice") {
        var value = "CostPrice";
        console.log(value);
        await searchStringInArray(CostPrice, usertemparray, value);
      }
      if (!Brand == "" && Brand != "Brand") {
        var value = "Brand";
        console.log(value);
        await searchStringInArray(Brand, usertemparray, value);
      }
      if (!ImageUrl == "" && ImageUrl != "ImageUrl") {
        var value = "ImageUrl";
        console.log(value);
        await searchStringInArray(ImageUrl, usertemparray, value);
      }
      if (!Manufracturer == "" && Manufracturer != "Manufracturer") {
        var value = "Manufracturer";
        console.log(value);
        await searchStringInArray(Manufracturer, usertemparray, value);
      }
      if (
        !ManufracturerPartNum == "" &&
        ManufracturerPartNum != "ManufracturerPartNum"
      ) {
        var value = "ManufracturerPartNum";
        console.log(value);
        await searchStringInArray(ManufracturerPartNum, usertemparray, value);
      }
      if (!Weight == "" && Weight != "Weight") {
        var value = "Weight";
        console.log(value);
        await searchStringInArray(Weight, usertemparray, value);
      }
      if (!ASIN == "" && ASIN != "ASIN") {
        var value = "ASIN";
        console.log(value);
        await searchStringInArray(ASIN, usertemparray, value);
      }
      if (!Length == "" && Length != "Length") {
        var value = "Length";
        console.log(value);
        await searchStringInArray(Length, usertemparray, value);
      }
      if (!Height == "" && Height != "Height") {
        var value = "Height";
        console.log(value);
        await searchStringInArray(Height, usertemparray, value);
      }
      if (!Width == "" && Width != "Width") {
        var value = "Width";
        console.log(value);
        await searchStringInArray(Width, usertemparray, value);
      }
      console.log(usertemp);
      console.log(output);
      AddtemplateModel.updateOne(
        { tempName: templatename },
        {
          $set: { tags: usertemp.tags, status: "Mapped" },
        },
        function (err, p) {
          if (err) {
            console.log(err);
          }
          console.log(p);
        }
      );
      var templatedetails = await AddtemplateModel.find({ userid: userIdd });
      var tempname = [];
      var dataarray = templatedetails;
      var start = dataarray.length - 1;
      console.log("vaidik from mapping", start);
      for (var i = start; i >= 0; i--) {
        tempname.push(dataarray[i].tempName);
      }
      res.send({
        status: "succes",
        message: "Final mapping",
        result: output,
        "after maping final template": usertemp,
        tempname: tempname,
      });
      // console.log("vaidik from mapping output ",output)
      // console.log("vaidik from mapping usertemp ",usertemp)
      // console.log("vaiidk from tempname",tempname)
    } catch (error) {
      console.log("error", error);
      res.send({ status: "fail" });
    }
  } else {
    console.log("provide token");
  }
};

export default mapTemplate;
