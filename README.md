<img src="https://www.paymee.io/img/logo.png" alt="Paymee" width="300px">

# Paymee Fitbit Integration

You can use [Paymee](https://paymee.io) as a payment solution for any watchface or app created for Fitbit Versa Lite, Fitbit Versa, Fitbit Versa 2 or Fitbit Ionic.

---

# Integration Steps

## Create a new product
Login to [Paymee](https://paymee.io) and add a new product using the sidebar link.

## Generate fitbit code
Click on the new app from the list, then click generate fitbit code.

## Integrate in fitbit app/watchface
Copy the following files to:
> app/paymee.js
> companion/index.js
> resources/paymee.gui
> Update resources/index.gui by adding the <use id="paymee"/> at the end of your file.

---

# Contact

Website: [https://paymee.io](https://paymee.io)
Send us an email: [support@paymee.io](mailto:support@paymee.io)
