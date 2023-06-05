const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async(req, res)=>{
    try{
        const getGiftCardURL = "https://auth.reloadly.com/oauth/token";
        const getGiftCard = await axios.post(getGiftCardURL, {
            client_id: "<ENTER YOUR RELOADLY CLIENT ID>",
            client_secret: "<ENTER YOUR RELOADLY CLIENT SECRET>",
            grant_type : "client_credentials",
            audience: "https://giftcards-sandbox.reloadly.com"
        },
        {
            headers: {
                "Content-Type" : 'application/json',
                "Accept" : 'application/json'
            }
        });
        accessTokenGiftCard = getGiftCard.data.access_token;
        console.log(accessTokenGiftCard)
        const products = "https://giftcards-sandbox.reloadly.com/products";
        const getProducts = await axios.get(products, {
            headers: {
                Accept: 'application/com.reloadly.giftcards-v1+json',
                Authorization: `Bearer ${accessTokenGiftCard}`
            }
        });
        const gotProducts = getProducts.data.content;
        res.render("giftCards",{
            products : gotProducts
        });
        console.log("success");
        // res.json(gotProducts)
    }catch(err){
        const error = err.message;
        res.render("error", {
            error
        })
        console.error(error);
    }
});


    
router.get("/:productID", async(req, res)=>{
    try{
        productID = req.params.productID;
        const getProductInfoURL = `https://giftcards-sandbox.reloadly.com/products/${productID}`;
        const getProductInfo = await axios.get(getProductInfoURL, {
            headers: {
                Accept: 'application/com.reloadly.giftcards-v1+json',
                Authorization: `Bearer ${accessTokenGiftCard}`
            }
        });
        var individualProduct = getProductInfo.data
        // res.json(individualProduct)
        res.render("giftCardConfirmation", {
            product: individualProduct
        });
    }catch(err){
        const error = err.message;
        res.render("error", {
            error
        })
        console.error(error);
    }
});

router.post("/:productID", async(req, res)=>{
    senderName = req.body.senderName;
    unitPrice = req.body.unitPrice;
    quantity = req.body.quantity;
    try{
        const orderCardURL = "https://giftcards-sandbox.reloadly.com/orders";
        const orderCard = await axios.post(orderCardURL,{
            productId : productID,
            senderName : senderName,
            unitPrice : unitPrice,
            quantity : quantity
        },{
            headers: {
                Accept: 'application/com.reloadly.giftcards-v1+json',
                Authorization: `Bearer ${accessTokenGiftCard}`
            }
        })
        const transactionId = orderCard.data.transactionId;
        const transactionStatus = orderCard.data.status;
        const transactionTime = orderCard.data.transactionCreatedTime;
        const quantityPurchased = orderCard.data.product.quantity
        const transactionPrice = orderCard.data.product.totalPrice;
        const getCardURL = `https://giftcards-sandbox.reloadly.com/orders/transactions/${transactionId}/cards`;
        const getCard = await axios.get(getCardURL, {
            headers: {
                Accept: 'application/com.reloadly.giftcards-v1+json',
                Authorization: `Bearer ${accessTokenGiftCard}`
            }
        });
        const giftCardNumber = getCard.data[0].cardNumber;
        const giftCardPin = getCard.data[0].pinCode;
        res.json({
            transactionId,
            transactionStatus,
            transactionTime,
            quantityPurchased,
            transactionPrice,
            giftCardNumber,
            giftCardPin
        });
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
