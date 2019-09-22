<img src="https://www.paymee.io/img/githublogo.png" alt="Paymee" width="300px">

Paymee is a payment solution for everyone. 

Since there are billions of devices in this world, used daily by each one of us to create virtual content, 
[Paymee](https://paymee.io) comes as a monetization platform for your content, a place where you can sell what you create. 

Use Paymee to enable customers to purchase your goods in a secure, timely and efficient manner!

# Fitbit Integration

You can use [Paymee](https://paymee.io) as a payment solution for any watchface or app created for:
* Fitbit Versa Lite
* Fitbit Versa
* Fitbit Versa 2
* Fitbit Ionic

# Integration Steps

Follow the next steps to integrate the payment solution to your app:

## 1. Create a new product
[Login](https://paymee.io/login) or [register](https://paymee.io/register) an account with [Paymee](https://paymee.io) and add a new product.

## 2. Get the product UID
Click on the new added product from the list, then click on UID.

## 3. Integrate in fitbit app/watchface
Copy or clone this repository into your app. 
The following files need to be updated:

* app/index.js (Import paymee.js and start payment)
* app/paymee.js (Device - companion communication)
* companion/index.js (Companion - Server communication)
* resources/paymee.gui (Paymee - UI File)
* resources/index.gui (Add <use href="#paymee" /> tag)
* resources/widgets.gui (Import paymee.gui)


# Contact

* Website: [https://paymee.io](https://paymee.io)
* Support email: [support@paymee.io](mailto:support@paymee.io)
