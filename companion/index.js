import { me } from "companion"
import * as messaging from 'messaging';
import { settingsStorage } from "settings";
import { outbox } from "file-transfer";
import { Image } from "image";
import * as fs from "fs";

const PRODUCT_ID = "YOUR_PRODUCT_UID";

let storedPaymentId = '';
let paid = 0;
let checkPaid = '';

messaging.peerSocket.addEventListener("open", () => {
  console.log("Communication onOpen called!");
});
messaging.peerSocket.addEventListener("message", (evt) => {
  //data from fibit to companion app
  let msg = evt.data;  
  console.log("Communication onMessage called: " + JSON.stringify(msg));
  checkPaymentStatus();
});
messaging.peerSocket.addEventListener("close", (evt) => {
  console.log("Communication onClose called: " + JSON.stringify(evt));
});
messaging.peerSocket.addEventListener("error", (err) => {
  console.log("Communication onError called: " + err.code + " - " + err.message);
});
 
//console.log('PAID STATUS STORED: '+paid);
if (paid == 0) {
  checkPaid = setInterval(function(){ checkPaymentStatus(); },3000);
  setTimeout(function(){getQR();},3000);
}

function checkPaymentStatus() {  
  fetch('https://paymee.io/api/payments/create?id='+PRODUCT_ID+'&paymentid='+settingsStorage.getItem('paymentid') )
  .then(function(res) { return res.text(); })
  .then(function(response){
    var result = JSON.parse(response);
    paid = result.status;
    //console.log("Payment ID "+result.paymentid+"; Status: "+paid+"; QR Code ID: "+result.id);
    
    settingsStorage.setItem('payment', result);
    settingsStorage.setItem('paymentid', result.paymentid);
    settingsStorage.setItem('qrid',result.id);
    
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) messaging.peerSocket.send({'payment' : result});
    else messaging.peerSocket.send({'payment' : result});
    if (paid == 1) clearInterval(checkPaid);
    
  });
}

function getQR() {
  fetch('https://paymee.io/qr/'+settingsStorage.getItem('qrid') )
    .then(response => { return response.arrayBuffer(); })
    .then(buffer => Image.from(buffer, "image/jpeg"))
    .then(image =>  image.export("image/jpeg", {
          background: "#FFFFFF", quality: 40 
    }))
    .then(buffer => outbox.enqueue(`${Date.now()}.jpg`, buffer))
    .then(fileTransfer => {
      console.log(`Sent file:`+fileTransfer.name);
    });
}
