import axios, { AxiosInstance } from 'axios'
import { StatusCodes } from 'http-status-codes'
import fs from 'fs'
import {
  Business,
  Restaurant,
  restaurantSuggestionRequest,
  restaurantSuggestionResponse,
  yelpResponse
} from './types'
import logger from './utils'
import { DATA_STORE_PATH } from './constants'

export class RestaurantSuggestionService {
  private readonly httpClient: AxiosInstance
  private readonly clientId: string
  private readonly apiKey: string
  private readonly dataStore?: yelpResponse

  constructor(
    baseUrl: string,
    apiKey: string,
    clientId: string,
    dataStore?: yelpResponse
  ) {
    if (!baseUrl || !clientId || !apiKey) {
      throw new Error(
        `Failed to create service... BaseUrl, ClientId, and ApiKey must not be empty`
      )
    }

    this.clientId = clientId
    this.apiKey = apiKey
    this.dataStore = dataStore
    this.httpClient = axios.create({
      baseURL: baseUrl,
      validateStatus: (_) => {
        return true
      }
    })
  }

  private transform(businesses: Business[]): restaurantSuggestionResponse {
    //only take one business from the array of Businesses and transform that for now
    const randomSuggestion =
      businesses[Math.floor(Math.random() * businesses.length)]

    //convert from meters to miles
    const distance = (Math.round(randomSuggestion.distance) / 1609).toFixed(2)

    const restaurant = {
      name: randomSuggestion.name,
      price: randomSuggestion.price,
      rating: randomSuggestion.rating,
      url: randomSuggestion.url,
      address: randomSuggestion.location['display_address'],
      distance
    } as Restaurant

    return {
      restaurants: [restaurant]
    }
  }

  public async restaurantSuggestions(
    request: restaurantSuggestionRequest
  ): Promise<restaurantSuggestionResponse> {
    logger.info('Invoking suggestions function...')

    if (this.dataStore) {
      logger.info(`Using internal data store`)
      return this.transform(this.dataStore.businesses)
    }

    logger.info(
      `Did not find file ${DATA_STORE_PATH}, attempting to retrieve data`
    )

    const response = await this.httpClient({
      method: 'get',
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      },
      params: request
    })

    if (response.status !== StatusCodes.OK) {
      throw new Error(
        `Yelp request failed with status=${
          response.status
        }. Error=${JSON.stringify(response.data)}`
      )
    }

    const restaurants = response.data as yelpResponse

    fs.writeFile(
      DATA_STORE_PATH,
      JSON.stringify(restaurants, null, 2) + '\n',
      (err) => {
        if (err) {
          throw new Error(
            `Failed to write data to ${DATA_STORE_PATH}. Error=${err}`
          )
        }
      }
    )

    return this.transform(restaurants.businesses)
  }
}

/**
 * THOUGHTS:
 * - One thing I definitely don't want to keep doing is sending a request to Yelp
 * everytime I get invoked. It's slow and wastes my API limit. I could potentially just
 * store the replies in a file and retrieve them if successive calls are made.
 *      -> If the user makes a request with different parameters then the file we created is
 *         stale and we'd have to make a request to get new data and write that file?
 * - I should also give the user the option to request how many suggestions they want to get get back.
 * Maybe provide a hard limit of like 10... idk
 * - Should also expose other fields in the request so the user can provide what kind of food
 * they're looking for, rating range, price range, etc.
 */
