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
  private responseCache?: yelpResponse
  private requestCache?: restaurantSuggestionRequest

  constructor(baseUrl: string, apiKey: string, clientId: string) {
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

  private isSameAsPreviousRequest(request: restaurantSuggestionRequest) {
    // If this is the first request since the server started
    if (!this.requestCache) {
      this.requestCache = request
      return false
    }
    return JSON.stringify(request) === JSON.stringify(this.requestCache)
  }

  public async restaurantSuggestions(
    request: restaurantSuggestionRequest
  ): Promise<restaurantSuggestionResponse> {
    if (this.isSameAsPreviousRequest(request) && this.responseCache) {
      logger.info(`Similar request from before, using response cache...`)
      return this.transform(this.responseCache.businesses)
    }

    if (!this.isSameAsPreviousRequest(request)) {
      logger.info(`Different request from before, retrieving data`)
      this.requestCache = request
    }

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

    this.responseCache = response.data as yelpResponse

    return this.transform(this.responseCache.businesses)
  }
}
