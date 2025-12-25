/**
 * Geocoding utilities for converting addresses to coordinates
 */

interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

/**
 * Geocode an address to get latitude and longitude
 * @param address - The address to geocode
 * @returns Promise with coordinates and formatted address
 */
export async function geocodeAddress(
  address: string,
): Promise<GeocodingResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Google Maps API key is not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`,
    );

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };
    } else {
      console.error('Geocoding failed:', data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Geocode multiple addresses in parallel
 * @param addresses - Array of addresses to geocode
 * @returns Promise with array of results (null for failed geocoding)
 */
export async function geocodeMultipleAddresses(
  addresses: string[],
): Promise<(GeocodingResult | null)[]> {
  const promises = addresses.map((address) => geocodeAddress(address));
  return Promise.all(promises);
}
