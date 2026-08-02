Generate a detailed, realistic %d-day travel itinerary for a %s trip to %s with %d travelers and a total budget of $%s. Respond strictly with a single valid raw JSON object (no markdown, no backticks, no wrapping text) with these exact keys:
{
  "itinerary": [{"day": 1, "morning": "...", "afternoon": "...", "evening": "..."}],
  "hotels": [{"name": "...", "price": 120.0, "rating": 4.5, "address": "..."}],
  "restaurants": [{"name": "...", "rating": 4.7, "price": "$$", "location": "..."}],
  "packingList": [{"item": "...", "category": "Clothing"}],
  "estimatedCostsSummary": "...",
  "travelTips": ["..."]
}
