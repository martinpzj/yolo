import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import logger from './utils'
import * as dotenv from 'dotenv'
import { StatusCodes } from 'http-status-codes'
import fs from 'fs'
import { RestaurantSuggestionService } from './service'
import { restaurantSuggestionRequest, yelpResponse } from './types'
import { DATA_STORE_PATH } from './constants'

dotenv.config()

const app = express()
const port = 7777

const baseUrl = process.env.BASE_URL ?? ''
const apiKey = process.env.API_KEY ?? ''
const clientId = process.env.CLIENT_ID ?? ''

// TODO: If the file doesn't exist, on the first call it will get generated
// but it won't get used until the server gets restarted. Because that's when it gets
// loaded in. How do i get this thing to react to this event? Would I have to make a similar check
// like this one in the service?
let dataStore = undefined
//check if our json file exists
if (fs.existsSync(DATA_STORE_PATH)) {
  dataStore = JSON.parse(
    fs.readFileSync(DATA_STORE_PATH, 'utf-8')
  ) as yelpResponse
}

const service = new RestaurantSuggestionService(
  baseUrl,
  apiKey,
  clientId,
  dataStore
)

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message) => logger.http(message.trim())
    }
  }
)

app.use(morganMiddleware)
app.use(bodyParser.json())

app.post('/restaurants', async (req, res) => {
  const requestBody = req.body as restaurantSuggestionRequest

  try {
    const suggestions = await service.restaurantSuggestions(requestBody)

    res.send(suggestions)
  } catch (e) {
    logger.error(`${e}`)
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
  }
})

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`)
})
