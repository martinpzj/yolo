import axios, { AxiosInstance } from 'axios'
import { StatusCodes } from 'http-status-codes'
import NodeCache from 'node-cache'
import {
  Business,
  Restaurant,
  restaurantSuggestionRequest,
  restaurantSuggestionResponse,
  yelpResponse
} from './types'
import { metersToMiles } from './utils'
import logger from './logger'

export class RestaurantSuggestionService {
  private readonly httpClient: AxiosInstance
  private readonly clientId: string
  private readonly apiKey: string
  private requestCache?: restaurantSuggestionRequest
  private suggestionsCache: NodeCache

  constructor(baseUrl: string, apiKey: string, clientId: string) {
    if (!baseUrl || !clientId || !apiKey) {
      throw new Error(
        `Failed to create service... BaseUrl, ClientId, and ApiKey must not be empty`
      )
    }

    this.clientId = clientId
    this.apiKey = apiKey
    this.suggestionsCache = new NodeCache()
    this.httpClient = axios.create({
      baseURL: baseUrl,
      validateStatus: (_) => {
        return true
      }
    })
  }

  private randomTransformedSuggestion(): restaurantSuggestionResponse {
    const { keys } = this.suggestionsCache.getStats()
    const allStoredKeys = this.suggestionsCache.keys()
    const randomKey = allStoredKeys[Math.floor(Math.random() * keys)]

    const randomSuggestion = this.suggestionsCache.take<Business>(randomKey)!
    logger.info(`Remaining suggestions = ${this.suggestionsCache.keys().length}`)

    const distance = metersToMiles(randomSuggestion.distance)

    const restaurant = {
      name: randomSuggestion.name,
      price: randomSuggestion.price,
      rating: randomSuggestion.rating,
      reviewCount: randomSuggestion.review_count,
      url: randomSuggestion.url,
      address: randomSuggestion.location['display_address'],
      distance
    } as Restaurant

    return {
      restaurants: [restaurant]
    }
  }

  private cacheRawSuggestions(businesses: Business[]): void {
    businesses.forEach((business) => {
      this.suggestionsCache.set<Business>(business.name, business)
    })
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
    if (this.isSameAsPreviousRequest(request) && this.suggestionsCache.keys().length > 0) {
      logger.info(`Similar request from before, using response cache`)
      return this.randomTransformedSuggestion()
    }
    else if (!this.isSameAsPreviousRequest(request)) {
      logger.info(`Different request from before, flushing cache and retrieving new data`)
      this.suggestionsCache.flushAll()
      this.requestCache = request
    }
    else {
      logger.info(`Cache contains 0 keys, retrieving data`)
      // need to add some logic to get the next 50 in line
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

    const { businesses } = response.data as yelpResponse

    this.cacheRawSuggestions(businesses)

    return this.randomTransformedSuggestion()
  }
}
