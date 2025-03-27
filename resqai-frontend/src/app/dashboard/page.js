"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import EmergencyList from "../../components/EmergencyList";
import dynamic from "next/dynamic";
const MapView = dynamic(() => import("../../components/MapView"), {
  ssr: false,
});
import TranscriptDetail from "../../components/TranscriptDetails";
import Header from "../../components/Header";

export default function Dashboard() {
  const [emergencies, setEmergencies] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const q = query(
      collection(db, "emergencies"),
      orderBy("criticality", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const emergencyData = [];
      querySnapshot.forEach((doc) => {
        emergencyData.push({
          id: doc.id,
          ...doc.data(),
          resolved: doc.data().resolved || false,
        });
      });

      setEmergencies(emergencyData);
      setLoading(false);

      if (
        !selectedEmergency &&
        emergencyData.length > 0 &&
        filteredEmergencies.length > 0
      ) {
        setSelectedEmergency(emergencyData[0]);
        console.log("Initial selected emergency set to:", emergencyData[0]);
      }
    });

    return () => unsubscribe();
  }, [filter]);

  const [transcript, setTranscript] = useState([]);
  useEffect(() => {
    if (selectedEmergency) {
      const getTranscript = async () => {
        try {
          const transcriptDoc = await getDoc(
            doc(db, "call_transcripts", selectedEmergency.id)
          );

          if (transcriptDoc.exists()) {
            setTranscript(transcriptDoc.data().messages || []);
          } else {
            setTranscript([]);
          }
        } catch (error) {
          console.error("Error fetching transcript:", error);
          setTranscript([]);
        }
      };

      getTranscript();
    }
  }, [selectedEmergency]);

  const filteredEmergencies = emergencies.filter((emergency) => {
    if (filter === "all") return true;
    if (filter === "active") return !emergency.resolved;
    if (filter === "resolved") return emergency.resolved;
    return true;
  });

  const handleEmergencySelect = (emergency) => {
    setSelectedEmergency(emergency);
    console.log("handleEmergencySelect: Selected emergency changed to:", emergency);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleResolveEmergency = async (emergencyId) => {
    try {
      await updateDoc(doc(db, "emergencies", emergencyId), {
        resolved: true,
      });

      setEmergencies((prevEmergencies) =>
        prevEmergencies.map((em) =>
          em.id === emergencyId ? { ...em, resolved: true } : em
        )
      );
    } catch (error) {
      console.error("Error resolving emergency:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header onFilterChange={handleFilterChange} currentFilter={filter} />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 bg-white shadow-md overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <EmergencyList
              emergencies={filteredEmergencies}
              selectedId={selectedEmergency?.id}
              onSelect={handleEmergencySelect}
              onResolve={handleResolveEmergency}
            />
          )}
        </div>

        <div className="w-2/4 bg-gray-200">
          {selectedEmergency ? (
            <>
              {console.log(
                "Rendering MapView with selectedEmergency:",
                selectedEmergency
              )}
              <MapView emergency={selectedEmergency} /> {/* Removed key prop */}
            </>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              Select an emergency to view location
            </div>
          )}
        </div>

        <div className="w-1/4 bg-white shadow-md overflow-y-auto">
          {selectedEmergency ? (
            <TranscriptDetail
              emergency={selectedEmergency}
              transcript={transcript}
            />
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              Select an emergency to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}