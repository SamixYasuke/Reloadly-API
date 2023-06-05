const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async(req, res)=>{
    try{
        const getUtilityURL = "https://auth.reloadly.com/oauth/token";
        const getUtility = await axios.post(getUtilityURL, {
            client_id: "<ENTER YOUR RELOADLY CLIENT ID>",
            client_secret: "<ENTER YOUR RELOADLY CLIENT SECRET>",
                grant_type: "client_credentials",
                audience: "https://utilities-sandbox.reloadly.com"
        },{
            headers : {
                "Content-Type": 'application/json', 
            }
        });
        accessTokenUtilityBill = getUtility.data.access_token;
        console.log(accessTokenUtilityBill);
        const getUtilityBillersURL = "https://utilities-sandbox.reloadly.com/billers";
        const getUtilityBillers = await axios.get(getUtilityBillersURL, {
            headers: {
                Accept: 'application/com.reloadly.utilities-v1+json',
                Authorization: `Bearer ${accessTokenUtilityBill}`
              }
        });
        const utilityBillers = getUtilityBillers.data.content;
        res.render("utilityBills", {
            utilityBillers
        });
        console.log("success!");
    }catch(err){
        const error = err.message;
        res.render("error", {
            error
        })
        console.error(error);
    }
});

router.post("/", async(req, res)=>{
    utilityBillAmountToBePaid = req.body.utilityBillAmount;
    utilityBillerID = req.body.utilityBillerID;
    utilityBillSuscriberNumber = req.body.utilityBillSuscriberNumber;
    const generateReferenceID = generateIdentifier();
    // console.log(utilityBillAmountToBePaid)
    // console.log(utilityBillSuscriberNumber)
    // console.log(utilityBillerID)
    // console.log(generateReferenceID)
    try{
        const utilityBillPaymentURL = "https://utilities-sandbox.reloadly.com/pay";
        const utilityBillPayment = await axios.post(utilityBillPaymentURL, {
                subscriberAccountNumber: utilityBillSuscriberNumber,
                amount: utilityBillAmountToBePaid,
                billerId: utilityBillerID,
                useLocalAmount: null,
                referenceId: generateReferenceID
        },{
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/com.reloadly.utilities-v1+json',
                Authorization: `Bearer ${accessTokenUtilityBill}`
              }
        });
        paymentID = utilityBillPayment.data.id;
        res.redirect("/utilityBill/successful")
    }catch(err){
        console.log(err.message)
        res.json(err.details)
    }

});

router.get("/Successful", async (req, res) => {
    const billTransactionURL = `https://utilities-sandbox.reloadly.com/transactions/${paymentID}`;
  
    const checkPaymentStatus = async () => {
      try {
        const billTransaction = await axios.get(billTransactionURL, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/com.reloadly.utilities-v1+json',
            Authorization: `Bearer ${accessTokenUtilityBill}`,
          },
        });
  
        const paymentCode = billTransaction.data.code;
        const SuscriberPaymentNumber = billTransaction.data.transaction.billDetails.subscriberDetails.accountNumber;
        const paymentMessage = billTransaction.data.message;
        const paymentTransactionID = billTransaction.data.transaction.id;
        const paymentTransactionAmount = billTransaction.data.transaction.amount;
        const paymentTransactionFee = billTransaction.data.transaction.fee;
        const paymentBillerName = billTransaction.data.transaction.billDetails.billerName;
        const paymentBillerType = billTransaction.data.transaction.billDetails.type;
        const paymentBillerServiceType = billTransaction.data.transaction.billDetails.serviceType;
        const paymentTransactionTime = billTransaction.data.transaction.billDetails.completedAt;
        const pinDetails = billTransaction.data.transaction.billDetails.pinDetails;
  
        // Conditionally include the pinToken only when it exists in the response
        const pinToken = pinDetails ? pinDetails.token : undefined;
  
        if (paymentCode === "PAYMENT_PROCESSED_SUCCESSFULLY") {
            res.json({
                paymentCode,
                SuscriberPaymentNumber,
                paymentMessage,
                paymentTransactionID,
                paymentTransactionAmount,
                paymentTransactionFee,
                paymentBillerName,
                paymentBillerType,
                paymentBillerServiceType,
                paymentTransactionTime,
                pinToken,
            });
            console.log("Payment Successfull!!!");
        } else if (paymentCode === "PAYMENT_PROCESSING_IN_PROGRESS") {
          // If payment is still processing, wait for a specific time (e.g., 1 minute) and check again
          setTimeout(checkPaymentStatus, 6000); // Wait for 1 minute
          console.log("Payment in Progress!!");
        } else {
          // Handle other payment status codes if needed
          res.json({ message: "Payment status not recognized" });
          console.log("Somethin fishy is going on");
        }
      } catch (err) {
        console.log(err.message);
        res.json(err.details);
      }
    };
  
    // Start checking payment status
    checkPaymentStatus();
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
