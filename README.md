# Aerix invoice template

This an example invoice template for [Nota](https://github.com/aerix-nl/nota) that demonstrates procedurally generated documents with basic rendering and arithmetic. This was the first template made and actualy used in prodution by Aerix. Producing such invoices was the driver that sparked the development of Nota in 2013.

#### Usage

This template comes with Nota by default as an example. Install [Nota](https://github.com/aerix-nl/nota) and run `./nota --template=example-invoice --preview` for a preview.

#### Features
* Does all the invoice arithmatic for you (item subtotal based on price and quantity, subtotal, VAT, total)
* Computes date of invoice expiration after specified validity period
* Detects country of client and automatically translates invoice to English for posting abroad
* Automatically formats filename (with suffixes for quotations and periodical invoices like monthly webhosting)
* Supports quotations. Automatically switches between invoice and quotation mode based on type specified in meta data
* Clever addressing resolution based on available data of client
* Has model validation so errors are thrown when incorrect data is being rendered