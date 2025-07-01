/**
 * Live Job Map Component
 * 
 * This component displays job locations on a Google Map for mechanics.
 * - Fetches active job locations from Firebase
 * - Renders markers for each job
 * - Centers map on mechanic's current location (future enhancement)
 * - Provides basic map controls (zoom, pan)
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { loadGoogleMapsScript, subscribeToJobLocations } from '../services/mapService';

const LiveJobMap = ({ mechanicId }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobMarkers, setJobMarkers] = useState({}); // Stores Google Maps Marker objects

  useEffect(() => {
    const initMap = async () => {
      try {
        await loadGoogleMapsScript();
        const googleMap = new window.google.maps.Map(mapRef.current, {
          center: { lat: 35.45, lng: -94.78 }, // Default center (Sallisaw, OK)
          zoom: 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        setMap(googleMap);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        setLoading(false);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!map || !mechanicId) return;

    const unsubscribe = subscribeToJobLocations(mechanicId, (locations) => {
      // Remove old markers that are no longer in the locations list
      const newJobMarkers = {};
      Object.keys(jobMarkers).forEach(jobId => {
        if (!locations.some(loc => loc.id === jobId)) {
          jobMarkers[jobId].setMap(null); // Remove marker from map
        }
      });

      // Add or update new markers
      locations.forEach(job => {
        const position = new window.google.maps.LatLng(job.latitude, job.longitude);
        if (jobMarkers[job.id]) {
          // Update existing marker position
          jobMarkers[job.id].setPosition(position);
          jobMarkers[job.id].setTitle(job.title);
          jobMarkers[job.id].setLabel({
            text: job.status.charAt(0).toUpperCase(),
            color: 'white',
            fontWeight: 'bold',
          });
          jobMarkers[job.id].setIcon({
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: getStatusColor(job.status),
            fillOpacity: 0.9,
            strokeWeight: 0,
            scale: 10,
          });
          newJobMarkers[job.id] = jobMarkers[job.id];
        } else {
          // Create new marker
          const marker = new window.google.maps.Marker({
            position: position,
            map: map,
            title: job.title,
            label: {
              text: job.status.charAt(0).toUpperCase(),
              color: 'white',
              fontWeight: 'bold',
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: getStatusColor(job.status),
              fillOpacity: 0.9,
              strokeWeight: 0,
              scale: 10,
            },
          });
          newJobMarkers[job.id] = marker;
        }
      });
      setJobMarkers(newJobMarkers);
    });

    return () => unsubscribe();
  }, [map, mechanicId, jobMarkers]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFC107'; // Amber
      case 'in_progress':
        return '#2196F3'; // Blue
      case 'completed':
        return '#4CAF50'; // Green
      case 'cancelled':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View ref={mapRef} style={styles.map} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default LiveJobMap;

