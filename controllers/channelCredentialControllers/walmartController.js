import { addInventoryModel } from "../../models/actionModel/addInventory.js";
import { NotificationModel } from "../../models/NotificationModel/NotificationModel.js";
import { ListingsModel } from "../../models/actionModel/Listing.js";
import { walmartCredModel } from "../../models/channelCredentialModel/walmartModel.js";
import fs from "fs";
import request from "request";
import xmlParser from 'xml2json';
import jwt from "jsonwebtoken";
import axios from "axios";
import FormData from "form-data";
import { promisify } from "util";
import fetch from 'node-fetch';
import { AddorderModel } from "../../models/orderModel/AddorderModel.js";


export async function walmart(req, res, id3, credid3) {
  console.log("in walmart", id3);
  try {
    let savedUser = await addInventoryModel.find({ _id: "6423cc5739cbd576c5e1e9e3" });
    // console.log(saved_user);
    // console.log(saved_user[0].sku);
    // console.log(saved_user.length);
    let count = 1;
    var allusers = [];
    var MPItem = [];
    var today = new Date();
    var month = today.getMonth() + 1;
    var tdate = today.getDate();
    if (month < 10 && tdate < 10) {
      let date =
        ("" + today.getFullYear()).substring(2) +
        "0" +
        (today.getMonth() + 1) +
        "0" +
        today.getDate() +
        "_" +
        today.getHours() +
        +today.getMinutes();
    } else {
      let date =
        ("" + today.getFullYear()).substring(2) +
        +(today.getMonth() + 1) +
        +today.getDate() +
        "_" +
        today.getHours() +
        +today.getMinutes();
    }
    for (let i = 0; i < savedUser.length; i++) {
      let inventory = {
        Orderable: {
          sku: savedUser[i].sku,
          productIdentifiers: {
            productIdType: "upc",
            productId: savedUser[i].upc,
          },
          productName: savedUser[i].productname,
          brand: savedUser[i].brand,
          price: savedUser[i].costprice,
          ShippingWeight: savedUser[i].weight,
          electronicsIndicator: "No",
          batteryTechnologyType: "Does Not Contain a Battery",
          chemicalAerosolPesticide: "No",
          shipsInOriginalPackaging: "No",
          startDate: "2022-08-08T08:00:00Z",
          endDate: "2023-01-01T08:00:00Z",
          MustShipAlone: "No",
        },
        Visible: {
          "Books & Magazines": {
            shortDescription: savedUser[i].description,
            mainImageUrl:
              "https://www.google.com/imgres?imgurl=http%3A%2F%2Frukmini1.flixcart.com%2Fimage%2F300%2F300%2Fjj4ln680%2Fbook%2F5%2F2%2F0%2Falfirean-age-book-original-imaf6rcy83cfvzrk.jpeg&imgrefurl=https%3A%2F%2Fwww.flipkart.com%2Falfirean-age-book%2Fp%2Fitmf6ryes6zcpgxd&tbnid=g7bjkf7-Oial_M&vet=12ahUKEwjA26y0xd_5AhVgyKACHXf0BtoQMygAegQIARAi..i&docid=-BH3WdsIdruj-M&w=200&h=300&itg=1&q=bookiage&ved=2ahUKEwjA26y0xd_5AhVgyKACHXf0BtoQMygAegQIARAi",
            productSecondaryImageURL: [
              "https://i5.walmartimages.com/asr/8e517c62-b3a0-4c3f-9b62-576e4686614f.bca27434aa9bb91c79125b807c027556.jpeg",
            ],
          },
        },
      };

      allusers.push(inventory);
    }
    const user = {
      MPItemFeedHeader: {
        sellingChannel: "marketplace",
        processMode: "REPLACE",
        subset: "EXTERNAL",
        locale: "en",
        version: "1.4",
        subCategory: "books_and_magazines",
      },
      MPItem: allusers,
    };
    const item = JSON.stringify(user);
    const file = Buffer.from(item);
    console.log("file", file);
    const finalitem = JSON.parse(item);
    fs.writeFile("./json/data.json", file, (err) => {
      if (err) {
        console.log("error", err);
      } else {
        console.log("Done");
      }
    });
    try {
      const cred = await walmartCredModel.findById("643e3913c614dbdc2bf224f8");
      const { walmartid, walmartsecret, nickname } = cred;
      console.log("cred", walmartid)
      const options = {
        url: "https://marketplace.walmartapis.com/v3/token",
        auth: {
          user: walmartid,
          pass: walmartsecret,
        },
        headers: {
          Accept: "text/plain",
          "WM_SVC.NAME": nickname,
        },
        form: {
          grant_type: "client_credentials",
        },
      };
      const { access_token } = await promisify(request.post)(options);

      const feedOptions = {
        url: "https://marketplace.walmartapis.com/v3/feeds?feedType=MP_ITEM",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "WM_QOS.CORRELATION_ID": walmartid,
          "WM_SVC.NAME": nickname,
        },
        formData: {
          // file: fs.createReadStream('data.json'),
        },
      };


      const response = await promisify(request.post)(feedOptions);
      return res.status(200).json({
        message: "Feed uploaded successfully.",
        data: response
        // feedId: response.headers["wm.consumer.id"],
      });
      // } else {
      //   throw new Error("Error uploading feed.");
      // }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
        error: error.message,
      });
    }


  } catch (error) {
    console.log("main catch", error);
  }
}

const getToken = async (id) => {
  const cred = await walmartCredModel.findOne({ userid: id });
  const { walmartid, walmartsecret, nickname } = cred;
  console.log("cred", walmartid)
  const options = {
    url: "https://marketplace.walmartapis.com/v3/token",
    auth: {
      user: walmartid,
      pass: walmartsecret,
    },
    headers: {
      "WM_SVC.NAME": nickname,
      "WM_QOS.CORRELATION_ID": walmartid,
    },
    form: {
      grant_type: "client_credentials",
    },
  };
  return new Promise(function (resolve, reject) {

    request.post(options, async (error, response, body) => {
      if (error) {
        console.error(error);
        // res.status(500).json({ error: "Internal server error" });
      } else if (response.statusCode !== 200) {
        console.error(body);

        if (userId && JSON.parse(body).code === 10002) {
          let token = await wishtoken.findOne({ userid: userId });
          resolve(token.access_token);
        } 
      } else {
        console.log("else", typeof body);

        if (id) {
          const { OAuthTokenDTO } = JSON.parse(xmlParser.toJson(body));
          resolve(OAuthTokenDTO.accessToken)
        }
        // res.json({ success: true, data: body });
      }
    });
  });
}

function dateToYMD(date) {
  var d = date.getDate();
  var m = date.getMonth() + 1; //Month from 0 to 11
  var y = date.getFullYear();
  return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}

export const walmartOrders = async (req, res, id) => {
  try {
    const apiEndpoint = `https://marketplace.walmartapis.com/v3/ca/orders?limit=10&createdStartDate=${dateToYMD(new Date())}`;
    let token = await getToken(id);
    const cred = await walmartCredModel.findOne({ userid: id });
    const { walmartid, walmartsecret, nickname } = cred;
    console.log(token);
    return new Promise(function (resolve, reject) {
      request.get({
        url: apiEndpoint, headers: {
          'Authorization': `Bearer ${token}`,
          "WM_SVC.NAME": nickname,
          "WM_QOS.CORRELATION_ID": walmartid,
        }
      }, async (error, response, body) => {
        if (error) {
          console.error(error);
          // res.send({ error: "Internal server error" });
        } else if (response.statusCode !== 200) {
          console.error("body", body);
          // res.send({ success: false, ...JSON.parse(body) });
        } else {
          // console.log(JSON.parse(body));
          let orderlist = JSON.parse(xmlParser.toJson(body)).list.elements.order;
          for (let order of orderlist) {
            let orderExist = await AddorderModel.find({ orderId: order.purchaseOrderId });
            if (orderExist?.length) {
              const doc = await AddorderModel.findOneAndUpdate(
                { orderId: order.purchaseOrderId, userid: id },
                {
                  orderStatus: order?.orderLines?.orderLine[0]?.orderLineStatuses?.orderLineStatus[0]?.status, // addwishproductid
                }
              ).catch(function (err) {
                console.log(err);
              });
              await doc?.save();
            } else {
              const doc = new AddorderModel({
                orderDate: order?.orderDate,
                orderId: order?.purchaseOrderId,
                productName: order?.orderLines?.orderLine[0]?.item?.productName,
                productId: order?.customerOrderId,
                purchasePrice: order?.orderLines?.orderLine[0]?.charges?.charge[0]?.chargeAmount?.amount,
                quantity: order?.orderLines?.orderLine[0]?.orderLineStatuses?.orderLineStatus[0]?.statusQuantity?.amount,
                tax: order?.orderLines?.orderLine[0]?.charges?.tax?.taxAmount?.amount,
                listedPrice: order?.orderLines?.orderLine[0]?.charges?.charge[0]?.chargeAmount?.amount,
                marketplaces: "EBay",
                recipientName: order?.shippingInfo?.postalAddress?.name,
                phoneNumber: order?.shippingInfo?.phone,
                addressOne: order?.shippingInfo?.postalAddress?.address1,
                addressTwo: order?.shippingInfo?.postalAddress?.address2,
                city: order?.shippingInfo?.postalAddress?.city,
                state: order?.shippingInfo?.postalAddress?.state,
                country: order?.shippingInfo?.postalAddress?.country,
                postalCode: parseInt(order?.shippingInfo?.postalAddress?.postalCode),
                orderStatus: order?.orderLines?.orderLine[0]?.orderLineStatuses?.orderLineStatus[0]?.status,
                sku: order?.orderLines?.orderLine[0]?.item?.sku,
                userid: id,
              });
              await doc.save();
            }
          }
          // resolve({ success: true, ...JSON.parse(body) });
          resolve({ success: true })
        }
      });
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }

}

export const walmartCancelOrder = async (req, res, id) => {
  try {
    const apiEndpoint = `https://marketplace.walmartapis.com/v3/ca/orders/${req.body.id}/cancel`;
    let token = await getToken(id);
    const cred = await walmartCredModel.findOne({ userid: id });
    const { walmartid, walmartsecret, nickname } = cred;
    let bodyXml = `<?xml version="1.0" encoding="UTF-8"?>
    <orderCancellation xmlns="http://walmart.com/mp/v3/orders">
        <orderLines>
            <orderLine>
                <lineNumber>1</lineNumber>
                <orderLineStatuses>
                    <orderLineStatus>
                        <status>Cancelled</status>
                        <cancellationReason>CUSTOMER_REQUESTED_SELLER_TO_CANCEL</cancellationReason>
                        <statusQuantity>
                            <unitOfMeasurement>EACH</unitOfMeasurement>
                            <amount>1</amount>
                        </statusQuantity>
                    </orderLineStatus>
                </orderLineStatuses>
            </orderLine>
        </orderLines>
    </orderCancellation>
    `;
    request.post({
      url: apiEndpoint, body: JSON.stringify(data), headers: {
        'authorization': `Bearer ${token}`,
        'Content-Type': 'application/xml',
      }
    }, async (error, response, body) => {
      if (error) {
        console.error(error);
        res.send({ error: "Internal server error" });
      } else if (response.statusCode !== 200) {
        console.error(body);
        res.send({ success: false, ...JSON.parse(body) });
      } else {
        console.log(JSON.parse(body));
        const doc = await AddorderModel.findOneAndUpdate(
          { orderId: req.body.id },
          {
            orderStatus: JSON.parse(body).data.state, // addwishproductid
          }
        ).catch(function (err) {
          console.log(err);
        });
        await doc.save();
        res.send({ success: true, ...JSON.parse(body) });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }

}
