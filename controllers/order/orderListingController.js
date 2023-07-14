import { AddorderModel } from "../../models/orderModel/AddorderModel.js";
import Jwt from "jsonwebtoken";
import { getOrderListWish } from "../channelCredentialControllers/wishcontroller.js";
import { amazonorders } from "../channelCredentialControllers/amazoncontroller.js";
import { getOrderListEbay } from "../channelCredentialControllers/ebaycontroller.js";
import { walmartOrders } from "../channelCredentialControllers/walmartController.js";
import { channelactive } from "../settingControllers/channelSetting.js";
import { getOrderListShopify } from "../channelCredentialControllers/shopifycontroller.js";
import { getOrderListNewegg } from "../channelCredentialControllers/neweggcontroller.js";

export const orderlist = async (req, res) => {
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
    // let resWish, resWalmart, resAmazon, resEbay;
    let activeChannel = await channelactive(req, res, null, "order");
    console.log(activeChannel);
    await activeChannel.forEach((obj) => {
      Object.keys(obj).forEach(async (key) => {
        if (obj[key] === "Connected") {
          switch (key) {
            case "Walmart":
              await walmartOrders(req, res, userId);
              break;
            case "eBay":
              await getOrderListEbay(req, res, userId);
              break;
            case "Amazon":
              await amazonorders(req, res, userId);
              break;
            case "Wish":
              await getOrderListWish(req, res, userId);
              break;
            case "Newegg":
              await getOrderListNewegg(req, res, userId);
              break;
            case "Shopify":
              await getOrderListShopify(req, res, userId);
              break;
            default:
              break;
          }
        }
      });
    });
    // if (resWish || resWalmart || resAmazon || resEbay) {
      let orderList = await AddorderModel.find({ userid: userId }).sort({ orderDate: -1 });
      res.send({ listings: orderList });
    // }
  } catch (err) {
    console.error(err);
    return res.status(401).send("Invalid or expired token");
  }
};

export const deleteorder = async (req, res, next) => {
  console.log("deleteorder", req.body);
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(" ")[1],
      decoded;
    try {
      console.log(authorization);
      decoded = Jwt.verify(authorization, process.env.JWT_SECRET_KEY);
    } catch (e) {
      return res.status(401).send("unauthorized");
    }
    var userIdd = decoded.userId;
    const id = req.body.id;
    const doc = await AddorderModel.findOneAndUpdate(
      { userid: userIdd, _id: id },
      {
        disable: true, // addwishproductid
      }
    ).catch(function (err) {
      console.log(err);
      res.send({ error: err });
    });
    await doc.save();
    // AddorderModel.deleteMany({ userid: userIdd, _id: id }, function (err, obj) {
    //   if (err) {
    //     res.send({ error: err });
    //   } else {
    //     res.send({ status: "delete success", message: obj, id: id });
    //   }
    // });
    res.send({ status: "delete success", message: obj, id: id });
  } else {
    console.log("provide token");
  }
};
