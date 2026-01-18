// import React, { useState, useEffect, useRef } from 'react';
// import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, FlatList, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
// import MapView, { Marker, Polyline } from 'react-native-maps';
// import * as Location from 'expo-location';
// import { ArrowLeft, TrainFront, Footprints, Clock, Circle, MapPin, Navigation } from 'lucide-react-native';
// import { Audio } from 'expo-av';
// const API_BASE_URL = 'https://e819e1a93149.ngrok-free.app/api'; 

// export default function App() {
//   const mapRef = useRef<MapView>(null);
  
//   // --- APP STATE ---
//   const [screen, setScreen] = useState<'search' | 'live'>('search'); 
  
//   // --- DATA ---
//   const [stations, setStations] = useState<any[]>([]);
//   const [vehicles, setVehicles] = useState<any[]>([]);
//   const [origin, setOrigin] = useState('');
//   const [destination, setDestination] = useState('');
//   const [walkingSpeed, setWalkingSpeed] = useState('normal'); 
  
//   const [allRoutes, setAllRoutes] = useState<any[]>([]);
//   const [activeRoute, setActiveRoute] = useState<any>(null); 
  
//   const [liveConfidence, setLiveConfidence] = useState<string>('high'); 
//   const [transferUpdate, setTransferUpdate] = useState<string>('');
  
//   const [loading, setLoading] = useState(false);
//   const [userLocation, setUserLocation] = useState<any>(null);
//   const [region, setRegion] = useState({
//     latitude: 42.3601, longitude: -71.0589, latitudeDelta: 0.05, longitudeDelta: 0.05,
//   });

//   // --- 1. INITIAL SETUP ---
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(`${API_BASE_URL}/mbta/stations`);
//         const data = await res.json();
//         if (data.success) setStations(data.data);
//       } catch (err) {}

//       try {
//         let { status } = await Location.requestForegroundPermissionsAsync();
//         if (status === 'granted') {
//              let loc = await Location.getCurrentPositionAsync({});
//              setUserLocation(loc.coords);
//         }
//       } catch (e) { setUserLocation({ latitude: 42.355, longitude: -71.065 }); }
//     })();
//   }, []);

// // --- 2. LIVE TRACKING LOGIC ---
//   useEffect(() => {
//     if (screen !== 'live' || !activeRoute) return;

//     // A. Vehicle Polling (Existing)
//     const summary = activeRoute.summary || "";
//     const linesToTrack: string[] = [];
//     if (summary.includes('Red')) linesToTrack.push('Red');
//     if (summary.includes('Orange')) linesToTrack.push('Orange');
//     if (summary.includes('Blue')) linesToTrack.push('Blue');
//     if (summary.includes('Green')) linesToTrack.push('Green-B,Green-C,Green-D,Green-E');

//     const fetchVehicles = async () => {
//         if(linesToTrack.length === 0) return;
//         try {
//             const res = await fetch(`${API_BASE_URL}/mbta/vehicles?routes=${linesToTrack.join(',')}`);
//             const data = await res.json();
//             if (data.success) setVehicles(data.data);
//         } catch (err) {}
//     };

//     // B. TARGETED TRANSFER CHECK (The Fix)
//     const checkTransferSafety = async () => {
//         let newConfidence = activeRoute.catch_confidence; 
//         let newUpdate = "On Schedule";

//         // Loop through all transit steps
//         for (let i = 0; i < activeRoute.steps.length; i++) {
//             const step = activeRoute.steps[i];
            
//             if (step.is_transit && step.stop_id) {
//                 try {
//                     // 1. Get ALL upcoming trains for this station
//                     const res = await fetch(`${API_BASE_URL}/mbta/predictions/${step.stop_id}`);
//                     const data = await res.json();
                    
//                     if (data.success && data.data.length > 0) {
//                         const predictions = data.data;
                        
//                         // 2. THE FIX: Find the specific train we are scheduled to take
//                         // We look for a train departing around our Scheduled Time (+/- 10 mins buffer)
//                         // step.departure_time is Unix Timestamp (Seconds)
//                         const scheduledTime = step.departure_time * 1000; // Convert to ms
                        
//                         // Find the prediction closest to our scheduled time
//                         // (MBTA API doesn't give timestamps in this simple endpoint, so we infer from 'minutes')
//                         const now = new Date().getTime();
                        
//                         let targetTrain = null;
//                         let minDiff = Infinity;

//                         // Calculate "Scheduled Minutes from Now" to match against MBTA "Minutes"
//                         const scheduledMinutesAway = (scheduledTime - now) / 60000;

//                         for(let pred of predictions) {
//                             // Difference between "Live Prediction" and "Google Schedule"
//                             const diff = Math.abs(pred.minutes - scheduledMinutesAway);
                            
//                             // If this train is within 15 mins of our schedule, it's likely OUR train
//                             if (diff < 15 && diff < minDiff) {
//                                 minDiff = diff;
//                                 targetTrain = pred;
//                             }
//                         }

//                         // If we found our specific train, analyze IT (not the random next one)
//                         if (targetTrain) {
//                             const minutesAway = targetTrain.minutes;
                            
//                             // LOGIC:
//                             // If this is a TRANSFER, we need to compare it to when we arrive from previous train
//                             if (i > 0 && activeRoute.steps[i-1].is_transit) {
//                                 // Previous step arrival time
//                                 const prevArrival = activeRoute.steps[i-1].arrival_time * 1000;
//                                 const msUntilArrival = prevArrival - now;
//                                 const minutesUntilArrival = msUntilArrival / 60000;
                                
//                                 // Buffer = (Train Leaves) - (I Arrive)
//                                 const buffer = minutesAway - minutesUntilArrival;
                                
//                                 if (buffer < 1) {
//                                     newConfidence = 'low';
//                                     newUpdate = `⚠️ Missed Connection: Train leaves before you arrive`;
//                                 } else if (buffer < 4) {
//                                     newConfidence = 'medium';
//                                     newUpdate = `🏃 Run! Connection tightens to ${Math.floor(buffer)} min`;
//                                 } else {
//                                     newUpdate = `✅ Connection On Time (${Math.floor(buffer)} min buffer)`;
//                                 }
//                             } 
//                             // If this is the FIRST train (Walking there)
//                             else {
//                                 // Use the static walk time calculated by backend
//                                 const walkTimeStr = activeRoute.walk_minutes || "0"; 
//                                 const walkMinutes = parseInt(walkTimeStr.split(' ')[0]) || 0;
                                
//                                 // Buffer = (Train Leaves) - (Walk Time)
//                                 const buffer = minutesAway - walkMinutes;

//                                 if (buffer < 0) {
//                                     // It's leaving before we can walk there. 
//                                     // BUT: Is there another train later?
//                                     // If we missed our target, we shift to the next available one.
//                                     newConfidence = 'medium';
//                                     newUpdate = `⚠️ You missed the ${formatTime(step.departure_time)} train. Next one in ${minutesAway} min.`;
//                                 } else if (buffer < 3) {
//                                     newConfidence = 'medium';
//                                     newUpdate = `🏃 Hurry! Depart in ${minutesAway} min (Walk is ${walkMinutes} min)`;
//                                 } else {
//                                     // We are safe
//                                     // newUpdate = `On Time: Depart in ${minutesAway} min`;
//                                 }
//                             }
//                         } else {
//                             // If no matching train found, it might be too far in future or cancelled
//                             // Fallback: Just show the next available
//                              if (predictions[0].minutes < 2 && i > 0) {
//                                  // Only warn if it's super close and we might be confused
//                                  // newUpdate = "Next train is very soon (check schedule)";
//                              }
//                         }
//                     }
//                 } catch (e) { console.log(e); }
//             }
//             if (newConfidence === 'low') break;
//         }
        
//         setLiveConfidence(newConfidence);
//         setTransferUpdate(newUpdate);
//     };

//     fetchVehicles();
//     checkTransferSafety();
//     const interval = setInterval(() => {
//         fetchVehicles();
//         checkTransferSafety();
//     }, 6000); 

//     return () => clearInterval(interval);
//   }, [screen, activeRoute]);

//   // --- 3. SEARCH ---
//   const handleSearch = async () => {
//     Keyboard.dismiss();
//     if (!origin || !destination) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE_URL}/directions`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ origin, destination, walking_speed: walkingSpeed })
//       });
//       const data = await res.json();
//       if (data.success) {
//           setAllRoutes(data.data);
//           if (data.data[0]?.path) fitToRoute(data.data[0].path);
//       } else { alert("No route found"); }
//     } catch (err) { alert("Error connecting to server"); }
//     setLoading(false);
//   };

//   const fitToRoute = (path: any[]) => {
//     const coords = path.map((c: any) => ({ latitude: c.lat, longitude: c.lng }));
//     mapRef.current?.fitToCoordinates(coords, { edgePadding: { top: 100, right: 40, bottom: 400, left: 40 } });
//   }

//   // --- 4. NAVIGATION ---
//   const startLiveNavigation = (route: any) => {
//       setActiveRoute(route);
//       setLiveConfidence(route.catch_confidence); 
//       setScreen('live');
//       fitToRoute(route.path);
//   };

//   const exitLiveNavigation = () => {
//       setScreen('search');
//       setActiveRoute(null);
//       setVehicles([]); 
//   };

//   const getConfidenceColor = (conf: string) => {
//       if (conf === 'high') return '#10B981'; 
//       if (conf === 'medium') return '#F59E0B'; 
//       return '#EF4444'; 
//   };

//   // --- TIME FORMATTER ---
//   const formatTime = (ts: number) => {
//       if(!ts) return "";
//       return new Date(ts * 1000).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'});
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" />
      
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         initialRegion={region}
//         showsUserLocation={true}
//       >
//         {screen === 'search' && stations.map(s => (
//           <Marker key={s.id} coordinate={{ latitude: s.lat, longitude: s.lng }} title={s.name}
//             pinColor={s.routes[0].includes('Red') ? '#DA291C' : s.routes[0].includes('Orange') ? '#ED8B00' : '#00843D'} />
//         ))}
//         {screen === 'live' && vehicles.map(v => (
//             <Marker key={v.id} coordinate={{ latitude: v.lat, longitude: v.lng }} rotation={v.bearing} anchor={{x:0.5, y:0.5}}>
//                 <View style={[styles.trainMarker, { backgroundColor: v.route.includes('Red') ? '#DA291C' : '#00843D' }]}>
//                     <TrainFront size={12} color="white"/>
//                 </View>
//             </Marker>
//         ))}
//         {(screen === 'live' && activeRoute) && (
//           <Polyline coordinates={activeRoute.path.map((p: any) => ({ latitude: p.lat, longitude: p.lng }))} strokeColor="#2563EB" strokeWidth={5} />
//         )}
//         {(screen === 'search' && allRoutes.length > 0) && (
//              <Polyline coordinates={allRoutes[0].path.map((p: any) => ({ latitude: p.lat, longitude: p.lng }))} strokeColor="#9ca3af" strokeWidth={3} lineDashPattern={[5,5]}/>
//         )}
//       </MapView>

//       {/* --- SEARCH SCREEN --- */}
//       {screen === 'search' && (
//           <SafeAreaView style={styles.overlay}>
//             <View style={styles.card}>
//                 <Text style={styles.title}>Boston Transit</Text>
//                 <TextInput style={styles.input} placeholder="Start" value={origin} onChangeText={setOrigin} />
//                 <TextInput style={styles.input} placeholder="End" value={destination} onChangeText={setDestination} />
//                 <View style={styles.speedRow}>
//                     {['slow', 'normal', 'fast'].map(s => (
//                         <TouchableOpacity key={s} onPress={() => setWalkingSpeed(s)} 
//                             style={[styles.speedBtn, walkingSpeed === s && styles.activeSpeed]}>
//                             <Text style={{textTransform:'capitalize', color: walkingSpeed===s?'white':'black'}}>{s}</Text>
//                         </TouchableOpacity>
//                     ))}
//                 </View>
//                 <TouchableOpacity style={styles.mainBtn} onPress={handleSearch} disabled={loading}>
//                     {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>Find Routes</Text>}
//                 </TouchableOpacity>
//             </View>

//             {allRoutes.length > 0 && (
//                 <View style={styles.routeListContainer}>
//                     <Text style={styles.listHeader}>Select a Route:</Text>
//                     <FlatList 
//                         data={allRoutes}
//                         keyExtractor={(_,i) => i.toString()}
//                         renderItem={({item}) => (
//                             <TouchableOpacity style={styles.routeCard} onPress={() => startLiveNavigation(item)}>
//                                 <View style={styles.routeRow}>
//                                     <View style={{flex: 1}}>
//                                         <Text style={styles.routeTime}>{item.duration}</Text>
//                                         <Text style={styles.routeSummary}>{item.summary}</Text>
//                                     </View>
//                                     <View style={[styles.confBadge, {backgroundColor: getConfidenceColor(item.catch_confidence)}]}>
//                                         <Text style={styles.confText}>{item.catch_confidence === 'high' ? 'Safe' : item.catch_confidence === 'medium' ? 'Tight' : 'Risky'}</Text>
//                                     </View>
//                                 </View>
//                             </TouchableOpacity>
//                         )}
//                     />
//                 </View>
//             )}
//           </SafeAreaView>
//       )}

//       {/* --- LIVE NAVIGATION SCREEN (UPDATED) --- */}
//       {screen === 'live' && activeRoute && (
//           <View style={styles.liveContainer}>
//               <SafeAreaView style={styles.liveHeader}>
//                   <TouchableOpacity onPress={exitLiveNavigation} style={styles.backBtn}>
//                       <ArrowLeft color="black" size={24}/>
//                   </TouchableOpacity>
//                   <View>
//                       <Text style={styles.liveTitle}>Full Itinerary</Text>
//                       <Text style={styles.liveSub}>Live Updates Active</Text>
//                   </View>
//                   <View style={[styles.confBadge, {marginLeft: 'auto', backgroundColor: getConfidenceColor(liveConfidence)}]}>
//                       <Text style={styles.confText}>{liveConfidence.toUpperCase()}</Text>
//                   </View>
//               </SafeAreaView>

//               {/* TIMELINE CARD */}
//               <View style={styles.timelineCard}>
//                    {/* DYNAMIC HEADER */}
//                    {transferUpdate !== '' && (
//                        <View style={[styles.updateBox, {backgroundColor: liveConfidence === 'low' ? '#FFEBEE' : '#E0F2F1'}]}>
//                            <Text style={[styles.updateText, {color: liveConfidence === 'low' ? '#C62828' : '#00695C'}]}>{transferUpdate}</Text>
//                        </View>
//                    )}

//                    <FlatList
//                       data={activeRoute.steps}
//                       keyExtractor={(_, i) => i.toString()}
//                       renderItem={({item, index}) => {
//                           // Is it a transit step?
//                           if(item.is_transit) {
//                               return (
//                                   <View style={styles.timelineItem}>
//                                       <View style={styles.timelineLeft}>
//                                           <Text style={styles.timeLabel}>{formatTime(item.departure_time)}</Text>
//                                           <View style={styles.lineBar} />
//                                           <Text style={styles.timeLabel}>{formatTime(item.arrival_time)}</Text>
//                                       </View>
//                                       <View style={styles.timelineIconContainer}>
//                                           <TrainFront size={20} color="#2563EB" />
//                                       </View>
//                                       <View style={styles.timelineContent}>
//                                           <Text style={styles.timelineTitle}>Ride Train</Text>
//                                           <Text style={styles.timelineDesc}>{item.instruction.replace(/<[^>]*>?/gm, '')}</Text>
//                                           {/* Buffer Calculation Logic could go here */}
//                                       </View>
//                                   </View>
//                               );
//                           }
//                           // Is it walking?
//                           return (
//                               <View style={styles.timelineItem}>
//                                   <View style={styles.timelineLeft}>
//                                        {/* Only show time if we calculated it manually in backend, otherwise blank */}
//                                        <Text style={styles.timeLabel}></Text> 
//                                   </View>
//                                   <View style={styles.timelineIconContainer}>
//                                       {index === 0 ? <Navigation size={20} color="#666"/> : <Footprints size={20} color="#666" />}
//                                   </View>
//                                   <View style={styles.timelineContent}>
//                                       <Text style={styles.timelineTitle}>{index === 0 ? "Start" : "Walk / Transfer"}</Text>
//                                       <Text style={styles.timelineDesc}>{item.instruction.replace(/<[^>]*>?/gm, '')}</Text>
//                                   </View>
//                               </View>
//                           );
//                       }}
//                    />
//               </View>
//           </View>
//       )}

//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   map: { ...StyleSheet.absoluteFillObject },
//   overlay: { flex: 1, padding: 20, justifyContent: 'space-between' },
//   card: { backgroundColor: 'white', padding: 16, borderRadius: 16, elevation: 10, shadowColor:'#000', shadowOpacity:0.1 },
//   title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
//   input: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, marginBottom: 10 },
//   speedRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
//   speedBtn: { flex: 1, alignItems: 'center', padding: 8, backgroundColor: '#eee', borderRadius: 8, marginHorizontal: 2 },
//   activeSpeed: { backgroundColor: '#2563EB' },
//   mainBtn: { backgroundColor: '#2563EB', padding: 14, borderRadius: 10, alignItems: 'center' },
//   btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

//   routeListContainer: { backgroundColor: 'white', borderRadius: 16, padding: 16, maxHeight: '45%' },
//   listHeader: { fontWeight: 'bold', marginBottom: 10, color: '#666' },
//   routeCard: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
//   routeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   routeTime: { fontSize: 18, fontWeight: 'bold' },
//   routeSummary: { fontSize: 12, color: '#666' },
//   confBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
//   confText: { color: 'white', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },

//   // Live Screen
//   liveContainer: { flex: 1, justifyContent: 'space-between' },
//   liveHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: 'rgba(255,255,255,0.9)' },
//   backBtn: { padding: 10, marginRight: 10, backgroundColor: '#eee', borderRadius: 20 },
//   liveTitle: { fontSize: 18, fontWeight: 'bold' },
//   liveSub: { color: '#666' },
  
//   timelineCard: { flex: 1, backgroundColor: 'white', marginTop: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, elevation: 20 },
//   updateBox: { padding: 12, borderRadius: 8, marginBottom: 15 },
//   updateText: { fontWeight: 'bold', textAlign: 'center' },

//   // Timeline Item
//   timelineItem: { flexDirection: 'row', marginBottom: 20 },
//   timelineLeft: { width: 60, alignItems: 'flex-end', marginRight: 10 },
//   timeLabel: { fontSize: 12, fontWeight: 'bold', color: '#666' },
//   lineBar: { width: 2, flex: 1, backgroundColor: '#ddd', marginVertical: 4, alignSelf: 'flex-end', marginRight: 0 },
//   timelineIconContainer: { alignItems: 'center', marginRight: 10 },
//   timelineContent: { flex: 1, justifyContent: 'center' },
//   timelineTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
//   timelineDesc: { color: '#555', fontSize: 14 },
  
//   trainMarker: { padding: 6, borderRadius: 12, borderWidth: 2, borderColor: 'white', elevation: 5 },
// });

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, FlatList, ActivityIndicator, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Audio } from 'expo-av'; // 👈 AUDIO LIBRARY
import { ArrowLeft, TrainFront, Footprints, Clock, Navigation } from 'lucide-react-native';

// ⚠️ REPLACE WITH YOUR CURRENT NGROK OR IP URL
const API_BASE_URL = 'https://e819e1a93149.ngrok-free.app/api'; 

export default function App() {
  const mapRef = useRef<MapView>(null);
  const lastSpokenRef = useRef<string>(""); // Prevents repeating audio
  
  // --- APP STATE ---
  const [screen, setScreen] = useState<'search' | 'live'>('search'); 
  
  // --- DATA ---
  const [stations, setStations] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [walkingSpeed, setWalkingSpeed] = useState('normal'); 
  
  const [allRoutes, setAllRoutes] = useState<any[]>([]);
  const [activeRoute, setActiveRoute] = useState<any>(null); 
  
  const [liveConfidence, setLiveConfidence] = useState<string>('high'); 
  const [transferUpdate, setTransferUpdate] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [region, setRegion] = useState({
    latitude: 42.3601, longitude: -71.0589, latitudeDelta: 0.05, longitudeDelta: 0.05,
  });

  // --- 0. ROBUST AUDIO HELPER (ELEVENLABS) ---
  const speak = async (message: string) => {
      // Don't repeat the exact same sentence immediately
      if (message === lastSpokenRef.current) return;
      lastSpokenRef.current = message;
      
      const url = `${API_BASE_URL}/speak?text=${encodeURIComponent(message)}`;

      try {
          // 1. Try to play the audio directly
          const { sound } = await Audio.Sound.createAsync(
              { uri: url },
              { shouldPlay: true }
          );
          await sound.playAsync();
      } catch (err) { 
          // 2. IF IT FAILS: Check if Backend sent a JSON error instead of Audio
          console.log("⚠️ Audio failed to load. Checking for API error...");
          
          try {
             const res = await fetch(url);
             const contentType = res.headers.get("content-type");
             
             if (contentType && contentType.includes("application/json")) {
                 const errorData = await res.json();
                 // 🚨 PRINT THE EXACT ERROR FOR DEBUGGING
                 console.error("❌ ElevenLabs API Error:", errorData.error); 
             } else {
                 console.error("❌ Audio Player Error (Network/Format):", err);
             }
          } catch (fetchErr) {
             console.error("❌ Unknown Audio Error:", err);
          }
      }
  };

  // --- 1. INITIAL SETUP ---
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/mbta/stations`);
        const data = await res.json();
        if (data.success) setStations(data.data);
      } catch (err) {}

      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
             let loc = await Location.getCurrentPositionAsync({});
             setUserLocation(loc.coords);
        }
      } catch (e) { setUserLocation({ latitude: 42.355, longitude: -71.065 }); }
    })();
  }, []);

  // --- 2. LIVE TRACKING & AUDIO ALERTS ---
  useEffect(() => {
    if (screen !== 'live' || !activeRoute) return;

    // A. Vehicle Polling
    const summary = activeRoute.summary || "";
    const linesToTrack: string[] = [];
    if (summary.includes('Red')) linesToTrack.push('Red');
    if (summary.includes('Orange')) linesToTrack.push('Orange');
    if (summary.includes('Blue')) linesToTrack.push('Blue');
    if (summary.includes('Green')) linesToTrack.push('Green-B,Green-C,Green-D,Green-E');

    const fetchVehicles = async () => {
        if(linesToTrack.length === 0) return;
        try {
            const res = await fetch(`${API_BASE_URL}/mbta/vehicles?routes=${linesToTrack.join(',')}`);
            const data = await res.json();
            if (data.success) setVehicles(data.data);
        } catch (err) {}
    };

    // B. TARGETED TRANSFER CHECK + VOICE LOGIC
    const checkTransferSafety = async () => {
        let newConfidence = activeRoute.catch_confidence; 
        let newUpdate = "On Schedule";

        for (let i = 0; i < activeRoute.steps.length; i++) {
            const step = activeRoute.steps[i];
            
            if (step.is_transit && step.stop_id) {
                try {
                    const res = await fetch(`${API_BASE_URL}/mbta/predictions/${step.stop_id}`);
                    const data = await res.json();
                    
                    if (data.success && data.data.length > 0) {
                        const predictions = data.data;
                        const scheduledTime = step.departure_time * 1000; 
                        const now = new Date().getTime();
                        
                        let targetTrain = null;
                        let minDiff = Infinity;
                        const scheduledMinutesAway = (scheduledTime - now) / 60000;

                        // Match Scheduled vs Live
                        for(let pred of predictions) {
                            const diff = Math.abs(pred.minutes - scheduledMinutesAway);
                            if (diff < 15 && diff < minDiff) {
                                minDiff = diff;
                                targetTrain = pred;
                            }
                        }

                        if (targetTrain) {
                            const minutesAway = targetTrain.minutes;
                            
                            // IS THIS A TRANSFER?
                            if (i > 0 && activeRoute.steps[i-1].is_transit) {
                                const prevArrival = activeRoute.steps[i-1].arrival_time * 1000;
                                const msUntilArrival = prevArrival - now;
                                const minutesUntilArrival = msUntilArrival / 60000;
                                
                                const buffer = minutesAway - minutesUntilArrival;
                                
                                if (buffer < 1) {
                                    newConfidence = 'low';
                                    newUpdate = `⚠️ Missed Connection`;
                                    // 🗣️ VOICE ALERT
                                    speak("Attention. You have missed your connection. Please check for alternative routes.");
                                } else if (buffer < 4) {
                                    newConfidence = 'medium';
                                    newUpdate = `🏃 Run! Buffer: ${Math.floor(buffer)} min`;
                                    // 🗣️ VOICE ALERT
                                    speak(`Hurry! Your connecting train leaves in ${Math.floor(buffer)} minutes. Please walk faster.`);
                                } else {
                                    newUpdate = `✅ Safe Transfer: ${Math.floor(buffer)} min buffer`;
                                }
                            } 
                            // IS THIS THE FIRST TRAIN? (Walking)
                            else {
                                const walkTimeStr = activeRoute.walk_minutes || "0"; 
                                const walkMinutes = parseInt(walkTimeStr.split(' ')[0]) || 0;
                                const buffer = minutesAway - walkMinutes;

                                if (buffer < 0) {
                                    newConfidence = 'medium';
                                    newUpdate = `⚠️ Missed target. Next in ${minutesAway} min.`;
                                    // 🗣️ VOICE ALERT
                                    speak(`You missed your scheduled train. The next one arrives in ${minutesAway} minutes.`);
                                } else if (buffer < 3) {
                                    newConfidence = 'medium';
                                    newUpdate = `🏃 Hurry! Depart in ${minutesAway} min`;
                                    // 🗣️ VOICE ALERT
                                    speak(`Hurry up. Your train leaves in ${minutesAway} minutes.`);
                                }
                            }
                        }
                    }
                } catch (e) { console.log(e); }
            }
            if (newConfidence === 'low') break;
        }
        
        setLiveConfidence(newConfidence);
        setTransferUpdate(newUpdate);
    };

    fetchVehicles();
    checkTransferSafety();
    const interval = setInterval(() => {
        fetchVehicles();
        checkTransferSafety();
    }, 6000); 

    return () => clearInterval(interval);
  }, [screen, activeRoute]);


  // --- 3. SEARCH ---
  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!origin || !destination) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/directions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, walking_speed: walkingSpeed })
      });
      const data = await res.json();
      if (data.success) {
          setAllRoutes(data.data);
          if (data.data[0]?.path) fitToRoute(data.data[0].path);
      } else { alert("No route found"); }
    } catch (err) { alert("Error connecting to server"); }
    setLoading(false);
  };

  const fitToRoute = (path: any[]) => {
    const coords = path.map((c: any) => ({ latitude: c.lat, longitude: c.lng }));
    mapRef.current?.fitToCoordinates(coords, { edgePadding: { top: 100, right: 40, bottom: 400, left: 40 } });
  }

  // --- 4. NAVIGATION ---
  const startLiveNavigation = (route: any) => {
      setActiveRoute(route);
      setLiveConfidence(route.catch_confidence); 
      setScreen('live');
      fitToRoute(route.path);
      
      // 🗣️ INITIAL VOICE GREETING
      speak(`Starting navigation to ${destination}. Your route is ${route.catch_confidence === 'high' ? 'safe' : 'tight'}.`);
  };

  const exitLiveNavigation = () => {
      setScreen('search');
      setActiveRoute(null);
      setVehicles([]); 
      lastSpokenRef.current = ""; // Reset voice memory
  };

  const getConfidenceColor = (conf: string) => {
      if (conf === 'high') return '#10B981'; 
      if (conf === 'medium') return '#F59E0B'; 
      return '#EF4444'; 
  };

  const formatTime = (ts: number) => {
      if(!ts) return "";
      return new Date(ts * 1000).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'});
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
      >
        {screen === 'search' && stations.map(s => (
          <Marker key={s.id} coordinate={{ latitude: s.lat, longitude: s.lng }} title={s.name}
            pinColor={s.routes[0].includes('Red') ? '#DA291C' : s.routes[0].includes('Orange') ? '#ED8B00' : '#00843D'} />
        ))}
        {screen === 'live' && vehicles.map(v => (
            <Marker key={v.id} coordinate={{ latitude: v.lat, longitude: v.lng }} rotation={v.bearing} anchor={{x:0.5, y:0.5}}>
                <View style={[styles.trainMarker, { backgroundColor: v.route.includes('Red') ? '#DA291C' : '#00843D' }]}>
                    <TrainFront size={12} color="white"/>
                </View>
            </Marker>
        ))}
        {(screen === 'live' && activeRoute) && (
          <Polyline coordinates={activeRoute.path.map((p: any) => ({ latitude: p.lat, longitude: p.lng }))} strokeColor="#2563EB" strokeWidth={5} />
        )}
        {(screen === 'search' && allRoutes.length > 0) && (
             <Polyline coordinates={allRoutes[0].path.map((p: any) => ({ latitude: p.lat, longitude: p.lng }))} strokeColor="#9ca3af" strokeWidth={3} lineDashPattern={[5,5]}/>
        )}
      </MapView>

      {/* --- SEARCH SCREEN --- */}
      {screen === 'search' && (
          <SafeAreaView style={styles.overlay}>
            <View style={styles.card}>
                <Text style={styles.title}>Boston Transit</Text>
                <TextInput style={styles.input} placeholder="Start" value={origin} onChangeText={setOrigin} />
                <TextInput style={styles.input} placeholder="End" value={destination} onChangeText={setDestination} />
                <View style={styles.speedRow}>
                    {['slow', 'normal', 'fast'].map(s => (
                        <TouchableOpacity key={s} onPress={() => setWalkingSpeed(s)} 
                            style={[styles.speedBtn, walkingSpeed === s && styles.activeSpeed]}>
                            <Text style={{textTransform:'capitalize', color: walkingSpeed===s?'white':'black'}}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity style={styles.mainBtn} onPress={handleSearch} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>Find Routes</Text>}
                </TouchableOpacity>
            </View>

            {allRoutes.length > 0 && (
                <View style={styles.routeListContainer}>
                    <Text style={styles.listHeader}>Select a Route:</Text>
                    <FlatList 
                        data={allRoutes}
                        keyExtractor={(_,i) => i.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity style={styles.routeCard} onPress={() => startLiveNavigation(item)}>
                                <View style={styles.routeRow}>
                                    <View style={{flex: 1}}>
                                        <Text style={styles.routeTime}>{item.duration}</Text>
                                        <Text style={styles.routeSummary}>{item.summary}</Text>
                                    </View>
                                    <View style={[styles.confBadge, {backgroundColor: getConfidenceColor(item.catch_confidence)}]}>
                                        <Text style={styles.confText}>{item.catch_confidence === 'high' ? 'Safe' : item.catch_confidence === 'medium' ? 'Tight' : 'Risky'}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
          </SafeAreaView>
      )}

      {/* --- LIVE NAVIGATION SCREEN --- */}
      {screen === 'live' && activeRoute && (
          <View style={styles.liveContainer}>
              <SafeAreaView style={styles.liveHeader}>
                  <TouchableOpacity onPress={exitLiveNavigation} style={styles.backBtn}>
                      <ArrowLeft color="black" size={24}/>
                  </TouchableOpacity>
                  <View>
                      <Text style={styles.liveTitle}>Live Itinerary</Text>
                      <Text style={styles.liveSub}>Voice Alerts On</Text>
                  </View>
                  <View style={[styles.confBadge, {marginLeft: 'auto', backgroundColor: getConfidenceColor(liveConfidence)}]}>
                      <Text style={styles.confText}>{liveConfidence.toUpperCase()}</Text>
                  </View>
              </SafeAreaView>

              <View style={styles.timelineCard}>
                   {/* DYNAMIC HEADER */}
                   {transferUpdate !== '' && (
                       <View style={[styles.updateBox, {backgroundColor: liveConfidence === 'low' ? '#FFEBEE' : '#E0F2F1'}]}>
                           <Text style={[styles.updateText, {color: liveConfidence === 'low' ? '#C62828' : '#00695C'}]}>{transferUpdate}</Text>
                       </View>
                   )}

                   <FlatList
                      data={activeRoute.steps}
                      keyExtractor={(_, i) => i.toString()}
                      renderItem={({item, index}) => {
                          if(item.is_transit) {
                              return (
                                  <View style={styles.timelineItem}>
                                      <View style={styles.timelineLeft}>
                                          <Text style={styles.timeLabel}>{formatTime(item.departure_time)}</Text>
                                          <View style={styles.lineBar} />
                                          <Text style={styles.timeLabel}>{formatTime(item.arrival_time)}</Text>
                                      </View>
                                      <View style={styles.timelineIconContainer}>
                                          <TrainFront size={20} color="#2563EB" />
                                      </View>
                                      <View style={styles.timelineContent}>
                                          <Text style={styles.timelineTitle}>Ride Train</Text>
                                          <Text style={styles.timelineDesc}>{item.instruction.replace(/<[^>]*>?/gm, '')}</Text>
                                      </View>
                                  </View>
                              );
                          }
                          return (
                              <View style={styles.timelineItem}>
                                  <View style={styles.timelineLeft}>
                                       <Text style={styles.timeLabel}></Text> 
                                  </View>
                                  <View style={styles.timelineIconContainer}>
                                      {index === 0 ? <Navigation size={20} color="#666"/> : <Footprints size={20} color="#666" />}
                                  </View>
                                  <View style={styles.timelineContent}>
                                      <Text style={styles.timelineTitle}>{index === 0 ? "Start" : "Walk / Transfer"}</Text>
                                      <Text style={styles.timelineDesc}>{item.instruction.replace(/<[^>]*>?/gm, '')}</Text>
                                  </View>
                              </View>
                          );
                      }}
                   />
              </View>
          </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { ...StyleSheet.absoluteFillObject },
  overlay: { flex: 1, padding: 20, justifyContent: 'space-between' },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 16, elevation: 10, shadowColor:'#000', shadowOpacity:0.1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, marginBottom: 10 },
  speedRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  speedBtn: { flex: 1, alignItems: 'center', padding: 8, backgroundColor: '#eee', borderRadius: 8, marginHorizontal: 2 },
  activeSpeed: { backgroundColor: '#2563EB' },
  mainBtn: { backgroundColor: '#2563EB', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  routeListContainer: { backgroundColor: 'white', borderRadius: 16, padding: 16, maxHeight: '45%' },
  listHeader: { fontWeight: 'bold', marginBottom: 10, color: '#666' },
  routeCard: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  routeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeTime: { fontSize: 18, fontWeight: 'bold' },
  routeSummary: { fontSize: 12, color: '#666' },
  confBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  confText: { color: 'white', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },

  liveContainer: { flex: 1, justifyContent: 'space-between' },
  liveHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: 'rgba(255,255,255,0.9)' },
  backBtn: { padding: 10, marginRight: 10, backgroundColor: '#eee', borderRadius: 20 },
  liveTitle: { fontSize: 18, fontWeight: 'bold' },
  liveSub: { color: '#666' },
  
  timelineCard: { flex: 1, backgroundColor: 'white', marginTop: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, elevation: 20 },
  updateBox: { padding: 12, borderRadius: 8, marginBottom: 15 },
  updateText: { fontWeight: 'bold', textAlign: 'center' },

  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timelineLeft: { width: 60, alignItems: 'flex-end', marginRight: 10 },
  timeLabel: { fontSize: 12, fontWeight: 'bold', color: '#666' },
  lineBar: { width: 2, flex: 1, backgroundColor: '#ddd', marginVertical: 4, alignSelf: 'flex-end', marginRight: 0 },
  timelineIconContainer: { alignItems: 'center', marginRight: 10 },
  timelineContent: { flex: 1, justifyContent: 'center' },
  timelineTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  timelineDesc: { color: '#555', fontSize: 14 },
  
  trainMarker: { padding: 6, borderRadius: 12, borderWidth: 2, borderColor: 'white', elevation: 5 },
});