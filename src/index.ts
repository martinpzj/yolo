import axios, { AxiosInstance } from 'axios'
import * as dotenv from 'dotenv'

dotenv.config()

const BASE_URL = 'https://api.yelp.com/v3/businesses/search'
const RADIUS = 40000
const LIMIT = 50

function createQueryParams(offset: number) {
  return {
    location: 'CA',
    latitude: process.env.LATITUDE,
    longitude: process.env.LONGITUDE,
    radius: RADIUS,
    limit: LIMIT,
    offset: offset
  }
}

async function main() {
  const apiKey = process.env['API_KEY']

  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      params: createQueryParams(50)
    })

    console.log(response.data)
  } catch (e) {
    throw new Error(`Something went wrong: ${e}`)
  }
}

console.log('yolo')
main()
