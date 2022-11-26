import { createRequire } from 'module';
import sendMail from './sendMail.js';
import dotenv from 'dotenv';
import scrapeData from './scraper.js';

dotenv.config();

const require = createRequire(import.meta.url);
require('log-timestamp')(function () {
  return '[' + new Date().toLocaleString('en-US', { hour12: false }) + '] %s';
});

const userAgent = process.env.USER_AGENT;

const customHeaderRequest = {
  headers: { 'User-Agent': userAgent },
};

const googleUrl = 'https://www.google.com';
const searchTerm = process.argv[2];
const maxPrice = parseFloat(process.argv[3]) || parseFloat(process.env.MAX_PRICE);
const minPrice = process.argv[4] || null
let cannotHave = process.argv[5] || null

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
let products = [];
let $ = await scrapeData(url, customHeaderRequest);
const productContainers = $(_productContainer);

const storeBlacklist = [
  'zoom',
  'vivo',
  'tiendamia.com.br',
  'olx',
  'techinn.com',
  'alifone.com.br',
  'buscapé',
  'ar free comercio',
  'loja tim',
  'top comercio de moveis',
  'trocafone marketplace br',
  'outlet do celular',
  'saldão da informática',
  'ri happy brinquedos',
  'machado moveis e eletros',
  'casa guararapes comercial eireli',
  'webfones',
  'madeiramadeira',
  'melo e lopes comércio'
];

// adding products to array
$(productContainers).each((index, element) => {
  let el = $(element);
  let price = $(element)
    .find(_price)
    .text()
    .match(/[\d|\.|\,]+/)
    .join()
    .replace('.', '')
    .replace(',', '.');

    price = parseFloat(price);

  if (price > minPrice) {
    products.push({
      title: el.find(_title).text(),
      price: price,
      store: el.find(_store).text(),
      url: googleUrl + el.find('a').attr('href'),
    });
  }
});

// filter blacklisted stores
products = products.filter((item) => {
  return !storeBlacklist.includes(item.store.toLowerCase());
});

let keywords = searchTerm.split(' ').filter(x => x.length > 1)

// filter results containing every search term
products = products.filter((item) =>
  keywords.every(v => item.title.toLowerCase().includes(v))
);

if(cannotHave) {
  cannotHave = cannotHave.split(',')

  // filter
  products = products.filter((item) =>
    cannotHave.every(v => !item.title.toLowerCase().includes(v))
  );
}

// sort by price
products = products.sort((a, b) =>
  a.price > b.price ? 1 : b.price > a.price ? -1 : 0
);

console.log('Products found: ' + products.length);

// email body
products.forEach((item) => {
  let monetaryPrice = item.price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  let bold = item.price <= maxPrice ? `style='font-weight: bold;'` : '';

  body += `<ul>
            <li><a href='${item.url}'>${item.title}</a></li>
            <li ${bold} >Price: ${monetaryPrice}</li>
            <li>Store: ${item.store}</li>
          </ul>`;
});

// filter by max price
products = products.filter((item) => item.price <= maxPrice);

if (email && products.length > 0) {
  sendMail(to, subject, body);
} else {
  mailSent = 'Price too high, email not sent';
}

console.log(body.replace(/<[^>]*>?/gm, ''));
console.log(new Date().toLocaleString());
console.log(mailSent)

// node app.js 'search term' 'maxprice' 'minprice' 'cannot,have,these,words'