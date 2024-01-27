import { sendMail, generateEmailBody } from './sendMail.js';
import { config } from 'dotenv';
import scrapeData from './scraper.js';
import { storeBlacklist } from './storeBlacklist.js';
import { storeWhitelist } from './storeWhitelist.js';

config();

const userAgent: string = process.env.USER_AGENT;

const customHeaderRequest = {
  headers: { 'User-Agent': userAgent },
};

const googleUrl: string = 'https://www.google.com';
const searchTerm: string = process.argv[2];
const maxPrice: number = parseFloat(process.argv[3]) || 0;
const minPrice: number = parseFloat(process.argv[4]) || 0
let cannotHave: string = process.argv[5] || null
let isWhiteList: boolean = process.argv[6] === 'true' ? true : false;

if (!searchTerm) {
  throw new Error('Please provide a search term')
}

const url = 'https://www.google.com/search?hl=pt-BR&tbm=shop&q=' + searchTerm;
const _productContainer = '.KZmu8e';
const _title = '.sh-np__product-title';
const _price = '.T14wmb b';
const _store = '.E5ocAb';
const email = true;
const subject = `💸 Low Price Alert! - ${searchTerm}`;
const to = process.env.TO;
let mailSent = '';
let body = '';
let products: Record<string, any>[] = [];
let $ = await scrapeData(url, customHeaderRequest);
const productContainers = $(_productContainer);

console.log(new Date().toLocaleString());
console.log('Search Term:', searchTerm, '\nMax Price:', maxPrice, '\nMin Price:', minPrice, '\nCannot Have:', cannotHave, '\nIs Whitelist:', isWhiteList, '\nProducts found:', products.length);

// adding products to array
$(productContainers).each((index, element) => {
  let el = $(element);
  let priceElement = $(element)
    .find(_price)
    .text()
    .match(/[\d|\.|\,]+/)
    .join()
    .replace('.', '')
    .replace(',', '.');

    let price = parseFloat(priceElement);

  if (price > minPrice) {
    products.push({
      title: el.find(_title).text(),
      price: price,
      store: el.find(_store).text(),
      url: googleUrl + el.find('a').attr('href'),
    });
  }
});

if (!isWhiteList) {
  // filter blacklisted stores
  products = products.filter((item) => {
    return !storeBlacklist.includes(item.store.toLowerCase());
  });
}
else {
  // filter whitelisted stores
  products = products.filter((item) => {
    return storeWhitelist.includes(item.store.toLowerCase());
  });
}

let keywords = searchTerm.split(' ').filter(x => x.length > 1)

// filter results containing every search term
products = products.filter((item) =>
  keywords.every(v => item.title.toLowerCase().includes(v))
);

if(cannotHave) {
  let _cannotHave = cannotHave.split(',')

  // filter
  products = products.filter((item) =>
    _cannotHave.every(v => !item.title.toLowerCase().includes(v))
  );
}

// sort by price
products = products.sort((a, b) =>
  a.price > b.price ? 1 : b.price > a.price ? -1 : 0
);

console.log('Products found: ' + products.length);

// email body
body = generateEmailBody(products, maxPrice)

// filter by max price
products = products.filter((item) => item.price <= maxPrice);

if (email && products.length > 0) {
  sendMail(to, subject, body);
} else {
  mailSent = 'Price too high, email not sent';
}

console.log(body.replace(/<[^>]*>?/gm, '')); // removes html tags from console.log
console.log(new Date().toLocaleString());
console.log(mailSent)