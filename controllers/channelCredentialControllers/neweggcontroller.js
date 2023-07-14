import { ListingsModel } from "../../models/actionModel/Listing.js";
import { addInventoryModel } from "../../models/actionModel/addInventory.js";
import { neweggCredModel } from "../../models/channelCredentialModel/neweggModel.js";
import jwt from "jsonwebtoken";
import { userModel } from "../../models/userModel.js";
import { AddorderModel } from "../../models/orderModel/AddorderModel.js";

const neweggApi = 'https://api.newegg.com/marketplace';

export const neweggCredential = async (req, res) => {
    const { nickname, neweggsellerid, neweggapikey } = req.body
    const marketplacename = "Newegg"
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
            var existChannel = await neweggCredModel.findOneAndUpdate({ userid: userIdd }, {
                nickname: nickname, neweggsellerid: neweggsellerid,
                neweggapikey: neweggapikey
            }, null, function (err, docs) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log("complete");

                }
            }).clone().catch(function (err) { console.log(err) })

            if (existChannel == null) {
                const doc = new neweggCredModel({
                    marketplacename: marketplacename,
                    nickname: nickname,
                    neweggsellerid: neweggsellerid,
                    neweggapikey: neweggapikey,
                    userid: userIdd,
                    flag: 1
                })
                await doc.save();
                res.send({ "status": "succes", "message": "Connection succesfully", "result": doc });
            } else {
                res.send({ "status": "succes", "message": "Updated succesfully", "result": existChannel });
            }
        } catch (error) {
            console.log(error);
        }

    } else {
        res.send("provide token");
    }
}

export const createProductOnNewegg = async (req, res, id, neweggCred) => {
    try {
        const headers = {
            Authorization: neweggCred.neweggSecretkey,
            SecretKey: neweggCred.neweggSecretkey,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        let data;

        for (let i = 0; i < id.length; i++) {

            var saved_user = await addInventoryModel.find({ _id: id[i] });
            data = {
                NeweggEnvelope: {
                    Header: { "DocumentVersion": "1.0" },
                    MessageType: "BatchItemCreation",
                    Message: {
                        Itemfeed: {
                            SummaryInfo: { "SubCategoryID": "13905" },
                            Item: [
                                {
                                    Action: "Create Item",
                                    BasicInfo: {
                                        SellerPartNumber: saved_user[0].manufacturernumber,
                                        Manufacturer: saved_user[0].manufacturer,
                                        ManufacturerPartsNumber: saved_user[0].manufacturernumber,
                                        UPCOrISBN: saved_user[0].upc,
                                        WebsiteShortTitle: saved_user[0].productname,
                                        BulletDescription: saved_user[0].description,
                                        ProductDescription: saved_user[0].description,
                                        ItemDimension: {
                                            ItemLength: saved_user[0].length,
                                            ItemWidth: saved_user[0].width,
                                            ItemHeight: saved_user[0].height
                                        },
                                        ItemWeight: saved_user[0].weight,
                                        PacksOrSets: "1",
                                        ItemCondition: "New",
                                        ItemPackage: "OEM",
                                        ShippingRestriction: "Yes",
                                        Currency: "USD",
                                        SellingPrice: saved_user[0].costprice,
                                        Shipping: "Default",
                                        Inventory: saved_user[0].availableqty,
                                        LimitQuantity: "1",
                                        ActivationMark: "True",
                                        ItemImages: {
                                            Image: [
                                                { ImageUrl: saved_user[0].imageupload1 },
                                                { ImageUrl: saved_user[0].imageupload2 },
                                                { ImageUrl: saved_user[0].imageupload3 }
                                            ]
                                        },
                                        "Warning": {
                                            "Prop65": "No",
                                            "Prop65Motherboard": "Yes",
                                            "OverAge18Verification": "Yes",
                                            "ChokingHazard": {
                                                "SmallParts": "Yes",
                                                "SmallBall": "Is a small ball",
                                                "Balloons": "Yes",
                                                "Marble": "Is a marble"
                                            }
                                        }
                                    },
                                    "SubCategoryProperty": {
                                        "CostumeAccessories": {
                                            "CostumeAccBrand": "String",
                                            "CostumeAccModel": "String",
                                            "CostumeAccGender": "Male",
                                            "CostumeAccAge": "Adult",
                                            "CostumeAccType": "Blood & Gore",
                                            "CostumeAccTheme": "Animals & Insects",
                                            "CostumeAccOccasion": "1st Birthday",
                                            "CostumeAccSize": "#10",
                                            "CostumeAccColor": "String",
                                            "CostumeAccMaterial": "String",
                                            "CostumeAccCareInstructions": "String"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }



            const apiEndpoint = `${neweggApi}/datafeedmgmt/feeds/submitfeed?sellerid=${neweggCred.neweggsellerid}&requesttype=ITEM_DATA`;

            return new Promise(function (resolve, reject) {

                request.post({ url: apiEndpoint, body: JSON.stringify(data), headers: headers }, async (error, response, body) => {
                    if (error) {
                        console.error(error);
                        resolve({ error: "Internal server error" });
                    } else if (response.statusCode !== 200) {
                        console.error(body);
                        resolve({ success: false, ...JSON.parse(body) });
                    } else {
                        console.log("else", body);

                        let data = JSON.parse(body).ResponseBody.ResponseList[0];
                        const doc = await addInventoryModel.findOneAndUpdate(
                            { _id: id[i] },
                            {
                                neweggProductId: data.RequestId, // addwishproductid
                            }
                        ).catch(function (err) {
                            console.log(err);
                        });
                        await doc.save();
                        const docProductListing = new ListingsModel({
                            productname: saved_user[0]?.productname,
                            description: saved_user[0]?.description,
                            identifier: data?.RequestId,
                            category: saved_user[0]?.category,
                            condition: saved_user[0]?.condition,
                            availableqty: saved_user[0]?.availableqty,
                            marketplacename: "Newegg",
                            weight: saved_user[0]?.weight,
                            length: saved_user[0]?.length,
                            width: saved_user[0]?.width,
                            height: saved_user[0]?.height,
                            mapprice: saved_user[0]?.mapprice,
                            gstin: saved_user[0]?.gstin,
                            sku: saved_user[0]?.sku,
                            costprice: saved_user[0]?.costprice,
                            date: saved_user[0]?.date,
                            userid: neweggCred.userid,
                            imageupload1: saved_user[0]?.imageupload1,
                            imageupload2: saved_user[0]?.imageupload2,
                            imageupload3: saved_user[0]?.imageupload3,
                            status: data?.RequestStatus
                        });
                        await docProductListing.save();
                        resolve({ success: true, ...JSON.parse(body) });
                        // res.json({ success: true, data: body });
                    }
                });
            });
        }

    } catch (e) {
        return res.status(401).send("unauthorized");
    }
}

export const updateProductOnNewegg = async (req, res, id, neweggCred) => {
    try {
        const headers = {
            Authorization: neweggCred.neweggSecretkey,
            SecretKey: neweggCred.neweggSecretkey,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        let data;

        for (let i = 0; i < id.length; i++) {

            var saved_user = await addInventoryModel.find({ _id: id[i] });
            data = {
                NeweggEnvelope: {
                    Header: {
                        DocumentVersion: "1.0"
                    },
                    MessageType: "Inventory",
                    Overwrite: "No",
                    Message: {
                        Inventory: {
                            Item: [
                                {
                                    SellerPartNumber: saved_user[0].manufacturernumber,
                                    Currency: "USD",
                                    SellingPrice: saved_user[0].costprice,
                                    Shipping: "Default",
                                    Inventory: saved_user[0].availableqty,
                                    LimitQuantity: "1",
                                    ActivationMark: "True",
                                    FulfillmentOption: "Seller",
                                    NeweggItemNumber: saved_user[0].neweggProductId
                                }
                            ]
                        }
                    }
                }
            }



            const apiEndpoint = `${neweggApi}/datafeedmgmt/feeds/submitfeed?sellerid=${neweggCred.neweggsellerid}&requesttype=ITEM_DATA`;

            return new Promise(function (resolve, reject) {

                request.post({ url: apiEndpoint, body: JSON.stringify(data), headers: headers }, async (error, response, body) => {
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

    } catch (e) {
        return res.status(401).send("unauthorized");
    }
}

export const getOrderListNewegg = async (req, res, userId) => {
    const neweggCred = await neweggCredModel.findOne({ userid: userId, marketplacename: "Newegg" });
    const headers = {
        Authorization: neweggCred.neweggSecretkey,
        SecretKey: neweggCred.neweggSecretkey,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    var user = await userModel.findOne({ _id: userId });
    let data = {
        OperationType: "GetOrderInfoRequest",
        IssueUser: user.email
    }
    const apiEndpoint = `${neweggApi}/ordermgmt/order/orderinfo?sellerid=${neweggCred.neweggsellerid}&version=312`;
    return new Promise(function (resolve, reject) {
        request.get({ url: apiEndpoint, body: JSON.stringify(data), headers: headers }, async (error, response, body) => {
            if (error) {
                console.error(error);
                res.send({ error: "Internal server error" });
            } else if (response.statusCode !== 200) {
                console.error(body);
                res.send({ success: false, ...JSON.parse(body) });
            } else {
                // console.log(JSON.parse(body));
                let orderlist = JSON.parse(body).OrderInfoList;
                for (let order of orderlist) {
                    let orderExist = await AddorderModel.find({ orderId: order.OrderNumber });
                    if (orderExist?.length) {
                        for (let item of order.ItemInfoList) {
                            const doc = await AddorderModel.findOneAndUpdate(
                                { productId: item.NeweggItemNumber, userid: user },
                                {
                                    orderStatus: order.StatusDescription, // addwishproductid
                                }
                            ).catch(function (err) {
                                console.log(err);
                            });
                            await doc?.save();
                        }
                    } else {
                        for (let item of order.ItemInfoList) {
                            const doc = new AddorderModel({
                                orderDate: order?.OrderDate,
                                orderId: order?.OrderNumber,
                                productName: item?.Description,
                                productId: item?.NeweggItemNumber,
                                purchasePrice: item?.UnitPrice,
                                quantity: item?.OrderedQty,
                                listedPrice: item?.UnitPrice,
                                marketplaces: "Newegg",
                                recipientName: order?.CustomerName,
                                phoneNumber: order?.CustomerPhoneNumber,
                                buyerEmail: order?.CustomerEmailAddress,
                                addressOne: order?.ShipToAddress1,
                                addressTwo: order?.ShipToAddress2,
                                city: order?.ShipToCityName,
                                state: order?.ShipToStateCode,
                                country: order?.ShipToCountryCode,
                                postalCode: parseInt(order?.ShipToZipCode),
                                orderStatus: order?.OrderStatusDescription,
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

export const cancelOrderNewegg =async (req, res, userId) => {
    const neweggCred = await neweggCredModel.findOne({ userid: userId, marketplacename: "Newegg" });
    const headers = {
        Authorization: neweggCred.neweggSecretkey,
        SecretKey: neweggCred.neweggSecretkey,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    const apiEndpoint = `${neweggApi}/ordermgmt/orderstatus/orders/${req.body.id}?sellerid=${neweggCred.neweggsellerid}`;
    data = {
        Action: "1",
        Value: "74"
    }
    request.put({ url: apiEndpoint, body: JSON.stringify(data), headers: headers }, async (error, response, body) => {
        if (error) {
            console.error(error);
            res.send({ error: "Internal server error" });
        } else if (response.statusCode !== 200) {
            console.error(body);
            res.send({ success: false, ...JSON.parse(body) });
        } else {
            console.log(JSON.parse(body));
            let orderExist = await AddorderModel.find({ orderId: req.body.id });
            for(let order of orderExist){
                const doc = await AddorderModel.findOneAndUpdate(
                    { productId: order.productId },
                    {
                        orderStatus: JSON.parse(body).Result.OrderStatus, // addwishproductid
                    }
                ).catch(function (err) {
                    console.log(err);
                });
                await doc.save();
            }
            res.send({ success: true, ...JSON.parse(body) });
        }
    });
}