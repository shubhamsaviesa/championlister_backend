import { shopifycredModel } from "../../models/channelCredentialModel/shopifyModel.js";
import jwt from "jsonwebtoken";
import { shopifyApi, ApiVersion, Session } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
import { addInventoryModel } from "../../models/actionModel/addInventory.js";
import { ListingsModel } from "../../models/actionModel/Listing.js";
import { AddorderModel } from "../../models/orderModel/AddorderModel.js";

export const shopifycredential = async (req, res) => {
    const { nickname, apiKey, apiSecretKey, adminApiAccessToken, shop } = req.body
    console.log("wal reqbody", req.body)

    const marketplacename = "Shopify"
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
            if (bigcommerceconnectvalue || marketplacename) {
                const doc = new shopifycredModel({
                    apiKey: apiKey,
                    apiSecretKey: apiSecretKey,
                    adminApiAccessToken: adminApiAccessToken,
                    shop: shop,
                    nickName: nickname,
                    marketplacename: "Shopify",
                    userid: userIdd,
                    flag: 1,
                })
                await doc.save();

                //    var userabelistings = await ListingsModel.find({ userid: userIdd, marketplacename: marketplacename })
                res.send({ "status": "succes", "message": "Connection succesfully", "result": doc });
            }
        } catch (error) {
            res.send({ "status": "failed", "message": "Connection failed" });
            console.log(error);
        }

    } else {
        res.send("provide token");
    }
}

const config = async (userCred) => {
    try {
        const shopify = shopifyApi({
            apiSecretKey: userCred.apiSecretKey,            // Note: this is the API Secret Key, NOT the API access token
            apiVersion: ApiVersion.April23,
            isCustomStoreApp: true,                        // this MUST be set to true (default is false)
            adminApiAccessToken: userCred.adminApiAccessToken, // Note: this is the API access token, NOT the API Secret Key
            isEmbeddedApp: false,
            scopes: ["read_products", "write_products", "read_orders", "write_orders", "read_all_orders", "read_order_edits", "write_order_edits"],
            hostName: userCred.shop,
            // Mount REST resources.
            restResources,
        });
        const session = shopify.session.customAppSession(userCred.shop);
        return { shopify: shopify, session: session };

    } catch (error) {
        console.log("error", error);
    }
}

export const createProductOnShopify = async (req, res, id, ShopifyCred) => {
    let init = config(ShopifyCred);

    for (let i = 0; i < id.length; i++) {

        var saved_user = await addInventoryModel.find({ _id: id[i] });
        const product = new init.shopify.rest.Product({ session: init.session });
        product.title = saved_user[0]?.productname;
        product.body_html = saved_user[0]?.description;
        product.product_type = saved_user[0]?.category;
        product.variants = [
            {
                option1: saved_user[0]?.productname,
                price: saved_user[0]?.costprice,
                sku: saved_user[0]?.sku,
                weight: saved_user[0]?.weight,
                inventory_quantity: saved_user[0]?.availableqty,
                old_inventory_quantity: saved_user[0]?.availableqty
            }
        ];
        product.images = [
            {
                src: saved_user[0]?.imageupload1
            },
            {
                src: saved_user[0]?.imageupload2
            },
            {
                src: saved_user[0]?.imageupload3
            },
        ]
        let response = await product.save({
            update: true,
        });
        return new Promise(async function (resolve, reject) {
            if (response?.errors) {
                console.error(errors);
                resolve({ error: errors });
            } else {
                let data = response.product;
                const docProductListing = new ListingsModel({
                    productname: data?.title,
                    description: data?.body_html,
                    identifier: data?.variants[0]?.id,
                    category: data?.product_type,
                    availableqty: data?.variants[0]?.inventory_quantity,
                    marketplacename: "Shopify",
                    weight: data?.variants[0]?.weight,
                    sku: data?.variants[0]?.sku,
                    costprice: data?.variants[0]?.price,
                    date: data?.created_at,
                    userid: ShopifyCred.userid,
                    imageupload1: data?.images[0]?.src,
                    imageupload2: data?.images[1]?.src,
                    imageupload3: data?.images[2]?.src,
                    ShopifyProductId: data.id,
                    status: data?.status
                });
                await docProductListing.save();
                resolve({ success: true });
            }
        });
    }
};

export const updateProductOnShopify = async (req, res, id, ShopifyCred) => {
    try {
        let init = config(ShopifyCred);
        for (i = 0; i < id.length; i++) {

            var saved_user = await addInventoryModel.find({ _id: id[i] });
            const product = new init.shopify.rest.Product({ session: init.session });
            product.id = saved_user[0].ShopifyProductId;
            product.variants = [
                {
                    id: saved_user[0]?.identifier,
                    price: saved_user[0]?.costprice,
                    inventory_quantity: saved_user[0]?.availableqty,
                    old_inventory_quantity: saved_user[0]?.availableqty
                }
            ];
            let response = await product.save({
                update: true,
            });
            return new Promise(async function (resolve, reject) {
                if (response?.errors) {
                    console.error(errors);
                    resolve({ error: errors });
                } else {
                    resolve({ success: true });
                }
            });
        }
    } catch (error) {
        res.status(400).json({ error: error?.message });
    }
};

export const getOrderListShopify = async (req, res, user) => {
    try {
        let ShopifyCred = await shopifycredModel.findOne({ userid: user, marketplacename: "Shopify" })
        let init = config(ShopifyCred);
        let response = await init.shopify.rest.Order.all({
            session: init.session,
            status: "any",
        });
        return new Promise(async function (resolve, reject) {
            if (response?.errors) {
                console.error(errors);
                resolve({ success: false, message: errors });
            } else {
                // console.log(JSON.parse(body));
                let orderlist = response.orders;
                for (let order of orderlist) {
                    let orderExist = await AddorderModel.find({ orderId: order.id });
                    if (orderExist?.length) {
                        const doc = await AddorderModel.findOneAndUpdate(
                            { orderId: order.id, userid: user },
                            {
                                orderStatus: order.state, // addShopifyproductid
                            }
                        ).catch(function (err) {
                            console.log(err);
                        });
                        await doc?.save();
                    } else {
                        for (let line of order?.line_items) {
                            const doc = new AddorderModel({
                                orderDate: order?.created_at,
                                orderId: order?.id,
                                productName: line?.name,
                                productId: line?.product_id,
                                purchasePrice: line?.price,
                                quantity: line?.quantity,
                                tax: order?.total_tax,
                                listedPrice: order?.total - price,
                                marketplaces: "Shopify",
                                recipientName: order?.shipping_address?.name,
                                phoneNumber: order?.shipping_address?.phone,
                                addressOne: order?.shipping_address?.address1,
                                addressTwo: order?.shipping_address?.address2,
                                city: order?.shipping_address?.city,
                                state: order?.shipping_address?.province,
                                country: order?.shipping_address?.country_code,
                                postalCode: parseInt(order?.shipping_address?.zip),
                                orderStatus: order?.fulfillments[0]?.status,
                                sku: line?.sku,
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
    } catch (error) {
        res.status(400).json({ error: error?.message });
    }
}

export const cancelOrderShopify = async (req, res, ShopifyCred) => {
    let init = config(ShopifyCred);
    const order = new init.shopify.rest.Order({ session: init.session });
    order.id = req.body.id;
    let response = await order.cancel({});
    return new Promise(async function (resolve, reject) {
        if (response?.errors) {
            console.error(errors);
            resolve({ error: errors });
        } else {
            const doc = await AddorderModel.findOneAndUpdate(
                { orderId: req.body.id },
                {
                    orderStatus: response.order?.fulfillments[0]?.status, // addShopifyproductid
                }
            ).catch(function (err) {
                console.log(err);
            });
            await doc.save();
            resolve({ success: true });
        }
    });
}

export const getProductListShopify = async (req, res, user) => {
    try {
        let ShopifyCred = await shopifycredModel.findOne({ userid: user, marketplacename: "Shopify" })
        let init = config(ShopifyCred);
        let response = await init.shopify.rest.Product.all({
            session: init.session,
        });
        return new Promise(async function (resolve, reject) {
            if (response?.errors) {
                console.error(errors);
                resolve({ error: errors });
            } else {
                let data = response.products;
                for (let product of data) {
                    let existProduct = await ListingsModel.findOne({ ShopifyProductId: product.id })
                    if (existProduct?.length === 0) {
                        const docProductListing = new ListingsModel({
                            productname: data?.title,
                            description: data?.body_html,
                            identifier: data?.variants[0]?.id,
                            category: data?.product_type,
                            availableqty: data?.variants[0]?.inventory_quantity,
                            marketplacename: "Shopify",
                            weight: data?.variants[0]?.weight,
                            sku: data?.variants[0]?.sku,
                            costprice: data?.variants[0]?.price,
                            date: data?.created_at,
                            userid: ShopifyCred.userid,
                            imageupload1: data?.images[0]?.src,
                            imageupload2: data?.images[1]?.src,
                            imageupload3: data?.images[2]?.src,
                            ShopifyProductId: data.id,
                            status: data?.status
                        });
                        await docProductListing.save();
                    }
                }
                resolve({ success: true });
            }
        });

    } catch (error) {
        res.status(400).json({ error: error?.message });
    }
}