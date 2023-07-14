import { userModel } from "../../models/userModel.js";
import jwt from "jsonwebtoken";

// export const accountSetting = async (req, res) => {
//   console.log("from account setting", req.body);
//   if (req.headers && req.headers.authorization) {
//     var authorization = req.headers.authorization.split(" ")[1],
//       decoded;
//     try {
//       console.log(authorization);
//       decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
//     } catch (e) {
//       return res.status(401).send("unauthorized");
//     }
//     var userIdd = decoded.userId;
//     try {
//       const { shippingInfo, accountInfo, billingInfo } = req.body;
//       const doc = await userModel
//         .findByIdAndUpdate(
//           { _id: userIdd },
//           {
//             userid: userIdd,
//             shippinginfo: shippingInfo,

//             billingInfo: billingInfo,
//           },
//           null,
//           function (err, docs) {
//             if (err) {
//               console.log(err);
//             } else {
//               console.log("complete");
//               console.log("docccccccc", docs);
//             }
//           }
//         )
//         .clone()
//         .catch(function (err) {
//           console.log(err);
//         });
//       console.log(doc);
//       res.send({ status: "succes", message: "address saved successfully" });
//     } catch (e) {
//       console.log("errorss", e);
//     }
//   } else {
//     console.log("provide token");
//   }
// };

export const accountSetting = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(" ")[1],
      decoded;
    try {
      console.log(authorization);
      decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
    } catch (e) {
      return res.status(401).send("unauthorized");
    }
    var userIdd = decoded.userId;

    try {
      const {
        userId,
        firstname,
        lastname,
        emailaddress,
        mobilenumber,
        companyname,
        country,
        state,
        city,
        postalcode,
        billingInfo,
        shippingInfo,
      } = req.body;
      console.log("req.body", userId);
      const doc = await userModel
        .findByIdAndUpdate(
          { _id: userId },
          {
            firstname: firstname,
            lastname: lastname,
            emailaddress: emailaddress,
            mobilenumber: mobilenumber,
            companyname: companyname,
            country: country,
            state: state,
            city: city,
            postalcode: postalcode,
            shippinginfo: shippingInfo,
            billinginfo: billingInfo,
          },
          null,
          function (err, docs) {
            if (err) {
              console.log(err);
            } else {
              console.log("complete");
              console.log("docccccccc", docs);
            }
          }
        )
        .clone()
        .catch(function (err) {
          console.log(err);
        });
      console.log(doc);
      res.send({ status: "succes", message: "address saved successfully" });
    } catch (e) {
      console.log("errorss", e);
    }
  } else {
    console.log("provide token");
  }
};
