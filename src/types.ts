// TODO: should probably split this data type into two. One for the user request to the 
// server and other for the request to the downstream API
export interface restaurantSuggestionRequest {
  // You can just provide a general location like: Phoenix, AZ instead of a specific location
  // But could kep latitude and longitude in case you want something around you
  readonly location: string
  readonly latitude: string
  readonly longitude: string
  readonly radius: string
  readonly limit: string
  readonly offset: string
  readonly price?: number[]
  /**
   * Search term, e.g. "food" or "restaurants". May also be the 
   * business name "Starbucks"
   */
  readonly term?: string
  readonly open_now?: boolean
}

export interface Restaurant {
  readonly name: string
  readonly rating: number
  readonly price: string
  readonly reviewCount: string
  readonly distance: string
  readonly address: string[]
  readonly url: string
}

export interface restaurantSuggestionResponse {
  restaurants: Restaurant[]
}

export interface Business {
  id: string
  alias: string
  name: string
  image_url: string
  is_closed: boolean
  url: string
  review_count: string
  categories: Record<string, string>[]
  rating: number
  coordinates: Record<string, number>
  transactions: string[]
  price: string
  location: Record<string, any>
  phone: string
  display_phone: string
  distance: number
}

export interface yelpResponse {
  businesses: Business[]
}
