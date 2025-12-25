'use client';

import { useEffect, useState } from 'react';

interface RideMiniMapProps {
  originAddress: string;
  destinationAddress: string;
  originLat?: number;
  originLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  className?: string;
}

export function RideMiniMap({
  originAddress,
  destinationAddress,
  originLat,
  originLng,
  destinationLat,
  destinationLng,
  className = '',
}: RideMiniMapProps) {
  const [mapUrl, setMapUrl] = useState<string>('');

  useEffect(() => {
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      'AIzaSyDTwVUsWOt5IFdO6ZYj-oRoYkyV3cQ2wmY';

    // Build markers with custom icons
    const markers: string[] = [];

    // Origin marker (green with A)
    if (originLat && originLng) {
      markers.push(`color:0x00C853|label:A|${originLat},${originLng}`);
    } else if (originAddress) {
      markers.push(
        `color:0x00C853|label:A|${encodeURIComponent(originAddress)}`,
      );
    }

    // Destination marker (red with B)
    if (destinationLat && destinationLng) {
      markers.push(
        `color:0xE53935|label:B|${destinationLat},${destinationLng}`,
      );
    } else if (destinationAddress) {
      markers.push(
        `color:0xE53935|label:B|${encodeURIComponent(destinationAddress)}`,
      );
    }

    // Build path with blue color like Google Maps
    let pathParam = '';
    if (originLat && originLng && destinationLat && destinationLng) {
      pathParam = `&path=color:0x4285F4|weight:5|${originLat},${originLng}|${destinationLat},${destinationLng}`;
    }

    // Construct Static Maps URL with better styling
    const markersParam = markers.map((m) => `markers=${m}`).join('&');
    const url = `https://maps.googleapis.com/maps/api/staticmap?size=600x300&scale=2&maptype=roadmap&${markersParam}${pathParam}&key=${apiKey}`;

    setMapUrl(url);
  }, [
    originAddress,
    destinationAddress,
    originLat,
    originLng,
    destinationLat,
    destinationLng,
  ]);

  if (!mapUrl) {
    return (
      <div
        className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-gray-400 text-sm">Loading map...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={mapUrl}
          alt={`Route from ${originAddress} to ${destinationAddress}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="bg-white rounded-b-lg border border-t-0 border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
          <span className="text-sm text-gray-700 truncate flex-1">
            {originAddress}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
          <span className="text-sm text-gray-700 truncate flex-1">
            {destinationAddress}
          </span>
        </div>
      </div>
    </div>
  );
}
