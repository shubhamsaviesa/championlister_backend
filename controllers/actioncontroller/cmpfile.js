const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const fs = require('fs');
var ftpClient = require('ftp-client');
const connectDB = require('./config/connectDB.js');
const routes = require('./routes/routes.js');
const app = express();
var swaggerJsDoc = require("swagger-jsdoc");
var swaggerUi = require("swagger-ui-express");
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const bodyParser = require('body-parser');
var logger = require("./logger.js")
var rdp = require('node-rdp');
const { Storage } = require('@google-cloud/storage');


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', "Content-Type,multipart/form-data");
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
//cors policy
app.use(cors());
//connect database
connectDB(DATABASE_URL);

//json
app.use(express.json());
app.use(bodyParser.json());
app.use('/walmartConnect',express.static(path.join(__dirname,'walmartConnect')))
app.use("/api/user", routes);
// app.use(express.static(path.join('/home/g457b5jxaq4m/public_html/shiva/upload/, 'uploads')))
app.use('/addTemplate',express.static(path.join('C:/Users/ecommerce2022/Desktop/','template')))


//swagger
const swaggerOptions = {

    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            description: "bookCommerce",
            version: "1.0.0",
            title: "bookCommerce",
            termsOfService: "http://swagger.io/terms/",
            email: "jigar.prajapati@iviewlabs.net",
            servers: ["https://bookcommerce-app.herokuapp.com/", "http://localhost:8000/"]
            // servers: ["http://localhost:8000/"]
        },

    components:{
        securitySchemes:{
            Bearer: {
                type: 'http',
                name: 'auth-token',
                scheme: 'bearer',
                in: 'header',
            }

        }
    },
    
    
    
},
    
    // ['.routes/*.js']
    apis: ["swagger.js"],
    basePath: "/api/user",

};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// rdp({
//     address: '34.132.139.112',
//     username: 'ecommerce2022',
//     password: 'BC.2022/CL;217'
// }).then(function () {
//     console.log('At this, point, the connection has terminated.');
// });
app.listen(port, () => {
    logger.info("server listening at http://localhost:".concat(port));
});