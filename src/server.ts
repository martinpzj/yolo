import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import logger from './utils'
import * as dotenv from 'dotenv'
import { StatusCodes } from 'http-status-codes'
import { RestaurantSuggestionService } from './service'
import { restaurantSuggestionRequest } from './types'

dotenv.config()

const app = express()
const port = 7777

const baseUrl = process.env.BASE_URL ?? ''
const apiKey = process.env.API_KEY ?? ''
const clientId = process.env.CLIENT_ID ?? ''
const service = new RestaurantSuggestionService(baseUrl, apiKey, clientId)

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
