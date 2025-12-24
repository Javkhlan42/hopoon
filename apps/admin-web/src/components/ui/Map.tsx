'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface MapProps {
  origin?: { lat: number; lng: number; label?: string };
  destination?: { lat: number; lng: number; label?: string };
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; label?: string }>;
  className?: string;
}

// Global flag to track script loading state
let isScriptLoading = false;
let isScriptLoaded = false;

export function Map({
  origin,
  destination,
  center,
  zoom = 13,
  markers = [],
  className = '',
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (typeof window !== 'undefined' && (window as any).google?.maps) {
      setIsLoaded(true);
      isScriptLoaded = true;
      return;
    }

    // If already loaded globally, set state
    if (isScriptLoaded) {
      setIsLoaded(true);
      return;
    }

    // If script is currently loading, wait for it
    if (isScriptLoading) {
      const checkLoaded = setInterval(() => {
        if ((window as any).google?.maps) {
          setIsLoaded(true);
          isScriptLoaded = true;
          clearInterval(checkLoaded);
        }
      }, 100);
      return () => clearInterval(checkLoaded);
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]',
    );
    if (existingScript) {
      isScriptLoading = true;
      const checkLoaded = setInterval(() => {
        if ((window as any).google?.maps) {
          setIsLoaded(true);
          isScriptLoaded = true;
          isScriptLoading = false;
          clearInterval(checkLoaded);
        }
      }, 100);
      return () => clearInterval(checkLoaded);
    }

    // Load Google Maps script
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    if (!apiKey || apiKey === 'your-google-maps-api-key-here') {
      setError('Google Maps API key шаардлагатай');
      console.error(
        'Google Maps API key олдсонгүй. .env.local файлд NEXT_PUBLIC_GOOGLE_MAPS_API_KEY тохируулна уу',
      );
      return;
    }

    console.log('Loading Google Maps API...');
    isScriptLoading = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
      isScriptLoaded = true;
      isScriptLoading = false;
    };
    script.onerror = () => {
      setError('Google Maps ачаалагдсангүй');
      isScriptLoading = false;
    };

    document.head.appendChild(script);

    // Don't remove script on unmount - keep it for reuse
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const google = (window as any).google;
    if (!google?.maps) return;

    console.log('Initializing map with:', {
      origin,
      destination,
      center,
      zoom,
    });

    // Determine center point
    let mapCenter = center;
    if (!mapCenter && origin) {
      mapCenter = origin;
    } else if (!mapCenter && markers.length > 0) {
      mapCenter = markers[0];
    } else if (!mapCenter) {
      mapCenter = { lat: 47.9184, lng: 106.9177 }; // Ulaanbaatar default
    }

    console.log('Map center:', mapCenter);

    // Initialize map
    const map = new google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    // Add origin marker
    if (origin) {
      new google.maps.Marker({
        position: origin,
        map,
        title: origin.label || 'Эхлэх цэг',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#22c55e',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 10,
        },
      });
    }

    // Add destination marker
    if (destination) {
      new google.maps.Marker({
        position: destination,
        map,
        title: destination.label || 'Очих цэг',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 10,
        },
      });

      // Draw route if both origin and destination exist
      if (origin) {
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#3b82f6',
            strokeWeight: 4,
          },
        });

        directionsService.route(
          {
            origin,
            destination,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result: any, status: any) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(result);
            }
          },
        );
      }
    }

    // Add other markers
    markers.forEach((marker) => {
      new google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map,
        title: marker.label,
      });
    });
  }, [isLoaded, origin, destination, center, zoom, markers]);

  if (error) {
    return (
      <div
        className={`bg-amber-50 border-2 border-amber-200 rounded-lg h-64 flex items-center justify-center ${className}`}
      >
        <div className="text-center px-4">
          <MapPin className="h-12 w-12 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-700 font-semibold mb-2">{error}</p>
          <div className="text-sm text-amber-600 space-y-1">
            <p>
              1. Google Cloud Console-руу очиж Maps JavaScript API идэвхжүүлнэ
            </p>
            <p>2. API key үүсгэнэ</p>
            <p>3. .env.local файлд дараах мөрийг нэмнэ:</p>
            <code className="block bg-white px-2 py-1 rounded mt-2 text-xs">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=таны-api-key
            </code>
            <p className="mt-2">4. Dev server дахин ажиллуулна</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`bg-gray-100 rounded-lg h-64 flex items-center justify-center ${className}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Газрын зураг ачаалж байна...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={`rounded-lg h-64 w-full ${className}`} />;
}
