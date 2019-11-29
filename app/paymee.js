import document from "document";
import { inbox } from "file-transfer";
import * as messaging from 'messaging';
import * as jpeg from "jpeg";
import * as fs from "fs";

export var paymentCheck, paymentId;
export var payment_settings = {};

messaging.peerSocket.addEventListener("open", () => {
  try { 
    payment_settings  = fs.readFileSync("payment_settings.txt", "json"); 
  } 
  catch(e) {
    payment_settings.paymentid = "0";
    fs.writeFileSync("payment_settings.txt", payment_settings, "json");
  }
  if (!payment_settings.payment || !payment_settings.payment.status) showPaymentOverlay();
  messaging.peerSocket.send(payment_settings);
});

inbox.onnewfile = () => {
  let qrCode;
  do {
    qrCode = inbox.nextFile();
    if (qrCode) {
      if (payment_settings.bg && payment_settings.bg !== "") {
        try { fs.unlinkSync(payment_settings.bg); }
        catch(e){}
      }
      let newPath = qrCode + ".txi";
      jpeg.decodeSync(qrCode, newPath, true);
      fs.unlinkSync(qrCode);
      payment_settings.bg = `/private/data/${newPath}`;
      setQrImage(payment_settings.bg);

      if (!payment_settings.payment || !payment_settings.payment.status) showPaymentOverlay();
      
      payment_settings.lastDownload = new Date().valueOf();
      fs.writeFileSync("payment_settings.txt", payment_settings, "json");
    }
  } while (qrCode);
};

export function startPayment() {  
  paymentCheck = '';
  
  try { payment_settings  = fs.readFileSync("payment_settings.txt", "json"); } 
  catch(e) {
    showPaymentOverlay();
    payment_settings.paymentid = "123456789";
    fs.writeFileSync("payment_settings.txt", payment_settings, "json");
  }
  
  if (payment_settings.payment) {
    
    if (payment_settings.payment.status == 1) hidePaymentOverlay();
    else showPaymentOverlay();
    
    paymentCheck = setInterval(function(){
      payment_settings  = fs.readFileSync("payment_settings.txt", "json");
      if (payment_settings.payment) {
        if (payment_settings.payment.status == 1) {
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
  
    if (payment_settings.bg) setQrImage(payment_settings.bg);
    if (payment_settings.qrid) bottomTxtElem.text = "paymee.io/pay/"+payment_settings.qrid;
    if (payment_settings.price) txtElem.text = "This is a paid product.\nPrice: $"+payment_settings.price;
  
    if(evt.data) {
      if (evt.data.payment.id) {
          var bottomTxtElem = document.getElementById("paymee-bottom-textarea");
          bottomTxtElem.text = "paymee.io/pay/"+evt.data.payment.id;
      }
      
      if (evt.data.image) setQrImage(evt.data.image);
      if (!evt.data.payment) return;
      
      payment_settings = {
        "payment" : evt.data.payment,
        "paymentid" : evt.data.payment.paymentid,
        "qrid" : evt.data.payment.id,
        "price" : evt.data.payment.price
      };
      
      fs.writeFileSync("payment_settings.txt", payment_settings, "json");
      
      if (payment_settings.payment.status == 1) {
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
  
    if (payment_settings.bg) setQrImage(payment_settings.bg);
    if (payment_settings.qrid) bottomTxtElem.text = "paymee.io/pay/"+payment_settings.qrid;
    if (payment_settings.price) txtElem.text = "This is a paid product.\nPrice: $"+payment_settings.price;
  
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
