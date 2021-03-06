# Aerix invoice template

<img src="https://cloud.aerix.nl/index.php/s/3cVZGiRYSw7Nx7e/download" styles="width: 80; box-shadow: 4px 4px black;">

An example invoice template that demonstrates procedurally generated documents based on JSON input data. See [`preview.json`](https://github.com/aerix-nl/nota-invoice-template/blob/master/json/preview.json) for the source data of the above preview. This template can be rendered to PDF using [Nota](https://github.com/aerix-nl/nota). This was the first template made and actualy used in prodution by [Aerix](https://aerix.nl). Producing such invoices was the driver that sparked the development of Nota in 2013.

## Features

* [Does all the invoice arithmatic for you](https://github.com/aerix-nl/nota-invoice-template/blob/master/src/invoice.coffee#L138) (subtotals, VAT, discounts, no more embarrasing calculator mistakes guaranteed).

<img src="https://cloud.aerix.nl/index.php/s/GV3KQQKsb2FTKJ7/download">
<img src="https://cloud.aerix.nl/index.php/s/ei4ZfIargtrvvZ5/download">

* [Supports quotations](https://github.com/aerix-nl/nota-invoice-template/blob/master/src/invoice.coffee#L57). Automatically switches between invoice and quotation mode based on type specified in meta data.

<img src="https://cloud.aerix.nl/index.php/s/cJ2F3bEmcdnIePr/download">

* [Invoice internationalisation](https://github.com/aerix-nl/nota-invoice-template/blob/master/src/main.coffee#L60). Detects country of client and automatically sets language (Dutch and English supported, but more could easily be added).
* [Automatically formats output PDF filename](https://github.com/aerix-nl/nota-invoice-template/blob/master/src/invoice.coffee#L25) (based on ID, client and project title). For example `2014.0044_Client-Company-Optional-project-name.pdf`. See the link to the source code for cases of formatting.
* [Invoice model validation](https://github.com/aerix-nl/nota-invoice-template/blob/master/src/invoice.coffee#L175). An error is throw when attempting to render an invalid invoice to prevent sending out faulty invoices to clients.
* [Expiration date](https://github.com/aerix-nl/nota-invoice-template/blob/master/src/invoice.coffee#L103). Expiration date of the invoice (or quotation) expires is calculated based on a configurable validity period.
* And many more ...

## Tech used
* [Handlebars.js](https://github.com/wycats/handlebars.js/)
* [i18next.js](https://github.com/i18next/i18next)
* [Moment.js](https://github.com/moment/moment)
* [TV4.js](https://github.com/geraintluff/tv4)
* jQuery
* Sass
* Bourbon
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

## Development 

#### Requirements
You'll need
* NodeJS
* NPM
* Bower
* Gulp
* Bourbon

#### Compiling assets
Run `grunt` in the template directory for automagically compiling SASS and CoffeeScript.
