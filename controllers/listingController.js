import { ListingsModel } from "../models/actionModel/Listing.js";
import { getProductListShopify } from "./channelCredentialControllers/shopifycontroller.js";
import { getProductListWish } from "./channelCredentialControllers/wishcontroller.js";

export const addinventorylistings = async (req, res) => {
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization.split(' ')[1],
            decoded;
        try {
            console.log(authorization);
            decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
        var userIdd = decoded.userId;
        try {
            let activeChannel = await channelactive(req, res, null, "order");
            console.log(activeChannel);
            activeChannel.forEach((obj) => {
                Object.keys(obj).forEach(async (key) => {
                    if (obj[key] === "Connected") {
                        switch (key) {
                            // case "Walmart":
                            //     await walmartOrders(req, res, userIdd);
                            //     break;
                            // case "eBay":
                            //     await getOrderListEbay(req, res, userIdd);
                            //     break;
                            // case "Amazon":
                            //     await amazonorders(req, res, userIdd);
                            //     break;
                            case "Wish":
                                await getProductListWish(req, res, userIdd);
                                break;
                            case "Shopify":
                                await getProductListShopify(req, res, userIdd);
                                break;
                            default:
                                break;
                        }
                    }
                });
            });
        } catch (error) {
            return res.status(400).send({ message: error?.message });
        }
        var data = await ListingsModel.find({ userid: userIdd }).sort({ date: -1 });
        res.send({ "listdata": data });
    }
    else {
        console.log("provide token");
    }
}

export const datefilters = async (req, res) => {
    const { date1, date2 } = req.body;
    // const id = req.query.id.split(';')
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization.split(' ')[1],
            decoded;
        try {
            console.log(authorization);
            decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
        var userIdd = decoded.userId;
        var dates = await ListingsModel.find({

            date: {
                $gte: date1,
                $lte: date2
            },
            userid: userIdd
        });
        var riversarray = [];
        var dataarray = dates
        var start = dataarray.length - 1;
        console.log(start);
        for (var i = start; i >= 0; i--) {

            riversarray.push(dataarray[i])
        }
        // console.log({ "listdata": dates });
        res.send({ "listdata": riversarray });
    } else {
        console.log("provide token");
    }


}

export const getcatalogdatefilters = async (req, res) => {
    const { date1, date2 } = req.body;
    // const id = req.query.id.split(';')
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization.split(' ')[1],
            decoded;
        try {
            console.log(authorization);
            decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
        var userIdd = decoded.userId;
        var dates = await ValorebooksModel.find({

            date: {
                $gte: date1,
                $lte: date2
            },
            userid: userIdd
        });
        var riversarray = [];
        var dataarray = dates
        var start = dataarray.length - 1;
        console.log(start);
        for (var i = start; i >= 0; i--) {

            riversarray.push(dataarray[i])
        }

        res.send({ "listdata": riversarray });
    } else {
        console.log("provide token");
    }


}