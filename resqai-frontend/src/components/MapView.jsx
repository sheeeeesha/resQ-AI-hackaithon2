

// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import dynamic from 'next/dynamic';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// const MapContainer = dynamic(() => import('react-leaflet').then(module => module.MapContainer), { ssr: false });
// const TileLayer = dynamic(() => import('react-leaflet').then(module => module.TileLayer), { ssr: false });
// const Marker = dynamic(() => import('react-leaflet').then(module => module.Marker), { ssr: false });
// const Popup = dynamic(() => import('react-leaflet').then(module => module.Popup), { ssr: false });

// const emergencyIcon = L.icon({
//   iconUrl: '/emergency-marker.png',
//   iconSize: [30, 48],
//   iconAnchor: [15, 48],
//   popupAnchor: [0, -48],
// });

// const responseUnitIcon = L.icon({
//   iconUrl: '/response-unit-marker.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
// });

// export default function MapView({ emergency }) {
//   console.log("*** MapView v3 loaded ***");
//   console.log("MapView component loaded with emergency:", emergency);

//   const [isClient, setIsClient] = useState(false);
//   const mapRef = useRef(null);
//   const [position, setPosition] = useState([40.7128, -74.0060]);
//   const [locationName, setLocationName] = useState('');
//   const [responseUnits, setResponseUnits] = useState([]);

//   useEffect(() => {
//     console.log("Setting isClient to true");
//     setIsClient(true);
//   }, []);

//   useEffect(() => {
//     console.log("useEffect triggered with emergency:", emergency);
//     if (isClient && emergency?.location) {
//       const { latitude, longitude } = emergency.location;
//       if (typeof latitude === 'number' && typeof longitude === 'number') {
//         setPosition([latitude, longitude]);
//         setLocationName(emergency.location.address || 'Unknown location');
//         console.log("Position set from prop to:", [latitude, longitude]);
//         if (mapRef.current) {
//           mapRef.current.setView([latitude, longitude], 13); // Update map view
//           console.log("Map view updated to:", [latitude, longitude]);
//         }
//       } else {
//         console.error("Invalid location data in emergency prop:", emergency.location);
//         setPosition([40.7128, -74.0060]);
//         setLocationName('Unknown location');
//       }

//       if (Array.isArray(emergency.response_units)) {
//         setResponseUnits(emergency.response_units);
//         console.log("Response units set from prop to:", emergency.response_units);
//       } else {
//         console.error("Invalid response units in emergency prop:", emergency.response_units);
//         setResponseUnits([]);
//       }
//     }
//   }, [isClient, emergency]);

//   if (!isClient || !Array.isArray(position)) {
//     console.log("MapView not rendering yet: isClient=", isClient, "position=", position);
//     return null;
//   }

//   console.log("Rendering MapView with position:", position);
//   console.log("Rendering with responseUnits:", responseUnits);

//   return (
//     <div className="h-full w-full relative">
//       <MapContainer
//         center={position}
//         zoom={13}
//         style={{ height: '100%', width: '100%' }}
//         whenCreated={(map) => {
//           mapRef.current = map;
//           console.log("MapContainer created with center:", position);
//         }}
//       >
//         <TileLayer
//           attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
//         <Marker position={position} icon={emergencyIcon}>
//           <Popup>
//             <div>
//               <b>{locationName || 'Emergency Location'}</b>
//               <p>Type: {emergency?.type_of_emergency || 'Unknown'}</p>
//               <p>Criticality: {emergency?.criticality || 'N/A'}</p>
//             </div>
//           </Popup>
//         </Marker>
//         {responseUnits
//           .filter((unit) => {
//             const hasValidLocation =
//               unit.location &&
//               typeof (unit.location.lat ?? unit.location.latitude) === 'number' &&
//               typeof (unit.location.lng ?? unit.location.longitude) === 'number';
//             if (!hasValidLocation) {
//               console.warn("Skipping response unit due to invalid location:", unit);
//             }
//             return hasValidLocation;
//           })
//           .map((unit, index) => {
//             const unitLat = unit.location.lat ?? unit.location.latitude;
//             const unitLng = unit.location.lng ?? unit.location.longitude;
//             console.log(`Rendering response unit ${index} at:`, [unitLat, unitLng]);
//             return (
//               <Marker key={index} position={[unitLat, unitLng]} icon={responseUnitIcon}>
//                 <Popup>
//                   <div>
//                     <b>{unit.name || 'Unnamed Unit'}</b>
//                     <p>Address: {unit.address || 'No address'}</p>
//                     <p>Contact: {unit.contact_info || 'No contact info'}</p>
//                     <p>Distance: {unit.distance ? `${unit.distance.toFixed(2)} miles` : 'N/A'}</p>
//                   </div>
//                 </Popup>
//               </Marker>
//             );
//           })}
//       </MapContainer>
//     </div>
//   );
// }
// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import dynamic from 'next/dynamic';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// const MapContainer = dynamic(() => import('react-leaflet').then(module => module.MapContainer), { ssr: false });
// const TileLayer = dynamic(() => import('react-leaflet').then(module => module.TileLayer), { ssr: false });
// const Marker = dynamic(() => import('react-leaflet').then(module => module.Marker), { ssr: false });
// const Popup = dynamic(() => import('react-leaflet').then(module => module.Popup), { ssr: false });

// const emergencyIcon = L.icon({
//   iconUrl: '/marker-icon.png',
//   iconSize: [30, 48],
//   iconAnchor: [15, 48],
//   popupAnchor: [0, -48],
// });

// const responseUnitIcon = L.icon({
//   iconUrl: '/response-unit-marker.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
// });

// export default function MapView({ emergency }) {
//   console.log("*** MapView v6 loaded ***"); // Updated version
//   console.log("MapView component loaded with emergency:", emergency);

//   const [isClient, setIsClient] = useState(false);
//   const mapRef = useRef(null);
//   const [position, setPosition] = useState([40.7128, -74.0060]);
//   const [locationName, setLocationName] = useState('');
//   const [responseUnits, setResponseUnits] = useState([]);

//   // Set isClient on mount
//   useEffect(() => {
//     console.log("Setting isClient to true");
//     setIsClient(true);
//   }, []);

//   // Update state when emergency changes
//   useEffect(() => {
//     console.log("useEffect [emergency] triggered with emergency:", emergency);
//     if (!emergency || !emergency.location) {
//       console.log("Resetting to default: no emergency or location");
//       setPosition([40.7128, -74.0060]);
//       setLocationName('Unknown location');
//       setResponseUnits([]);
//       return;
//     }

//     const { latitude, longitude } = emergency.location;
//     if (typeof latitude !== 'number' || typeof longitude !== 'number') {
//       console.error("Invalid location data:", emergency.location);
//       setPosition([40.7128, -74.0060]);
//       setLocationName('Unknown location');
//       setResponseUnits([]);
//       return;
//     }

//     const newPosition = [latitude, longitude];
//     setPosition(newPosition);
//     setLocationName(emergency.location.address || 'Unknown location');
//     console.log("Position updated to:", newPosition);

//     if (Array.isArray(emergency.response_units)) {
//       setResponseUnits(emergency.response_units);
//       console.log("Response units updated to:", emergency.response_units);
//     } else {
//       console.error("Invalid response units:", emergency.response_units);
//       setResponseUnits([]);
//     }
//   }, [emergency]);

//   // Sync map view with position when map is ready
//   useEffect(() => {
//     if (!isClient || !mapRef.current) {
//       console.log("Skipping map sync: isClient=", isClient, "mapRef.current=", mapRef.current);
//       return;
//     }

//     console.log("Syncing map to position:", position);
//     mapRef.current.flyTo(position, 13, { duration: 1 });
//   }, [isClient, position]);

//   if (!isClient) {
//     console.log("MapView not rendering yet: isClient=", isClient);
//     return null;
//   }

//   console.log("Rendering MapView with position:", position);
//   console.log("Rendering with responseUnits:", responseUnits);

//   return (
//     <div className="h-full w-full relative">
//       <MapContainer
//         center={position}
//         zoom={13}
//         style={{ height: '100%', width: '100%' }}
//         whenCreated={(map) => {
//           mapRef.current = map;
//           console.log("MapContainer created with center:", position);
//           map.flyTo(position, 13, { duration: 1 }); // Initial positioning
//         }}
//       >
//         <TileLayer
//           attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
//         <Marker position={position} icon={emergencyIcon}>
//           <Popup>
//             <div>
//               <b>{locationName || 'Emergency Location'}</b>
//               <p>Type: {emergency?.type_of_emergency || 'Unknown'}</p>
//               <p>Criticality: {emergency?.criticality || 'N/A'}</p>
//             </div>
//           </Popup>
//         </Marker>
//         {responseUnits
//           .filter((unit) => {
//             const hasValidLocation =
//               unit.location &&
//               typeof (unit.location.lat ?? unit.location.latitude) === 'number' &&
//               typeof (unit.location.lng ?? unit.location.longitude) === 'number';
//             if (!hasValidLocation) {
//               console.warn("Skipping response unit due to invalid location:", unit);
//             }
//             return hasValidLocation;
//           })
//           .map((unit, index) => {
//             const unitLat = unit.location.lat ?? unit.location.latitude;
//             const unitLng = unit.location.lng ?? unit.location.longitude;
//             console.log(`Rendering response unit ${index} at:`, [unitLat, unitLng]);
//             return (
//               <Marker key={index} position={[unitLat, unitLng]} icon={responseUnitIcon}>
//                 <Popup>
//                   <div>
//                     <b>{unit.name || 'Unnamed Unit'}</b>
//                     <p>Address: {unit.address || 'No address'}</p>
//                     <p>Contact: {unit.contact_info || 'No contact info'}</p>
//                     <p>Distance: {unit.distance ? `${unit.distance.toFixed(2)} miles` : 'N/A'}</p>
//                   </div>
//                 </Popup>
//               </Marker>
//             );
//           })}
//       </MapContainer>
//     </div>
//   );
// }


'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'; // Direct imports
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamically import MapContainer only, if needed, but let’s try direct imports first
// const MapContainer = dynamic(() => import('react-leaflet').then(module => module.MapContainer), { ssr: false });

const emergencyIcon = L.icon({
  iconUrl: '/marker-icon.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [0, -48],
});

const responseUnitIcon = L.icon({
  iconUrl: '/response-unit-marker.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Component to update map position
function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    console.log("MapUpdater: Map instance:", map);
    console.log("MapUpdater: Flying to position:", position);
    if (map && typeof map.flyTo === 'function') {
      map.flyTo(position, 13, { duration: 1 });
      console.log("MapUpdater: Current map center after flyTo:", map.getCenter());
    } else {
      console.error("MapUpdater: map.flyTo is not a function, map:", map);
    }
  }, [map, position]);
  return null;
}

export default function MapView({ emergency }) {
  console.log("*** MapView v8 loaded ***"); // New version
  console.log("MapView component loaded with emergency:", emergency);

  const [isClient, setIsClient] = useState(false);
  const [position, setPosition] = useState([40.7128, -74.0060]);
  const [locationName, setLocationName] = useState('');
  const [responseUnits, setResponseUnits] = useState([]);

  // Set isClient on mount
  useEffect(() => {
    console.log("Setting isClient to true");
    setIsClient(true);
  }, []);

  // Update state when emergency changes
  useEffect(() => {
    console.log("useEffect [emergency] triggered with emergency:", emergency);
    if (!emergency || !emergency.location) {
      console.log("Resetting to default: no emergency or location");
      setPosition([40.7128, -74.0060]);
      setLocationName('Unknown location');
      setResponseUnits([]);
      return;
    }

    const { latitude, longitude } = emergency.location;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      console.error("Invalid location data:", emergency.location);
      setPosition([40.7128, -74.0060]);
      setLocationName('Unknown location');
      setResponseUnits([]);
      return;
    }

    const newPosition = [latitude, longitude];
    setPosition(newPosition);
    setLocationName(emergency.location.address || 'Unknown location');
    console.log("Position updated to:", newPosition);

    if (Array.isArray(emergency.response_units)) {
      setResponseUnits(emergency.response_units);
      console.log("Response units updated to:", emergency.response_units);
    } else {
      console.error("Invalid response units:", emergency.response_units);
      setResponseUnits([]);
    }
  }, [emergency]);

  if (!isClient) {
    console.log("MapView not rendering yet: isClient=", isClient);
    return null;
  }

  console.log("Rendering MapView with position:", position);
  console.log("Rendering with responseUnits:", responseUnits);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <MapUpdater position={position} />
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={emergencyIcon}>
          <Popup>
            <div>
              <b>{locationName || 'Emergency Location'}</b>
              <p>Type: {emergency?.type_of_emergency || 'Unknown'}</p>
              <p>Criticality: {emergency?.criticality || 'N/A'}</p>
            </div>
          </Popup>
        </Marker>
        {responseUnits
          .filter((unit) => {
            const hasValidLocation =
              unit.location &&
              typeof (unit.location.lat ?? unit.location.latitude) === 'number' &&
              typeof (unit.location.lng ?? unit.location.longitude) === 'number';
            if (!hasValidLocation) {
              console.warn("Skipping response unit due to invalid location:", unit);
            }
            return hasValidLocation;
          })
          .map((unit, index) => {
            const unitLat = unit.location.lat ?? unit.location.latitude;
            const unitLng = unit.location.lng ?? unit.location.longitude;
            console.log(`Rendering response unit ${index} at:`, [unitLat, unitLng]);
            return (
              <Marker key={index} position={[unitLat, unitLng]} icon={responseUnitIcon}>
                <Popup>
                  <div>
                    <b>{unit.name || 'Unnamed Unit'}</b>
                    <p>Address: {unit.address || 'No address'}</p>
                    <p>Contact: {unit.contact_info || 'No contact info'}</p>
                    <p>Distance: {unit.distance ? `${unit.distance.toFixed(2)} miles` : 'N/A'}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}