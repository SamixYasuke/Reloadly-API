const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

// AirTime TopUp
var accessTokenTopUp;
var userName;
var userCountryISO;
var userMobileNumber;
var userAmount;
var userServiceProvider;
var userOperatorID;

// Gift Card
var accessTokenGiftCard;

// Gift Card Purchase
var productID;
var senderName;
var unitPrice;
var quantity;

// Utility Bill
var accessTokenUtilityBill;

// Utility Bill Payment
var utilityBillAmountToBePaid;
var utilityBillerID;
var utilityBillSuscriberNumber;
var paymentID;


app.get("/", async(req, res)=>{
    res.render("index"); 
});

const airtimeRoutes = require("./routes/airtimeRoutes");
app.use("/airtime", airtimeRoutes);

const giftCardRoutes = require("./routes/giftCardRoutes");
app.use("/giftCards", giftCardRoutes);

const utilityBillsRoutes = require("./routes/utilityBillRoutes");
app.use("/utilityBill", utilityBillsRoutes);

app.listen("3000", ()=>{
    console.log("App is active on port 3000");
});
