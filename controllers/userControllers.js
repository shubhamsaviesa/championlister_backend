import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();
import twilio from "twilio";
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
import { ListingsModel } from "../models/actionModel/Listing.js";
// import { CpsContext } from "twilio/lib/rest/preview/trusted_comms/cps.js";
import request from "request";
import { amazoncredModel } from "../models/channelCredentialModel/amazonModel.js";
import { walmartCredModel } from "../models/channelCredentialModel/walmartModel.js";
import { ebaycredModel } from "../models/channelCredentialModel/ebayModel.js";
import EbayAuthToken from "ebay-oauth-nodejs-client";
import { body } from "express-validator";
import { wishCredModel } from "../models/channelCredentialModel/wishModel.js";
import { getToken, getWarehouseId } from "./channelCredentialControllers/wishcontroller.js";

export const userRegistration = async (req, res) => {
  console.log("userregistration", req.body);
  const {
    firstname,
    lastname,
    username,
    email,
    mobilenumber,
    password,
    confirmPassword,
  } = req.body;
  const user = await userModel.findOne({ email: email });
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  if (user) {
    res.send({ status: "failed", message: "email alredy exists" });
  } else {
    if (
      firstname &&
      lastname &&
      username &&
      email &&
      mobilenumber &&
      password &&
      confirmPassword
    ) {
      if (regex.test(email)) {
        if (mobilenumber.length === 10) {
          if (
            username.match(/[a-z]/g) &&
            username.match(/[0-9]/g) &&
            username.length >= 4
          ) {
            if (password == confirmPassword) {
              if (
                password.match(/[a-z]/g) &&
                password.match(/[A-Z]/g) &&
                password.match(/[0-9]/g) &&
                password.match(/[^a-zA-Z\d]/g) &&
                password.length >= 6 &&
                password.length < 11
              ) {
                try {
                  const salt = await bcrypt.genSalt(10);
                  const hashPassword = await bcrypt.hash(password, salt);
                  const doc = new userModel({
                    firstname: firstname,
                    lastname: lastname,
                    username: username,
                    email: email,
                    mobilenumber: mobilenumber,
                    password: hashPassword,
                  });
                  await doc.save();
                  const saved_user = await userModel.findOne({ email: email });
                  //generate jwt token
                  const token = jwt.sign(
                    { userId: saved_user._id, userName: saved_user.name },
                    process.env.JWT_SECRET_KEY,
                    { expiresIn: "5d" }
                  );
                  res.send({
                    status: "success",
                    message: "registration succesfully",
                    token: token,
                  });
                } catch (error) {
                  console.log(error);
                  res.send({ status: "failed", message: "Unable to register" });
                }
              } else {
                res.send({
                  status: "failed",
                  message: "password format is not correct",
                });
              }
            } else {
              res.send({
                status: "failed",
                message: "Password and Confirm Password doesnt match",
              });
            }
          } else {
            res.send({
              status: "failed",
              message: "username format is not correct",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "mobile number must be 10 digit",
          });
        }
      } else {
        res.send({ status: "failed", message: "email format is not correct" });
      }
    } else {
      res.send({ status: "failed", message: "All fields are required" });
    }
  }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (email && password) {
      const user = await userModel.findOne({ email: email });
      if (user != null) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (user.email == email && isMatch) {
          //generate login jwt token
          const token = jwt.sign(
            {
              userId: user._id,
              userName: user.firstname,
              userEmail: user.email,
              userPassword: password,
              hashUserPassword: user.password,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "5d" }
          );
          res.send({
            status: "succes",
            message: "Login succesfully",
            token: token,
            user: user,
          });
        } else {
          res.send({
            status: "failed",
            message: "This userId and Password are not correct",
          });
        }
      } else {
        res.send({
          status: "wrong credentials",
          message: "Email or password wrong or user is not register yet",
        });
      }
    } else {
      res.send({
        status: "Required field",
        message: "Please fill all the fields",
      });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "failed", message: "Unable to login" });
  }
};

export const getOtp = async (req, res) => {
  const mobilenumber = req.body.mobilenumber;
  const saved_user = await userModel.findOne({ mobilenumber: mobilenumber });
  if (saved_user) {
    const newMobilenumber = "+91" + mobilenumber;
    // console.log(newMobilenumber)
    await client.verify.v2
      .services(process.env.TWILIO_SERVICE_ID)
      .verifications.create({ to: newMobilenumber, channel: "sms" })
      .then((verification) => {
        console.log(verification);
        res.send({
          status: "success",
          message: "OTP Send Successfully",
          user: saved_user,
        });
      });
  } else {
    res.send({ status: "failed", message: "Mobile Number is not registered" });
  }
};

export const verifyOtp = async (req, res) => {
  console.log("verify", req.body);
  const { otpCode, mobilenumber } = req.body;
  try {
    console.log("otpCode", otpCode, mobilenumber);
    const newMobilenumber = "+91" + mobilenumber;
    await client.verify.v2
      .services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks.create({ to: newMobilenumber, code: otpCode })
      .then((verification_check) => {
        console.log(verification_check);
        if (verification_check.status === "approved") {
          res.send({ status: "success", message: "OTP Verified Successfully" });
        } else {
          res.send({ status: "failed", message: "OTP is not matched" });
        }
      });
  } catch (e) {
    console.log("error", e);
  }
};

export const resetPassword = async (req, res) => {
  console.log("from reset password", req.body);
  const { password, confirmPassword, user } = req.body;
  if (password && confirmPassword) {
    if (
      password.match(/[a-z]/g) &&
      password.match(/[A-Z]/g) &&
      password.match(/[0-9]/g) &&
      password.match(/[^a-zA-Z\d]/g) &&
      password.length >= 6 &&
      password.length < 11
    ) {
      if (password !== confirmPassword) {
        res.send({
          status: "password not matched",
          message: "New password and confirm new password does not match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newhashPassword = await bcrypt.hash(password, salt);
        await userModel
          .findByIdAndUpdate(
            { _id: user._id },
            {
              password: newhashPassword,
            },
            null,
            function (err, docs) {
              if (err) {
                console.log(err);
              } else {
                console.log("complete");
              }
            }
          )
          .clone()
          .catch(function (err) {
            console.log(err);
          });
        res.send({
          status: "success",
          message: "password change successfully",
        });
      }
    } else {
      res.send({
        status: "incorrect format",
        message: "password does not in correct format",
      });
    }
  } else {
    res.send({ status: "failed", message: "All fields are required" });
  }
};

export const changePassword = async (req, res) => {
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
    const { currentPassword, newPassword, confirmnewPassword } = req.body;
    console.log("newPassword", newPassword);
    console.log("confirms", confirmnewPassword);

    const saved_user = await userModel.findOne({ _id: userIdd });
    const isMatch = await bcrypt.compare(currentPassword, saved_user.password);
    if (saved_user) {
      if (isMatch) {
        if (newPassword && confirmnewPassword) {
          if (
            newPassword.match(/[a-z]/g) &&
            newPassword.match(/[A-Z]/g) &&
            newPassword.match(/[0-9]/g) &&
            newPassword.match(/[^a-zA-Z\d]/g) &&
            newPassword.length >= 6 &&
            newPassword.length < 11
          ) {
            if (newPassword !== confirmnewPassword) {
              console.log("181");
              res.send({
                status: "password not matched",
                message: "New password and confirm new password does not match",
              });
            } else {
              const salt = await bcrypt.genSalt(10);
              const newhashPassword = await bcrypt.hash(newPassword, salt);
              await userModel
                .findByIdAndUpdate(
                  { _id: saved_user._id },
                  {
                    password: newhashPassword,
                  },
                  null,
                  function (err, docs) {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log("complete");
                    }
                  }
                )
                .clone()
                .catch(function (err) {
                  console.log(err);
                });
              res.send({
                status: "success",
                message: "password change successfully",
              });
            }
          } else {
            console.log("not matchs");
            res.send({
              status: "incorrect format",
              message: "password does not in correct format",
            });
          }
        } else {
          res.send({ status: "failed", message: "All fields are required" });
        }
      } else {
        res.send({ status: "current password not matched" });
      }
    }
  } else {
    console.log("provide token");
  }
};

export const userData = async (req, res) => {
  if (req.body.headers && req.body.headers.Authorization) {
    var authorization = req.body.headers.Authorization.split(" ")[1],
      decoded;
    try {
      decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
    } catch (e) {
      return res.status(401).send("unauthorized");
    }
    var userIdd = decoded.userId;
    const userData = await userModel.findOne({ _id: userIdd });
    res.send(userData);
  } else {
    console.log("Provide Token");
  }
};


export const amazoncredential = async (req, res) => {
  console.log(req.body);
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
    console.log(userIdd);
    const { amazonclientid, amazonclientsecret, amazonsellerid } = req.body;
    const marketplacename = "Amazon";
    var find8 = await amazoncredModel
      .findOneAndUpdate(
        { userid: userIdd },
        {
          amazonemailid: amazonclientid,
          amazonpassword: amazonclientsecret,
          amazonsellerid: amazonsellerid,
        },
        null,
        function (err, docs) {
          if (err) {
            console.log(err);
          } else {
            console.log("complete");
          }
        }
      )
      .clone()
      .catch(function (err) {
        console.log(err);
      });
    var userabelistings = await ListingsModel.find({
      userid: userIdd,
      marketplacename: marketplacename,
    });
    console.log(find8);
    if (find8 == null) {
      try {
        const formData = {
          grant_type: "client_credentials",
          client_id:
            amazonclientid,
          client_secret:
            amazonclientsecret,
          scope: "appstore::apps:readwrite",
        };
        const options1 = {
          url: "https://api.amazon.com/auth/o2/token",

          headers: { 'content-type': 'application/x-www-form-urlencoded' },

          body: JSON.stringify(formData),
        };

        async function callback(error, response, body) {
          console.log("res", body, response);
          if (!error || response.statusCode == 200) {
            const infotoken = JSON.parse(body);
            const doc = new amazoncredModel({
              marketplacename: marketplacename,
              amazonemailid: amazonclientid,
              amazonpassword: amazonclientsecret,
              amazonsellerid: amazonsellerid,
              userid: userIdd,
              flag: 1,
            });
            await doc.save();
            //    res.send(doc);
            res.send({
              status: "success",
              message: "Connection succesfully",
              result: doc,
              listings: userabelistings,
            });
          } else {
            console.log({ error: error });
            res.send({ error: error });
          }
        }

        request.post(options1, callback);
      } catch (error) {
        console.log("wrong credentials");
      }
    } else {
      res.send({
        status: "success",
        message: "Updated succesfully",
        result: find8,
        listings: userabelistings,
      });
    }
  } else {
    console.log("provide token");
  }
};

export const walmartCredential = async (req, res) => {
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
    console.log(userIdd);
    const { nickname, walmartid, walmartsecret } = req.body;
    const marketplacename = "Walmart";
    try {
      const options = {
        url: "https://marketplace.walmartapis.com/v3/token",
        auth: {
          username: walmartid,
          password: walmartsecret,
        },
        headers: {
          Authorization: "",
          Accept: "application/json",
          "WM_QOS.CORRELATION_ID": walmartid,
          "WM_SVC.NAME": nickname,
        },
        form: { grant_type: "client_credentials" },
      };

      async function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
          const info = JSON.parse(body);
          var token = info.access_token;
          console.log("token", token);
          var find7 = await walmartCredModel
            .findOneAndUpdate(
              { userid: userIdd },
              {
                nickname: nickname,
                walmartid: walmartid,
                walmartsecret: walmartsecret,
              },
              null,
              function (err, docs) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("complete");
                }
              }
            )
            .clone()
            .catch(function (err) {
              console.log(err);
            });
          var userabelistings = await ListingsModel.find({
            userid: userIdd,
            marketplacename: marketplacename,
          });
          if (find7 == null) {
            const doc = new walmartCredModel({
              marketplacename: marketplacename,
              nickname: nickname,
              walmartid: walmartid,
              walmartsecret: walmartsecret,
              userid: userIdd,
              flag: 1,
            });
            await doc.save();

            res.send({
              status: "succes",
              message: "Connection succesfully",
              result: doc,
              listings: userabelistings,
            });
          } else {
            res.send({
              status: "succes",
              message: "Updated succesfully",
              result: find7,
              listings: userabelistings,
            });
          }
        } else {
          console.log({ error: error });
          res.send({ status: "fail", message: "provide right credentials" });
        }
      }
      request.post(options, callback);
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("provide token");
  }
};

export const ebaycredential = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    // Extract the JWT token from the authorization header
    const authorization = req.headers.authorization.split(" ")[1];

    try {
      // Verify the JWT token and extract the user ID from the payload
      const decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
      const userId = decoded.userId;

      // Extract the eBay credentials from the request body
      const { nickname, ebayclientid, ebayclientsecret, code, redirect_uri } = req.body;

      // Define the eBay marketplace name and OAuth scopes
      const marketplaceName = "Ebay";
      const scopes = [
        "https://api.ebay.com/oauth/api_scope",
        "https://api.ebay.com/oauth/api_scope/sell.marketing.readonly",
        "https://api.ebay.com/oauth/api_scope/sell.marketing",
        "https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
        "https://api.ebay.com/oauth/api_scope/sell.inventory",
        "https://api.ebay.com/oauth/api_scope/sell.account.readonly",
        "https://api.ebay.com/oauth/api_scope/sell.account",
        "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
        "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
        "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
        "https://api.ebay.com/oauth/api_scope/sell.finances",
        "https://api.ebay.com/oauth/api_scope/sell.payment.dispute",
        "https://api.ebay.com/oauth/api_scope/commerce.identity.readonly",
        "https://api.ebay.com/oauth/api_scope/commerce.notification.subscription",
        "https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly"
      ];

      // Generate the eBay authorization URL
      const ebayAuthToken = new EbayAuthToken({
        clientId: ebayclientid,
        clientSecret: ebayclientsecret,
        redirectUri: nickname,
      });
      console.log(ebayAuthToken);
      const options = {
        prompt: "login",
        state: "state",
      };
      const authUrl = ebayAuthToken.generateUserAuthorizationUrl(
        "PRODUCTION",
        scopes,
        options
      );

      // Update the eBay credentials for the current user in the MongoDB database
      const findEBAY = await ebaycredModel.findOne({ userid: userId });
      let findResult;
      if (findEBAY) {
        findResult = await ebaycredModel
          .findOneAndUpdate(
            { userid: userId },
            { ebayclientid: ebayclientid, ebayclientsecret: ebayclientsecret },
            { upsert: true, new: true }
          )
          .exec();
      } else {
        findResult = new ebaycredModel({
          nickname: nickname,
          ebayid: ebayclientid,
          ebaysecret: ebayclientsecret,
          code: code,
          redirect_uri: redirect_uri,
          userid: userId,
          marketplacename: marketplaceName,
          flag: 1
        })
        await findResult.save();
      }


      // Get the current user's eBay listings from the MongoDB database
      const userAbelistings = await ListingsModel.find({
        userid: userId,
        marketplacename: marketplaceName,
      });

      // Send the response with the updated eBay credentials, eBay authorization URL, and eBay listings
      res.send({
        status: "success",
        message: findResult ? "Updated successfully" : "Connected successfully",
        result: findResult,
        listings: userAbelistings,
        Url: authUrl,
      });
    } catch (e) {
      console.error(e);
      res.status(401).send("Unauthorized");
    }
  } else {
    console.log("Provide token");
    res.status(401).send("Unauthorized");
  }
};

export const ebaycred = async (req, res) => {

  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(' ')[1],
      decoded;
    try {
      decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
    } catch (e) {
      return res.status(401).send('unauthorized');
    }
    var userIdd = decoded.userId;
    const { nickname, ebayclientid, ebayclientsecret } = req.body;
    const marketplacename = "Ebay"
    try {
      const ebayAuthToken = new EbayAuthToken({
        clientId: ebayclientid,
        clientSecret: ebayclientsecret,
        redirectUri: nickname,
      });
      const options = {
        prompt: 'login',
        state: 'state'
      }
      const scopes = [
        "https://api.ebay.com/oauth/api_scope",
        "https://api.ebay.com/oauth/api_scope/sell.marketing.readonly",
        "https://api.ebay.com/oauth/api_scope/sell.marketing",
        "https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
        "https://api.ebay.com/oauth/api_scope/sell.inventory",
        "https://api.ebay.com/oauth/api_scope/sell.account.readonly",
        "https://api.ebay.com/oauth/api_scope/sell.account",
        "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
        "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
        "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
        "https://api.ebay.com/oauth/api_scope/sell.finances",
        "https://api.ebay.com/oauth/api_scope/sell.payment.dispute",
        "https://api.ebay.com/oauth/api_scope/commerce.identity.readonly",
        "https://api.ebay.com/oauth/api_scope/commerce.notification.subscription",
        "https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly"
      ];
      // const scopes = ['https://api.ebay.com/oauth/api_scope/sell.inventory', 'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly', 'https://api.ebay.com/oauth/api_scope/sell.account', 'https://api.ebay.com/oauth/api_scope/sell.account.readonly', 'https://api.ebay.com/oauth/api_scope/sell.fulfillment', 'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly'
      // ];
      var authUrl = ebayAuthToken.generateUserAuthorizationUrl('PRODUCTION', scopes, options);
      console.log(authUrl);
      var find9 = await ebaycredModel.findOneAndUpdate({ userid: userIdd }, {
        ebayclientid: ebayclientid,
        ebayclientsecret: ebayclientsecret
      }, null, function (err, docs) {
        if (err) {
          console.log(err)
        }
        else {
          console.log("complete")

        }
      }).clone().catch(function (err) { console.log(err) })
      var userabelistings = await ListingsModel.find({ userid: userIdd, marketplacename: marketplacename })

      if (find9 == null) {
        const doc = new ebaycredModel({
          marketplacename: marketplacename,
          nickname: nickname,
          ebayclientid: ebayclientid,
          ebayclientsecret: ebayclientsecret,
          userid: userIdd,
          flag: 1

        })
        await doc.save();

        res.send({ "status": "succes", "message": "Connection succesfully", "result": doc, "listings": userabelistings, "Url": authUrl });
      }
      else {
        res.send({ "status": "succes", "message": "Updated succesfully", "result": find9, "listings": userabelistings });
      }
    } catch (error) {
      console.log("wrong credentials");
      res.send({ "status": "fail", "message": "wrong credentials" })
    }


  } else {
    console.log("provide token");
  }
}

export const ebaytokengenrate = async (req, res, next) => {
  const code = req.body.code;
  console.log("")
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
    let data = await ebaycredModel.find({ userid: userIdd });
    var useri = data[0].ebayclientid;
    var userp = data[0].ebayclientsecret;
    var usern = data[0].nickname;
    console.log(useri);
    console.log(userp);
    console.log(usern);
    const ebayAuthToken = new EbayAuthToken({
      clientId: useri,
      clientSecret: userp,
      redirectUri: usern
    });
    const accessToken = await ebayAuthToken.exchangeCodeForAccessToken('PRODUCTION', code);
    // console.log(accessToken);
    var replaydata = JSON.parse(accessToken);
    var refreshtoken = replaydata.refresh_token
    console.log(refreshtoken);
    var myquery = { userid: userIdd };
    var newvalues = { $set: { refresh_token: refreshtoken } };
    ebaycredModel.updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("refresh token updated");
    })
    res.send(accessToken)
  } else {
    console.log("provide token");
  }
}

export const wishcredential = async (req, res) => {
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
    console.log(userIdd);
    const { nickname, client_id, client_secret, code, warehouse_id } = req.body;
    const marketplacename = "Wish";
    var find8 = await wishCredModel
      .findOneAndUpdate(
        { userid: userIdd },
        {
          wishid: client_id,
          wishsecret: client_secret,
          wishwarehouseid: warehouse_id,
          wishcode: code
        },
        null,
        function (err, docs) {
          if (err) {
            console.log(err);
          } else {
            console.log("complete");
          }
        }
      )
      .clone()
      .catch(function (err) {
        console.log(err);
      });
    var userabelistings = await ListingsModel.find({
      userid: userIdd,
      marketplacename: marketplacename,
    });
    try {
      if (find8 === null) {
        const response = getToken(req, res, userIdd);
        if (response) {
          const doc = new wishCredModel({
            marketplacename: marketplacename,
            nickname: nickname,
            wishid: client_id,
            wishsecret: client_secret,
            wishwarehouseid: warehouse_id,
            wishcode: code,
            userid: userIdd,
            flag: 1,
          });
          await doc.save();
          res.send({
            status: "succes",
            message: "Connection succesfully",
            result: doc,
            listings: userabelistings,
          });
        }
      } else {
        res.send({
          status: "success",
          message: "Updated succesfully",
          result: find8,
          listings: userabelistings,
        });
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("Provide Token");
  }
};


export const searscredential = async (req, res) => {
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
    console.log(userIdd);
    const { nickname, client_id, access_token } = req.body;
    const marketplacename = "wish";
    const accountEndpoint =
      "https://seller.marketplace.sears.com/SellerPortal/api/accounts";

    // Define function to retrieve account information from the API
    async function getAccount() {
      try {
        // Make API request
        const response = await axios.get(accountEndpoint, {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${apiKey}:${apiSecret}`
            ).toString("base64")}`,
          },
        });

        // Extract account information from API response
        const account = response.data.account;

        // Do something with the account information, such as return it or process it further
        return account;
      } catch (error) {
        // Handle errors appropriately
        console.error(error);
        throw new Error(
          "Failed to retrieve account information from Sears Marketplace API"
        );
      }
    }
  }
};
export const Usps = async (req, res) => {
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
    console.log(userIdd);
    try {
      const apiKey = "YOUR_API_KEY"; // Replace with your USPS Web Tools API key
      const trackingNumber = req.params.trackingNumber; // Replace with your USPS tracking number

      const options = {
        method: "GET",
        url: `https://secure.shippingapis.com/ShippingAPI.dll?API=TrackV2&XML=<TrackRequest USERID="${apiKey}"><TrackID ID="${trackingNumber}"></TrackID></TrackRequest>`,
      };
      request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body); // Print the API response to the console
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("Provide Token");
  }
};
