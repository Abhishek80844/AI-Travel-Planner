export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  location: LocationCoordinates;
  rating?: number;
  category?: string;
  region?: string;
  photoUrl?: string;
}

export interface GeocodeResponse {
  formattedAddress: string;
  location: LocationCoordinates;
  placeId?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface RouteStep {
  stepNumber: number;
  instruction: string;
  distanceText: string;
  distanceKm?: number;
  durationText: string;
  startLocation?: LocationCoordinates;
  endLocation?: LocationCoordinates;
  travelMode?: string;
}

export interface RouteDirections {
  origin: string;
  destination: string;
  originLocation?: LocationCoordinates;
  destinationLocation?: LocationCoordinates;
  totalDistanceText: string;
  totalDistanceKm: number;
  totalDurationText: string;
  totalDurationMinutes: number;
  travelMode: 'driving' | 'transit' | 'walking' | 'bicycling';
  steps: RouteStep[];
  encodedPolyline?: string;
  routePath?: LocationCoordinates[];
}

export interface NearbyPlace {
  placeId: string;
  name: string;
  category: string;
  address: string;
  location: LocationCoordinates;
  distanceKm?: number;
  rating?: number;
  priceLevel?: string;
  openNow?: string;
}
