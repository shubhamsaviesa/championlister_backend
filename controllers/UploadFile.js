import { BulkFileModel } from '../models/bulkuploadfile.js';
import { AddtemplateModel } from '../models/actionModel/addtemplate.js';
import path from 'path'
import XLSX from 'xlsx'
import jwt from "jsonwebtoken";
import { addInventoryModel } from '../models/actionModel/addInventory.js';
import { ListingsModel } from '../models/actionModel/Listing.js';


export const UploadFile = async (req, res) => {
  console.log(req.body)
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(" ")[1],
      decoded;
    try {
      decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
    } catch (e) {
      return res.status(401).send("unauthorized");
    }
    var userIdd = decoded.userId;
    const { tempName } = req.body;
    const templatefile = req.file.filename;
    if (templatefile) {
      try {
        var templatname = await AddtemplateModel.findOne({
          userid: userIdd,
          Templatename: tempName,
        });
        if (templatname == null) {
          res.send({ status: "failed", message: "Please do mapping properly" });
        }
        var columnA = templatname.tags;
        var dataid = [];
        var workbook = XLSX.readFile(req.file.path);

        var sheet_namelist = workbook.SheetNames;

        let worksheet = workbook.Sheets[sheet_namelist[0]];
        var xlData = XLSX.utils.sheet_to_json(worksheet);
        const replaceKeys = (arr, obj) => {
          const keys = Object.keys(obj);
          const res = {};
          console.log("arr keys", obj);
          for (let a in arr) {
            // const key = arr[a].toLowerCase();
            const key = arr[a];
            console.log(1111111, key, obj[key], obj[key + "*"]);
            res[arr[a]] =
              obj[key] ||
              obj[key + "*"] ||
              obj[key.toLowerCase()] ||
              obj[key.toLowerCase() + "*"];
            obj[arr[a]] =
              obj[key] ||
              obj[key + "*"] ||
              obj[key.toLowerCase()] ||
              obj[key.toLowerCase() + "*"];
            if (key === "costprice") {
              res[arr[a]] = obj["cost_price"] || obj["cost_price*"];
            }
            if (key === "Productname") {
              res[arr[a]] = obj["Productname"] || obj["Productname*"];
            }
            if (key === "itemcondition") {
              res[arr[a]] = obj["item_condition"] || obj["item_condition*"];
            }
          }
        };

        for (var i = 0; i < xlData.length; i++) {
          replaceKeys(columnA, xlData[i]);
        }
        console.log(333333333333, xlData);
        try {
          BulkFileModel.insertMany(xlData, (err, data) => {
            if (err) {
              res.send({
                status: "failed",
                message: "mapping field are not properly matched",
              });
            }
          });
          let inventryData = xlData.map((obj) => {
            return {
              lbs: obj?.LBS || obj?.Lbs || obj?.lbs,
              height: obj?.HEIGHT || obj?.Height || obj?.height,
              width: obj?.WIDTH || obj?.Width || obj?.width,
              length: obj?.LENGTH || obj?.Length || obj?.length,
              weight: obj?.WEIGHT || obj?.Weight || obj?.weight,
              costprice: obj?.cost_price || obj?.CostPrice,
              sku: obj?.SKU || obj?.Sku || obj?.sku,
              gstin: obj?.GSTIN || obj?.Gstin || obj?.gstin,
              upc: obj?.UPC || obj?.Upc || obj?.upc,
              lisrtprice: obj?.SellingPrice || obj?.selling_price,
              manufacturernumber: obj?.ManufracturerPartNum,
              manufacturer: obj?.Manufracturer,
              availableqty: obj?.Quantity,
              condition: obj?.itemcondition,
              brand: obj?.Brand,
              description: obj?.Description,
              productname: obj?.ProductName,
              add_modify_delete: "A",
              product_code_type: 1,
              date: new Date(),
              userid: userIdd,
              imageupload1: obj?.ImageUrl,
            }
          });
          ListingsModel.insertMany(inventryData, (err, data) => {
            if (err) {
              res.send({
                status: "failed",
                message: "mapping field are not properly matched",
              });
            }
          })
          addInventoryModel.insertMany(inventryData, (err, data) => {
            if (err) {
              res.send({
                status: "failed",
                message: "mapping field are not properly matched",
              });
            } else {
              for (var i = 0; i < data.length; i++) {
                var dati = data[i]._id;
                dataid.push(dati);
              }

              res.send({
                status: "success",
                message: "Inserted succesfully",
                result: data,
                id: dataid,
              });
            }
          });
        } catch (error) {
          console.log("error: ", error);
        }
      } catch (error) {
        console.log("error", error);
      }
    } else {
      res.send({ status: "fail", message: "give file" });
    }
  } else {
    console.log("provide token");
  }

}
