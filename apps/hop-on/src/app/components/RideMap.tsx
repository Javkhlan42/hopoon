'use client';

import React, { useCallback, useState } from 'react';
import { GoogleMap, DirectionsRenderer, Marker, useJsApiLoader } from '@react-google-maps/api';

interface RideMapProps {
  rides: Array<{
    id: string;
    origin: { lat: number; lng: number; address: string };
    destination: { lat: number; lng: number; address: string };
    driverName: string;
    price: number;
  }>;
  selectedRideId?: string;
  onRideSelect?: (rideId: string) => void;
}

const containerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
  lat: 47.9184,
  lng: 106.9177, // Ulaanbaatar coordinates
};

export function RideMap({ rides, selectedRideId, onRideSelect }: RideMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<{ [key: string]: google.maps.DirectionsResult }>({});

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Calculate bounds to fit all rides
    if (rides.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      rides.forEach(ride => {
        bounds.extend(new google.maps.LatLng(ride.origin.lat, ride.origin.lng));
        bounds.extend(new google.maps.LatLng(ride.destination.lat, ride.destination.lng));
      });
      map.fitBounds(bounds);
    }
  }, [rides]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Load directions for all rides
  React.useEffect(() => {
    if (!isLoaded || rides.length === 0) return;

    const directionsService = new google.maps.DirectionsService();
    const newDirections: { [key: string]: google.maps.DirectionsResult } = {};

    rides.forEach((ride) => {
      directionsService.route(
        {
          origin: new google.maps.LatLng(ride.origin.lat, ride.origin.lng),
          destination: new google.maps.LatLng(ride.destination.lat, ride.destination.lng),
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            newDirections[ride.id] = result;
            setDirections(prev => ({ ...prev, [ride.id]: result }));
          }
        }
      );
    });
  }, [isLoaded, rides]);

  if (loadError) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Google Maps ачаалахад алдаа гарлаа</p>
          <p className="text-sm text-gray-600">API key-г шалгана уу</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600">Газрын зураг ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border shadow-md">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Render directions for selected ride or all rides */}
        {rides.map((ride) => {
          const isSelected = selectedRideId ? ride.id === selectedRideId : true;
          const direction = directions[ride.id];

          if (!direction || !isSelected) return null;

          return (
            <DirectionsRenderer
              key={ride.id}
              directions={direction}
              options={{
                polylineOptions: {
                  strokeColor: selectedRideId === ride.id ? '#00AFF5' : '#94a3b8',
                  strokeWeight: selectedRideId === ride.id ? 5 : 3,
                  strokeOpacity: selectedRideId === ride.id ? 0.8 : 0.5,
                },
                suppressMarkers: false,
                markerOptions: {
                  icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  },
                },
              }}
            />
          );
        })}

        {/* Add custom markers for origins if not showing specific route */}
        {!selectedRideId && rides.map((ride) => (
          <Marker
            key={`marker-${ride.id}`}
            position={{ lat: ride.origin.lat, lng: ride.origin.lng }}
            onClick={() => onRideSelect?.(ride.id)}
            title={`${ride.driverName} - ₮${ride.price.toLocaleString()}`}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new google.maps.Size(40, 40),
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
