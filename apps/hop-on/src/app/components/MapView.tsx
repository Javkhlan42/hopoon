import React from 'react';
import { Navigation, MapPin } from 'lucide-react';

interface MapViewProps {
  height?: string;
  showRoute?: boolean;
  pickupLocation?: string;
  dropoffLocation?: string;
  className?: string;
}

export function MapView({ 
  height = '300px', 
  showRoute = false,
  pickupLocation,
  dropoffLocation,
  className = ''
}: MapViewProps) {
  return (
    <div 
      className={`relative bg-gradient-to-br from-blue-50 to-green-50 rounded-xl overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Map background pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e40af" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Route visualization */}
      {showRoute && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="80%" height="80%" viewBox="0 0 200 200">
            <path
              d="M 30 150 Q 100 50 170 150"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
            {/* Pickup marker */}
            <circle cx="30" cy="150" r="8" fill="#10b981" stroke="white" strokeWidth="2"/>
            {/* Dropoff marker */}
            <circle cx="170" cy="150" r="8" fill="#ef4444" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
      )}

      {/* Location pins */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 text-sm">
        <MapPin className="w-4 h-4 text-green-600" />
        <span className="text-gray-700">{pickupLocation || 'Ulaanbaatar'}</span>
      </div>

      {pickupLocation && dropoffLocation && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-red-600" />
          <span className="text-gray-700">{dropoffLocation}</span>
        </div>
      )}

      {/* Navigation compass */}
      <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
        <Navigation className="w-5 h-5 text-blue-600" />
      </div>
    </div>
  );
}
