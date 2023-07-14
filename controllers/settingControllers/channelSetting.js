import { neweggCredModel } from "../../models/channelCredentialModel/neweggModel.js";
import { searsCredModel } from "../../models/channelCredentialModel/searsModel.js";
import { walmartCredModel } from "../../models/channelCredentialModel/walmartModel.js";
import { wishCredModel } from "../../models/channelCredentialModel/wishModel.js";
import { uspscredModel } from "../../models/channelCredentialModel/uspsModel.js";
import { ebaycredModel } from "../../models/channelCredentialModel/ebayModel.js";
import { amazoncredModel } from "../../models/channelCredentialModel/amazonModel.js";
import jwt from 'jsonwebtoken';
import { bigcommercecredModel } from "../../models/channelCredentialModel/bigcommerceModel.js";
import { shopifycredModel } from "../../models/channelCredentialModel/shopifyModel.js";

export const channelactive = async (req, res, next, type) => {
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization.split(' ')[1],
            decoded;
        try {
            // console.log(authorization);
            decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
        var userIdd = decoded.userId;
        var neweggactive = await neweggCredModel.findOne({ userid: userIdd })
        var searsactive = await searsCredModel.findOne({ userid: userIdd })
        var walmartactive = await walmartCredModel.findOne({ userid: userIdd })
        var wishactive = await wishCredModel.findOne({ userid: userIdd })
        var uspsactive = await uspscredModel.findOne({ userid: userIdd })
        var ebayactive = await ebaycredModel.findOne({ userid: userIdd })
        var amazonactive = await amazoncredModel.findOne({ userid: userIdd })
        // var bigcommactive = await bigcommercecredModel.findOne({userid:userIdd})
        // var shopifyactive = await shopifycredModel.findOne({userid:userIdd})

        const channelStatus = []
        if (neweggactive) {
            channelStatus.push({ Newegg: "Connected" })
        } else channelStatus.push({ Newegg: "Not Connected" })

        if (searsactive) {
            channelStatus.push({ Sears: "Connected" })
        } else channelStatus.push({ Sears: "Not Connected" })

        if (walmartactive) {
            channelStatus.push({ Walmart: "Connected" })
        } else channelStatus.push({ Walmart: "Not Connected" })

        if (wishactive) {
            channelStatus.push({ Wish: "Connected" })
        } else channelStatus.push({ Wish: "Not Connected" })

        if (uspsactive) {
            channelStatus.push({ USPS: "Connected" })
        } else channelStatus.push({ USPS: "Not Connected" })

        if (amazonactive) {
            channelStatus.push({ Amazon: "Connected" })
        } else channelStatus.push({ Amazon: "Not Connected" })
        if (ebayactive) {
            channelStatus.push({ eBay: "Connected" })
        } else channelStatus.push({ eBay: "Not Connected" })

        if (type) {
            return channelStatus;
        } else {
            res.send({ "status": "success", "channelStatus": channelStatus })
        }

    } else {
        console.log("provide token");
    }
}

export const channelsetting = async (req, res) => {
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
        console.log(userIdd);
        var channel = []
        const newegg = await neweggCredModel.findOne({ userid: userIdd, marketplacename: "Newegg" })
        const sears = await searsCredModel.findOne({ userid: userIdd, marketplacename: "Sears" })
        const walmart = await walmartCredModel.findOne({ userid: userIdd, marketplacename: "Walmart" })
        const wish = await wishCredModel.findOne({ userid: userIdd, marketplacename: "Wish" })
        const usps = await uspscredModel.findOne({ userid: userIdd, marketplacename: "USPS" })
        const ebay = await ebaycredModel.findOne({ userid: userIdd, marketplacename: "eBay" })
        const amazon = await amazoncredModel.findOne({ userid: userIdd, marketplacename: "Amazon" })

        if (amazon !== null) {
            if (amazon.flag == 1) {
                channel.push({ "Amazon": "Connected" })
            }
            else {
                channel.push({ "Amazon": "Disconnected" })
            }
        }

        if (ebay !== null) {
            if (ebay.flag == 1) {
                channel.push({ "eBay": "Connected" })
            }
            else {
                channel.push({ "eBay": "Disconnected" })
            }
        }

        if (walmart !== null) {
            if (walmart.flag == 1) {
                channel.push({ "Walmart": "Connected" })
            }
            else {
                channel.push({ "Walmart": "Disconnected" })
            }
        }

        if (newegg !== null) {
            if (newegg.flag == 1) {
                channel.push({ "Newegg": "Connected" })
            }
            else {
                channel.push({ "Newegg": "Disconnected" })
            }


        }

        if (sears !== null) {
            if (sears.flag == 1) {
                channel.push({ "Sears": "Connected" })
            }
            else {
                channel.push({ "Sears": "Disconnected" })
            }

        }

        if (wish !== null) {
            if (wish.flag == 1) {
                channel.push({ "Wish": "Connected" })
            }
            else {
                channel.push({ "Wish": "Disconnected" })
            }

        }
        if (usps !== null) {
            if (usps.flag == 1) {
                channel.push({ "USPS": "Connected" })
            }
            else {
                channel.push({ "USPS": "Disconnected" })
            }

        }

        res.send({ "status": "succes", "message": channel })

    }
    else {
        console.log("provide token");
    }
}

export const deleteChannelconnection = async (req, res) => {
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
        var marketplacename = req.body.marketplacename
        switch (marketplacename) {

            case "Amazon":
                const amazon_user = await amazoncredModel.deleteOne({ userid: userIdd, marketplacename: "Amazon" })
                res.send({ "status": "success", "delete": amazon_user })
                break;

            case "eBay":
                const eBay_user = await ebaycredModel.deleteOne({ userid: userIdd, marketplacename: "eBay" })
                res.send({ "status": "success", "delete": eBay_user })
                break;

            case "Walmart":
                const walmart_user = await walmartCredModel.deleteOne({ userid: userIdd, marketplacename: "Walmart" })
                res.send({ "status": "success", "delete": walmart_user })
                break;

            case "Newegg":
                const newegg_user = await neweggCredModel.deleteOne({ userid: userIdd, marketplacename: "Newegg" })
                res.send({ "status": "success", "delete": newegg_user })
                break;

            case "Sears":
                const Sears_user = await searsCredModel.deleteOne({ userid: userIdd, marketplacename: "Sears" })
                res.send({ "status": "success", "delete": Sears_user })
                break;

            case "USPS":
                const Usps_user = await uspscredModel.deleteOne({ userid: userIdd, marketplacename: "USPS" })
                res.send({ "status": "success", "delete": Usps_user })
                break;

            case "Wish":
                const Wish_user = await wishCredModel.deleteOne({ userid: userIdd, marketplacename: "Wish" })
                res.send({ "status": "success", "delete": Wish_user })
                break;

            default:
                break;
        }

    }
    else {
        console.log("provide token");
    }


}

export const editchannel = async (req, res) => {
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
        var marketplacename = req.body.marketplacename
        switch (marketplacename) {
            case "Amazon":
                const amazon_user = await amazoncredModel.findOne({ userid: userIdd, marketplacename: "Amazon" })
                res.send({ "status": "success", "message": amazon_user })
                break;

            case "eBay":
                const ebay_user = await ebaycredModel.findOne({ userid: userIdd, marketplacename: "eBay" })
                res.send({ "status": "success", "message": ebay_user })
                break;

            case "Walmart":
                const walmart_user = await walmartCredModel.findOne({ userid: userIdd, marketplacename: "Walmart" })
                res.send({ "status": "success", "message": walmart_user })
                break;

            case "Newegg":
                const Newegg_user = await neweggCredModel.findOne({ userid: userIdd, marketplacename: "Newegg" })
                res.send({ "status": "success", "message": Newegg_user })
                break;

            case "Sears":
                const Sears_user = await searsCredModel.findOne({ userid: userIdd, marketplacename: "Sears" })
                res.send({ "status": "success", "message": Sears_user })
                break;

            case "Wish":
                const Wish_user = await wishCredModel.findOne({ userid: userIdd, marketplacename: "Wish" })
                res.send({ "status": "success", "message": Wish_user })
                break;

            case "USPS":
                const usps_user = await uspscredModel.findOne({ userid: userIdd, marketplacename: "USPS" })
                res.send({ "status": "success", "message": usps_user })
                break;


            default:
                break;
        }
    }
    else {
        console.log("provide token");
    }
}

export const channelconnectdisconnect = async (req, res) => {

    console.log("frpom", req.body)

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
        var marketplacename = req.body.marketplacename
        var status = req.body.status

        if (status == "Disconnect") {
            switch (marketplacename) {
                case "Walmart":
                    await walmartCredModel.findOneAndUpdate({ userid: userIdd, marketplacename: "Walmart", flag: 1 }, { flag: 0 }, null, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            res.send({ "status": "Disconnect", "Original Doc :": docs })

                        }
                    }).clone().catch(function (err) { console.log(err) })
                    break;

                case "eBay":
                    await ebaycredModel.findOneAndUpdate({ userid: userIdd, marketplacename: "eBay", flag: 1 }, { flag: 0 }, null, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            res.send({ "status": "Disconnect", "Original Doc :": docs })

                        }
                    }).clone().catch(function (err) { console.log(err) })
                    break;

                case "Amazon":
                    await amazoncredModel.findOneAndUpdate({ userid: userIdd, marketplacename: "Amazon", flag: 1 }, { flag: 0 }, null, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            res.send({ "status": "Disconnect", "Original Doc :": docs })

                        }
                    }).clone().catch(function (err) { console.log(err) })
                    break;

                case "Sears":
                    await searsCredModel.findOneAndUpdate({ userid: userIdd, marketplacename: "Sears", flag: 1 }, { flag: 0 }, null, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            res.send({ "status": "Disconnect", "Original Doc :": docs })

                        }
                    }).clone().catch(function (err) { console.log(err) })
                    break;

                case "Newegg":
                    await neweggCredModel.findOneAndUpdate({ userid: userIdd, marketplacename: "Newegg", flag: 1 }, { flag: 0 }, null, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            res.send({ "status": "Disconnect", "Original Doc :": docs })

                        }
                    }).clone().catch(function (err) { console.log(err) })
                    break;

                case "Wish":
                    await wishCredModel.findOneAndUpdate({ userid: userIdd, marketplacename: "Wish", flag: 1 }, { flag: 0 }, null, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            res.send({ "status": "Disconnect", "Original Doc :": docs })

                        }
                    }).clone().catch(function (err) { console.log(err) })
                    break;

                case "USPS":
                    await uspscredModel.findOneAndUpdate({ userid: userIdd, marketplacename: "USPS", flag: 1 }, { flag: 0 }, null, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            res.send({ "status": "Disconnect", "Original Doc :": docs })

                        }
                    }).clone().catch(function (err) { console.log(err) })
                    break;

            }
        }
        else {
            switch (marketplacename) {
                case "Walmart":
                    await walmartCredModel.findOneAndUpdate({ userid: userIdd, marketplacename: "Walmart", flag: 0 }, { flag: 1 }, null, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            res.send({ "status": "Connect", "Original Doc : ": docs })
                        }
                    }).clone().catch(function (err) { console.log(err) })
                    break;

                case "eBay":
                    await ebaycredModel.findOneAndUpdate({ userid: userIdd, marketplacename: "eBay", flag: 0 }, { flag: 1 }, null, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            res.send({ "status": "Connect", "Original Doc : ": docs })
                        }
                    }).clone().catch(function (err) { console.log(err) })
                    break;

                case "Amazon":
                    await amazoncredModel.findOneAndUpdate({ userid: userIdd, marketplacename: "Amazon", flag: 0 }, { flag: 1 }, null, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            res.send({ "status": "Connect", "Original Doc :": docs })

                        }
                    }).clone().catch(function (err) { console.log(err) })
                    break;

                case "Sears":
                    await searsCredModel.findOneAndUpdate({ userid: userIdd, marketplacename: "Sears", flag: 0 }, { flag: 1 }, null, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            res.send({ "status": "Connect", "Original Doc :": docs })

                        }
                    }).clone().catch(function (err) { console.log(err) })
                    break;

                case "Newegg":

                    await neweggCredModel.findOneAndUpdate({ userid: userIdd, marketplacename: "Newegg", flag: 0 }, { flag: 1 }, null, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            console.log("neweee")
                            res.send({ "status": "Connect", "Original Doc :": docs })

                        }
                    }).clone().catch(function (err) { console.log(err) })
                    break;

                case "Wish":
                    await wishCredModel.findOneAndUpdate({ userid: userIdd, marketplacename: "Wish", flag: 0 }, { flag: 1 }, null, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            res.send({ "status": "Connect", "Original Doc :": docs })

                        }
                    }).clone().catch(function (err) { console.log(err) })
                    break;

                case "USPS":
                    await uspscredModel.findOneAndUpdate({ userid: userIdd, marketplacename: "USPS", flag: 0 }, { flag: 1 }, null, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            res.send({ "status": "Connect", "Original Doc :": docs })

                        }
                    }).clone().catch(function (err) { console.log(err) })
                    break;
            }
        }

    }
    else {
        console.log("provide token");
    }
}

