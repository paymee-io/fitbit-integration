import { me } from "companion"
import * as messaging from 'messaging';
import { settingsStorage } from "settings";
import { outbox } from "file-transfer";
import { Image } from "image";
import * as fs from "fs";

const PRODUCT_ID = "REPLACE_YOUR_PAYMEE_PRODUCT_UID";
let storedPaymentId = '';
let paid = 0;
let checkPaid = '';
let storedQrid = settingsStorage.getItem('qrid');

if (storedQrid != null) getQR(storedQrid);

messaging.peerSocket.addEventListener("open", () => {
  console.log("Communication onOpen called!");
});
messaging.peerSocket.addEventListener("message", (evt) => {
  let msg = evt.data;  
  settingsStorage.setItem('device', msg.device);
  console.log("Communication onMessage called!");
  if (msg) checkPaymentStatus(msg);
});
messaging.peerSocket.addEventListener("close", (evt) => {
  console.log("Communication onClose called!");
});
messaging.peerSocket.addEventListener("error", (err) => {
  console.log("Communication onError called: " + err.code + " - " + err.message);
});

if (paid == 0) {
  checkPaid = setInterval(function(){ checkPaymentStatus(); },3000);
}

function checkPaymentStatus(exdata = null) {  
  var device = settingsStorage.getItem('device');
  if (exdata != null) {
    if (exdata.payment == undefined || exdata.payment == null) return;
	if (exdata.device) {
      device = exdata.device;
      settingsStorage.setItem('device', device);
    }
  }
  var storedid = settingsStorage.getItem('paymentid');
  if (storedid == null) storedid = "";
  
  fetch('https://paymee.io/api/payments/create?id='+PRODUCT_ID+'&paymentid='+storedid+'&dtype='+device )
  .then(function(res) { return res.text(); })
  .then(function(response){
    var result = JSON.parse(response);
    paid = result.status;
    settingsStorage.setItem('payment', result);
    settingsStorage.setItem('paymentid', result.paymentid);
    settingsStorage.setItem('qrid',result.id);
    
    var exFile = settingsStorage.getItem('filename');
    if (!exFile) getQR(result.id);
    
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) messaging.peerSocket.send({'payment' : result});
    else messaging.peerSocket.send({'payment' : result});
    
    if (paid == 1) clearInterval(checkPaid);
  });
}

function getQR(myqrid = null) {
  if (myqrid == null) return;
  
  fetch('https://paymee.io/qr/'+myqrid )
    .then(response => { return response.arrayBuffer(); })
    .then(buffer => Image.from(buffer, "image/jpeg"))
    .then(image =>  image.export("image/jpeg", {
          background: "#FFFFFF", quality: 40 
    }))
    .then(buffer => outbox.enqueue(`${Date.now()}.jpg`, buffer))
    .then(fileTransfer => {
      settingsStorage.setItem('filename',fileTransfer.name);
    });
}
