# Google Shopping Scraper

This project is a web scraping tool designed to scrape product data from Google Shopping (Brazil). It allows you to specify a search term, a maximum price, a minimum price, words that should not be included in the product title, and a flag to indicate whether the product is on a whitelist of stores.

## Prerequisites

- Node.js 18

## Setup

1. Clone the repository to your local machine.
2. Run `npm install` to install the project dependencies.
3. Create a `.env` file in the root directory of the project based on the `.env.example` file. This file should contain your SMTP credentials if you want to receive emails.

## Usage

To run the scraper, first build the application:

```bash
npm run build
```
Then run:

```bash
node dist/app.js 'search term' 'maxprice' 'minprice' 'list,of,comma,separeted,words' true
```
Replace `search term` with the term you want to search for, `maxprice` with the maximum price, `minprice` with the minimum price, `list,of,comma,separeted,words` with words that should not be included in the product title, and true if you want to use the whitelist.

### Example

```bash
node dist/app.js 'iphone' '4000', '2000', 'used,red', true
```


## Debugging
To debug the application in Visual Studio Code, use the provided launch configuration in .vscode/launch.json.