// // // import { AddorderModel } from "../../models/orderModel/AddorderModel";
import { AddorderModel } from "../../models/orderModel/AddorderModel.js";
import { NotificationModel } from "../../models/NotificationModel/NotificationModel.js";
// // // const tokenverify = require('../../helpers/tokenverify.js');
import { tokenverify } from "../../helper/tokenverify.js";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { cancelOrderWish } from "../channelCredentialControllers/wishcontroller.js";
import { neweggCredModel } from "../../models/channelCredentialModel/neweggModel.js";
import { wishCredModel } from "../../models/channelCredentialModel/wishModel.js";
import { amazoncredModel } from "../../models/channelCredentialModel/amazonModel.js";
import { ebaycredModel } from "../../models/channelCredentialModel/ebayModel.js";
import { walmartCredModel } from "../../models/channelCredentialModel/walmartModel.js";
import { shopifycredModel } from "../../models/channelCredentialModel/shopifyModel.js";
import { cancelOrderShopify } from "../channelCredentialControllers/shopifycontroller.js";
import { canvcelOrderEbay } from "../channelCredentialControllers/ebaycontroller.js";

export const addorder = async (req, res) => {
  console.log("addorder", req.body);
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
    const userId = decoded.userId;

    const {
      orderDate,
      orderId,
      productName,
      orderNote,
      identifierType,
      identifier,
      category,
      condition,
      purchasePrice,
      quantity,
      commision,
      tax,
      listedPrice,
      marketplaces,
      recipientName,
      phoneNumber,
      buyerEmail,
      addressOne,
      addressTwo,
      city,
      state,
      country,
      postalCode,
      packageWeight,
      lbs,
      packageDimensions,
      width,
      height,
    } = req.body;

    const doc = new AddorderModel({
      orderDate,
      orderId,
      productName,
      orderNote,
      identifierType,
      identifier,
      category,
      condition,
      purchasePrice,
      quantity,
      commision,
      tax,
      listedPrice,
      marketplaces,
      recipientName,
      phoneNumber,
      buyerEmail,
      addressOne,
      addressTwo,
      city,
      state,
      country,
      postalCode,
      packageWeight,
      lbs,
      packageDimensions,
      width,
      height,
      userid: await tokenverify(req, res),
    });
    await doc.save();

    var orderDetails = await AddorderModel.findOne({
      orderId: orderId,
      userid: userId,
    });

    const notification = new NotificationModel({
      actionType: "Add Order",
      actionName: "Order added manually",
      description: "Order added",
      status: "Completed",
      date: new Date(),
      userid: userId,
    });
    await notification.save();

    var notify = await NotificationModel.findOne({
      userid: userId,
    });

    res.send({
      status: "success",
      message: "item creation successfully",
      details: orderDetails,
    });
  } catch (error) {
    console.error(error);

    // add proper error handling based on the error type
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid Authorization token" });
    } else if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err) => err.message);
      res.status(400).json({ errors });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const cancelOrder = async (req, res) => {
  let id = req.body.id;
  let marketplacename = req.body.marketplacename;
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
    const userId = decoded.userId;

    switch (marketplacename) {
      case "Walmart":
        const walmart_user = await walmartCredModel.findOne({ userid: userId, marketplacename: "Walmart", flag: 1 });
        if (walmart_user) {

        } else {
          return res.json({ "message": "not connected with walmart", "status": "not connected" });
        }
        break;
      case "Ebay":
        const ebay_user = await ebaycredModel.findOne({ userid: userId, marketplacename: "Ebay"});
        await canvcelOrderEbay(req, res, ebay_user);
        break;
      case "Amazon":
        const amazon_user = await amazoncredModel.findOne({ userid: userId, marketplacename: "Amazon" });
        if (amazon_user) {

        } else {
          return res.send("not connected with Amazon");
        }
        break;
      case "Wish":
        const Wish_user = await wishCredModel.findOne({ userid: userId, marketplacename: "Wish" });
        if (Wish_user) {
          await cancelOrderWish(req, res, Wish_user);
          // if(response)ˀ÷
        } else {
          return res.send({ message: "not connected with Wish", status: false });
        }
        break;
      case "Newegg":
        const Newegg_user = await neweggCredModel.findOne({ userid: userId, marketplacename: "Newegg" });
        if (Newegg_user) {
          await cancelOrderNewegg(req, res, Newegg_user);
          // if(response)ˀ÷
        } else {
          return res.send({ message: "not connected with Newegg", status: false });
        }
        break;
      case "Shopify":
        const Shopify_user = await shopifycredModel.findOne({ userid: userId, marketplacename: "Shopify" });
        if (Shopify_user) {
          await cancelOrderShopify(req, res, Shopify_user);
          // if(response)ˀ÷
        } else {
          return res.send({ message: "not connected with Shopify", status: false });
        }
        break;
      default:
        break;
    }

  } catch (error) {
    console.error(error);

    // add proper error handling based on the error type
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid Authorization token" });
    } else if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err) => err.message);
      res.status(400).json({ errors });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}