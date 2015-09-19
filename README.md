# Aerix invoice template

<img src="https://cloud.aerix.nl/index.php/s/3cVZGiRYSw7Nx7e/download" styles="width: 80; box-shadow: 4px 4px black;">

An example invoice template that demonstrates procedurally generated documents based on JSON input data. See [`preview.json`](https://github.com/aerix-nl/nota-invoice-template/blob/master/json/preview.json) for the source data of the above preview. This template can be rendered to PDF using [Nota](https://github.com/aerix-nl/nota). This was the first template made and actualy used in prodution by [Aerix](https://aerix.nl). Producing such invoices was the driver that sparked the development of Nota in 2013.

## Features
* Does all the invoice arithmatic for you (item subtotal based on price and quantity, subtotal, VAT, total)
* Computes date of invoice expiration after specified validity period
* Detects country of client and automatically translates invoice to English for posting abroad
* Automatically formats filename (with suffixes for quotations and periodical invoices like monthly webhosting)
* Supports quotations. Automatically switches between invoice and quotation mode based on type specified in meta data
* Clever addressing resolution based on available data of client
* Has model validation so errors are thrown when incorrect data is being rendered

## Tech used
* Handlebars.js
* i18next.js
* Moment.js
* jQuery
* Sass
* CoffeeScript
* RequireJS
* Grunt
* Bower

## Usage
This template comes by default with the [Nota CLI](https://github.com/aerix-nl/nota-cli) as an example. Install it using `npm install nota-cli`.

#### Preview in browser
In the Nota CLI folder, run `./nota --template=example-invoice --preview` for a preview.

#### Render to PDF with your own data
In the Nota CLI directory, run `./nota --template=example-invoice --data=<path/to/data.json`. The output PDF will be located in the same directory. Specify the location with the flag `--output=<path/to/output.pdf>`, and try the other options available with `./nota --help`.
