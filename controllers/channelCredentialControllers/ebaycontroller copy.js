import { ListingsModel } from "../../models/actionModel/Listing.js";
import { addInventoryModel } from "../../models/actionModel/addInventory.js";
import { ebaycredModel } from "../../models/channelCredentialModel/ebayModel.js"
import jwt from "jsonwebtoken"
import eBay from 'ebay-api'

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


export const getOrderListEbay = (req, res, user) => {
  let apiEndpoint = `${ebayUrl}/order?limit=100`
  let token = getAccessToken(req, res, user).access_token;
  return new Promise(function (resolve, reject) {
    request.get({ url: apiEndpoint, headers: { 'Authorization': `Bearer ${token}` } }, async (error, response, body) => {
      if (error) {
        console.error(error);
        // res.send({ error: "Internal server error" });
      } else if (response.statusCode !== 200) {
        console.error("body", body);
        // res.send({ success: false, ...JSON.parse(body) });
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
              marketplaces: "EBay",
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

function createProduct(saved_user, eBayOptions) {
  return new Promise((resolve, reject) => {
    const params = {
      Item: {
        Title: saved_user.productname,
        Description: saved_user.description,
        StartPrice: saved_user.costprice,
        CategoryID: '12345', // The eBay category ID for your product
        Quantity: saved_user.availableqty,
        ConditionID: 1000, // The condition ID for your product
        Country: 'US',
        Currency: 'USD',
        ListingDuration: 'Days_7',
        DispatchTimeMax: 1,
        ReturnsAcceptedOption: 'ReturnsAccepted',
        RefundOption: 'MoneyBack',
        PictureDetails: [
          { PictureURL: saved_user.imageupload1 },
          { PictureURL: saved_user.imageupload2 },
          { PictureURL: saved_user.imageupload3 }
        ],
        ProductListingDetails:{
          UPC: saved_user.upc
        }
      },
    };

    eBay.xmlRequest({
      serviceName: 'Trading',
      opType: 'AddItem', // or 'AddItem' for general listings
      devId: eBayOptions.devId,
      certId: eBayOptions.certId,
      appName: eBayOptions.appName,
      sandbox: eBayOptions.sandbox,
      params: params,
    }, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}


export async function ebay(req, res, id4, dataebay) {
  console.log("in ebay", id4);
  try {
    var saved_user = await addInventoryModel.find({ _id: { $in: id4 } });
    console.log(saved_user);
    const config = {
      apiUrl: 'https://api.ebay.com/ws/api.dll',
      devId: dataebay.devId,
      certId: dataebay.ebayclientsecret,
      appId: dataebay.ebayclientid,
      authToken: 'v^1.1#i^1#p^3#f^0#I^3#r^0#t^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',
      siteId: 0, // 0 for US site, see eBay documentation for other values
      version: '1113' // API version
    };

    for (const product of saved_user) {
      await createProduct(product, config);
      console.log(`Product "${product.title}" created successfully.`);
    }
  } catch (error) {
    console.log("Error", error);
  }

}