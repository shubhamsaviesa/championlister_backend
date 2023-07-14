import jwt from "jsonwebtoken";
import { Storage } from "@google-cloud/storage";
import { addInventoryModel } from "../../models/actionModel/addInventory.js";
import path from "path";
import { fileURLToPath } from "url";
import Jwt from "jsonwebtoken";
import { check, validationResult, body } from "express-validator";
import { walmartCredModel } from "../../models/channelCredentialModel/walmartModel.js";
import { amazoncredModel } from "../../models/channelCredentialModel/amazonModel.js";
import {walmart}  from "../channelCredentialControllers/walmartController.js";
import {amazon, amazonUpdate} from "../channelCredentialControllers/amazoncontroller.js";
import { testWalmart } from "../testWalmart.js";
import { wishCredModel } from "../../models/channelCredentialModel/wishModel.js";
import { createProductOnWish, updateProductOnWish } from "../channelCredentialControllers/wishcontroller.js";
import { ebay } from "../channelCredentialControllers/ebaycontroller.js";
import { neweggCredModel } from "../../models/channelCredentialModel/neweggModel.js";
import { createProductOnNewegg } from "../channelCredentialControllers/neweggcontroller.js";
import { shopifycredModel } from "../../models/channelCredentialModel/shopifyModel.js";
import { createProductOnShopify, updateProductOnShopify } from "../channelCredentialControllers/shopifycontroller.js";
import { ebaycredModel } from "../../models/channelCredentialModel/ebayModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gc = new Storage({
  keyFilename: path.join(
    __dirname,
    "../../platinum-sorter-172610-0d2d41517966.json"
  ),
  projectId: "platinum-sorter-172610",
});
const bucket = gc.bucket("championlister");

export const addinventory = async (req, res) => {
  console.log("add inventrory insertdata", req.files);
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return res
        .status(401)
        .json({ message: "Authorization token is missing" });
    }

    const decoded = jwt.verify(
      authorization.split(" ")[1],
      process.env.JWT_SECRET_KEY
    );
    const userIdd = decoded.userId;

    const validationRules = [
      body("productname", "Product Name is Required").isString(),
      body("description", "Description is Required").isString(),
      body("identifiertype", "Identification Type is Required").isString(),
      body("condition", "Condition is Required").isString(),
      body("category", "Category is Required").isString(),
      body("availableqty", "Available Quantity is Required").isNumeric(),
      body("costprice", "Cost Price is Required").isNumeric(),
      body("profitprice", "Profit Price is Required").isNumeric(),
      body("sku").isAlphanumeric().withMessage("SKU must be alphanumeric"),
    ];

    await Promise.all(validationRules.map((validation) => validation.run(req)));
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sku = req.body.sku;
    const existingInventory = await addInventoryModel.findOne({ sku: sku });

    if (existingInventory) {
      return res.json({
        status: "sku exist",
        message: "sku exist",
      });
    }

    const {
      lbs,
      height,
      width,
      length,
      weight,
      marketplacecommision,
      profitprice,
      costprice,
      gstin,
      upc,
      mapprice,
      lisrtprice,
      manufacturernumber,
      manufacturer,
      availableqty,
      brand,
      category,
      condition,
      identifier,
      identifiertype,
      description,
      productname,
      other = {},
    } = req.body;

    const imageupload1 =
      `http://localhost:5000/` + req.files["imageupload1"][0].path;
    const imageupload2 =
      `http://localhost:5000/` + req.files["imageupload2"][0].path;
    const imageupload3 =
      `http://localhost:5000/` + req.files["imageupload3"][0].path;

    const doc = new addInventoryModel({
      lbs,
      height,
      width,
      length,
      weight,
      marketplacecommision,
      profitprice,
      costprice,
      other,
      sku,
      gstin,
      upc,
      mapprice,
      lisrtprice,
      manufacturernumber,
      manufacturer,
      availableqty,
      condition,
      brand,
      category,
      identifier,
      identifiertype,
      description,
      productname,
      add_modify_delete: "A",
      product_code_type: 1,
      date: new Date(),
      userid: userIdd,
      imageupload1,
      imageupload2,
      imageupload3,
    });
    await doc.save();

    return res.json({
      status: "success",
      message: "Item created successfully",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "500", message: "Internal server error" });
  }
};

export const editProductCatalog = async (req, res) => {
  console.log("editeddata", req.body);
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return res
        .status(401)
        .json({ message: "Authorization token is missing" });
    }

    const decoded = jwt.verify(
      authorization.split(" ")[1],
      process.env.JWT_SECRET_KEY
    );
    const validationRules = [
      body("productname", "Product Name is Required").isString(),
      body("description", "Description is Required").isString(),
      body("identifiertype", "Identification Type is Required").isString(),
      body("condition", "Condition is Required").isString(),
      body("category", "Category is Required").isString(),
      body("availableqty", "Available Quantity is Required").isNumeric(),
      body("costprice", "Cost Price is Required").isNumeric(),
      body("profitprice", "Profit Price is Required").isNumeric(),
      body("sku").isAlphanumeric().withMessage("SKU must be alphanumeric"),
    ];

    await Promise.all(validationRules.map((validation) => validation.run(req)));
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = decoded.userId;
    const id = req.body._id;

    const {
      lbs,
      height,
      width,
      length,
      weight,
      marketplacecommision,
      profitprice,
      costprice,
      gstin,
      upc,
      sku,
      mapprice,
      lisrtprice,
      manufacturernumber,
      manufacturer,
      availableqty,
      brand,
      category,
      condition,
      identifier,
      identifiertype,
      description,
      productname,
      other = {},
    } = req.body;

    const updateDoc = {
      lbs,
      height,
      width,
      length,
      weight,
      marketplacecommision,
      profitprice,
      costprice,
      gstin,
      upc,
      sku,
      mapprice,
      lisrtprice,
      manufacturernumber,
      manufacturer,
      availableqty,
      brand,
      category,
      condition,
      identifier,
      identifiertype,
      description,
      productname,
      other,
    };

    const updatedDoc = await addInventoryModel.findByIdAndUpdate(
      id,
      { $set: updateDoc },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).send("Document not found");
    }

    res.send({
      status: "success",
      message: "Edit done",
      updatedData: updatedDoc,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "Internal server error",
      message: "Internal server error",
    });
  }
};

export const productcatalog = async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).send("Authentication required");
  }
  const [authType, token] = authorizationHeader.split(" ");
  if (authType !== "Bearer" || !token) {
    return res.status(401).send("Invalid authorization header");
  }
  try {
    const decoded = Jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userId;
    let catalogdata = await addInventoryModel.find({ userid: userId });
    var riverscatalogdata = [];
    var dataarray = catalogdata;
    var start = dataarray.length - 1;
    for (var i = start; i >= 0; i--) {
      riverscatalogdata.push(dataarray[i]);
    }
    res.send({ data: riverscatalogdata });
  } catch (err) {
    console.error(err);
    return res.status(401).send("Invalid or expired token");
  }
};

export const getProductCatalogId = async (req, res) => {
  const id = req.params.id;
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).send("Authentication required");
  }
  const [authType, token] = authorizationHeader.split(" ");
  if (authType !== "Bearer" || !token) {
    return res.status(401).send("Invalid authorization header");
  }
  try {
    const decoded = Jwt.verify(token, process.env.JWT_SECRET_KEY);
    // const userId = decoded.userId;
    const data = await addInventoryModel.findOne({ _id: id });
    res.send(data);
  } catch (err) {
    console.error(err);
    return res.status(401).send("Invalid or expired token");
  }
};

export const productcatalogdatefilters = async (req, res) => {
  const { date1, date2 } = req.body;
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
    var dates = await addInventoryModel.find({
      date: {
        $gte: date1,
        $lte: date2,
      },
      userid: userIdd,
    });
    var riversarray = [];
    var dataarray = dates;
    var start = dataarray.length - 1;
    console.log(start);
    for (var i = start; i >= 0; i--) {
      riversarray.push(dataarray[i]);
    }

    res.send({ status: "success", catalogdata: riversarray });
  } else {
    console.log("provide token");
  }
};

export const deleteOneproductcatalog = async (req, res, next) => {
  console.log("deleteOneproductcatalog", req.body);
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
    const id = req.body.id;
    addInventoryModel.deleteOne(
      { userid: userIdd, _id: id },
      function (err, obj) {
        if (err) {
          console.log("err", err);
          res.send({ error: err });
        } else {
          console.log("obj", obj);
          res.send({ status: "delete success", message: obj, id: id });
        }
      }
    );
  } else {
    console.log("provide token");
  }
};

export const deleteActionproductcatalog = async (req, res, next) => {
  console.log("product catalog multi delete")
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
    const id = req.body.id;
    addInventoryModel.deleteMany(
      { userid: userIdd, _id: id },
      function (err, obj) {
        if (err) {
          res.send({ error: err });
        } else {
          res.send({ status: "delete success", message: obj, id: id });
        }
      }
    );
  } else {
    console.log("provide token");
  }
};

// export var exportCatalog = async (req, res, next) => {
//   var id = req.body.idd;
//   // var credid = req.body.credid;
//   var marketplacename = req.body.marketplacename;
//   console.log(id);
//   console.log(1111,marketplacename);
//   if (req.headers && req.headers.authorization) {
//       var authorization = req.headers.authorization.split(' ')[1],
//           decoded;
//       try {
//           console.log(authorization);
//           decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
//       } catch (e) {
//           return res.status(401).send('unauthorized');
//       }
//       var userIdd = decoded.userId;
//       console.log(userIdd);
//   for (var i = 0; i < marketplacename.length; i++) {
//       switch (marketplacename[i]) {
//           case "Walmart":
//             console.log("from walmart");
//               const walmart_user = await walmartCredModel.findOne({ userid: userIdd, marketplacename: "Walmart", flag: 1 })
//               if(walmart_user){
//                   const walmartid = walmart_user._id;
//                   await walmartbooks(req, res, id, walmartid);
//                   console.log("done walmart now uploding");
//                   break;
//               }
//               else{
//                   res.send({ "message": "not connected with walmart", "status": "not connected" });
//               }
//               break;

//           case "Ebay":
//               const ebay_user = await EbayCredModel.findOne({ userid: userIdd, marketplacename: "Ebay", flag: 1 })
//                 if(ebay_user){
//                   const ebayid = ebay_user._id;
//                   await ebaybooks(req, res, id, ebayid);
//                   break;
//               }
//               else{
//                   console.log("not connected with ebay");
//                   res.send({ "message": "not connected with ebay", "status": "not connected" });
//               }
//               break;
 
//            case "Amazon":
//               const amazon_user = await AmazonCredModel.findOne({ userid: userIdd, marketplacename: "Amazon" })
//               if (amazon_user) {
//                   const amazonid = amazon_user._id;
//                   await amazon(req, res,id, amazonid);
//                   console.log("done Amazon now uploding");
//                   break;
//               }
//               else {
//                   res.send("not connected with walmart");
//               }
//               break;    

//           default:
//               break;
//       }
//   }
//   } else {
//       console.log("provide token");
//   }
// }

export var exportCatalog = async (req, res, next) => {
  let id = req.body.id; // Id getting with array for the single and bulk
  let marketplacename = req.body.marketplacename; // marketplace getting with array for the single and bulk
  let action = req.body.action; // action is getting string which action perform

  let authorization = req.headers.authorization?.split(' ')[1],
  decoded;
  try {
  decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
  } catch (e) {
    return res.status(401).send('unauthorized');
  }
    let userIdd = decoded.userId;
    for (let i = 0; i < marketplacename.length; i++) {
      // console.log("export",req.body,marketplacename[i]) 
        switch (marketplacename[i]) {
        case "Walmart":
          const walmart_user = await walmartCredModel.findOne({ userid: userIdd, marketplacename: "Walmart", flag: 1 });
          if (walmart_user) {
            const walmartid = walmart_user._id;
            await walmart(req, res, id, walmartid);
          } else {
            return res.json({ "message": "not connected with walmart", "status": "not connected" });
          }
          break;
        case "Ebay":
          const ebay_user = await ebaycredModel.findOne({ userid: userIdd, marketplacename: "Ebay" });
          if (ebay_user) {
            const response = await ebay(req, res, id, ebay_user);
            res.send(response)
          } else {
            console.log("not connected with ebay");
            return res.send({ "message": "not connected with ebay", "status": "not connected" });
          }
          break;
        case "Amazon":
          const amazon_user = await amazoncredModel.findOne({ userid: userIdd, marketplacename: "Amazon" });
          if (amazon_user) {
            const amazonid = amazon_user._id;
            console.log("action", action);
            if(action === "create"){
              await amazon(req, res, id, amazon_user);
              // console.log("done Amazon now uploading");
            }else if(action === "update"){
              await amazonUpdate(req, res, id, amazon_user);
            }
          } else {
          //  return res.send("not connected with Amazon");
          }
          break;
        case "Wish":
          const Wish_user = await wishCredModel.findOne({ userid: userIdd, marketplacename: "Wish" });
          if (Wish_user) {
            const Wishid = Wish_user._id;
            if(action === 'create'){
              const response = await createProductOnWish(req, res, id, Wish_user);
              res.send(response)
            }else if(action === 'update'){
              const response = await updateProductOnWish(req, res, id, Wish_user);
              res.send(response)
            }
            // if(response)ˀ÷
          } else {
           return res.send("not connected with Wish");
          }
          break;
        case "Newegg":
          const neweggCred = await neweggCredModel.findOne({ userid: userIdd, marketplacename: "Newegg" });
          if (neweggCred) {
            if(action === 'create'){
              const response = await createProductOnNewegg(req, res, id, neweggCred);
              res.send(response)
            }else if(action === 'update'){
              const response = await updateProductOnWish(req, res, id, neweggCred);
              res.send(response)
            }
            // if(response)ˀ÷
          } else {
           return res.send("not connected with Newegg");
          }
          break;
        case "Shopify":
          const ShopifyCred = await shopifycredModel.findOne({ userid: userIdd, marketplacename: "Shopify" });
          if (ShopifyCred) {
            if(action === 'create'){
              const response = await createProductOnShopify(req, res, id, ShopifyCred);
              res.send(response)
            }else if(action === 'update'){
              const response = await updateProductOnShopify(req, res, id, ShopifyCred);
              res.send(response)
            }
            // if(response)ˀ÷
          } else {
           return res.send("not connected with Shopify");
          }
          break;
        default:
          break;
      }
    }

    // res.json({sucess: true})
  
  next()
};
