export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface Itinerary {
  id?: number;
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
}

export interface Hotel {
  id?: number;
  name: string;
  price: number;
  rating: number;
  address: string;
}

export interface Restaurant {
  id?: number;
  name: string;
  rating: number;
  price: string;
  location: string;
}

export interface PackingItem {
  id?: number;
  item: string;
  category: 'Clothing' | 'Documents' | 'Electronics' | 'Health' | string;
  isChecked: boolean;
}

export interface WeatherDay {
  id?: number;
  destination: string;
  forecastDate: string;
  temperature: number;
  rainChance: number;
  humidity: number;
  wind: number;
}

export interface Trip {
  id: number;
  destination: string;
  budget: number;
  days: number;
  travelStyle: 'Solo' | 'Couple' | 'Family' | 'Friends' | string;
  travelers: number;
  createdDate: string;
  shareToken?: string;
  itineraries: Itinerary[];
  hotels: Hotel[];
  restaurants: Restaurant[];
  packingLists: PackingItem[];
  weatherForecasts?: WeatherDay[];
}

export interface CreateTripRequest {
  destination: string;
  budget: number;
  days: number;
  travelStyle: string;
  travelers: number;
}

export interface EmergencyLocation {
  name: string;
  type: 'Hospital' | 'Police Station' | 'Embassy';
  address: string;
  phone?: string;
  distanceKm?: number;
}
