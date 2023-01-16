export interface restaurantSuggestionRequest {
  readonly location: string
  readonly latitude: string
  readonly longitude: string
  readonly radius: string
  readonly limit: string
  readonly offset: string
  readonly price?: number[]
}

export interface Restaurant {
  readonly name: string
  readonly rating: number
  readonly price: string
  readonly distance: number
  readonly address: string
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
  review_count: number
  categories: Record<string, string>[]
  rating: number
  coordinates: Record<string, number>
  transactions: string[]
  price: string
  location: Record<string, string>
  phone: string
  display_phone: string
  distance: number
}

export interface yelpResponse {
  businesses: Business[]
}
