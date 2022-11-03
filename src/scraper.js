import { createRequire } from "module"
import axios from "axios"

const require = createRequire(import.meta.url)
const cheerio = require('cheerio')

export default async function scrapeData(url, headers) {
  try {
    const { data } = await axios.get(url, headers)
    return cheerio.load(data)
  } catch (err) {
    console.error(err)
  }
}