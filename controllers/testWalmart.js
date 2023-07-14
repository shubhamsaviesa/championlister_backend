import fs from 'fs'
import request from "request";
import { promisify } from "util";
import { walmartCredModel } from '../models/channelCredentialModel/walmartModel.js';

export const testWalmart = async (req, res, id3, credid3) => {
    console.log("nekjj")
  try {
    const cred = await walmartCredModel.findById(credid3);
    const { clientId, clientSecret, name } = cred;

    const options = {
      url: "https://marketplace.walmartapis.com/v3/token",
      auth: {
        user: clientId,
        pass: clientSecret,
      },
      headers: {
        Accept: "application/json",
        "WM_SVC.NAME": name,
      },
      form: {
        grant_type: "client_credentials",
      },
    };

    const { access_token } = await promisify(request.post)(options);

    const feedOptions = {
      url: "https://marketplace.walmartapis.com/v3/feeds?feedType=MP_ITEM",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "WM_QOS.CORRELATION_ID": clientId,
        "WM_SVC.NAME": name,
      },
      formData: {
        file: fs.createReadStream("./json/data.json"),
      },
    };

    const response = await promisify(request.post)(feedOptions);

    if (response.statusCode === 202) {
      res.status(200).send({
        message: "Feed uploaded successfully.",
        feedId: response.headers["wm.consumer.id"],
      });
    } else {
      res.status(response.statusCode).send({
        message: "Error uploading feed.",
        error: response.body,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal server error.",
      error: error.message,
    });
  }
}
