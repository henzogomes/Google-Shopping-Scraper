import { createRequire } from "module"
import sendMail from "./sendMail.js"
import dotenv from "dotenv"
import scrapeData from "./scraper.js"

dotenv.config()

const require = createRequire(import.meta.url)
require('log-timestamp')(function() { return '[' + new Date().toLocaleString('en-US', { hour12: false }) + '] %s'; })

const userAgent = process.env.USER_AGENT

const customHeaderRequest = {
  headers: {'User-Agent': userAgent}
}

const googleUrl = 'https://www.google.com'
const maxPrice = parseFloat(process.env.MAX_PRICE)
const minPrice = parseFloat(process.env.MIN_PRICE)
const searchTerm = process.env.SEARCH_TERM
const url = "https://www.google.com/search?hl=pt-BR&tbm=shop&q=" + searchTerm
const _productContainer = '.KZmu8e'
const _title = '.sh-np__product-title'
const _price = '.T14wmb b'
const _store = '.E5ocAb'
const email = true
const subject = '💸 Low Price Alert!'
const to = process.env.TO
const storeBlacklist = ['zoom', 'vivo', 'tiendamia.com.br', 'olx'];
let body = ''
let products = []
let $ = await scrapeData(url, customHeaderRequest);
const productContainers = $(_productContainer)

// adding products to array
$(productContainers).each((index, element) => {
  let el = $(element)
  let price = $(element).find(_price).text().match(/[\d|\.|\,]+/).join().replace('.', '').replace(',', '.')
  price = parseFloat(price)

  if(price > minPrice) {
    products.push({
      title: el.find(_title).text(),
      price: price,
      store: el.find(_store).text(),
      url: googleUrl + el.find('a').attr('href')
    })
  }
})

// filter blacklisted stores
products = products.filter((item)=>{
  return !storeBlacklist.includes(item.store.toLowerCase())
});

// filter only results matching the search term
products = products.filter(item => item.title.toLowerCase().includes(searchTerm))

// sort by price
products = products.sort((a, b) => (a.price > b.price) ? 1 : ((b.price > a.price) ? -1 : 0))

console.log('Products found: ' + products.length)

// email body
products.forEach((item) => {
  let monetaryPrice = item.price.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
  let bold = item.price <= maxPrice ? `style='font-weight: bold;'` : ''

  body += `<ul>
            <li><a href='${item.url}'>${item.title}</a></li>
            <li ${bold} >Price: ${monetaryPrice}</li>
            <li>Store: ${item.store}</li>
          </ul>`
})

// filter by max price
products = products.filter(item => item.price <= maxPrice)

if(email && products.length > 0) {
  sendMail(to, subject, body)
}
else {
  console.log("price too high, email not sent")
}

console.log(body.replace(/<[^>]*>?/gm, ''))