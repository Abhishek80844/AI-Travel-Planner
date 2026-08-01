import api from './axios';
import { Trip, CreateTripRequest, Itinerary, PackingItem, EmergencyLocation } from '../types';

export const createTrip = async (data: CreateTripRequest): Promise<Trip> => {
  const response = await api.post<Trip>('/trips', data);
  return response.data;
};

export const getUserTrips = async (): Promise<Trip[]> => {
  const response = await api.get<Trip[]>('/trips');
  return response.data;
};

export const getTripById = async (id: number | string): Promise<Trip> => {
  const response = await api.get<Trip>(`/trips/${id}`);
  return response.data;
};

export const getTripByShareToken = async (token: string): Promise<Trip> => {
  const response = await api.get<Trip>(`/trips/share/${token}`);
  return response.data;
};

export const deleteTrip = async (id: number): Promise<void> => {
  await api.delete(`/trips/${id}`);
};

export const updateItineraryDay = async (
  tripId: number,
  itineraryId: number,
  data: Partial<Itinerary>
): Promise<Itinerary> => {
  const response = await api.put<Itinerary>(`/trips/${tripId}/itineraries/${itineraryId}`, data);
  return response.data;
};

export const togglePackingItem = async (tripId: number, itemId: number): Promise<PackingItem> => {
  const response = await api.patch<PackingItem>(`/trips/${tripId}/packing-lists/${itemId}/toggle`);
  return response.data;
};

export const addPackingItem = async (tripId: number, item: { item: string; category: string }): Promise<PackingItem> => {
  const response = await api.post<PackingItem>(`/trips/${tripId}/packing-lists`, item);
  return response.data;
};

export const deletePackingItem = async (tripId: number, itemId: number): Promise<void> => {
  await api.delete(`/trips/${tripId}/packing-lists/${itemId}`);
};

export const sendTripChatMessage = async (tripId: number, message: string): Promise<{ reply: string; timestamp: string }> => {
  const response = await api.post<{ reply: string; timestamp: string }>(`/trips/${tripId}/chat`, { message });
  return response.data;
};

export const getGeneralTravelAdvice = async (message: string): Promise<{ reply: string; timestamp: string }> => {
  const response = await api.post<{ reply: string; timestamp: string }>('/trips/advice', { message });
  return response.data;
};

export const getEmergencyLocations = async (tripId: number): Promise<EmergencyLocation[]> => {
  const response = await api.get<EmergencyLocation[]>(`/trips/${tripId}/emergency`);
  return response.data;
};
