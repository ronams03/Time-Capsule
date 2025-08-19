import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Eye, Lock } from 'lucide-react';
import { TimeCapsule, Location, MapHotspot } from '@/types';
import { getCurrentLocation, isWithinGeofence } from '@/lib/geolocation';

interface MapProps {
  capsules: TimeCapsule[];
  onLocationSelect: (location: Location) => void;
  onCapsuleSelect: (capsule: TimeCapsule) => void;
  showCreateMode: boolean;
}

export const TimeCapsuleMap: React.FC<MapProps> = ({ 
  capsules, 
  onLocationSelect, 
  onCapsuleSelect, 
  showCreateMode 
}) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [hotspots, setHotspots] = useState<MapHotspot[]>([]);

  useEffect(() => {
    getCurrentLocation()
      .then((position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      })
      .catch((error) => {
        console.error('Error getting location:', error);
      });
  }, []);

  useEffect(() => {
    // Create hotspots from capsules
    const locationGroups = new Map<string, TimeCapsule[]>();
    
    capsules.forEach(capsule => {
      const key = `${capsule.location.latitude.toFixed(4)}_${capsule.location.longitude.toFixed(4)}`;
      if (!locationGroups.has(key)) {
        locationGroups.set(key, []);
      }
      locationGroups.get(key)!.push(capsule);
    });

    const newHotspots: MapHotspot[] = Array.from(locationGroups.entries()).map(([key, groupCapsules]) => {
      const firstCapsule = groupCapsules[0];
      const hasUnlocked = userLocation ? groupCapsules.some(capsule => 
        isWithinGeofence(userLocation, capsule.location) && 
        new Date() >= new Date(capsule.unlockDate) &&
        (capsule.isPublic || capsule.isUnlocked)
      ) : false;

      return {
        id: key,
        location: firstCapsule.location,
        capsuleCount: groupCapsules.length,
        hasUnlocked
      };
    });

    setHotspots(newHotspots);
  }, [capsules, userLocation]);

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!showCreateMode) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert click position to mock coordinates
    const latitude = 37.7749 + (y - rect.height / 2) / 1000;
    const longitude = -122.4194 + (x - rect.width / 2) / 1000;
    
    const location: Location = {
      latitude,
      longitude,
      address: `Location ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      radius: 50 // 50 meter radius
    };
    
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  const handleHotspotClick = (hotspot: MapHotspot) => {
    const capsulesAtLocation = capsules.filter(capsule => 
      Math.abs(capsule.location.latitude - hotspot.location.latitude) < 0.0001 &&
      Math.abs(capsule.location.longitude - hotspot.location.longitude) < 0.0001
    );
    
    if (capsulesAtLocation.length === 1) {
      onCapsuleSelect(capsulesAtLocation[0]);
    }
  };

  return (
    <div className="w-full h-full">
      <Card className="h-96 bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
        <div 
          className="w-full h-full cursor-pointer relative"
          onClick={handleMapClick}
        >
          {/* Mock map background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-50 to-indigo-100">
            <div className="absolute inset-0 opacity-20">
              {/* Grid pattern to simulate map */}
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }} />
            </div>
          </div>

          {/* User location */}
          {userLocation && (
            <div 
              className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}

          {/* Hotspots */}
          {hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                left: `${50 + (hotspot.location.longitude + 122.4194) * 1000}%`,
                top: `${50 - (hotspot.location.latitude - 37.7749) * 1000}%`
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleHotspotClick(hotspot);
              }}
            >
              <div className={`relative ${hotspot.hasUnlocked ? 'text-green-600' : 'text-orange-600'}`}>
                <MapPin className="w-6 h-6" />
                <Badge 
                  variant={hotspot.hasUnlocked ? "default" : "secondary"}
                  className="absolute -top-2 -right-2 text-xs min-w-5 h-5 flex items-center justify-center"
                >
                  {hotspot.capsuleCount}
                </Badge>
              </div>
            </div>
          ))}

          {/* Selected location for creation */}
          {showCreateMode && selectedLocation && (
            <div
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-30"
              style={{
                left: `${50 + (selectedLocation.longitude + 122.4194) * 1000}%`,
                top: `${50 - (selectedLocation.latitude - 37.7749) * 1000}%`
              }}
            >
              <div className="text-red-500 animate-pulse">
                <Plus className="w-8 h-8" />
              </div>
            </div>
          )}

          {/* Map legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Your Location</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span>Unlocked Capsules</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Locked Capsules</span>
              </div>
              {showCreateMode && (
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-red-500" />
                  <span>Click to Place</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};