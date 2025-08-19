import { useState, useEffect } from 'react';
import { getCurrentLocation } from '@/lib/geolocation';

interface GeolocationState {
  location: { latitude: number; longitude: number } | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    const getLocation = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const position = await getCurrentLocation();
        
        if (mounted) {
          setState({
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            },
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (mounted) {
          setState({
            location: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to get location'
          });
        }
      }
    };

    getLocation();

    return () => {
      mounted = false;
    };
  }, []);

  const refetch = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    getCurrentLocation()
      .then((position) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          },
          loading: false,
          error: null
        });
      })
      .catch((error) => {
        setState({
          location: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to get location'
        });
      });
  };

  return {
    ...state,
    refetch
  };
};