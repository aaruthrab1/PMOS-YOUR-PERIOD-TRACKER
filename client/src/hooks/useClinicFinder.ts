import { useCallback, useState } from 'react';
import type { GeoPosition } from '@/lib/care/clinicFinder';

type LocationState = 'idle' | 'loading' | 'granted' | 'denied' | 'error';

export function useClinicFinder() {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState('error');
      setLocationError('Location is not supported on this device.');
      return;
    }

    setLocationState('loading');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationState('granted');
      },
      (err) => {
        setLocationState(err.code === err.PERMISSION_DENIED ? 'denied' : 'error');
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied — search by city or open Maps manually.'
            : 'Could not detect your location. Try again or pick a city.',
        );
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300_000 },
    );
  }, []);

  return {
    position,
    locationState,
    locationError,
    requestLocation,
    hasLocation: locationState === 'granted' && position != null,
  };
}
