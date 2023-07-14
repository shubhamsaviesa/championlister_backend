import jwt from "jsonwebtoken";
import { shippingModal } from "../../models/shippingModal/shippingModal.js";

export const creatShipping = async (req, res) => {
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
            productId,
            productName,
            uspsId,
            marketplaces,
            firstName,
            lastName,
            phoneNumber,
            address,
            city,
            state,
            country,
            postalCode,
            packageWeight,
            lbs,
            length,
            width,
            height,
            shippinDate,
            cancelDate,
        } = req.body;

        const doc = new shippingModal({
            orderDate,
            orderId,
            productId,
            productName,
            uspsId,
            marketplaces,
            firstName,
            lastName,
            phoneNumber,
            address,
            city,
            state,
            country,
            postalCode,
            packageWeight,
            lbs,
            length,
            width,
            height,
            userid: userId,
            shippinDate,
            cancelDate,
        });

        await doc.save();
        res.status(200).json({
            status: "success",
            message: "Shipping creation successfully"
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
}

export const deleteShipping = async (req, res) => {
    try {
        const id = req.params.id;
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

        const doc = await shippingModal.findOneAndUpdate(
            { userid: userId, _id: id },
            {
                disable: true, // addwishproductid
            }
        ).catch(function (err) {
            console.log(err);
            res.send({ error: err });
        });
        await doc.save();
        res.status(200).json({
            status: "success",
            message: "Shipping deleted successfully"
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
}
export const updateShipping = async (req, res) => {
    try {
        const id = req.params.id;
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
            productId,
            productName,
            uspsId,
            marketplaces,
            firstName,
            lastName,
            phoneNumber,
            address,
            city,
            state,
            country,
            postalCode,
            packageWeight,
            lbs,
            length,
            width,
            height,
            shippinDate,
            cancelDate,
            shippingStatus
        } = req.body;

        const doc = await shippingModal.findOneAndUpdate(
            { userid: userId, _id: id },
            {
                orderDate,
                orderId,
                productId,
                productName,
                uspsId,
                marketplaces,
                firstName,
                lastName,
                phoneNumber,
                address,
                city,
                state,
                country,
                postalCode,
                packageWeight,
                lbs,
                length,
                width,
                height,
                shippinDate,
                cancelDate,
                shippingStatus
            }
        ).catch(function (err) {
            console.log(err);
            res.send({ error: err });
        });
        await doc.save();
        res.status(200).json({
            status: "success",
            message: "Shipping updated successfully"
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
}
export const getShipping = async (req, res) => {
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

        const doc = await shippingModal.find(
            { userid: userId, disable: false }
        ).catch(function (err) {
            console.log(err);
            res.send({ error: err });
        });
        res.status(200).json({
            status: "success",
            message: "Shipping details get successfully",
            data: doc
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
}