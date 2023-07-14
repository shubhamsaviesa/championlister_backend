import { wishCredModel } from "../../models/channelCredentialModel/wishModel.js"
import jwt from "jsonwebtoken"

// const request = require('request');
import request from 'request'
import { wishtoken } from "../../models/wishTokenModel.js"
import { addInventoryModel } from "../../models/actionModel/addInventory.js"
import { AddorderModel } from "../../models/orderModel/AddorderModel.js"
import { ListingsModel } from "../../models/actionModel/Listing.js"

const wishUrl = "https://merchant.wish.com/api/v3";

export const getWarehouseId = () => {
  try {
    const apiEndpoint = `${wishUrl}/merchant/warehouses`;

    return new Promise(function (resolve, reject) {

      request.get({ url: apiEndpoint, headers: { 'authorization': 'Bearer 0ce923c90b144c7f9968bfef5c3c4d16' } }, (error, response, body) => {
        if (error) {
          console.error(error);
          res.status(500).json({ error: "Internal server error" });
        } else if (response.statusCode !== 200) {
          console.error(body);
          res.status(response.statusCode).json({ error: "Error creating Warehouse Id" });
        } else {
          console.log(body);
          resolve(body.data[0].id)
          // res.json({ success: true, data: body });
        }
      });
    });

  } catch (e) {
    return res.status(401).send("unauthorized");
  }
}

export const getToken = async (req, res, userId) => {

  // client_id:"63242023b5a9b0d57d23d4b4",
  // client_secret:"63d4ffd3af5a4fe6b66fcfc1c4bef222",
  // "code": "a19d301ce9744c8f9187b6b2de0f9976"
  const { client_id, client_secret, code } = req.body
  try {
    const data = {
      client_id: client_id,
      client_secret: client_secret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: "http://championlister.com"
    }
    const apiEndpoint = `${wishUrl}/oauth/access_token`;

    return new Promise(function (resolve, reject) {

      request.post({ url: apiEndpoint, body: JSON.stringify(data) }, async (error, response, body) => {
        if (error) {
          console.error(error);
          res.status(500).json({ error: "Internal server error" });
        } else if (response.statusCode !== 200) {
          console.error(body);

          if (userId && JSON.parse(body).code === 10002) {
            let token = await wishtoken.findOne({ userid: userId });
            resolve(token.access_token);
          } else {
            res.status(response.statusCode).json({ ...JSON.parse(body) });
          }
        } else {
          console.log("else", body);

          if (userId) {
            resolve(JSON.parse(body))
          }

          const data = new wishtoken({
            access_token: JSON.parse(body).accessToken,
            scopes: JSON.parse(body).scopes,
            merchant_id: JSON.parse(body).merchant_id,
            expiry_time: JSON.parse(body).expiry_time,
            refresh_token: JSON.parse(body).refresh_token,
            client_id: client_id,
            client_secret: client_secret,
            userid: userId
          })
          data.save()
          // res.json({ success: true, data: body });
        }
      });
    });

  } catch (e) {
    return res.status(401).send("unauthorized");
  }
}

// const postToken = (req, res, next) => {

// }

export const createProductOnWish = async (req, res, id, wishCred) => {
  // const { product_name, description, price, shipping, main_image_url, other_image_urls, tags } = req.body;
  const { default_shipping_prices, description, main_image, name, parent_sku, variations } = req.body;

  // const accessToken = "0ce923c90b144c7f9968bfef5c3c4d16";
  // const clientId = "63242023b5a9b0d57d23d4b4";

  console.log(wishCred.wishwarehouseid);

  const apiEndpoint = `${wishUrl}/products`;
  // const formData = {
  //   access_token: accessToken,
  //   client_id: clientId,
  //   name: product_name,
  //   description: description,
  //   price: price,
  //   shipping: shipping,
  //   main_image_url: main_image_url,
  //   other_image_urls: other_image_urls,
  //   tags: tags
  // };

  for (let i = 0; i < id.length; i++) {

    var saved_user = await addInventoryModel.find({ _id: id[i] });

    const formData = {
      default_shipping_prices: [
        {
          default_shipping_price: {
            amount: 10,
            currency_code: "USD"
          },
          warehouse_id: wishCred.wishwarehouseid
        }
      ],
      main_image: {
        is_clean_image: false,
        url: saved_user[0].imageupload1
      },
      description: saved_user[0].description,
      // california_prop65_warning_type: "CHEMICAL",
      condition: "NEW",
      max_quantity: saved_user[0].availableqty,
      parent_sku: saved_user[0].sku,
      name: saved_user[0].productname,
      variations: [
        {
          inventories: [
            {
              inventory: 10,
              warehouse_id: wishCred.wishwarehouseid
            }
          ],
          sku: saved_user[0].sku,
          quantity_value: saved_user[0].availableqty,
          price: {
            amount: saved_user[0].mapprice,
            currency_code: "USD"
          },
          cost: {
            amount: saved_user[0].costprice,
            currency_code: "USD"
          },
          gtin: saved_user[0].gstin,
          logistics_details: {
            origin_country: "US",
            weight: saved_user[0].weight,
            height: saved_user[0].height,
            width: saved_user[0].width,
            length: saved_user[0].length,
          }
        }
      ],
    }
    return new Promise(function (resolve, reject) {
      request.post({ url: apiEndpoint, body: JSON.stringify(formData), headers: { 'authorization': 'Bearer 0ce923c90b144c7f9968bfef5c3c4d16' } }, async (error, response, body) => {
        if (error) {
          console.error(error);
          resolve({ error: "Internal server error" });
        } else if (response.statusCode !== 200) {
          console.error("elseif", body);
          resolve({ success: false, ...JSON.parse(body) });
        } else {
          console.log("else", body);
          let data = JSON.parse(body).data;
          const doc = await addInventoryModel.findOneAndUpdate(
            { _id: id[i] },
            {
              wishProductId: data.id, // addwishproductid
            }
          ).catch(function (err) {
            console.log(err);
          });
          await doc.save();
          const docProductListing = new ListingsModel({
            productname: data?.name,
            description: data?.description,
            identifier: data?.id,
            category: data?.category,
            condition: data?.condition,
            availableqty: data?.variations[0]?.quantity_value,
            marketplacename: "Wish",
            weight: data?.variations[0]?.logistics_details?.weight,
            length: data?.variations[0]?.logistics_details?.length,
            width: data?.variations[0]?.logistics_details?.width,
            height: data?.variations[0]?.logistics_details?.height,
            mapprice: data?.variations[0]?.price?.amount,
            gstin: data?.variations[0]?.gtin,
            sku: data?.parent_sku,
            costprice: data?.variations[0]?.cost?.amount,
            date: data?.created_at,
            userid: wishCred?.userid,
            imageupload1: data?.main_image?.url,
            status: data?.status
          });
          await docProductListing.save();
          resolve({ success: true, ...JSON.parse(body) });
        }
      });
    });
  }
};

export const updateProductOnWish = async (req, res, id, wishCred) => {
  try {
    for (i = 0; i < id.length; i++) {

      var saved_user = await addInventoryModel.find({ _id: id[i] });
      const apiEndpoint = `${wishUrl}/products/${saved_user[0].wishProductId}`;

      // const formData = {
      //   default_shipping_prices: saved_user[0].default_shipping_prices,
      //   description: saved_user[0].description,
      //   main_image: saved_user[0].main_image,
      //   name: saved_user[0].name,
      //   parent_sku: saved_user[0].parent_sku,
      //   variations: saved_user[0].variations
      // }

      const formData = {
        variations: [
          {
            quantity_value: saved_user[0].availableqty,
            price: {
              amount: saved_user[0].mapprice,
              currency_code: "USD"
            },
            cost: {
              amount: saved_user[0].costprice,
              currency_code: "USD"
            },
          }
        ],
      }
      return new Promise(function (resolve, reject) {
        request.put({ url: apiEndpoint, body: JSON.stringify(formData), headers: { 'authorization': 'Bearer 0ce923c90b144c7f9968bfef5c3c4d16' } }, async (error, response, body) => {
          if (error) {
            console.error(error);
            resolve({ error: "Internal server error" });
          } else if (response.statusCode !== 200) {
            console.error(body);
            resolve({ success: false, ...JSON.parse(body) });
          } else {
            console.log(body);
            resolve({ success: true, ...JSON.parse(body) });
          }
        });
      });
    }
  } catch (error) {
    res.status(400).json({ error: error?.message });
  }
};

export const getOrderListWish = async (req, res, user) => {
  const apiEndpoint = `${wishUrl}/orders?limit=100&sort_by=released_at.desc`;
  return new Promise(function (resolve, reject) {
    request.get({ url: apiEndpoint, headers: { 'authorization': 'Bearer 0ce923c90b144c7f9968bfef5c3c4d16' } }, async (error, response, body) => {
      if (error) {
        console.error(error);
        res.send({ error: "Internal server error" });
      } else if (response.statusCode !== 200) {
        console.error(body);
        res.send({ success: false, ...JSON.parse(body) });
      } else {
        // console.log(JSON.parse(body));
        let orderlist = JSON.parse(body).data;
        for (let order of orderlist) {
          let orderExist = await AddorderModel.find({ orderId: order.id });
          if (orderExist?.length) {
            const doc = await AddorderModel.findOneAndUpdate(
              { orderId: order.id, userid: user },
              {
                orderStatus: order.state, // addwishproductid
              }
            ).catch(function (err) {
              console.log(err);
            });
            await doc?.save();
          } else {
            const doc = new AddorderModel({
              orderDate: order?.released_at,
              orderId: order?.id,
              productName: order?.product_information?.name,
              productId: order?.product_information?.id,
              purchasePrice: order?.order_payment?.general_payment_details?.payment_total?.amount,
              quantity: order?.order_payment?.general_payment_details?.product_quantity,
              commision: order?.order_payment?.rev_share?.merchant_commission_fees?.amount,
              tax: order?.tax_information?.vat_information?.vat_amount?.amount,
              listedPrice: order?.order_payment?.general_payment_details?.product_price?.amount,
              marketplaces: "Wish",
              recipientName: order?.full_address?.shipping_detail?.name,
              phoneNumber: order?.full_address?.shipping_detail?.phone_number?.number,
              addressOne: order?.full_address?.shipping_detail?.street_address1,
              addressTwo: order?.full_address?.shipping_detail?.street_address2,
              city: order?.full_address?.shipping_detail?.city,
              state: order?.full_address?.shipping_detail?.state,
              country: order?.full_address?.shipping_detail?.country_code,
              postalCode: parseInt(order?.full_address?.shipping_detail?.zipcode),
              orderStatus: order?.state,
              sku: order?.product_information?.sku,
              userid: user,
            });
            await doc.save();
          }
        }
        // resolve({ success: true, ...JSON.parse(body) });
        resolve({ success: true })
      }
    });
  });
}

export const cancelOrderWish = (req, res, user) => {
  const apiEndpoint = `${wishUrl}/orders/${req.body.id}/refund`;
  data = {
    refund_reason: "UNABLE_TO_SHIP"
  }
  request.put({ url: apiEndpoint, body: JSON.stringify(data), headers: { 'authorization': 'Bearer 0ce923c90b144c7f9968bfef5c3c4d16' } }, async (error, response, body) => {
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
}

export const getProductListWish = (req, res, user) => {
  try {
    const apiEndpoint = `${wishUrl}/products?limit=100`;
    return new Promise(function (resolve, reject) {
      request.get({ url: apiEndpoint, headers: { 'authorization': 'Bearer 0ce923c90b144c7f9968bfef5c3c4d16' } }, async (error, response, body) => {
        if (error) {
          console.error(error);
          res.send({ error: "Internal server error" });
        } else if (response.statusCode !== 200) {
          console.error(body);
          res.send({ success: false, ...JSON.parse(body) });
        } else {
          // console.log(JSON.parse(body));
          let listing = JSON.parse(body).data;
          for (let product of listing) {
            let productExist = await ListingsModel.find({ identifier: product.id });
            if (productExist?.length) {
              const doc = await ListingsModel.findOneAndUpdate(
                { identifier: product.id, userid: user },
                {
                  status: product.status, // addwishproductid
                }
              ).catch(function (err) {
                console.log(err);
              });
              await doc?.save();
            } else {
              const docProductListing = new ListingsModel({
                productname: product?.name,
                description: product?.description,
                identifier: product?.id,
                category: product?.category,
                condition: product?.condition,
                availableqty: product?.variations[0]?.quantity_value,
                marketplacename: "Wish",
                weight: product?.variations[0]?.logistics_details?.weight,
                length: product?.variations[0]?.logistics_details?.length,
                width: product?.variations[0]?.logistics_details?.width,
                height: product?.variations[0]?.logistics_details?.height,
                mapprice: product?.variations[0]?.price?.amount,
                gstin: product?.variations[0]?.gtin,
                sku: product?.parent_sku,
                costprice: product?.variations[0]?.cost?.amount,
                date: product?.created_at,
                userid: user,
                imageupload1: product?.main_image?.url,
                status: product?.status
              });
              await docProductListing.save();
            }
          }
          // resolve({ success: true, ...JSON.parse(body) });
          resolve({ success: true })
        }
      });
    });

  } catch (error) {
    res.status(400).json({ error: error?.message });
  }
}