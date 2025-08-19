import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navigation } from '@/components/Navigation';
import { TimeCapsuleMap } from '@/components/Map';
import { CapsuleForm } from '@/components/CapsuleForm';
import { CapsuleViewer } from '@/components/CapsuleViewer';
import { CapsuleList } from '@/components/CapsuleList';
import { useGeolocation } from '@/hooks/useGeolocation';
import { storageService } from '@/lib/storage';
import { reverseGeocode, isWithinGeofence } from '@/lib/geolocation';
import { TimeCapsule, Location, User } from '@/types';
import { AlertCircle, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TimeCapsuleApp() {
  const [activeView, setActiveView] = useState<'map' | 'create' | 'my-capsules' | 'discover' | 'settings'>('map');
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null);
  const [discoveredCapsules, setDiscoveredCapsules] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const { location: userLocation, loading: locationLoading, error: locationError, refetch } = useGeolocation();

  // Initialize user and load data
  useEffect(() => {
    // Create or load user
    let currentUser = storageService.getUser();
    if (!currentUser) {
      currentUser = {
        id: `user_${Date.now()}`,
        name: 'Anonymous Explorer',
        email: 'user@timecapsule.app'
      };
      storageService.saveUser(currentUser);
    }
    setUser(currentUser);

    // Load capsules and discovered list
    const loadedCapsules = storageService.getCapsules();
    const discovered = storageService.getDiscoveredCapsules();
    
    setCapsules(loadedCapsules);
    setDiscoveredCapsules(discovered);
  }, []);

  // Demo data - add some sample capsules for demonstration
  useEffect(() => {
    const existingCapsules = storageService.getCapsules();
    if (existingCapsules.length === 0 && userLocation) {
      // Create demo capsules near user location
      const demoCapsules: TimeCapsule[] = [
        {
          id: 'demo_1',
          title: 'Welcome to TimeCapsule!',
          message: 'This is your first time capsule! You can create messages that unlock at specific times and places. This demo capsule shows how the app works.',
          mediaFiles: [],
          location: {
            latitude: userLocation.latitude + 0.001,
            longitude: userLocation.longitude + 0.001,
            address: 'Demo Location 1',
            radius: 100
          },
          unlockDate: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago (unlocked)
          createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          createdBy: 'TimeCapsule Team',
          isPublic: true,
          isUnlocked: false
        },
        {
          id: 'demo_2',
          title: 'Future Message',
          message: 'This capsule will unlock tomorrow! Come back to this location after the unlock time to read the full message.',
          mediaFiles: [],
          location: {
            latitude: userLocation.latitude + 0.002,
            longitude: userLocation.longitude - 0.001,
            address: 'Demo Location 2',
            radius: 50
          },
          unlockDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
          createdDate: new Date(),
          createdBy: 'TimeCapsule Team',
          isPublic: true,
          isUnlocked: false
        }
      ];

      demoCapsules.forEach(capsule => storageService.saveCapsule(capsule));
      setCapsules(demoCapsules);
    }
  }, [userLocation]);

  const handleLocationSelect = async (location: Location) => {
    try {
      const address = await reverseGeocode(location.latitude, location.longitude);
      setSelectedLocation({
        ...location,
        address
      });
    } catch (error) {
      setSelectedLocation(location);
    }
  };

  const handleCreateCapsule = (capsuleData: Omit<TimeCapsule, 'id' | 'createdDate' | 'isUnlocked'>) => {
    const newCapsule: TimeCapsule = {
      ...capsuleData,
      id: `capsule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date(),
      isUnlocked: false
    };

    storageService.saveCapsule(newCapsule);
    setCapsules(prev => [...prev, newCapsule]);
    setSelectedLocation(null);
    setActiveView('map');
    
    toast.success('Time capsule created successfully!');
  };

  const handleUnlockCapsule = (capsuleId: string, accessKey?: string) => {
    const capsule = capsules.find(c => c.id === capsuleId);
    if (!capsule) return;

    // Check location requirement
    if (!userLocation || !isWithinGeofence(userLocation, capsule.location)) {
      toast.error('You must be at the capsule location to unlock it');
      return;
    }

    // Check time requirement
    if (new Date() < new Date(capsule.unlockDate)) {
      toast.error('This capsule is not ready to be unlocked yet');
      return;
    }

    // Check access key for private capsules
    if (!capsule.isPublic && capsule.accessKey && capsule.accessKey !== accessKey) {
      toast.error('Invalid access key');
      return;
    }

    // Unlock the capsule
    const unlockedCapsule = { ...capsule, isUnlocked: true };
    storageService.saveCapsule(unlockedCapsule);
    setCapsules(prev => prev.map(c => c.id === capsuleId ? unlockedCapsule : c));
    
    // Add to discovered list
    if (!discoveredCapsules.includes(capsuleId)) {
      storageService.addDiscoveredCapsule(capsuleId);
      setDiscoveredCapsules(prev => [...prev, capsuleId]);
    }

    toast.success('Time capsule unlocked! 🎉');
  };

  const handleDeleteCapsule = (capsuleId: string) => {
    if (confirm('Are you sure you want to delete this time capsule?')) {
      storageService.deleteCapsule(capsuleId);
      setCapsules(prev => prev.filter(c => c.id !== capsuleId));
      toast.success('Time capsule deleted');
    }
  };

  const getMyCapsules = () => capsules.filter(c => c.createdBy === user?.id || c.createdBy === 'current-user');
  const getDiscoveredCapsules = () => capsules.filter(c => discoveredCapsules.includes(c.id));

  const renderContent = () => {
    switch (activeView) {
      case 'map':
        return (
          <div className="space-y-4">
            {locationError && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Location access is required to use TimeCapsule. Please enable location services.
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refetch}
                    className="ml-2"
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            {locationLoading && (
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Getting your location...
                  </div>
                </CardContent>
              </Card>
            )}

            <TimeCapsuleMap
              capsules={capsules}
              onLocationSelect={handleLocationSelect}
              onCapsuleSelect={setSelectedCapsule}
              showCreateMode={false}
            />

            {userLocation && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        Current Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                      </span>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'create':
        return (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h2 className="font-medium mb-2">Step 1: Select Location</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Click on the map below to choose where your time capsule will be placed.
                </p>
              </CardContent>
            </Card>

            <TimeCapsuleMap
              capsules={capsules}
              onLocationSelect={handleLocationSelect}
              onCapsuleSelect={() => {}}
              showCreateMode={true}
            />

            {selectedLocation && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h2 className="font-medium mb-2">Step 2: Create Your Time Capsule</h2>
                    <p className="text-sm text-muted-foreground">
                      Fill in the details for your time capsule below.
                    </p>
                  </CardContent>
                </Card>

                <CapsuleForm
                  location={selectedLocation}
                  onSubmit={handleCreateCapsule}
                  onCancel={() => {
                    setSelectedLocation(null);
                    setActiveView('map');
                  }}
                />
              </div>
            )}
          </div>
        );

      case 'my-capsules':
        return (
          <CapsuleList
            capsules={getMyCapsules()}
            title="My Time Capsules"
            onView={setSelectedCapsule}
            onDelete={handleDeleteCapsule}
            showDeleteButton={true}
          />
        );

      case 'discover':
        return (
          <CapsuleList
            capsules={getDiscoveredCapsules()}
            title="Discovered Capsules"
            onView={setSelectedCapsule}
          />
        );

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="font-medium mb-2">Coming Soon</h2>
              <p className="text-muted-foreground">This feature is under development.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        activeView={activeView}
        onViewChange={setActiveView}
        myCapsuleCount={getMyCapsules().length}
        discoveredCount={getDiscoveredCapsules().length}
      />

      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Capsule Viewer Modal */}
      {selectedCapsule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CapsuleViewer
              capsule={selectedCapsule}
              userLocation={userLocation}
              onClose={() => setSelectedCapsule(null)}
              onUnlock={handleUnlockCapsule}
            />
          </div>
        </div>
      )}
    </div>
  );
}
