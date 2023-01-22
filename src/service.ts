import axios, { AxiosInstance } from 'axios'
import { StatusCodes } from 'http-status-codes'
import {
  Business,
  Restaurant,
  restaurantSuggestionRequest,
  restaurantSuggestionResponse,
  yelpResponse
} from './types'
import logger from './utils'

export class RestaurantSuggestionService {
  private readonly httpClient: AxiosInstance
  private readonly clientId: string
  private readonly apiKey: string

  constructor(baseUrl: string, apiKey: string, clientId: string) {
    logger.info('Constructor invoked')

    if (!baseUrl || !clientId || !apiKey) {
      throw new Error(
        `Failed to create service... BaseUrl, ClientId, and ApiKey must not be empty`
      )
    }

    this.clientId = clientId
    this.apiKey = apiKey
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

    return this.transform(restaurants.businesses)
  }
}
