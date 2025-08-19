import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  Lock, 
  Unlock, 
  Image, 
  Music, 
  Video, 
  User, 
  Key,
  Clock,
  AlertCircle
} from 'lucide-react';
import { TimeCapsule } from '@/types';
import { isWithinGeofence } from '@/lib/geolocation';

interface CapsuleViewerProps {
  capsule: TimeCapsule;
  userLocation: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onUnlock: (capsuleId: string, accessKey?: string) => void;
}

export const CapsuleViewer: React.FC<CapsuleViewerProps> = ({ 
  capsule, 
  userLocation, 
  onClose, 
  onUnlock 
}) => {
  const [accessKey, setAccessKey] = useState('');
  const [showAccessKeyInput, setShowAccessKeyInput] = useState(false);

  const isLocationValid = userLocation ? isWithinGeofence(userLocation, capsule.location) : false;
  const isTimeValid = new Date() >= new Date(capsule.unlockDate);
  const canUnlock = isLocationValid && isTimeValid && (capsule.isPublic || capsule.isUnlocked);
  const needsAccessKey = !capsule.isPublic && !capsule.isUnlocked;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUnlockAttempt = () => {
    if (needsAccessKey && !showAccessKeyInput) {
      setShowAccessKeyInput(true);
      return;
    }
    
    if (needsAccessKey) {
      onUnlock(capsule.id, accessKey);
    } else {
      onUnlock(capsule.id);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const renderMediaFile = (file: MediaFile) => {
    switch (file.type) {
      case 'image':
        return (
          <img 
            src={file.url} 
            alt={file.filename}
            className="w-full h-48 object-cover rounded-lg"
          />
        );
      case 'audio':
        return (
          <audio controls className="w-full">
            <source src={file.url} />
            Your browser does not support the audio element.
          </audio>
        );
      case 'video':
        return (
          <video controls className="w-full h-48 rounded-lg">
            <source src={file.url} />
            Your browser does not support the video element.
          </video>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              {canUnlock || capsule.isUnlocked ? (
                <Unlock className="w-5 h-5 text-green-600" />
              ) : (
                <Lock className="w-5 h-5 text-orange-600" />
              )}
              {capsule.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant={capsule.isPublic ? "default" : "secondary"}>
                {capsule.isPublic ? "Public" : "Private"}
              </Badge>
              {capsule.chainId && (
                <Badge variant="outline">
                  Memory Chain
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Information */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(capsule.createdDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Unlocks</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(capsule.unlockDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-xs text-muted-foreground">{capsule.location.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Created by</p>
              <p className="text-xs text-muted-foreground">{capsule.createdBy}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Unlock Status */}
        <div className="space-y-3">
          <h3 className="font-medium">Access Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Location</span>
              <Badge variant={isLocationValid ? "default" : "destructive"}>
                {isLocationValid ? "✓ In Range" : "✗ Out of Range"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Time</span>
              <Badge variant={isTimeValid ? "default" : "secondary"}>
                {isTimeValid ? "✓ Unlocked" : "⏳ Locked"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Access Key Input */}
        {showAccessKeyInput && needsAccessKey && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Access Key</label>
            <Input
              type="password"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="Enter the access key..."
            />
          </div>
        )}

        {/* Unlock Button */}
        {!capsule.isUnlocked && (
          <Button 
            onClick={handleUnlockAttempt}
            disabled={!canUnlock && !needsAccessKey}
            className="w-full"
            variant={canUnlock || needsAccessKey ? "default" : "secondary"}
          >
            {needsAccessKey ? (
              <>
                <Key className="w-4 h-4 mr-2" />
                {showAccessKeyInput ? "Unlock with Key" : "Enter Access Key"}
              </>
            ) : canUnlock ? (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Open Capsule
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                Cannot Open Yet
              </>
            )}
          </Button>
        )}

        {/* Capsule Content (only if unlocked) */}
        {capsule.isUnlocked && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-medium text-green-600">📖 Capsule Content</h3>
              
              {/* Message */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="whitespace-pre-wrap">{capsule.message}</p>
              </div>

              {/* Media Files */}
              {capsule.mediaFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Media Files
                  </h4>
                  <div className="grid gap-3">
                    {capsule.mediaFiles.map((file) => (
                      <div key={file.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getMediaIcon(file.type)}
                          <span className="text-sm font-medium">{file.filename}</span>
                        </div>
                        {renderMediaFile(file)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};