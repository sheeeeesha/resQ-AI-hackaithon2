

// require("dotenv").config();
// const express = require("express");
// const admin = require("firebase-admin");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const { Client } = require("@googlemaps/google-maps-services-js");
// const placesService = require("./placesService");
// // Initialize Firebase
// const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const db = admin.firestore();

// // Initialize Gemini API
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const app = express();
// app.use(express.json());


// // Helper function to calculate distance (Haversine formula)
// function calculateDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371; // Radius of the Earth in km
//   const dLat = (lat2 - lat1) * (Math.PI / 180);
//   const dLon = (lon2 - lon1) * (Math.PI / 180);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
//     Math.sin(dLon / 2) * Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = R * c; // Distance in km
//   return distance;
// }

// /**
//  * 1️⃣ Store Call Transcripts in Firebase
//  */
// app.post("/store-transcript", async (req, res) => {
//   try {
//     const { call_id, message, speaker, timestamp } = req.body;

//     if (!call_id || !message || !speaker || !timestamp) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const transcriptRef = db.collection("call_transcripts").doc(call_id);
//     const transcriptDoc = await transcriptRef.get();

//     let transcriptData = [];
//     if (transcriptDoc.exists) {
//       transcriptData = transcriptDoc.data().messages || [];
//     }

//     transcriptData.push({ message, speaker, timestamp });

//     await transcriptRef.set({ messages: transcriptData });

//     console.log(`✅ Stored transcript for Call ID: ${call_id}`);
//     res.status(200).json({ message: "Transcript stored successfully" });
//   } catch (error) {
//     console.error("❌ Error storing transcript:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// /**
//  * 2️⃣ Extract Emergency Details (NER Tagging)
//  */
// async function extractEmergencyDetails(callId, transcript) {
//   try {
//     console.log(`🔍 Extracting emergency details for Call ID: ${callId}...`);

//     const fullText = transcript.map((entry) => entry.message).join(" ");

//     const prompt = `
//       Extract the following details from this emergency call transcript:
//       - Location of emergency
//       - Type of emergency
//       - Criticality (Low, Medium, High)
//       - Approximate number of casualties
//       Respond in JSON format:
//       {"location": "...", "type_of_emergency": "...", "criticality": "...", "approximate_casualties": ...}
      
//       Transcript: "${fullText}"
//     `;

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(prompt);
//     let responseText = result.response.text().replace(/```json|```/g, "").trim();

//     console.log("🔍 NER Response:", responseText);
//     return JSON.parse(responseText);
//   } catch (error) {
//     console.error("❌ Error in NER Extraction:", error.message);
//     return {
//       location: "Unknown",
//       type_of_emergency: "Unknown",
//       criticality: "Unknown",
//       approximate_casualties: 0,
//     };
//   }
// }

// /**
//  * 3️⃣ Emotion Detection on Call Transcripts
//  */
// async function detectEmotion(callId, transcript) {
//   try {
//     console.log(`🔍 Performing Emotion Detection for Call ID: ${callId}...`);

//     const callerMessages = transcript
//       .filter((entry) => entry.speaker === "caller")
//       .map((entry) => entry.message)
//       .join(" ");

//     if (!callerMessages) {
//       console.warn("⚠️ No caller messages found for emotion detection.");
//       return { emotion: "Neutral", confidence: 1.0 };
//     }

//     const prompt = `
//       Analyze the following emergency call transcript and classify the caller's emotion.
//       Possible emotions: Panic, Fear, Calm, Angry, Sad, Neutral.
//       Respond in JSON format: {"emotion": "<label>", "confidence": <0-1>}.
      
//       Transcript: "${callerMessages}"
//     `;

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(prompt);
//     let responseText = result.response.text().replace(/```json|```/g, "").trim();

//     console.log("🔍 Emotion Analysis Response:", responseText);
//     return JSON.parse(responseText);
//   } catch (error) {
//     console.error("❌ Error in Emotion Detection:", error.message);
//     return { emotion: "Error", confidence: 0.0 };
//   }
// }

// /**
//  * 4️⃣ Process Completed Call (NER + Emotion Analysis + Store in Firebase)
//  */
// app.post("/process-completed-call", async (req, res) => {
//   try {
//     const { call_id } = req.body;

//     if (!call_id) {
//       return res.status(400).json({ error: "Missing call_id" });
//     }

//     const transcriptDoc = await db.collection("call_transcripts").doc(call_id).get();
//     if (!transcriptDoc.exists) {
//       return res.status(404).json({ error: "Call transcript not found" });
//     }
//     const transcript = transcriptDoc.data().messages;

//     const emergencyDetails = await extractEmergencyDetails(call_id, transcript);
//     const emotionResult = await detectEmotion(call_id, transcript);

//     const geocoder = new Client({});

//     // Geocode the location
//     const geocodeResponse = await geocoder.geocode({
//       params: {
//         address: emergencyDetails.location,
//         key: process.env.GOOGLE_PLACES_API_KEY,
//       },
//       timeout: 1000,
//     });

//     if (!geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
//       console.error("Geocoding failed for location:", emergencyDetails.location);
//       // If geocoding fails, store the original string and continue.
//       await db.collection("emergencies").doc(call_id).set(
//         {
//           ...emergencyDetails,
//           emotion_analysis: {
//             caller_emotion: emotionResult.emotion,
//             confidence_score: emotionResult.confidence,
//           },
//           location: emergencyDetails.location, // Store the original string.
//           response_units: [], // Store an empty array if response units cannot be calculated.
//         },
//         { merge: true }
//       );
//       console.log(`🚀 Emergency details & emotion analysis stored for Call ID: ${call_id} (Geocoding Failed)`);
//       return res.status(200).json({ message: "Processed successfully (Geocoding Failed)", call_id });
//     }

//     const location = geocodeResponse.data.results[0].geometry.location;

//     // Find nearby response units
//     const responseUnits = await findNearbyResponseUnits(emergencyDetails.location, emergencyDetails.type_of_emergency, emergencyDetails.criticality);

//     await db.collection("emergencies").doc(call_id).set(
//       {
//         ...emergencyDetails,
//         emotion_analysis: {
//           caller_emotion: emotionResult.emotion,
//           confidence_score: emotionResult.confidence,
//         },
//         location: {
//           address: emergencyDetails.location,
//           latitude: location.lat,
//           longitude: location.lng,
//         },
//         response_units: responseUnits, // Store response units
//       },
//       { merge: true }
//     );

//     console.log(`🚀 Emergency details & emotion analysis stored for Call ID: ${call_id}`);
//     res.status(200).json({ message: "Processed successfully", call_id });
//   } catch (error) {
//     console.error("❌ Error processing completed call:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Helper function to find nearby response units
// async function findNearbyResponseUnits(emergencyLocation, emergencyType, criticality) {
//   try {
//     let query = "";
//     if (emergencyType && emergencyType.toLowerCase().includes("fire")) {
//       query = "fire station";
//     } else if (emergencyType && emergencyType.toLowerCase().includes("medical")) {
//       query = "hospital";
//     } else if (emergencyType && emergencyType.toLowerCase().includes("crime")) {
//       query = "police station";
//     } else {
//       query = "emergency services"; // Default query
//     }

//     // Geocode the emergency location
//     const geocoder = new Client({});
//     const geocodeResponse = await geocoder.geocode({
//       params: {
//         address: emergencyLocation,
//         key: process.env.GOOGLE_PLACES_API_KEY,
//       },
//       timeout: 1000,
//     });

//     if (!geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
//       console.error("Geocoding failed for location:", emergencyLocation);
//       return [];
//     }

//     const location = geocodeResponse.data.results[0].geometry.location;

//     const nearbyPlaces = await placesService.searchPlaces(query, location);
//     if (!nearbyPlaces) {
//       return [];
//     }

//     const responseUnits = []; // Corrected line: Initialize an empty array
//     for (const place of nearbyPlaces) {
//       const placeDetails = await placesService.getPlaceDetails(place.place_id);
//       if (placeDetails) {
//         const distance = calculateDistance(
//           location.lat,
//           location.lng,
//           placeDetails.geometry.location.lat,
//           placeDetails.geometry.location.lng
//         );
//         responseUnits.push({
//           name: placeDetails.name,
//           address: placeDetails.formatted_address,
//           location: placeDetails.geometry.location, // Store lat/lng
//           contact_info: placeDetails.formatted_phone_number,
//           distance: distance, // Add distance to the object
//         });
//       }
//     }

//     // Sort by distance (nearest first)
//     responseUnits.sort((a, b) => a.distance - b.distance);

//     // Select units based on criticality
//     if (criticality && criticality.toLowerCase() === "high") {
//       return responseUnits.slice(0, 3); // Return the 3 nearest units for high criticality
//     } else {
//       return responseUnits.slice(0, 1); // Return the nearest unit for other cases
//     }
//   } catch (error) {
//     console.error("Error finding nearby response units:", error);
//     return [];
//   }
// }
// app.get('/api/emergencies/:callId', async (req, res) => {
//   try {
//       const { callId } = req.params;
//       console.log("Received callId:", callId); // Log the received callId
//       const emergencyDoc = await db.collection('emergencies').doc(callId).get();
//       console.log("Firestore document:", emergencyDoc); // Log the document object
//       if (!emergencyDoc.exists) {
//           console.log("Document does not exist in Firestore."); // Log if document not found
//           return res.status(404).json({ error: 'Emergency data not found' });
//       }
//       console.log("Document data:", emergencyDoc.data()); // Log the document data
//       res.json(emergencyDoc.data());
//   } catch (error) {
//       console.error('Error fetching emergency data:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Start Server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
require("dotenv").config();
const express = require("express");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Client } = require("@googlemaps/google-maps-services-js");
const placesService = require("./placesService");

// Initialize Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
app.use(express.json());

// Helper function to calculate distance (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

// Helper function to sanitize data for Firestore
function sanitizeFirestoreData(data) {
  if (Array.isArray(data)) {
    return data.map(item => sanitizeFirestoreData(item));
  } else if (data && typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) {
        sanitized[key] = null;
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeFirestoreData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  return data;
}

/**
 * 1️⃣ Store Call Transcripts in Firebase
 */
app.post("/store-transcript", async (req, res) => {
  try {
    const { call_id, message, speaker, timestamp } = req.body;

    if (!call_id || !message || !speaker || !timestamp) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const transcriptRef = db.collection("call_transcripts").doc(call_id);
    const transcriptDoc = await transcriptRef.get();

    let transcriptData = [];
    if (transcriptDoc.exists) {
      transcriptData = transcriptDoc.data().messages || [];
    }

    transcriptData.push({ message, speaker, timestamp });

    await transcriptRef.set({ messages: transcriptData });

    console.log(`✅ Stored transcript for Call ID: ${call_id}`);
    res.status(200).json({ message: "Transcript stored successfully" });
  } catch (error) {
    console.error("❌ Error storing transcript:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 2️⃣ Extract Emergency Details (NER Tagging)
 */
async function extractEmergencyDetails(callId, transcript) {
  try {
    console.log(`🔍 Extracting emergency details for Call ID: ${callId}...`);

    const fullText = transcript.map((entry) => entry.message).join(" ");

    const prompt = `
      Extract the following details from this emergency call transcript:
      - Location of emergency
      - Type of emergency
      - Criticality (Low, Medium, High)
      - Approximate number of casualties
      Respond in JSON format:
      {"location": "...", "type_of_emergency": "...", "criticality": "...", "approximate_casualties": ...}
      
      Transcript: "${fullText}"
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let responseText = result.response.text().replace(/```json|```/g, "").trim();

    console.log("🔍 NER Response:", responseText);
    return JSON.parse(responseText);
  } catch (error) {
    console.error("❌ Error in NER Extraction:", error.message);
    return {
      location: "Unknown",
      type_of_emergency: "Unknown",
      criticality: "Unknown",
      approximate_casualties: 0,
    };
  }
}

/**
 * 3️⃣ Emotion Detection on Call Transcripts
 */
async function detectEmotion(callId, transcript) {
  try {
    console.log(`🔍 Performing Emotion Detection for Call ID: ${callId}...`);

    const callerMessages = transcript
      .filter((entry) => entry.speaker === "caller")
      .map((entry) => entry.message)
      .join(" ");

    if (!callerMessages) {
      console.warn("⚠️ No caller messages found for emotion detection.");
      return { emotion: "Neutral", confidence: 1.0 };
    }

    const prompt = `
      Analyze the following emergency call transcript and classify the caller's emotion.
      Possible emotions: Panic, Fear, Calm, Angry, Sad, Neutral.
      Respond in JSON format: {"emotion": "<label>", "confidence": <0-1>}.
      
      Transcript: "${callerMessages}"
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let responseText = result.response.text().replace(/```json|```/g, "").trim();

    console.log("🔍 Emotion Analysis Response:", responseText);
    return JSON.parse(responseText);
  } catch (error) {
    console.error("❌ Error in Emotion Detection:", error.message);
    return { emotion: "Error", confidence: 0.0 };
  }
}

/**
 * 4️⃣ Process Completed Call (NER + Emotion Analysis + Store in Firebase)
 */
app.post("/process-completed-call", async (req, res) => {
  try {
    const { call_id } = req.body;

    if (!call_id) {
      return res.status(400).json({ error: "Missing call_id" });
    }

    const transcriptDoc = await db.collection("call_transcripts").doc(call_id).get();
    if (!transcriptDoc.exists) {
      return res.status(404).json({ error: "Call transcript not found" });
    }
    const transcript = transcriptDoc.data().messages;

    const emergencyDetails = await extractEmergencyDetails(call_id, transcript);
    const emotionResult = await detectEmotion(call_id, transcript);

    const geocoder = new Client({});

    const geocodeResponse = await geocoder.geocode({
      params: {
        address: emergencyDetails.location,
        key: process.env.GOOGLE_PLACES_API_KEY,
      },
      timeout: 1000,
    });

    if (!geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
      console.error("Geocoding failed for location:", emergencyDetails.location);
      await db.collection("emergencies").doc(call_id).set(
        sanitizeFirestoreData({
          ...emergencyDetails,
          emotion_analysis: {
            caller_emotion: emotionResult.emotion,
            confidence_score: emotionResult.confidence,
          },
          location: emergencyDetails.location,
          response_units: [],
        }),
        { merge: true }
      );
      console.log(`🚀 Emergency details & emotion analysis stored for Call ID: ${call_id} (Geocoding Failed)`);
      return res.status(200).json({ message: "Processed successfully (Geocoding Failed)", call_id });
    }

    const location = geocodeResponse.data.results[0].geometry.location;

    const responseUnits = await findNearbyResponseUnits(emergencyDetails.location, emergencyDetails.type_of_emergency, emergencyDetails.criticality);

    await db.collection("emergencies").doc(call_id).set(
      sanitizeFirestoreData({
        ...emergencyDetails,
        emotion_analysis: {
          caller_emotion: emotionResult.emotion,
          confidence_score: emotionResult.confidence,
        },
        location: {
          address: emergencyDetails.location,
          latitude: location.lat,
          longitude: location.lng,
        },
        response_units: responseUnits,
      }),
      { merge: true }
    );

    console.log(`🚀 Emergency details & emotion analysis stored for Call ID: ${call_id}`);
    res.status(200).json({ message: "Processed successfully", call_id });
  } catch (error) {
    console.error("❌ Error processing completed call:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Helper function to find nearby response units
async function findNearbyResponseUnits(emergencyLocation, emergencyType, criticality) {
  try {
    let query = "";
    let placeType = "";
    if (emergencyType && emergencyType.toLowerCase().includes("fire")) {
      query = "fire station";
      placeType = "fire_station";
    } else if (emergencyType && emergencyType.toLowerCase().includes("medical")) {
      query = "hospital";
      placeType = "hospital";
    } else if (emergencyType && emergencyType.toLowerCase().includes("crime")) {
      query = "police station";
      placeType = "police";
    } else {
      query = "emergency services";
      placeType = "emergency_service"; // Fallback, though less specific
    }

    const geocoder = new Client({});
    const geocodeResponse = await geocoder.geocode({
      params: {
        address: emergencyLocation,
        key: process.env.GOOGLE_PLACES_API_KEY,
      },
      timeout: 1000,
    });

    if (!geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
      console.error("Geocoding failed for location:", emergencyLocation);
      return [];
    }

    const location = geocodeResponse.data.results[0].geometry.location;

    const nearbyPlaces = await placesService.searchPlaces(query, location);
    console.log(`Places API raw response for query "${query}":`, nearbyPlaces); // Debug log

    if (!nearbyPlaces || nearbyPlaces.length === 0) {
      console.warn("No nearby places found for query:", query);
      return [];
    }

    const responseUnits = [];
    for (const place of nearbyPlaces) {
      // Filter by place type to ensure relevance
      const isRelevantType = place.types && place.types.includes(placeType);
      if (!isRelevantType) {
        console.log(`Skipping irrelevant place: ${place.name} (types: ${place.types})`);
        continue;
      }

      const placeDetails = await placesService.getPlaceDetails(place.place_id);
      if (placeDetails) {
        const distance = calculateDistance(
          location.lat,
          location.lng,
          placeDetails.geometry.location.lat,
          placeDetails.geometry.location.lng
        );
        responseUnits.push({
          name: placeDetails.name || 'Unknown',
          address: placeDetails.formatted_address || 'No address',
          location: placeDetails.geometry.location,
          contact_info: placeDetails.formatted_phone_number || 'N/A',
          distance: distance,
        });
      }
    }

    if (responseUnits.length === 0) {
      console.warn("No relevant response units found after filtering.");
    }

    responseUnits.sort((a, b) => a.distance - b.distance);

    if (criticality && criticality.toLowerCase() === "high") {
      return responseUnits.slice(0, 3);
    } else {
      return responseUnits.slice(0, 1);
    }
  } catch (error) {
    console.error("Error finding nearby response units:", error);
    return [];
  }
}

app.get('/api/emergencies/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    console.log("Received callId:", callId);
    const emergencyDoc = await db.collection('emergencies').doc(callId).get();
    console.log("Firestore document:", emergencyDoc);
    if (!emergencyDoc.exists) {
      console.log("Document does not exist in Firestore.");
      return res.status(404).json({ error: 'Emergency data not found' });
    }
    console.log("Document data:", emergencyDoc.data());
    res.json(emergencyDoc.data());
  } catch (error) {
    console.error('Error fetching emergency data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});