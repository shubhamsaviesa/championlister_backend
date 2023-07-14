import express from "express";
import multer from "multer";
import {
  userRegistration,
  changePassword,
  userLogin,
  getOtp,
  verifyOtp,
  resetPassword,
  amazoncredential,
  walmartCredential,
  ebaycredential,
  wishcredential,
  userData,
  searscredential,
  Usps,
  ebaytokengenrate,
  ebaycred,
} from "../controllers/userControllers.js";
import { accountSetting } from "../controllers/settingControllers/accountSetting.js";
import {
  channelsetting,
  deleteChannelconnection,
  editchannel,
  channelconnectdisconnect,
  channelactive,
} from "../controllers/settingControllers/channelSetting.js";
import {
  addinventory,
  editProductCatalog,
  getProductCatalogId,
  productcatalog,
  productcatalogdatefilters,
  deleteOneproductcatalog,
  deleteActionproductcatalog,
  exportCatalog
} from "../controllers/actioncontroller/addinventoryController.js";
import  {templateupload}  from "../helper/tempUpload.js";
// import { addorder } from "../controllers/order/orderController.js";
import { addorder, cancelOrder } from "../controllers/order/orderController.js";
import {
  addTemplate,
  bulkuploadlisting,
  deleteMappingTemplate,
  deleteMultiMappingTemplate,
  getBulkImportId,
  editBulkImportId
} from "../controllers/actioncontroller/bulkimportTemplate.js";
import mapTemplate from "../controllers/actioncontroller/mapTemplate.js";
import {
  orderlist,
  deleteorder,
} from "../controllers/order/orderListingController.js";
import { NotificationData, notificationCountroutes } from "../controllers/notification/notificationController.js";
import {
  emailSetingpost,
  emailsettingget,
} from "../controllers/emailController/email.js";
import { billingSettingpost } from "../controllers/settingControllers/billingSetting.js";
import { stripeController } from "../controllers/settingControllers/stripeController.js";
import Channellisting from "../controllers/channelCredentialControllers/ChanneListing.js";
import { addinventorylistings,datefilters,getcatalogdatefilters } from "../controllers/listingController.js";
import { ProfilePic } from "../controllers/ProfilePic.js";
import { updateProfilepic } from "../controllers/ProfilePic.js";
import { UploadFile } from "../controllers/UploadFile.js";
import { body } from "express-validator";
import { testWalmart } from "../controllers/testWalmart.js";
import { walmartCredModel } from "../models/channelCredentialModel/walmartModel.js";
import { createProductOnWish, getToken } from "../controllers/channelCredentialControllers/wishcontroller.js";
import { getTokenAmz } from "../controllers/channelCredentialControllers/amazoncontroller.js";
import { creatShipping, deleteShipping, getShipping, updateShipping } from "../controllers/shippingcontroller/index.js";


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },

  filename: async (req, file, cb) => {
    var today = new Date();
    var date =
      ("" + today.getFullYear()).substring(2) +
      +(today.getMonth() + 1) +
      +today.getDate() +
      "_" +
      today.getHours() +
      "_" +
      today.getMinutes() +
      "_" +
      today.getSeconds();
    const filename = date + file.originalname;
    cb(null, filename);
  },
});

export const upload = multer({ storage: storage });
const router = express.Router();

// public routes
router.post("/userRegistration", userRegistration);
router.post("/userLogin", userLogin);
router.post("/getOtp", getOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/resetPassword", resetPassword);
router.post("/changePassword", changePassword);
router.post("/profilepic", ProfilePic.single("profile_pic"), updateProfilepic);
router.post("/userData", userData);
router.post("/postData", userData);

router.get("/wishToken", getToken)
// router.post("/postToken", postToken)
router.post("/amazonToken", getTokenAmz)
router.post("/createWishProduct", createProductOnWish )


//channel credantial routes
router.get("/channelActive", channelactive);
router.post("/amazoncredential", amazoncredential);
router.post("/walmartcredential", walmartCredential);
router.post("/ebaycredential", ebaycred);
router.post("/EbayTokenGenrate", ebaytokengenrate);
router.post("/wishcredential", wishcredential);
router.post("/searscredential", searscredential);
router.get("/track/:trackingNumber", Usps);


// ----------------------------- not done ----------------------------
router.get("/walmartlistinh", Channellisting.walmartlisting);
router.get("/ebaylisting", Channellisting.ebaylisting);
router.get("/amazonlisting", Channellisting.amazonlisting);

// report section - total sales

// Listing
router.get("/listing", addinventorylistings);

//action routes
router.post(
  "/addinventory",
  upload.fields([
    { name: "imageupload1", maxCount: 1 },
    { name: "imageupload2", maxCount: 1 },
    { name: "imageupload3", maxCount: 1 },
  ]),
  addinventory
);
router.post('/datefilter', datefilters);  //new
router.post('/getcatalogdatefilter', getcatalogdatefilters);  //new
router.post('/getcatalogdatefilter', getcatalogdatefilters);  //new
router.post('/exportCatalog', exportCatalog);  //new
// router.post('/export-Catalog', exportCatalog); 

router.post("/editproductcatalog", editProductCatalog); //done
router.get("/productcatalog", productcatalog); //done
router.get("/getProductCatalogId/:id", getProductCatalogId); //done
router.post("/productcatalogdatefilters", productcatalogdatefilters);
router.post("/deleteOneproductcatalog", deleteOneproductcatalog); //done
router.post("/deleteActionproductcatalog", deleteActionproductcatalog); // done

//bulkImport
router.post("/addTemplate", templateupload.single("file"), addTemplate); //done
router.get("/getbulkimportId/:id", getBulkImportId); //done
router.post("/editbulkimportId", editBulkImportId); //done
router.get("/bulkuploadlisting", bulkuploadlisting); //done
router.post("/deleteMappingTemplate", deleteMappingTemplate); //done
router.post("/deletemultitemplate", deleteMultiMappingTemplate); //done
router.post("/mapTemplate/:id", mapTemplate); //done

router.post('/uploadFile',templateupload.single('file'),UploadFile);



// setting routes
router.post("/accountSetting", accountSetting);
router.get("/channelSetting", channelsetting); //done
router.post("/deleteChannelconnection", deleteChannelconnection); //done
router.post("/editchannel", editchannel); //done
router.post("/channelconnectdisconnect", channelconnectdisconnect); //done

// order route
router.post("/addorder", addorder); //done
router.get("/orderlisting", orderlist);
router.post("/deleteorder", deleteorder); //done

//orderstatus
// router.post('/inprocessorder', inProcessOrder)
router.post('/cancelorder', cancelOrder);

// notification
router.get("/notificationData", NotificationData);
router.get("notificationCountroutes",notificationCountroutes)
// email settings
router.get("/emailsettingget", emailsettingget);
router.post("/emailsettingpost", emailSetingpost);

router.post("/billingSettings", billingSettingpost);

// subcriptions
router.post("/stripePayment", stripeController);

//Shipping
router.post("/createShipping", creatShipping);
router.get("/shipping", getShipping);
router.put("/updateShipping/:id", updateShipping);
router.delete("/shipping/:id", deleteShipping);

// router.post('/purgeproductcatalog', purgeroutes.productcatalog);  new

export default router;
