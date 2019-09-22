import document from "document";
import { inbox } from "file-transfer";
import * as messaging from 'messaging';
import * as jpeg from "jpeg";
import * as fs from "fs";

export var paymentCheck, paymentId;
export var json_object = {};

messaging.peerSocket.addEventListener("open", () => {
  try { 
    json_object  = fs.readFileSync("json.txt", "json"); 
    //console.log("Stored settings PAYMENT STATUS: "+JSON.stringify(json_object));
  } 
  catch(e) {
    json_object.paymentid = "0";
    fs.writeFileSync("json.txt", json_object, "json");
  }
  if (!json_object.payment || !json_object.payment.status) showPaymentOverlay();
  messaging.peerSocket.send(json_object);
});

inbox.onnewfile = () => {
  //console.log("Received QR Code file");
  let qrCode;
  do {
    qrCode = inbox.nextFile();
    if (qrCode) {
      if (json_object.bg && json_object.bg !== "") {
        try { fs.unlinkSync(json_object.bg); }
        catch(e){}
      }
      let newPath = qrCode + ".txi";
      jpeg.decodeSync(qrCode, newPath, true);
      fs.unlinkSync(qrCode);
      json_object.bg = `/private/data/${newPath}`;
      setQrImage(json_object.bg);

      if (!json_object.payment || !json_object.payment.status) showPaymentOverlay();
      
      json_object.lastDownload = new Date().valueOf();
      fs.writeFileSync("json.txt", json_object, "json");
    }
  } while (qrCode);
};

export function startPayment() {  
  paymentCheck = '';
  
  try { json_object  = fs.readFileSync("json.txt", "json"); } 
  catch(e) {
    showPaymentOverlay();
    //console.log('No settings found. Sending request to companion...');
    json_object.paymentid = "123456789";
    fs.writeFileSync("json.txt", json_object, "json");
  }
  
  
  //PAYMENT SETTINGS ARE SAVED, CHECK IF PAID OR TRY READING STATUS INTERVAL 3000ms
  if (json_object.payment) {
    
    if (json_object.payment.status == 1) hidePaymentOverlay();
    else showPaymentOverlay();
    
    paymentCheck = setInterval(function(){
      json_object  = fs.readFileSync("json.txt", "json");
      if (json_object.payment) {
        
        //PAYMENT HAS BEEN MADE
        if (json_object.payment.status == 1) {
          hidePaymentOverlay();
          clearInterval(paymentCheck);
        }
      }
    },3000);
    
    
  }
}

messaging.peerSocket.onmessage = function(evt) {
    var txtElem = document.getElementById("paymee-textarea");
    var bottomTxtElem = document.getElementById("paymee-bottom-textarea");
  
    if (json_object.bg) setQrImage(json_object.bg);
    if (json_object.qrid) bottomTxtElem.text = "paymee.io/pay/"+json_object.qrid;
    if (json_object.price) txtElem.text = "This is a paid product.\nPrice: $"+json_object.price;
    //console.log("Watch received message: "+ evt.data.payment.id);
    if(evt.data) {
      if (evt.data.payment.id) {
          var bottomTxtElem = document.getElementById("paymee-bottom-textarea");
          bottomTxtElem.text = "paymee.io/pay/"+evt.data.payment.id;
        
      }
      if (evt.data.image) {
        console.log("WATCH RECEIVED IMAGE: "+evt.data.image);
        setQrImage(evt.data.image);
      }
      if (!evt.data.payment) return;
      
      json_object = {
        "payment" : evt.data.payment,
        "paymentid" : evt.data.payment.paymentid,
        "qrid" : evt.data.payment.id,
        "price" : evt.data.payment.price
      };
      
      fs.writeFileSync("json.txt", json_object, "json");
      
      if (json_object.payment.status == 1) {
        console.log("Status is Paid, hiding overlay");
        hidePaymentOverlay();
        return;
      }
      showPaymentOverlay();
    }
  }


export function showPaymentOverlay() {
    var loaderElem = document.getElementById("paymee-loader");
    var qrElem = document.getElementById("paymee-qr");
    var bgElem = document.getElementById("paymee-bg");
    var txtElem = document.getElementById("paymee-textarea");
    var bottomTxtElem = document.getElementById("paymee-bottom-textarea");
  
    if (json_object.bg) setQrImage(json_object.bg);
    if (json_object.qrid) bottomTxtElem.text = "paymee.io/pay/"+json_object.qrid;
    if (json_object.price) txtElem.text = "This is a paid product.\nPrice: $"+json_object.price;
  
    loaderElem.style.opacity = 1;
    bgElem.style.opacity = 0.85;
    qrElem.style.opacity = 1;
    txtElem.style.opacity = 1;
    bottomTxtElem.style.opacity = 1;
  
}

export function hidePaymentOverlay() {
    var loaderElem = document.getElementById("paymee-loader");
    var qrElem = document.getElementById("paymee-qr");
    var bgElem = document.getElementById("paymee-bg");
    var txtElem = document.getElementById("paymee-textarea");
    var bottomTxtElem = document.getElementById("paymee-bottom-textarea");
  
    loaderElem.style.opacity = 0;
    qrElem.style.opacity = 0;
    bgElem.style.opacity = 0;
    txtElem.style.opacity = 0;
    bottomTxtElem.style.opacity = 0;
}

export function setQrImage(image) {
    var imgElem = document.getElementById("paymee-qr");
    imgElem.image = image;
}
