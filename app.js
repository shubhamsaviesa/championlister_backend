import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import connectDB from "./dbConfig/connectDB.js";
import router from "./routes/routes.js";
import '@shopify/shopify-api/adapters/node';

const port = process.env.PORT;
dotenv.config();
const app = express();
var server = http.createServer(app);

// parse application/json

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/uploads", express.static("uploads"));

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,X-Requested-With,Accept,Authorization,Origin"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

//cors policy
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "X-Requested-With,content-type, Accept,Authorization,Origin",
  })
);
// db connection
const DATABASE_URL = process.env.DATABASE_URL;
connectDB(DATABASE_URL);
app.use(bodyParser.json());
app.use("/api/user", router);

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      description: "championLister",
      version: "1.0.0",
      title: "championLister",
      termsOfService: "http://swagger.io/terms/",
      email: "rakesh.keer@saviesainfotech.com",
      servers: ["http://api.championlister.com/", "http://localhost:5000/"],
    },
    components: {
      securitySchemes: {
        Bearer: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  
  apis: ["swaggar.js"],
  basePath: "/api/user",
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(port, () => console.log(`Server Running On Port ${port}...`));
