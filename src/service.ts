import axios, { AxiosInstance } from 'axios'
import { StatusCodes } from 'http-status-codes'
import {
  Business,
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

  /**
   * So at this point we have an array of Businesses that match the criteria
   * we sent in the request. So from here, as a starting point and first attempt
   * for this project. I should just select one item at random from the list, tranform it
   * to give me only the information I want, and return that.
   * @param data
   * @returns
   */
  private transform(data: Business[]): restaurantSuggestionResponse[] {
    return [] as restaurantSuggestionResponse[]
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
    //transform to possible options and just return one for now?
    const suggestion = this.transform(restaurants.businesses)

    return {} as restaurantSuggestionResponse
  }
}
