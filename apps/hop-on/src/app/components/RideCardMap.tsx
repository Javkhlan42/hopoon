'use client';

import React, { useCallback, useState } from 'react';
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

interface RideCardMapProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}

const containerStyle = {
  width: '100%',
  height: '100px',
  borderRadius: '8px',
};

export function RideCardMap({ origin, destination }: RideCardMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Calculate and fit bounds
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(origin.lat, origin.lng));
    bounds.extend(new google.maps.LatLng(destination.lat, destination.lng));
    map.fitBounds(bounds);
  }, [origin, destination]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Load directions
  React.useEffect(() => {
    if (!isLoaded) return;

    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        }
      }
    );
  }, [isLoaded, origin, destination]);

  if (!isLoaded) {
    return (
      <div 
        className="w-full bg-gray-50 rounded-lg flex items-center justify-center"
        style={{ height: '100px' }}
      >
        <div className="text-xs text-gray-400">Ачааллаж байна...</div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-sm">
      <GoogleMap
        mapContainerStyle={containerStyle}
        zoom={8}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          disableDefaultUI: true,
        }}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: '#00AFF5',
                strokeWeight: 3,
                strokeOpacity: 0.7,
              },
              suppressMarkers: false,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
