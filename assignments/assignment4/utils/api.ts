// API utility for destination data
import axios from 'axios';

// Define types for the API response
export interface Destination {
  name: string;
  description: string;
  coordinates: {
    latitude: string;
    longitude: string;
  };
  type: string;
  comments: string;
}

export interface ApiResponse {
  result: Destination[];
  cacheTime: number;
  time: number;
  status: string;
  message: string;
}

// Sample destinations for fallback
const FALLBACK_DESTINATIONS: Destination[] = [
  {
    name: 'Tower of London',
    description: 'Historic fortress and popular tourist attraction on the north bank of the River Thames',
    coordinates: { latitude: '51.5055', longitude: '-0.0754' },
    type: 'historical',
    comments: 'UNESCO World Heritage Site, home to Crown Jewels',
  },
  {
    name: 'Big Ben',
    description: 'Iconic clock tower and symbol of London, located at Palace of Westminster',
    coordinates: { latitude: '51.4975', longitude: '-0.1246' },
    type: 'historical',
    comments: 'Gothic Revival architecture, stunning views from river',
  },
  {
    name: 'British Museum',
    description: 'World-renowned museum featuring artifacts from around the globe',
    coordinates: { latitude: '51.5194', longitude: '-0.1270' },
    type: 'cultural',
    comments: 'Free admission, extensive collections of history and art',
  },
  {
    name: 'Borough Market',
    description: 'Historic food market with local produce, street food, and artisan goods',
    coordinates: { latitude: '51.5052', longitude: '-0.0882' },
    type: 'food',
    comments: 'Fresh ingredients, international cuisine, vibrant atmosphere',
  },
  {
    name: 'St. Paul\'s Cathedral',
    description: 'Iconic baroque cathedral and masterpiece of English architecture',
    coordinates: { latitude: '51.5138', longitude: '-0.0984' },
    type: 'historical',
    comments: 'Stunning dome, accessible interior with shop and café',
  },
  {
    name: 'Harrods Food Hall',
    description: 'Luxury food hall with gourmet products from around the world',
    coordinates: { latitude: '51.4995', longitude: '-0.1634' },
    type: 'food',
    comments: 'Premium ingredients, specialty foods, elegant dining experience',
  },
];

// API client instance
const API_KEY = 'e10cbf8a55mshd256519820a89fdp1153b2jsnb9c5dad3cfb9';
const API_HOST = 'travel-guide-api-city-guide-top-places.p.rapidapi.com';

export const fetchDestinations = async (region: string): Promise<Destination[]> => {
  try {
    const options = {
      method: 'POST' as const,
      url: 'https://travel-guide-api-city-guide-top-places.p.rapidapi.com/check',
      params: { noqueue: '1' },
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
        'Content-Type': 'application/json',
      },
      data: {
        region,
        language: 'en',
        interests: ['historical', 'cultural', 'food'],
      },
    };

    const response = await axios.request<ApiResponse>(options);
    return response.data.result || [];
  } catch (error) {
    console.warn('API request failed, using fallback data:', error);
    // Return fallback data instead of throwing error
    return FALLBACK_DESTINATIONS;
  }
};

export default { fetchDestinations };
