import axios from "axios"
import * as cheerio from 'cheerio';

export default async function scrapeData(url: string, headers: {}) {
  try {
    const { data } = await axios.get(url, headers)
    return cheerio.load(data)
  } catch (err) {
    console.error(err)
  }
}