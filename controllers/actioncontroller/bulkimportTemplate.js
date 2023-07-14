import xlsx from "xlsx";
import { AddtemplateModel } from "../../models/actionModel/addtemplate.js";
import jwt from "jsonwebtoken";
import Jwt from "jsonwebtoken";
import {userModel} from '../../models/userModel.js'

import mongodb from "mongodb";
import path from "path";

export const addTemplate = async (req, res, next) => {
  console.log("add template", req.body)
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
      var { tempName, abbrevation, category, subcategory } = req.body;
      console.log("reqbody second", req.body)
      const tempname = await AddtemplateModel.findOne({ tempName: tempName, userid: userIdd })
      if (tempname) {
          res.send({ "message": "give different name to your template" })
      }
      else {
          console.log(abbrevation);
          const templatefile = req.file.filename
          console.log("filename", templatefile)
          var extension = templatefile.split(".").pop();
          console.log("extension", extension)
          if (['xls', 'xlsx'].indexOf(extension) < 0) {
              res.send({ "status": "fail", "message": "Invalid filename extension! Give only XLSX or XLS" });
          }
          else {
              const random = Math.floor(Math.random() * (999 - 100 + 1) + 100);
              const sku = `${abbrevation}-${random}`;
              if (tempName && abbrevation) {
                  try {
                       // Reading our test file
                      const workbook = xlsx.readFile(path.resolve('template',templatefile), { sheetRows: 1 })
                      console.log("workbook", workbook)
                      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                      var columnA = [];
                      for (let z in worksheet) {
                          if (worksheet[z].v !== null && worksheet[z].v !== undefined) {
                              columnA.push(worksheet[z].v)
                          }
                      }
                      console.log(columnA);
                      var yourtemp = new AddtemplateModel({
                          tags: columnA,
                          userid: userIdd,
                          tempName: tempName,
                          abbrevation: abbrevation,
                          category: category,
                          subcategory: subcategory,
                          templatefile: templatefile,
                          sku: sku,
                          status: "Not Mapped"
                      })
                      await yourtemp.save();
                      console.log(yourtemp);
                      // res.send({ "status": "succes", "message": "Connection succesfully", "result": doc,"your template": columnA });
                  } catch (error) {
                      console.log("error", error);
                  }

                  try {

                      const MongoClient = mongodb.MongoClient
                      const url = process.env.DATABASE_URL
                      MongoClient.connect(url, (err, db) => {

                          if (err) throw err;
                          else {
                              console.log("connected");
                              const dbo = db.db('ChempionLister');
                              var user = dbo.collection('ChempionLister_template');
                                const template = user.findOne({}, function (err, result) {
                                  if (err) throw err;
                                  console.log(result);
                                  res.send({ "status": "success", "message": "Connection succesfully", "yourtemplate": yourtemp, "chaimpionlistertemplate": result });
                                  db.close();
                              });
                          }

                      })

                  } catch (error) {
                      console.log("error", error);
                  }

              }
              else {
                  res.send({ "status": "fail", "message": "All feilds are required" });
              }
          }
      }
  } else {
      console.log("provide token");
  }
}

export const getBulkImportId = async (req, res) => {
  const _id = req.params.id;
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).send("Authentication required");
  }
  const [authType, token] = authorizationHeader.split(" ");
  if (authType !== "Bearer" || !token) {
    return res.status(401).send("Invalid authorization header");
  }
  try {
    const decoded = Jwt.verify(token, process.env.JWT_SECRET_KEY);
    // const userId = decoded.userId;
    const data = await AddtemplateModel.findOne({ _id: _id });
    res.send(data);
  } catch (err) {
    console.error(err);
    return res.status(401).send("Invalid or expired token");
  }
};

export const editBulkImportId = async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).send("Authentication required");
  }
  const [authType, token] = authorizationHeader.split(" ");
  if (authType !== "Bearer" || !token) {
    return res.status(401).send("Invalid authorization header");
  }
  const _id = req.body.id;
  const { tempName, abbrevation, category, subcategory } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const updatedData = await AddtemplateModel.findOneAndUpdate(
      { _id: _id }, // filter for the document to update
      { 
        tempName: tempName, 
        abbrevation: abbrevation, 
        category: category, 
        subcategory: subcategory
      }, // the new data to replace the old data
      { new: true } // return the updated document
    );
    res.send(updatedData);
  } catch (err) {
    console.error(err);
    return res.status(401).send("Invalid or expired token");
  }
};


export const bulkuploadlisting = async (req, res, next) => {
  console.log(11111111111)
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(" ")[1],
      decoded;
    try {
      // console.log(authorization);
      decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
    } catch (e) {
      return res.status(401).send("unauthorized");
    }
    var userIdd = decoded.userId;
    // console.log(userIdd);

    var templatedetails = await AddtemplateModel.find({ userid: userIdd });
    var riversarray = [];
    var tempname = [];
    var dataarray = templatedetails;
    var start = dataarray.length - 1;
    // console.log(start);
    for (var i = start; i >= 0; i--) {
      // console.log(dataarray[i]);
      riversarray.push(dataarray[i]);
      tempname.push(dataarray[i].tempName);
    }
    res.send({ templatedetails: riversarray, tempName: tempname });
  } else {
    console.log("provid token");
  }
};


export const deleteMappingTemplate = async (req, res) => {
  console.log("its is from mapping data", req.body.id);
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
    const _id = req.body.id;
    AddtemplateModel.deleteOne(
      { userid: userIdd, _id: _id },
      function (err, obj) {
        if (err) {
          console.log("err", err);
          res.send({ error: err });
        } else {
          console.log("obj", obj);
          res.send({ status: "delete success", message: obj, _id: _id });
        }
      }
    );
  } else {
    console.log("provide token");
  }
};


export const deleteMultiMappingTemplate = async (req, res, next) => {
  console.log("req body in multi delete template", req.body);
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
    const id = req.body.id;
    AddtemplateModel.deleteMany(
      { userid: userIdd, _id: id },
      function (err, obj) {
        if (err) {
          res.send({ error: err });
        } else {
          res.send({ status: "delete success", message: obj, id: id });
        }
      }
    );
  } else {
    console.log("provide token");
  }
};
