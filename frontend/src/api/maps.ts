import axios from 'axios';
import { PlaceSearchResult, GeocodeResponse, RouteDirections, NearbyPlace } from '../types/maps';

const API_BASE = '/api/maps';

export const searchDestinations = async (query: string, region: string = 'in'): Promise<PlaceSearchResult[]> => {
  const response = await axios.get<PlaceSearchResult[]>(`${API_BASE}/search`, {
    params: { query, region },
  });
  return response.data;
};

export const geocodeAddress = async (address: string): Promise<GeocodeResponse> => {
  const response = await axios.get<GeocodeResponse>(`${API_BASE}/geocode`, {
    params: { address },
  });
  return response.data;
};

export const getDirections = async (
  origin: string,
  destination: string,
  mode: string = 'driving'
): Promise<RouteDirections> => {
  const response = await axios.get<RouteDirections>(`${API_BASE}/directions`, {
    params: { origin, destination, mode },
  });
  return response.data;
};

export const getNearbyPlaces = async (
  location: string,
  radius: number = 5000,
  type: string = 'tourist_attraction'
): Promise<NearbyPlace[]> => {
  const response = await axios.get<NearbyPlace[]>(`${API_BASE}/nearby`, {
    params: { location, radius, type },
  });
  return response.data;
};
