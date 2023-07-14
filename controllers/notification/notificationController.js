import { NotificationModel } from "../../models/NotificationModel/NotificationModel.js";
import { tokenverify } from "../../helper/tokenverify.js";
import jwt from 'jsonwebtoken';

export const NotificationData = async (req, res) => {
   const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).send('Authentication required');
  }

  const [authType, token] = authorizationHeader.split(' ');

  if (authType !== 'Bearer' || !token) {
    return res.status(401).send('Invalid authorization header');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const userId = decoded.userId;

    const notificationData = await NotificationModel.find({ userid: userId });

    res.send({ Notification: notificationData });
  } catch (err) {
    console.error(err);
    return res.status(401).send('Invalid or expired token');
  }
};


export const notificationCountroutes = async (req, res) => {
  const notifydata = await NotificationModel.find({
    userid: await tokenverify.tokenverify(req, res),
  });
  let notificationCount = 0;
  for (let i = 0; i < notifydata.length; i++) {
    notificationCount++;
  }
  res.send({ notificationCount: notificationCount });
};