const express = require("express");
const axios = require("axios");
const router = express.Router();

var accessTokenTopUp;

router.get("/", async (req, res) => {
    try{
        const getAccessTokenURL = "https://auth.reloadly.com/oauth/token";
        const getAccessToken = await axios.post(getAccessTokenURL, {
            client_id: "<ENTER YOUR RELOADLY CLIENT ID>",
            client_secret: "<ENTER YOUR RELOADLY CLIENT SECRET>",
            grant_type: "client_credentials",
            audience: "https://topups-sandbox.reloadly.com"
            },{
            headers: {
                "Content-Type": "application/json"
            }
        });
        const getCountryURL = "https://topups-sandbox.reloadly.com/countries";
        const getCountry = await axios.get(getCountryURL, {
            headers: {
                Accept: 'application/com.reloadly.topups-v1+json',
                Authorization: `Bearer ${accessTokenTopUp}`
            }
        });
        res.render("airtime",{
            countries : getCountry.data
        });
        accessTokenTopUp = getAccessToken.data.access_token;
        console.log(accessTokenTopUp);
        console.log("Success")
    }catch(err){
        const error = err.message;
        res.render("error", {
            error
        })
        console.error(error);
    }
});

router.post("/", async (req, res) => {
    try{
        userName = req.body.userName;
        userMobileNumber = req.body.userNumber;
        userAmount = req.body.userPrice;
        userCountryISO = req.body.userCountryISO;
        const autoDetectOperatorURL = `https://topups-sandbox.reloadly.com/operators/auto-detect/phone/${userMobileNumber}/countries/${userCountryISO}`;
        const autoDetectOperator = await axios.get(autoDetectOperatorURL,{
            headers: {
                Accept: 'application/com.reloadly.topups-v1+json',
                Authorization: `Bearer ${accessTokenTopUp}`
            }
        });
        userServiceProvider = autoDetectOperator.data.name;
        userOperatorID = autoDetectOperator.data.operatorId;
        res.redirect("/airtime/confirmation");
        console.log("success")
    }catch(err){
        const error = err.message;
        res.render("error", {
            error
        })
        console.error(error);
    }
    
});

router.get("/confirmation", (req, res) => {
    res.render("confirmation", {
        name : userName,
        number : userMobileNumber,
        amount : userAmount,
        serviceProvider : userServiceProvider,
        operatorID :  userOperatorID,
        countryISO : userCountryISO
    });
    console.log("success");
});

router.post("/confirmation", async (req, res) => {
    try{
        const topUpURL = "https://topups-sandbox.reloadly.com/topups";
        const customIdentifier = generateIdentifier()
        const topUp = await axios.post(topUpURL, {
            operatorId: userOperatorID,
            amount: userAmount,
            useLocalAmount: true,
            customIdentifier: customIdentifier,
            recipientPhone: {
                countryCode: userCountryISO,
                number: userMobileNumber
            },
        },{
            headers: {
                Accept: 'application/com.reloadly.topups-v1+json',
                Authorization: `Bearer ${accessTokenTopUp}`
            }
        });
        res.json(topUp.data)
        console.log("success")
    }catch(err){
        const error = err.message;
        res.render("error", {
            error
        })
        console.error(error);
    }
});


function generateIdentifier() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let identifier = '';
  
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      identifier += characters.charAt(randomIndex);
    }
    return identifier;
}

module.exports = router;
