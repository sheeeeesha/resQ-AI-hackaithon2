// const { Client } = require("@googlemaps/google-maps-services-js");

// const client = new Client({});

// module.exports = {
//   searchPlaces: async (query, location) => {
//     try {
//       const response = await client.placesNearby({
//         params: {
//           query: query, // e.g., "police station", "hospital"
//           location: location, // { lat: ..., lng: ... }
//           radius: 10000, // Search radius in meters (adjust as needed)
//           key: process.env.GOOGLE_PLACES_API_KEY, // Your API key from .env file
//         },
//         timeout: 1000, // milliseconds
//       });
//       return response.data.results;
//     } catch (error) {
//       console.error("Error searching places:", error);
//       return null;
//     }
//   },

//   getPlaceDetails: async (placeId) => {
//     try {
//       const response = await client.placeDetails({
//         params: {
//           place_id: placeId,
//           fields: ["name", "formatted_address", "geometry", "formatted_phone_number"],
//           key: process.env.GOOGLE_PLACES_API_KEY,
//         },
//         timeout: 1000,
//       });
//       return response.data.result;
//     } catch (error) {
//       console.error("Error getting place details:", error);
//       return null;
//     }
//   },
// };

// placesService.js (example)
const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});

async function searchPlaces(query, location) {
  try {
    const response = await client.placesNearby({
      params: {
        location: [location.lat, location.lng],
        radius: 5000, // 5km radius
        keyword: query,
        key: process.env.GOOGLE_PLACES_API_KEY,
      },
      timeout: 1000,
    });
    return response.data.results;
  } catch (error) {
    console.error("Error searching places:", error);
    return null;
  }
}

async function getPlaceDetails(placeId) {
  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: ['name', 'formatted_address', 'geometry', 'formatted_phone_number', 'types'],
        key: process.env.GOOGLE_PLACES_API_KEY,
      },
      timeout: 1000,
    });
    return response.data.result;
  } catch (error) {
    console.error("Error fetching place details:", error);
    return null;
  }
}

module.exports = { searchPlaces, getPlaceDetails };