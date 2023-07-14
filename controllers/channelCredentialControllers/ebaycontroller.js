import { ListingsModel } from "../../models/actionModel/Listing.js";
import { addInventoryModel } from "../../models/actionModel/addInventory.js";
import { ebaycredModel } from "../../models/channelCredentialModel/ebayModel.js"
import jwt from "jsonwebtoken"
import request from 'request'
import axios from 'axios'
import querystring from 'querystring'
import EbayAuthToken from "ebay-oauth-nodejs-client";
import { AddorderModel } from "../../models/orderModel/AddorderModel.js";

const ebayUrl = "https://api.ebay.com/sell";

const getAccessToken = async (req, res, userIdd) => {
  try {
    console.log("user", userIdd);
    let dataebay = await ebaycredModel.findOne({ userid: userIdd });
    console.log(dataebay);
    const params = querystring.stringify({
      grant_type: 'authorization_code',
      code: dataebay.code,
      redirect_uri: dataebay.redirect_uri,
    });

    const authHeader = Buffer.from(`${dataebay.ebayclientid}:${dataebay.ebayclientsecret}`).toString('base64');
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
    };
    const response = await axios.post(
      'https://api.ebay.com/identity/v1/oauth2/token',
      params,
      config
    );
    console.log(response.data);

    const userToken = response.data.access_token;

    return new Promise(function (resolve, reject) {
      if (error) {
        console.error(error);
        resolve({ error: "Internal server error" });
      } else if (response.statusCode !== 200) {
        console.log(body);
        resolve({ ...JSON.parse(body) })
      } else {
        console.log("else", body);
        resolve(userToken)
        // res.json({ success: true, data: body });
      }
    });

  } catch (e) {
    return res.status(401).send("unauthorized");
  }
}

export const ebaycredential = async (req, res) => {
  const { nickname, ebayid, ebaysecret } = req.body
  const marketplacename = "Ebay"
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
      var existChannel = await ebaycredModel.findOneAndUpdate({ userid: userIdd }, {
        nickname: nickname, ebayid: ebayid,
        ebaysecret: ebaysecret
      }, null, function (err, docs) {
        if (err) {
          console.log(err)
        }
        else {
          console.log("complete");

        }
      }).clone().catch(function (err) { console.log(err) })
      if (existChannel == null) {
        const doc = new ebaycredModel({
          nickname: nickname,
          ebayid: ebayid,
          ebaysecret: ebaysecret,
          userid: userIdd,
          marketplacename: marketplacename,
          flag: 1
        })
        await doc.save();

        //    var userabelistings = await ListingsModel.find({ userid: userIdd, marketplacename: marketplacename })
        res.send({ "status": "succes", "message": "Connection succesfully", "result": doc });
      } else {
        res.send({ "status": "succes", "message": "Updated succesfully", "result": existChannel });
      }
    } catch (error) {
      res.send({ "status": "failed", "message": "Connection failed" });
      console.log(error);
    }

  } else {
    res.send("provide token");
  }
}


export const getOrderListEbay = async (req, res, user) => {
  let apiEndpoint = `https://api.ebay.com/sell/fulfillment/v1/order`
  let data = await ebaycredModel.find({ userid: user });
  console.log("userIdd", data);
  var useri = data[0].ebayclientid;
  var userp = data[0].ebayclientsecret;
  var usern = data[0].nickname;
  var refreshtoken = data[0].refresh_token;
  const scopes = ["https://api.ebay.com/oauth/api_scope/sell.fulfillment", "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly"];

  const ebayAuthToken = new EbayAuthToken({
    clientId: useri,
    clientSecret: userp,
    redirectUri: usern,
  });
  const accessToken = await ebayAuthToken.getAccessToken(
    "PRODUCTION",
    refreshtoken,
    scopes
  );
  var replaydata = JSON.parse(accessToken);
  var accesstoken = replaydata.access_token;
  console.log("accesstoken", accesstoken);
  var token = "Bearer 123" + accesstoken;
  console.log("token", token);
  return new Promise(function (resolve, reject) {
    request.get({ url: apiEndpoint, headers: { 'Authorization': token } }, async (error, response, body) => {
      if (error) {
        console.error("errror", error);
        // res.send({ error: "Internal server error" });
      } else if (response.statusCode !== 200) {
        console.error("body", body);
        // res.send({ success: false, ...JSON.parse(body) });
      } else {
        // console.log(JSON.parse(body));
        let orderlist = JSON.parse(body).orders;
        console.log(orderlist);
        for (let order of orderlist) {
          let orderExist = await AddorderModel.find({ orderId: order.orderId });
          if (orderExist?.length) {
            const doc = await AddorderModel.findOneAndUpdate(
              { orderId: order.orderId, userid: user },
              {
                orderStatus: order.orderFulfillmentStatus, // addwishproductid
              }
            ).catch(function (err) {
              console.log(err);
            });
            await doc?.save();
          } else {
            for (let item in order?.lineItems) {
              const doc = new AddorderModel({
                orderDate: order?.creationDate,
                orderId: order?.orderId,
                productName: item?.title,
                productId: item?.lineItemId,
                purchasePrice: item?.total?.value,
                quantity: item?.quantity,
                listedPrice: item?.lineItemCost?.value,
                marketplaces: "EBay",
                recipientName: order?.buyer?.buyerRegistrationAddress?.fullName,
                phoneNumber: order?.buyer?.buyerRegistrationAddress?.primaryPhone?.phoneNumber,
                addressOne: order?.buyer?.buyerRegistrationAddress?.contactAddress?.addressLine1,
                city: order?.buyer?.buyerRegistrationAddress?.contactAddress?.city,
                state: order?.buyer?.buyerRegistrationAddress?.contactAddress?.stateOrProvince,
                country: order?.buyer?.buyerRegistrationAddress?.contactAddress?.countryCode,
                postalCode: parseInt(order?.buyer?.buyerRegistrationAddress?.contactAddress?.postalCode),
                orderStatus: order?.orderFulfillmentStatus,
                sku: item?.sku,
                userid: user,
              });
              await doc.save();
            }
          }
        }
        // resolve({ success: true, ...JSON.parse(body) });
        resolve({ success: true })
      }
    });
  });
}

export const canvcelOrderEbay = async (req, res, user) => {
  let apiEndpoint = `https://api.ebay.com/sell/fulfillment/v1/order/${req.body.id}/issue_refund`
  let data = await ebaycredModel.find({ userid: user });
  console.log("userIdd", data);
  var useri = data[0].ebayclientid;
  var userp = data[0].ebayclientsecret;
  var usern = data[0].nickname;
  var refreshtoken = data[0].refresh_token;
  const scopes = ["https://api.ebay.com/oauth/api_scope/sell.fulfillment", "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly"];

  const ebayAuthToken = new EbayAuthToken({
    clientId: useri,
    clientSecret: userp,
    redirectUri: usern,
  });
  const accessToken = await ebayAuthToken.getAccessToken(
    "PRODUCTION",
    refreshtoken,
    scopes
  );
  var replaydata = JSON.parse(accessToken);
  var accesstoken = replaydata.access_token;
  console.log("accesstoken", accesstoken);
  var token = "Bearer 123" + accesstoken;
  console.log("token", token);
  const dataEbay = {
    "reasonForRefund": "BUYER_CANCEL",
    "comment": "Buyer changed mind and requested cancellation of order"
  }
  return new Promise(function (resolve, reject) {
    request.post({ url: apiEndpoint, body: dataEbay, headers: { 'Authorization': token } }, async (error, response, body) => {
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
            orderStatus: JSON.parse(body).refundStatus, // addwishproductid
          }
        ).catch(function (err) {
          console.log(err);
        });
        await doc.save();
        res.send({ success: true, ...JSON.parse(body) });
      }
    });
  });
}

export async function ebay(req, res, id4, credid4) {
  console.log("in ebay", id4);
  try {
    var saved_user = await addInventoryModel.find({ _id: { $in: id4 } });
    console.log(saved_user);
    console.log(saved_user[0].sku);
    console.log(saved_user.length);
    let count = 1;
    var allusers = [];
    for (var i = 0; i < saved_user.length; i++) {
      console.log(i);
      var user = {
        sku: saved_user[i].sku,
        locale: "en_US",
        product: {
          title: saved_user[i].productname,
          aspects: {
            Product: [`${saved_user[i].productname}`],
            "Country/Region of Manufacture": ["United States"],
            Type: ["Internal"],
            Brand: ["Apex Tool Group"],
            UPC: [`${saved_user[i].upc}`],
          },
          description: saved_user[i].description,
          imageUrls: [
            saved_user[i].imageupload1,
            saved_user[i].imageupload2,
            saved_user[i].imageupload3,
          ],
        },
        condition: "NEW",
        availability: {
          shipToLocationAvailability: {
            merchantLocationKey: '"Store-6"',
            quantity: saved_user[i].availableqty,
          },
        },
      };

      allusers.push(user);
    }
    var item = {
      requests: allusers,
    };

    var jsonData = JSON.stringify(item);
    var finalitem = JSON.parse(jsonData);
    console.log("jsonData", jsonData);
    console.log("finalitem", finalitem);
    fs.writeFile("./json/testebaydata.json", jsonData, (err) => {
      if (err) throw err;
      else {
        console.log("Done", i);
      }
    });
  } catch (error) {
    console.log("Error", error);
  }
  try {
    if (req.headers && req.headers.authorization) {
      var authorization = req.headers.authorization.split(" ")[1],
        decoded;
      try {
        console.log("authorization", authorization);
        decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
      var userIdd = decoded.userId;

      let data = await ebaycredModel.find({ userid: userIdd });
      console.log("userIdd", data);
      var useri = data[0].ebayclientid;
      var userp = data[0].ebayclientsecret;
      var usern = data[0].nickname;
      var refreshtoken = data[0].refresh_token;
      const scopes = ["https://api.ebay.com/oauth/api_scope/sell.inventory"];

      const ebayAuthToken = new EbayAuthToken({
        clientId: useri,
        clientSecret: userp,
        redirectUri: usern,
      });
      const accessToken = await ebayAuthToken.getAccessToken(
        "PRODUCTION",
        refreshtoken,
        scopes
      );
      var replaydata = JSON.parse(accessToken);
      var accesstoken = replaydata.access_token;
      console.log(accesstoken);
      var token = "Bearer 123" + accesstoken;
    } else {
      console.log("provide token");
    }
  } catch (error) {
    console.log(error);
  }

  try {
    console.log("token", token);
    const option = {
      url: "https://api.ebay.com/sell/inventory/v1/bulk_create_or_replace_inventory_item",
      headers: {
        Authorization: token,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: finalitem,
      json: true,
    };
    return new Promise(function (resolve, reject) {
      request.post(option, (error, response, body) => {
        // body = JSON.parse(body);
        if (body.responses[0].statusCode !== 400) {
          console.log("1", body);

          var allitem = [];
          for (var i = 0; i < saved_user.length; i++) {
            console.log(i);
            var useritem = {
              sku: saved_user[i].sku,
              marketplaceId: "EBAY_US",
              format: "FIXED_PRICE",
              categoryId: "118254",
              pricingSummary: {
                price: {
                  value: saved_user[i].costprice,
                  currency: "USD",
                },
                originalRetailPrice: {
                  value: saved_user[i].costprice - saved_user[i].profitprice,
                  currency: "USD",
                },
                minimumAdvertisedPrice: {
                  value: saved_user[i].costprice - 5,
                  currency: "USD",
                },
                pricingVisibility: "PRE_CHECKOUT",
                originallySoldForRetailPriceOn: "ON_EBAY",
              },
              listingPolicies: {
                fulfillmentPolicyId: "225663281017",
                returnPolicyId: "224135977017",
                paymentPolicyId: "26347478013",
                shippingCostOverrides: [
                  {
                    shippingCost: {
                      value: "0",
                      currency: "USD",
                    },
                    additionalShippingCost: {
                      value: "0",
                      currency: "USD",
                    },
                    priority: "1",
                    shippingServiceType: "DOMESTIC",
                  },
                ],
              },
              listingDescription: saved_user[i].description,
              quantityLimitPerBuyer: 5,
              merchantLocationKey: '"Store-6"',
              includeCatalogProductDetails: true,
            };
            allitem.push(useritem);
          }
          var itemoffer = {
            requests: allitem,
          };

          var jsonDataoffer = JSON.stringify(itemoffer);
          var offer = JSON.parse(jsonDataoffer);
          console.log("offer", offer);

          try {
            console.log(token);
            const option = {
              url: "https://api.ebay.com/sell/inventory/v1/bulk_create_offer",
              headers: {
                Authorization: token,
                Accept: "application/json",
                "Content-Type": "application/json",
                "Content-Language": "en-US",
              },

              body: offer,
              json: true,
            };
            request.post(option, (error, response, body) => {
              console.log("body hai", body);
              // body = JSON.parse(body);
              if (body.responses[0].statusCode === 400) {
                console.log(
                  "body.responses[0].offerId",
                  body.responses[0].offerId
                );
                var offeridarr = [];
                for (var i = 0; i < saved_user.length; i++) {
                  console.log(i);

                  var offerid = {
                    offerId: body.responses[i].offerId,
                  };

                  offeridarr.push(offerid);
                }
                var offeriditem = {
                  requests: offeridarr,
                };

                var jsonDataofferid = JSON.stringify(offeriditem);
                var finaofferid = JSON.parse(jsonDataofferid);
                console.log(finaofferid);
                console.log(jsonDataofferid);
                try {
                  console.log(token);
                  const option = {
                    url: "https://api.ebay.com/sell/inventory/v1/bulk_publish_offer",
                    headers: {
                      Authorization: token,
                      Accept: "application/json",
                      "Content-Type": "application/json",
                    },

                    body: finaofferid,

                    json: true,
                  };

                  request.post(option, (error, response, body) => {
                    console.log("body hao 2", body);
                    // body = JSON.parse(body);
                    // if (body.responses[0].statusCode === 400) {
                    if (body) {
                      for (var i = 0; i < saved_user.length; i++) {
                        var doc = new ListingsModel({
                          marketplacename: "Ebay",
                          bookname: saved_user[i].productname,
                          description: saved_user[i].description,
                          sku: saved_user[i].sku,
                          ISBN_ASIN_UPC: saved_user[i].upc,
                          title: saved_user[i].productname,
                          quantity: saved_user[i].availableqty,
                          cost_price: saved_user[i].costprice,
                          profit: saved_user[i].profitprice,
                          condition: saved_user[i].condition,
                          identifier: saved_user[i].identifier,
                          imageupload1: saved_user[i].imageupload1,
                          date: new Date(),
                          userid: userIdd,
                        });
                        doc.save();
                      }
                      console.log("body6", body);
                      resolve({ data6: doc, replay: body });
                    } else {
                      console.log(error, body);
                      resolve({ error: body });
                    }
                  });
                } catch (error) {
                  console.log("in bulk_publish offer error", error);
                }
              } else {
                console.log(error, body);
                resolve({ error: body });
                // res.send({ error: body });
              }
            });
          } catch (error) {
            console.log("in bulk_offer error", error);
          }
        } else {
          console.log(error, body);
          resolve({ error: body });
          // res.send({ error: body });
        }
      });
    });
  } catch (error) {
    console.log("in bulk_create_or_replace_inventory_item error", error);
  }
}

// export async function ebay(req, res, id4, credid4) {
//   console.log("in ebay", id4);
//   try {
//     var saved_user = await addInventoryModel.find({ _id: { $in: id4 } });
//     console.log(saved_user);
//     console.log(saved_user[0].sku);
//     console.log(saved_user.length);
//     let count = 1;
//     var allusers = [];
//     for (var i = 0; i < saved_user.length; i++) {
//       console.log(i);
//       var user = {
//         sku: saved_user[i].sku,
//         locale: "en_US",
//         product: {
//           title: saved_user[i].productname,
//           aspects: {
//             Product: [`${saved_user[i].productname}`],
//             "Country/Region of Manufacture": ["United States"],
//             Type: ["Internal"],
//             Brand: ["Apex Tool Group"],
//             UPC: [`${saved_user[i].upc}`],
//           },
//           description: saved_user[i].description,
//           imageUrls: [
//             saved_user[i]?.imageupload1,
//             saved_user[i]?.imageupload2,
//             saved_user[i]?.imageupload3,
//           ],
//         },
//         condition: "NEW",
//         availability: {
//           shipToLocationAvailability: {
//             merchantLocationKey: '"Store-6"',
//             quantity: saved_user[i].availableqty,
//           },
//         },
//       };

//       allusers.push(user);
//     }
//     var item = {
//       requests: allusers,
//     };

//     var jsonData = JSON.stringify(item);
//     var finalitem = JSON.parse(jsonData);
//     console.log("jsonData", jsonData);
//     console.log("finalitem", finalitem);
//     // fs.writeFile("./json/testebaydata.json", jsonData, (err) => {
//     //   if (err) throw err;
//     //   else {
//     //     console.log("Done", i);
//     //   }
//     // });
//   } catch (error) {
//     console.log("Error", error);
//   }
//   try {
//     if (req.headers && req.headers.authorization) {
//       var authorization = req.headers.authorization.split(" ")[1],
//         decoded;
//       try {
//         console.log("authorization", authorization);
//         decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
//       } catch (e) {
//         return res.status(401).send("unauthorized");
//       }
//       var userIdd = decoded.userId;

//       // let data = await ebaycredModel.find({ userid: userIdd });
//       // console.log("userIdd", data);
//       // var useri = data[0].ebayclientid;
//       // var userp = data[0].ebayclientsecret;
//       // var usern = data[0].nickname;
//       // const scopes = ["https://api.ebay.com/oauth/api_scope/sell.inventory"];

//       // const ebayAuthToken = new EbayAuthToken({
//       //   clientId: useri,
//       //   clientSecret: userp,
//       //   redirectUri: usern,
//       // });
//       // const accessToken = await ebayAuthToken.getAccessToken(
//       //   "PRODUCTION",
//       //   refreshtoken,
//       //   scopes
//       // );
//       // var replaydata = JSON.parse(accessToken);
//     } else {
//       console.log("provide token");
//     }
//   } catch (error) {
//     console.log(error);
//   }

//   try {
//     var accesstoken = await getAccessToken(req, res, userIdd);
//     console.log(accesstoken);
//     // var token = "Bearer " + accesstoken;
//     var token = "Bearer v^1.1#i^1#f^0#I^3#r^1#p^3#t^Ul4xMF8yOkU3NzU4REJBQUU5RTlEQTVBQjk0OEM3NTUyMjZCNEMzXzNfMSNFXjI2MA==";
//     console.log("token", token);
//     const option = {
//       url: "https://api.ebay.com/sell/inventory/v1/bulk_create_or_replace_inventory_item",
//       headers: {
//         Authorization: token,
//         Accept: "application/json",
//         "Content-Type": "application/json",
//         "Content-Language": "en-US",
//       },
//       body: finalitem,
//       json: true,
//     };
//     const data = function callback(error, response, body) {
//       console.log(body);
//       if (body.responses[0]?.statusCode !== 400) {
//         console.log("1", body);

//         var allitem = [];
//         for (var i = 0; i < saved_user.length; i++) {
//           console.log(i);
//           var useritem = {
//             sku: saved_user[i].sku,
//             marketplaceId: "EBAY_US",
//             format: "FIXED_PRICE",
//             categoryId: "118254",
//             pricingSummary: {
//               price: {
//                 value: saved_user[i].cost_price,
//                 currency: "USD",
//               },
//               originalRetailPrice: {
//                 value: saved_user[i].cost_price - saved_user[i].profit,
//                 currency: "USD",
//               },
//               minimumAdvertisedPrice: {
//                 value: saved_user[i].cost_price - 5,
//                 currency: "USD",
//               },
//               pricingVisibility: "PRE_CHECKOUT",
//               originallySoldForRetailPriceOn: "ON_EBAY",
//             },
//             listingPolicies: {
//               fulfillmentPolicyId: "225663281017",
//               returnPolicyId: "224135977017",
//               paymentPolicyId: "26347478013",
//               shippingCostOverrides: [
//                 {
//                   shippingCost: {
//                     value: "0",
//                     currency: "USD",
//                   },
//                   additionalShippingCost: {
//                     value: "0",
//                     currency: "USD",
//                   },
//                   priority: "1",
//                   shippingServiceType: "DOMESTIC",
//                 },
//               ],
//             },
//             listingDescription: saved_user[i].description,
//             quantityLimitPerBuyer: 5,
//             merchantLocationKey: '"Store-6"',
//             includeCatalogProductDetails: true,
//           };
//           allitem.push(useritem);
//         }
//         var itemoffer = {
//           requests: allitem,
//         };

//         var jsonDataoffer = JSON.stringify(itemoffer);
//         var offer = JSON.parse(jsonDataoffer);
//         console.log("offer", offer);

//         try {
//           console.log(token);
//           const option = {
//             url: "https://api.ebay.com/sell/inventory/v1/bulk_create_offer",
//             headers: {
//               Authorization: token,
//               Accept: "application/json",
//               "Content-Type": "application/json",
//               "Content-Language": "en-US",
//             },

//             body: offer,
//             json: true,
//           };
//           const data = function callback(error, response, body) {
//             console.log("body hai", body);
//             if (body.responses[0].statusCode === 400) {
//               console.log(
//                 "body.responses[0].offerId",
//                 body.responses[0].offerId
//               );
//               var offeridarr = [];
//               for (var i = 0; i < saved_user.length; i++) {
//                 console.log(i);

//                 var offerid = {
//                   offerId: body.responses[i].offerId,
//                 };

//                 offeridarr.push(offerid);
//               }
//               var offeriditem = {
//                 requests: offeridarr,
//               };

//               var jsonDataofferid = JSON.stringify(offeriditem);
//               var finaofferid = JSON.parse(jsonDataofferid);
//               console.log(finaofferid);
//               console.log(jsonDataofferid);
//               try {
//                 console.log(token);
//                 const option = {
//                   url: "https://api.ebay.com/sell/inventory/v1/bulk_publish_offer",
//                   headers: {
//                     Authorization: token,
//                     Accept: "application/json",
//                     "Content-Type": "application/json",
//                     "Content-Language": "en-US",
//                   },

//                   body: finaofferid,

//                   json: true,
//                 };
//                 const data = function callback(error, response, body) {
//                   console.log("body hao 2", body);
//                   // if (body.responses[0].statusCode === 400) {
//                   if (body) {
//                     for (var i = 0; i < saved_user.length; i++) {
//                       var doc = new ListingsModel({
//                         marketplacename: "Ebay",
//                         productname: saved_user[i].productname,
//                         description: saved_user[i].description,
//                         sku: saved_user[i].sku,
//                         upc: saved_user[i].upc,
//                         availableqty: saved_user[i].availableqty,
//                         costprice: saved_user[i].costprice,
//                         profitprice: saved_user[i].profitprice,
//                         condition: saved_user[i].condition,
//                         identifier: saved_user[i].identifier,
//                         imageupload1: saved_user[i].imageupload1,
//                         date: new Date(),
//                         userid: userIdd,
//                       });
//                       doc.save();
//                     }
//                     console.log("body6", body);
//                     res.send({ data6: doc, replay: body });
//                   } else {
//                     console.log(error);
//                     res.send({ error: body });
//                   }
//                 };

//                 request.post(option, data);
//               } catch (error) {
//                 console.log("in bulk_publish offer error", error);
//               }
//             } else {
//               console.log(error);
//               res.send({ error: body });
//             }
//           };

//           request.post(option, data);
//         } catch (error) {
//           console.log("in bulk_offer error", error);
//         }
//       } else {
//         console.log(error);
//         res.send({ error: body });
//       }
//     };

//     request.post(option, data);
//   } catch (error) {
//     console.log("in bulk_create_or_replace_inventory_item error", error);
//   }
// }