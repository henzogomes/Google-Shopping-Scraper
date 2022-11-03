import { createRequire } from "module"
import axios from "axios"
import sendMail from "./sendMail.js"

const require = createRequire(import.meta.url)
require('log-timestamp')(function() { return '[' + new Date().toLocaleString('en-US', { hour12: false }) + '] %s'; })

const cheerio = require('cheerio')
const url = process.argv[2] || "https://www.amazon.com.br/dp/B09L1N6BGC"
const highestPrice = 4986

async function scrapeData() {
  try {
    const { data } = await axios.get(url)
    const $ = cheerio.load(data)

    let product = $("#productTitle").text().trim();
    let price = $(".a-price-whole").first()

    price = price.text()

    price = price.replace(",", "")
    price = price.replace(".", "")

    let body = `Produto ${product} \n Preço: ${price}`

    if(price < highestPrice) {
      body = body + `\n URL: <a href='${url}'>Click to buy</a>`
      sendMail("henzo.gomes@gmail.com", "alerta de preço", body)
    }
    else {
      console.log("price too high, email not sent")
    }

    console.log(body)

  } catch (err) {
    console.error(err)
  }
}

scrapeData();