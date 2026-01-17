// // import React, { useState, useEffect, useRef } from 'react';
// // import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
// // import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// // import * as Location from 'expo-location';
// // import { X } from 'lucide-react-native';

// // // ⚠️ REPLACE THIS WITH YOUR COMPUTER'S LOCAL IP ADDRESS
// // // Example: http://192.168.1.15:5001/api
// // const API_BASE_URL = 'https://e819e1a93149.ngrok-free.app/api'; 

// // export default function App() {
// //   const mapRef =useRef<MapView>(null);
// //   const [stations, setStations] = useState<any[]>([]);
// //   const [origin, setOrigin] = useState('');
// //   const [destination, setDestination] = useState('');
// //   const [routeData, setRouteData] = useState<any>(null);
// //   const [loading, setLoading] = useState(false);
// //   const [userLocation, setUserLocation] = useState<any>(null);

// //   // Initial Region (Boston)
// //   const [region, setRegion] = useState({
// //     latitude: 42.3601,
// //     longitude: -71.0589,
// //     latitudeDelta: 0.05,
// //     longitudeDelta: 0.05,
// //   });

// //   // 1. Fetch Stations & Permission on Load
// //   useEffect(() => {
// //     (async () => {
// //       // Get Location Permission
// //       let { status } = await Location.requestForegroundPermissionsAsync();
// //       if (status === 'granted') {
// //         let location = await Location.getCurrentPositionAsync({});
// //         setUserLocation(location.coords);
// //       }

// //       // Fetch Stations from Python Backend
// //       try {
// //         const res = await fetch(`${API_BASE_URL}/mbta/stations`);
// //         const data = await res.json();
// //         if (data.success) setStations(data.data);
// //       } catch (err) {
// //         console.error("Backend Error. Check IP Address!", err);
// //       }
// //     })();
// //   }, []);

// //   // 2. Handle Route Search
// //   const handleSearch = async () => {
// //     Keyboard.dismiss();
// //     if (!origin || !destination) return;

// //     setLoading(true);
// //     try {
// //       const res = await fetch(`${API_BASE_URL}/directions`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ origin, destination })
// //       });
// //       const data = await res.json();
      
// //       if (data.success && data.data) {
// //         setRouteData(data.data);
        
// //         // Zoom map to the route
// //         const coords = data.data.path; // [{lat, lng}]
// //         // Convert to RNMaps format
// //         const mapCoords = coords.map((c: any) => ({ latitude: c.lat, longitude: c.lng }));
        
// //         if (mapRef.current) {
// //           mapRef.current.fitToCoordinates(mapCoords, {
// //             edgePadding: { top: 50, right: 20, bottom: 300, left: 20 },
// //             animated: true,
// //           });
// //         }
// //       }
// //     } catch (err) {
// //       if (err instanceof Error) {
// //         alert("Technical Error: " + err.message);
// //       } else {
// //         alert("Technical Error: " + String(err));
// //       }
// //     }
// //     setLoading(false);
// //   };

// //   return (
// //     <View style={styles.container}>
      
// //       {/* MAP BACKGROUND */}
// //       <MapView
// //         ref={mapRef}
// //         style={styles.map}
// //         provider={PROVIDER_GOOGLE}
// //         initialRegion={region}
// //         showsUserLocation={true}
// //       >
// //         {/* Draw Stations */}
// //         {stations.map(station => (
// //           <Marker
// //             key={station.id}
// //             coordinate={{ latitude: station.lat, longitude: station.lng }}
// //             title={station.name}
// //             pinColor={station.routes[0] === 'Red' ? 'red' : station.routes[0] === 'Orange' ? 'orange' : 'green'}
// //           />
// //         ))}

// //         {/* Draw Route Line */}
// //         {routeData && (
// //           <Polyline
// //             coordinates={routeData.path.map((p: any) => ({ latitude: p.lat, longitude: p.lng }))}
// //             strokeColor="#2563EB"
// //             strokeWidth={4}
// //           />
// //         )}
// //       </MapView>

// //       {/* FLOATING SEARCH PANEL */}
// //       <SafeAreaView style={styles.searchContainer}>
// //         <View style={styles.card}>
// //           <Text style={styles.title}>Trip Planner</Text>
          
// //           <View style={styles.inputRow}>
// //             <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
// //             <TextInput
// //               style={styles.input}
// //               placeholder="Start Location"
// //               value={origin}
// //               onChangeText={setOrigin}
// //               placeholderTextColor="#999"
// //             />
// //           </View>

// //           <View style={styles.inputRow}>
// //             <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
// //             <TextInput
// //               style={styles.input}
// //               placeholder="Destination"
// //               value={destination}
// //               onChangeText={setDestination}
// //               placeholderTextColor="#999"
// //             />
// //           </View>

// //           <TouchableOpacity style={styles.button} onPress={handleSearch} disabled={loading}>
// //             {loading ? (
// //               <ActivityIndicator color="#fff" />
// //             ) : (
// //               <Text style={styles.buttonText}>Get Directions</Text>
// //             )}
// //           </TouchableOpacity>
// //         </View>
// //       </SafeAreaView>

// //       {/* BOTTOM SHEET RESULTS */}
// //       {routeData && (
// //         <View style={styles.resultsSheet}>
// //           <View style={styles.resultHeader}>
// //             <View>
// //               <Text style={styles.timeText}>{routeData.duration}</Text>
// //               <Text style={styles.distText}>{routeData.distance}</Text>
// //             </View>
// //             <TouchableOpacity onPress={() => setRouteData(null)}>
// //               <View style={styles.closeBtn}>
// //                  <X size={20} color="#000" />
// //               </View>
// //             </TouchableOpacity>
// //           </View>

// //           <FlatList
// //             data={routeData.steps}
// //             keyExtractor={(_, i) => i.toString()}
// //             style={{ marginTop: 10 }}
// //             renderItem={({ item, index }) => (
// //               <View style={styles.stepItem}>
// //                 <Text style={styles.stepIndex}>{index + 1}.</Text>
// //                 {/* HTML Stripping for clean text */}
// //                 <Text style={styles.stepText}>
// //                   {item.instruction.replace(/<[^>]*>?/gm, '')}
// //                 </Text>
// //               </View>
// //             )}
// //           />
// //         </View>
// //       )}
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1 },
// //   map: { width: '100%', height: '100%' },
  
// //   searchContainer: {
// //     position: 'absolute',
// //     top: 60, // Adjusted for SafeArea
// //     width: '100%',
// //     paddingHorizontal: 20,
// //     zIndex: 10,
// //   },
// //   card: {
// //     backgroundColor: 'white',
// //     borderRadius: 16,
// //     padding: 16,
// //     shadowColor: '#000',
// //     shadowOpacity: 0.1,
// //     shadowRadius: 10,
// //     elevation: 5,
// //   },
// //   title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
// //   inputRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginBottom: 10,
// //     backgroundColor: '#F3F4F6',
// //     borderRadius: 8,
// //     paddingHorizontal: 10,
// //   },
// //   dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
// //   input: {
// //     flex: 1,
// //     height: 44,
// //     fontSize: 16,
// //     color: '#000'
// //   },
// //   button: {
// //     backgroundColor: '#2563EB',
// //     borderRadius: 10,
// //     height: 48,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginTop: 5,
// //   },
// //   buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

// //   resultsSheet: {
// //     position: 'absolute',
// //     bottom: 0,
// //     width: '100%',
// //     height: '40%',
// //     backgroundColor: 'white',
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //     padding: 20,
// //     shadowColor: '#000',
// //     shadowOpacity: 0.1,
// //     shadowRadius: 10,
// //     elevation: 10,
// //   },
// //   resultHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'flex-start',
// //     marginBottom: 10,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#eee',
// //     paddingBottom: 10,
// //   },
// //   timeText: { fontSize: 24, fontWeight: 'bold', color: '#2563EB' },
// //   distText: { fontSize: 14, color: '#666' },
// //   closeBtn: { padding: 5, backgroundColor: '#eee', borderRadius: 15 },
// //   stepItem: { flexDirection: 'row', marginBottom: 12, paddingRight: 10 },
// //   stepIndex: { fontWeight: 'bold', color: '#2563EB', marginRight: 8, width: 25 },
// //   stepText: { flex: 1, color: '#333', lineHeight: 20 },
// // });
// import React, { useState, useEffect, useRef } from 'react';
// import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, FlatList, ActivityIndicator, SafeAreaView, ScrollView, Dimensions } from 'react-native';
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// import * as Location from 'expo-location';
// import { X, Train, Clock, MapPin } from 'lucide-react-native';



// const API_BASE_URL = 'https://e819e1a93149.ngrok-free.app/api';

// const { width } = Dimensions.get('window');

// export default function App() {
//   const mapRef = useRef<MapView>(null);
  
//   // --- STATE ---
//   const [stations, setStations] = useState<any[]>([]);
//   const [vehicles, setVehicles] = useState<any[]>([]); // 🚇 Live Trains
//   const [origin, setOrigin] = useState('');
//   const [destination, setDestination] = useState('');
  
//   // Route Data (Now handles Multiple Routes)
//   const [allRoutes, setAllRoutes] = useState<any[]>([]);
//   const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  
//   // Station Predictions (Arrivals Board)
//   const [selectedStation, setSelectedStation] = useState<any>(null);
//   const [predictions, setPredictions] = useState<any[]>([]);
  
//   const [loading, setLoading] = useState(false);
//   const [userLocation, setUserLocation] = useState<any>(null);

//   // Initial Region (Boston)
//   const [region, setRegion] = useState({
//     latitude: 42.3601,
//     longitude: -71.0589,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   });

//   // --- 1. INITIAL FETCH & LIVE VEHICLE POLLING ---
//   useEffect(() => {
//     (async () => {
//       // Permission & Location
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status === 'granted') {
//         let location = await Location.getCurrentPositionAsync({});
//         setUserLocation(location.coords);
//       }

//       // Fetch Static Stations
//       try {
//         const res = await fetch(`${API_BASE_URL}/mbta/stations`);
//         const data = await res.json();
//         if (data.success) setStations(data.data);
//       } catch (err) {
//         console.error("Station Fetch Error:", err);
//       }
//     })();

//     // 🔄 POLL LIVE TRAINS (Every 5 Seconds)
//     const fetchVehicles = async () => {
//       try {
//         const res = await fetch(`${API_BASE_URL}/mbta/vehicles`);
//         const data = await res.json();
//         if (data.success) setVehicles(data.data);
//       } catch (err) {
//         console.log("Vehicle Sync Error (Check Server):", err);
//       }
//     };

//     fetchVehicles(); // Run once immediately
//     const interval = setInterval(fetchVehicles, 5000); // Loop
//     return () => clearInterval(interval); // Cleanup
//   }, []);

//   // --- 2. HANDLE SEARCH (MULTIPLE ROUTES) ---
//   const handleSearch = async () => {
//     Keyboard.dismiss();
//     setRouteData(null); // Clear previous
//     setSelectedStation(null); // Close prediction board if open
    
//     if (!origin || !destination) return;

//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE_URL}/directions`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ origin, destination })
//       });
//       const data = await res.json();
      
//       if (data.success && data.data) {
//         // Handle List of Routes
//         const routes = Array.isArray(data.data) ? data.data : [data.data];
//         setAllRoutes(routes);
//         setSelectedRouteIndex(0); // Default to first route

//         // Zoom to the first route
//         if (routes.length > 0) {
//             const coords = routes[0].path.map((c: any) => ({ latitude: c.lat, longitude: c.lng }));
//             mapRef.current?.fitToCoordinates(coords, {
//                 edgePadding: { top: 100, right: 40, bottom: 400, left: 40 },
//                 animated: true,
//             });
//         }
//       } else {
//         alert("No route found: " + (data.error || "Unknown error"));
//       }
//     } catch (err: any) {
//       alert("Network Error: " + err.message);
//     }
//     setLoading(false);
//   };

//   // --- 3. FETCH PREDICTIONS (ON STATION CLICK) ---
//   const fetchPredictions = async (station: any) => {
//     setSelectedStation(station);
//     setPredictions([]); // Clear old data
//     // Close route view to focus on station
//     setAllRoutes([]); 

//     try {
//         const res = await fetch(`${API_BASE_URL}/mbta/predictions/${station.id}`);
//         const data = await res.json();
//         if (data.success) setPredictions(data.data);
//     } catch (err) {
//         console.error("Prediction Error", err);
//     }
//   };

//   // Helper to get current route data safely
//   const currentRoute = allRoutes.length > 0 ? allRoutes[selectedRouteIndex] : null;

//   // Helper to set route data to null (replacing setRouteData(null))
//   const setRouteData = (val: any) => {
//     if (val === null) setAllRoutes([]);
//   }

//   return (
//     <View style={styles.container}>
      
//       {/* --- MAP VIEW --- */}
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         provider={PROVIDER_GOOGLE}
//         initialRegion={region}
//         showsUserLocation={true}
//         onPress={() => Keyboard.dismiss()}
//       >
//         {/* 1. STATION MARKERS (Clickable) */}
//         {stations.map(station => (
//           <Marker
//             key={station.id}
//             coordinate={{ latitude: station.lat, longitude: station.lng }}
//             title={station.name}
//             // Color code pins by line
//             pinColor={
//                 station.routes[0].includes('Red') ? '#DA291C' : 
//                 station.routes[0].includes('Orange') ? '#ED8B00' : 
//                 station.routes[0].includes('Blue') ? '#003DA5' : '#00843D'
//             }
//             onPress={() => fetchPredictions(station)}
//           />
//         ))}

//         {/* 2. LIVE TRAIN MARKERS (Moving) */}
//         {vehicles.map((train) => (
//             <Marker
//                 key={train.id}
//                 coordinate={{ latitude: train.lat, longitude: train.lng }}
//                 rotation={train.bearing}
//                 anchor={{ x: 0.5, y: 0.5 }}
//                 title={`${train.route} Line`}
//                 zIndex={10} // Put trains above stations
//             >
//                 <View style={[styles.trainMarker, {
//                     backgroundColor: train.route.includes('Red') ? '#DA291C' : 
//                                    train.route.includes('Orange') ? '#ED8B00' : 
//                                    train.route.includes('Blue') ? '#003DA5' : '#00843D'
//                 }]}>
//                     <Text style={{fontSize: 12}}>🚇</Text>
//                 </View>
//             </Marker>
//         ))}

//         {/* 3. ROUTE POLYLINE (Updates on Tab Click) */}
//         {currentRoute && (
//           <Polyline
//             coordinates={currentRoute.path.map((p: any) => ({ latitude: p.lat, longitude: p.lng }))}
//             strokeColor="#2563EB"
//             strokeWidth={5}
//           />
//         )}
//       </MapView>

//       {/* --- SEARCH BOX --- */}
//       <SafeAreaView style={styles.searchContainer}>
//         <View style={styles.card}>
//           <Text style={styles.title}>Boston Transit</Text>
//           <View style={styles.inputRow}>
//             <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
//             <TextInput style={styles.input} placeholder="Start (e.g. Ashmont)" value={origin} onChangeText={setOrigin} />
//           </View>
//           <View style={styles.inputRow}>
//             <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
//             <TextInput style={styles.input} placeholder="End (e.g. Harvard)" value={destination} onChangeText={setDestination} />
//           </View>
//           <TouchableOpacity style={styles.button} onPress={handleSearch} disabled={loading}>
//             {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Find Route</Text>}
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>

      
//       {/* --- BOTTOM SHEET A: ROUTE RESULTS --- */}
//       {currentRoute && (
//         <View style={styles.resultsSheet}>
            
//             {/* 1. UPDATED TABS: Show Departure Time & Duration */}
//             {allRoutes.length > 1 && (
//                 <View style={styles.routeTabs}>
//                     <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                         {allRoutes.map((route, idx) => {
//                             // Extract just the start time (e.g. "2:15 PM") from the range
//                             const startTime = route.time_range ? route.time_range.split('–')[0].trim() : "Now";
                            
//                             return (
//                                 <TouchableOpacity 
//                                     key={idx}
//                                     onPress={() => setSelectedRouteIndex(idx)}
//                                     style={[styles.tab, selectedRouteIndex === idx && styles.activeTab]}
//                                 >
//                                     <View style={{alignItems: 'center'}}>
//                                         <Text style={[styles.tabText, selectedRouteIndex === idx && styles.activeTabText, {fontWeight: 'bold'}]}>
//                                             {startTime}
//                                         </Text>
//                                         <Text style={[styles.tabText, selectedRouteIndex === idx && styles.activeTabText, {fontSize: 10}]}>
//                                             {route.duration}
//                                         </Text>
//                                     </View>
//                                 </TouchableOpacity>
//                             );
//                         })}
//                     </ScrollView>
//                 </View>
//             )}

//             {/* 2. UPDATED HEADER: Show Full Time Range (2:15 PM - 2:45 PM) */}
//             <View style={styles.resultHeader}>
//                 <View>
//                     <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
//                         <Text style={styles.timeText}>{currentRoute.duration}</Text>
//                         {currentRoute.time_range && (
//                             <Text style={{marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#444'}}>
//                                 {currentRoute.time_range}
//                             </Text>
//                         )}
//                     </View>
//                     <Text style={styles.distText}>{currentRoute.distance} • {currentRoute.summary}</Text>
//                 </View>
//                 <TouchableOpacity onPress={() => setAllRoutes([])}>
//                     <View style={styles.closeBtn}><X size={20} color="#000" /></View>
//                 </TouchableOpacity>
//             </View>

//             {/* Steps List (Unchanged) */}
//             <FlatList
//                 data={currentRoute.steps}
//                 keyExtractor={(_, i) => i.toString()}
//                 renderItem={({ item, index }) => (
//                 <View style={styles.stepItem}>
//                     <Text style={styles.stepIndex}>{index + 1}.</Text>
//                     <Text style={styles.stepText}>
//                         {item.instruction.replace(/<[^>]*>?/gm, '')}
//                     </Text>
//                 </View>
//                 )}
//             />
//         </View>
//       )}

//       {/* --- BOTTOM SHEET B: STATION ARRIVALS (PREDICTIONS) --- */}
//       {selectedStation && (
//           <View style={[styles.resultsSheet, { height: 350 }]}>
//               <View style={styles.resultHeader}>
//                 <View style={{flexDirection:'row', alignItems:'center'}}>
//                     <MapPin color="red" size={24} style={{marginRight: 8}}/>
//                     <Text style={styles.stationTitle}>{selectedStation.name}</Text>
//                 </View>
//                 <TouchableOpacity onPress={() => setSelectedStation(null)}>
//                     <View style={styles.closeBtn}><X size={20} color="#000" /></View>
//                 </TouchableOpacity>
//               </View>

//               <Text style={{color:'#666', marginBottom:10}}>Live Arrivals:</Text>
              
//               {predictions.length === 0 ? (
//                   <ActivityIndicator color="#2563EB" style={{marginTop: 20}}/>
//               ) : (
//                 <FlatList 
//                     data={predictions}
//                     keyExtractor={(item) => item.id}
//                     renderItem={({item}) => (
//                         <View style={styles.predictionRow}>
//                             <View style={[styles.badge, {
//                                 backgroundColor: item.route.includes('Red') ? '#DA291C' : 
//                                                item.route.includes('Orange') ? '#ED8B00' : 
//                                                item.route.includes('Blue') ? '#003DA5' : '#00843D'
//                             }]}>
//                                 <Text style={styles.badgeText}>{item.route}</Text>
//                             </View>
//                             <Text style={styles.predDest}>{item.direction}</Text>
//                             <View style={{alignItems:'flex-end'}}>
//                                 <Text style={styles.predTime}>{item.minutes} min</Text>
//                                 <Text style={{fontSize:10, color:'#999'}}>{item.status}</Text>
//                             </View>
//                         </View>
//                     )}
//                 />
//               )}
//           </View>
//       )}

//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { width: '100%', height: '100%' },
  
//   // Search
//   searchContainer: { position: 'absolute', top: 50, width: '100%', paddingHorizontal: 20, zIndex: 10 },
//   card: { backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
//   title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
//   inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 10 },
//   dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
//   input: { flex: 1, height: 44, fontSize: 16, color: '#000' },
//   button: { backgroundColor: '#2563EB', borderRadius: 10, height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 5 },
//   buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

//   // Markers
//   trainMarker: { padding: 4, borderRadius: 12, borderWidth: 1.5, borderColor: 'white', elevation: 4 },

//   // Bottom Sheet
//   resultsSheet: { position: 'absolute', bottom: 0, width: '100%', height: '45%', backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, shadowColor: '#000', elevation: 20 },
//   resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
//   closeBtn: { padding: 5, backgroundColor: '#f0f0f0', borderRadius: 15 },
  
//   // Route Info
//   timeText: { fontSize: 24, fontWeight: 'bold', color: '#2563EB' },
//   distText: { fontSize: 14, color: '#666', marginTop: 2 },
  
//   // Steps
//   stepItem: { flexDirection: 'row', marginBottom: 12, paddingRight: 10 },
//   stepIndex: { fontWeight: 'bold', color: '#2563EB', marginRight: 8, width: 25 },
//   stepText: { flex: 1, color: '#333', lineHeight: 20 },

//   // Multi-Route Tabs
//   routeTabs: { flexDirection: 'row', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
//   tab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
//   activeTab: { backgroundColor: '#2563EB' },
//   tabText: { color: '#666', fontWeight: '600', fontSize: 12 },
//   activeTabText: { color: 'white' },

//   // Prediction Board
//   stationTitle: { fontSize: 22, fontWeight: 'bold' },
//   predictionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
//   badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 10, width: 60, alignItems:'center' },
//   badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
//   predDest: { flex: 1, fontSize: 16, fontWeight: '500' },
//   predTime: { fontSize: 18, fontWeight: 'bold', color: '#333' },
// });
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, FlatList, ActivityIndicator, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { X, MapPin } from 'lucide-react-native';

// ⚠️ REPLACE WITH YOUR CURRENT NGROK OR IP URL
const API_BASE_URL = 'https://e819e1a93149.ngrok-free.app/api'; 

const { width } = Dimensions.get('window');

export default function App() {
  const mapRef = useRef<MapView>(null);
  
  // --- STATE ---
  const [stations, setStations] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]); // 🚇 Live Trains
  
  // Search Inputs
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [walkingSpeed, setWalkingSpeed] = useState('normal'); // 'slow', 'normal', 'fast'
  
  // Route Data (Multiple Routes)
  const [allRoutes, setAllRoutes] = useState<any[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  
  // Station Predictions (Arrivals Board)
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);

  // Initial Region (Boston)
  const [region, setRegion] = useState({
    latitude: 42.3601,
    longitude: -71.0589,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // --- 1. INITIAL FETCH & LIVE VEHICLE POLLING ---
  useEffect(() => {
    (async () => {
      // Permission & Location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      }

      // Fetch Static Stations
      try {
        const res = await fetch(`${API_BASE_URL}/mbta/stations`);
        const data = await res.json();
        if (data.success) setStations(data.data);
      } catch (err) {
        console.error("Station Fetch Error:", err);
      }
    })();

    // 🔄 POLL LIVE TRAINS (Every 5 Seconds)
    const fetchVehicles = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/mbta/vehicles`);
        const data = await res.json();
        if (data.success) setVehicles(data.data);
      } catch (err) {
        console.log("Vehicle Sync Error:", err);
      }
    };

    fetchVehicles(); // Run once immediately
    const interval = setInterval(fetchVehicles, 5000); // Loop
    return () => clearInterval(interval); // Cleanup
  }, []);

  // --- 2. HANDLE SEARCH (WITH SPEED FILTER) ---
  const handleSearch = async () => {
    Keyboard.dismiss();
    setRouteData(null); // Clear previous
    setSelectedStation(null); // Close prediction board
    
    if (!origin || !destination) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/directions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            origin, 
            destination,
            walking_speed: walkingSpeed // 👈 SEND SPEED PREFERENCE
        })
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        const routes = Array.isArray(data.data) ? data.data : [data.data];
        setAllRoutes(routes);
        setSelectedRouteIndex(0);

        // Zoom to route
        if (routes.length > 0) {
            const coords = routes[0].path.map((c: any) => ({ latitude: c.lat, longitude: c.lng }));
            mapRef.current?.fitToCoordinates(coords, {
                edgePadding: { top: 100, right: 40, bottom: 400, left: 40 },
                animated: true,
            });
        }
      } else {
        alert("No route found: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Network Error: " + err.message);
    }
    setLoading(false);
  };

  // --- 3. FETCH PREDICTIONS (ON STATION CLICK) ---
  const fetchPredictions = async (station: any) => {
    setSelectedStation(station);
    setPredictions([]); 
    setAllRoutes([]); 

    try {
        const res = await fetch(`${API_BASE_URL}/mbta/predictions/${station.id}`);
        const data = await res.json();
        if (data.success) setPredictions(data.data);
    } catch (err) {
        console.error("Prediction Error", err);
    }
  };

  const currentRoute = allRoutes.length > 0 ? allRoutes[selectedRouteIndex] : null;

  const setRouteData = (val: any) => {
    if (val === null) setAllRoutes([]);
  }

  return (
    <View style={styles.container}>
      
      {/* --- MAP VIEW --- */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={true}
        onPress={() => Keyboard.dismiss()}
      >
        {/* STATION MARKERS */}
        {stations.map(station => (
          <Marker
            key={station.id}
            coordinate={{ latitude: station.lat, longitude: station.lng }}
            title={station.name}
            pinColor={
                station.routes[0].includes('Red') ? '#DA291C' : 
                station.routes[0].includes('Orange') ? '#ED8B00' : 
                station.routes[0].includes('Blue') ? '#003DA5' : '#00843D'
            }
            onPress={() => fetchPredictions(station)}
          />
        ))}

        {/* LIVE TRAIN MARKERS */}
        {vehicles.map((train) => (
            <Marker
                key={train.id}
                coordinate={{ latitude: train.lat, longitude: train.lng }}
                rotation={train.bearing}
                anchor={{ x: 0.5, y: 0.5 }}
                title={`${train.route} Line`}
                zIndex={10} 
            >
                <View style={[styles.trainMarker, {
                    backgroundColor: train.route.includes('Red') ? '#DA291C' : 
                                   train.route.includes('Orange') ? '#ED8B00' : 
                                   train.route.includes('Blue') ? '#003DA5' : '#00843D'
                }]}>
                    <Text style={{fontSize: 12}}>🚇</Text>
                </View>
            </Marker>
        ))}

        {/* ROUTE POLYLINE */}
        {currentRoute && (
          <Polyline
            coordinates={currentRoute.path.map((p: any) => ({ latitude: p.lat, longitude: p.lng }))}
            strokeColor="#2563EB"
            strokeWidth={5}
          />
        )}
      </MapView>

      {/* --- SEARCH BOX --- */}
      <SafeAreaView style={styles.searchContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Boston Transit</Text>
          <View style={styles.inputRow}>
            <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
            <TextInput style={styles.input} placeholder="Start (e.g. Ashmont)" value={origin} onChangeText={setOrigin} />
          </View>
          <View style={styles.inputRow}>
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
            <TextInput style={styles.input} placeholder="End (e.g. Harvard)" value={destination} onChangeText={setDestination} />
          </View>

          {/* WALKING SPEED TOGGLE */}
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}}>
            {['slow', 'normal', 'fast'].map((speed) => (
                <TouchableOpacity 
                    key={speed}
                    onPress={() => setWalkingSpeed(speed)}
                    style={{
                        flex: 1,
                        paddingVertical: 8,
                        marginHorizontal: 4,
                        backgroundColor: walkingSpeed === speed ? '#2563EB' : '#F3F4F6',
                        borderRadius: 8,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{
                        color: walkingSpeed === speed ? 'white' : 'black',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                    }}>
                        {speed === 'slow' ? '🐢 Slow' : speed === 'fast' ? '🐇 Fast' : '🚶 Normal'}
                    </Text>
                </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSearch} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Find Route</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      
      {/* --- BOTTOM SHEET A: ROUTE RESULTS --- */}
      {currentRoute && (
        <View style={styles.resultsSheet}>
            
            {/* 1. TABS: Show Arrival Time (The Goal) */}
            {allRoutes.length > 1 && (
                <View style={styles.routeTabs}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {allRoutes.map((route, idx) => {
                            // Extract End Time from range "5:00 PM – 5:30 PM"
                            const arrivalTime = route.time_range.split('–')[1]?.trim() || "End";
                            
                            return (
                                <TouchableOpacity 
                                    key={idx}
                                    onPress={() => setSelectedRouteIndex(idx)}
                                    style={[styles.tab, selectedRouteIndex === idx && styles.activeTab]}
                                >
                                    <View style={{alignItems: 'center'}}>
                                        <Text style={[styles.tabText, selectedRouteIndex === idx && styles.activeTabText, {fontWeight: 'bold'}]}>
                                            Arrive {arrivalTime}
                                        </Text>
                                        <Text style={[styles.tabText, selectedRouteIndex === idx && styles.activeTabText, {fontSize: 10}]}>
                                            {route.duration}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* 2. HEADER: Show Station ETA & Time Range */}
            <View style={styles.resultHeader}>
                <View>
                    <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
                        <Text style={styles.timeText}>{currentRoute.duration}</Text>
                        {currentRoute.time_range && (
                            <Text style={{marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#444'}}>
                                ({currentRoute.time_range})
                            </Text>
                        )}
                    </View>
                    
                    {/* ⚠️ STATION ETA WARNING */}
                    <Text style={{color: '#d32f2f', fontWeight: 'bold', marginTop: 4, fontSize: 14}}>
                        {currentRoute.station_eta}
                    </Text>

                    <Text style={styles.distText}>{currentRoute.distance} • {currentRoute.summary}</Text>
                </View>
                <TouchableOpacity onPress={() => setAllRoutes([])}>
                    <View style={styles.closeBtn}><X size={20} color="#000" /></View>
                </TouchableOpacity>
            </View>

            {/* Steps List */}
            <FlatList
                data={currentRoute.steps}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item, index }) => (
                <View style={styles.stepItem}>
                    <Text style={styles.stepIndex}>{index + 1}.</Text>
                    <Text style={styles.stepText}>
                        {item.instruction.replace(/<[^>]*>?/gm, '')}
                    </Text>
                </View>
                )}
            />
        </View>
      )}

      {/* --- BOTTOM SHEET B: STATION ARRIVALS (PREDICTIONS) --- */}
      {selectedStation && (
          <View style={[styles.resultsSheet, { height: 350 }]}>
              <View style={styles.resultHeader}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <MapPin color="red" size={24} style={{marginRight: 8}}/>
                    <Text style={styles.stationTitle}>{selectedStation.name}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedStation(null)}>
                    <View style={styles.closeBtn}><X size={20} color="#000" /></View>
                </TouchableOpacity>
              </View>

              <Text style={{color:'#666', marginBottom:10}}>Live Arrivals:</Text>
              
              {predictions.length === 0 ? (
                  <ActivityIndicator color="#2563EB" style={{marginTop: 20}}/>
              ) : (
                <FlatList 
                    data={predictions}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => (
                        <View style={styles.predictionRow}>
                            <View style={[styles.badge, {
                                backgroundColor: item.route.includes('Red') ? '#DA291C' : 
                                               item.route.includes('Orange') ? '#ED8B00' : 
                                               item.route.includes('Blue') ? '#003DA5' : '#00843D'
                            }]}>
                                <Text style={styles.badgeText}>{item.route}</Text>
                            </View>
                            <Text style={styles.predDest}>{item.direction}</Text>
                            <View style={{alignItems:'flex-end'}}>
                                <Text style={styles.predTime}>{item.minutes} min</Text>
                                <Text style={{fontSize:10, color:'#999'}}>{item.status}</Text>
                            </View>
                        </View>
                    )}
                />
              )}
          </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  
  // Search
  searchContainer: { position: 'absolute', top: 50, width: '100%', paddingHorizontal: 20, zIndex: 10 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  input: { flex: 1, height: 44, fontSize: 16, color: '#000' },
  button: { backgroundColor: '#2563EB', borderRadius: 10, height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 5 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // Markers
  trainMarker: { padding: 4, borderRadius: 12, borderWidth: 1.5, borderColor: 'white', elevation: 4 },

  // Bottom Sheet
  resultsSheet: { position: 'absolute', bottom: 0, width: '100%', height: '45%', backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, shadowColor: '#000', elevation: 20 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  closeBtn: { padding: 5, backgroundColor: '#f0f0f0', borderRadius: 15 },
  
  // Route Info
  timeText: { fontSize: 24, fontWeight: 'bold', color: '#2563EB' },
  distText: { fontSize: 14, color: '#666', marginTop: 2 },
  
  // Steps
  stepItem: { flexDirection: 'row', marginBottom: 12, paddingRight: 10 },
  stepIndex: { fontWeight: 'bold', color: '#2563EB', marginRight: 8, width: 25 },
  stepText: { flex: 1, color: '#333', lineHeight: 20 },

  // Multi-Route Tabs
  routeTabs: { flexDirection: 'row', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  tab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
  activeTab: { backgroundColor: '#2563EB' },
  tabText: { color: '#666', fontWeight: '600', fontSize: 12 },
  activeTabText: { color: 'white' },

  // Prediction Board
  stationTitle: { fontSize: 22, fontWeight: 'bold' },
  predictionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 10, width: 60, alignItems:'center' },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  predDest: { flex: 1, fontSize: 16, fontWeight: '500' },
  predTime: { fontSize: 18, fontWeight: 'bold', color: '#333' },
});