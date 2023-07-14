import { addInventoryModel } from "../../models/actionModel/addInventory.js";
import { NotificationModel } from "../../models/NotificationModel/NotificationModel.js";
import { ListingsModel } from "../../models/actionModel/Listing.js";
import { amazoncredModel } from "../../models/channelCredentialModel/amazonModel.js";
import request from "request";
import AWS from "aws-sdk";
import jwt from "jsonwebtoken";
import SellingPartnerAPI from "amazon-sp-api";
import { AddorderModel } from "../../models/orderModel/AddorderModel.js";


export const getTokenAmz = async (req, res, amazon_user) => {
  try {
    const { amazonclientid, amazonclientsecret, grant_type, scope } = req.body
    const data = {
      client_id: amazonclientid || amazon_user?.amazonemailid,
      client_secret: amazonclientsecret || amazon_user?.amazonpassword,
      grant_type: grant_type || 'client_credentials',
      scope: scope || 'appstore::apps:readwrite',
    }
    const apiEndpoint = "https://api.amazon.com/auth/o2/token";
    return new Promise(function (resolve, reject) {

      request.post({ url: apiEndpoint, body: JSON.stringify(data), headers: { 'content-type': 'application/json' }, }, (error, response, body) => {
        if (error) {
          console.error(error);
          // res.status(500).json({ error: "Internal server error" });
        } else if (response.statusCode !== 200) {
          console.error(body);
          // res.status(response.statusCode).json({ error: "Error creating token" });
        } else {
          console.log(JSON.parse(body).access_token);
          if (amazon_user) {
            resolve(JSON.parse(body).access_token);
          }
        }
      });
    });

  } catch (e) {
    return res.status(401).send("unauthorized");
  }
}

export async function amazon(req, res, id8, amazon_user) {
  console.log("in amazon", id8, amazon_user);
  var keys = {
    SELLING_PARTNER_APP_CLIENT_ID: amazon_user?.amazonemailid,
    SELLING_PARTNER_APP_CLIENT_SECRET: amazon_user?.amazonpassword,
    AWS_ACCESS_KEY_ID: "AKIA2YZAIMA566Q2F25P",
    AWS_SECRET_ACCESS_KEY: "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",
    AWS_SELLING_PARTNER_ROLE: "arn:aws:iam::740412645435:role/BookCommerce",
  };

  const response = await getTokenAmz(req, res, amazon_user);
  console.log("response12", response);
  if (response) {
    let sellingPartner = new SellingPartnerAPI({
      region: "na",
      refresh_token: response,
      credentials: keys,
      options: {
        only_grantless_operations: false
      }
    });
    let manageInventoryData, error;
    for (var i = 0; i < id8.length; i++) {
      var saved_user = await addInventoryModel.find({ _id: id8[i] });
      var amazoncred = await amazoncredModel.findById(amazon_user._id);
      console.log("type of", saved_user, id8);
      console.log(amazoncred);
      try {
        manageInventoryData = await sellingPartner.callAPI({
          operation: "putListingsItem",
          endpoint: "listingsItems",
          restore_rate: "5",
          path: {
            sellerId: amazoncred.amazonsellerid,
            sku: saved_user[0].sku,
          },
          query: {
            marketplaceIds: ["ATVPDKIKX0DER"],
            issueLocale: "en_US",
          },
          body: {
            productType: "PRODUCT",
            requirements: "LISTING_OFFER_ONLY",
            // "requirements": 'LISTING',
            attributes: {
              condition_type: [
                {
                  value: "new_new",
                  marketplace_id: "ATVPDKIKX0DER",
                },
              ],
              item_name: [
                {
                  value: saved_user[0].productname,
                  language_tag: "en_US",
                  marketplace_id: "ATVPDKIKX0DER",
                },
              ],
              externally_assigned_product_identifier: [
                {
                  value: "MNHF123",
                },
              ],
              merchant_suggested_asin: [
                {
                  value: saved_user[0].upc,
                },
              ],
              purchasable_offer: [
                {
                  marketplace_id: "ATVPDKIKX0DER",
                  currency: "USD",
                  our_price: [
                    {
                      schedule: [
                        {
                          value_with_tax: saved_user[0].costprice,
                        },
                      ],
                    },
                  ],
                },
              ],

              fulfillment_availability: [
                {
                  availableqty: saved_user[0].availableqty,
                  fulfillment_channel_code: "DEFAULT",
                },
              ],
            },
          },
        });

        console.log("manageInventoryData", manageInventoryData);
        // responseSend(manageInventoryData, null);
        // res.write(JSON.stringify(manageInventoryData));
        res.send({ success: true, message: "done Amazon now uploading", data: manageInventoryData })
      } catch (error) {
        console.log("error", error);
        // res.send(null, error.code);
        // res.write({ error: error });
        res.send({ success: false, message: error.code });
      }
      var amazondoc = new ListingsModel({
        marketplacename: "Amazon",
        productname: saved_user[0].productname,
        description: saved_user[0].description,
        sku: saved_user[0].sku,
        upc: saved_user[0].upc,
        brand: saved_user[0].brand,
        availableqty: saved_user[0].availableqty,
        costprice: saved_user[0].costprice,
        profitprice: saved_user[0].profitprice,
        imageupload1: saved_user[0].imageupload1,
        date: new Date(),
        userid: amazon_user._id,
      });
      amazondoc.save();
    }
    const notification = new NotificationModel({
      actionType: "Item Creation",
      actionName: "Amazon Item",
      description: "Item posted on Amazon",
      status: "Completed",
      date: new Date(),
      userid: amazon_user._id,
    });
    await notification.save();
    if (manageInventoryData) {
      return "done Wish now uploading";
    } else {
      return "error";
    }
  }
  console.log(response);
}

export async function amazonUpdate(req, res, id8, amazon_user) {
  console.log("in amazon", req, res, id8, amazon_user);
  var keys = {
    SELLING_PARTNER_APP_CLIENT_ID: amazon_user?.amazonemailid,
    SELLING_PARTNER_APP_CLIENT_SECRET: amazon_user?.amazonpassword,
    AWS_ACCESS_KEY_ID: "AKIA2YZAIMA566Q2F25P",
    AWS_SECRET_ACCESS_KEY: "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",
    AWS_SELLING_PARTNER_ROLE: "arn:aws:iam::740412645435:role/BookCommerce",
  };

  let token;
  const response = getTokenAmz(req, res, amazon_user)
  if (response) {
    let sellingPartner = new SellingPartnerAPI({
      region: "na",
      refresh_token: response,
      credentials: keys,
      options: {
        only_grantless_operations: false
      }
    });

    for (var i = 0; i < id8.length; i++) {
      var saved_user = await addInventoryModel.find({ _id: id8[i] });
      var amazoncred = await amazoncredModel.findById(amazon_user._id);
      console.log("type of", saved_user, id8);
      console.log(amazoncred);
      try {
        let manageInventoryData = await sellingPartner.callAPI({
          operation: "patchListingsItem",
          endpoint: "listingsItems",
          restore_rate: "5",
          path: {
            sellerId: amazoncred.amazonsellerid,
            sku: saved_user[0].sku,
          },
          query: {
            marketplaceIds: ["ATVPDKIKX0DER"],
            issueLocale: "en_US",
          },
          body: {
            productType: "PRODUCT",
            patches: [
              {
                op: "replace",
                path: "/attributes/purchasable_offer",
                value: [
                  {
                    currency: "GBP",
                    marketplace_id: marketplaceId,
                    our_price: [
                      {
                        schedule: [
                          {
                            value_with_tax: parseFloat(saved_user[0].costprice),
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                fulfillment_channel_code: "DEFAULT",
                quantity: saved_user[0].availableqty
              }
            ],
          },
        });

        console.log("manageInventoryData", manageInventoryData);
        // res.write(JSON.stringify(manageInventoryData));
        res.send({ success: true, message: "done Amazon now uploading", data: manageInventoryData })
      } catch (error) {
        console.log("error", error);
        // res.send({ error: error });
        res.send({ success: false, message: error.code });
      }
      var amazondoc = new ListingsModel({
        marketplacename: "Amazon",
        productname: saved_user[0].productname,
        description: saved_user[0].description,
        sku: saved_user[0].sku,
        upc: saved_user[0].upc,
        brand: saved_user[0].brand,
        availableqty: saved_user[0].availableqty,
        costprice: saved_user[0].costprice,
        profitprice: saved_user[0].profitprice,
        imageupload1: saved_user[0].imageupload1,
        date: new Date(),
        userid: userIdd,
      });
      amazondoc.save();
    }
    const notification = new NotificationModel({
      actionType: "Item Creation",
      actionName: "Amazon Item",
      description: "Item updated on Amazon",
      status: "Completed",
      date: new Date(),
      userid: userIdd,
    });
    await notification.save();
  }
}

export async function amazonorders(req, res, id8) {
  console.log("in amazon", id8);
  var amazon_user = await amazoncredModel.findOne({userid: id8});
  var keys = {
    SELLING_PARTNER_APP_CLIENT_ID: amazon_user?.amazonemailid,
    SELLING_PARTNER_APP_CLIENT_SECRET: amazon_user?.amazonpassword,
    AWS_ACCESS_KEY_ID: "AKIA2YZAIMA566Q2F25P",
    AWS_SECRET_ACCESS_KEY: "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",
    AWS_SELLING_PARTNER_ROLE: "arn:aws:iam::740412645435:role/BookCommerce",
  };

  var saved_user = await addInventoryModel.findOne({userid: id8});
  const response = await getTokenAmz(req, res, amazon_user);
  console.log("response12", response);
  if (response) {
    let sellingPartner = new SellingPartnerAPI({
      region: "na",
      refresh_token: response,
      credentials: keys,
      options: {
        only_grantless_operations: false
      }
    });
    let manageInventoryData, error;
    try {
      manageInventoryData = await sellingPartner.callAPI({
        operation: "getOrders",
        endpoint: "orders",
        path: {
          sellerId: amazon_user.amazonsellerid,
          sku: saved_user.sku,
        },
        query: {
          marketplaceIds: ["ATVPDKIKX0DER"],
          issueLocale: "en_US",
        },
      });

      console.log("manageInventoryData", manageInventoryData);
      // responseSend(manageInventoryData, null);
      // res.write(JSON.stringify(manageInventoryData));
      return manageInventoryData
      // res.send({ success: true, message: "done Amazon now uploading", data: manageInventoryData })
    } catch (error) {
      console.log("error manah", error);
      // res.send(null, error.code);
      // res.write({ error: error });
      // res.send({ success: false, message: error.code });
    }

  }
}

export async function amazonorderCancel(req, res, id8) {
  console.log("in amazon", id8);
  var amazon_user = await amazoncredModel.findOne({userid: id8});
  var keys = {
    SELLING_PARTNER_APP_CLIENT_ID: amazon_user?.amazonemailid,
    SELLING_PARTNER_APP_CLIENT_SECRET: amazon_user?.amazonpassword,
    AWS_ACCESS_KEY_ID: "AKIA2YZAIMA566Q2F25P",
    AWS_SECRET_ACCESS_KEY: "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",
    AWS_SELLING_PARTNER_ROLE: "arn:aws:iam::740412645435:role/BookCommerce",
  };

  var saved_user = await AddorderModel.findOne({userid: id8});
  const response = await getTokenAmz(req, res, amazon_user);
  console.log("response12", response);
  if (response) {
    let sellingPartner = new SellingPartnerAPI({
      region: "na",
      refresh_token: response,
      credentials: keys,
      options: {
        only_grantless_operations: false
      }
    });
    let manageInventoryData, error;
    try {
      manageInventoryData = await sellingPartner.callAPI({
        operation: "getListingsItem",
        endpoint: "orders",
        path: {
          orderId: saved_user.orderId,
        },
        body: {
          status: "Cancelled",
          externalReviewerId: "en_US",
        },
      });

      console.log("manageInventoryData", manageInventoryData);
      // responseSend(manageInventoryData, null);
      // res.write(JSON.stringify(manageInventoryData));
      return manageInventoryData
      // res.send({ success: true, message: "done Amazon now uploading", data: manageInventoryData })
    } catch (error) {
      console.log("error manah", error);
      // res.send(null, error.code);
      // res.write({ error: error });
      // res.send({ success: false, message: error.code });
    }

  }
}
export async function amazonListing(req, res, id8) {
  console.log("in amazon", id8);
  var amazon_user = await amazoncredModel.findOne({userid: id8});
  var keys = {
    SELLING_PARTNER_APP_CLIENT_ID: amazon_user?.amazonemailid,
    SELLING_PARTNER_APP_CLIENT_SECRET: amazon_user?.amazonpassword,
    AWS_ACCESS_KEY_ID: "AKIA2YZAIMA566Q2F25P",
    AWS_SECRET_ACCESS_KEY: "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",
    AWS_SELLING_PARTNER_ROLE: "arn:aws:iam::740412645435:role/BookCommerce",
  };

  var saved_user = await addInventoryModel.findOne({userid: id8});
  const response = await getTokenAmz(req, res, amazon_user);
  console.log("response12", response);
  if (response) {
    let sellingPartner = new SellingPartnerAPI({
      region: "na",
      refresh_token: response,
      credentials: keys,
      options: {
        only_grantless_operations: false
      }
    });
    let manageInventoryData, error;
    try {
      manageInventoryData = await sellingPartner.callAPI({
        operation: "getListingsItem",
        endpoint: "listingsItems",
        path: {
          sellerId: amazon_user.amazonsellerid,
          sku: saved_user.sku,
        },
        query: {
          marketplaceIds: ["ATVPDKIKX0DER"],
          issueLocale: "en_US",
        },
      });

      console.log("manageInventoryData", manageInventoryData);
      // responseSend(manageInventoryData, null);
      // res.write(JSON.stringify(manageInventoryData));
      return manageInventoryData
      // res.send({ success: true, message: "done Amazon now uploading", data: manageInventoryData })
    } catch (error) {
      console.log("error manah", error);
      // res.send(null, error.code);
      // res.write({ error: error });
      // res.send({ success: false, message: error.code });
    }

  }
}