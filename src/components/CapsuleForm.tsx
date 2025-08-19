import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Upload, X, Key } from 'lucide-react';
import { TimeCapsule, Location, MediaFile } from '@/types';

interface CapsuleFormProps {
  location: Location | null;
  onSubmit: (capsule: Omit<TimeCapsule, 'id' | 'createdDate' | 'isUnlocked'>) => void;
  onCancel: () => void;
}

export const CapsuleForm: React.FC<CapsuleFormProps> = ({ location, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [accessKey, setAccessKey] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location || !title || !message || !unlockDate) {
      alert('Please fill in all required fields and select a location on the map');
      return;
    }

    const capsule: Omit<TimeCapsule, 'id' | 'createdDate' | 'isUnlocked'> = {
      title,
      message,
      mediaFiles,
      location,
      unlockDate: new Date(unlockDate),
      createdBy: 'current-user', // In real app, get from auth
      isPublic,
      accessKey: isPublic ? undefined : accessKey || undefined
    };

    onSubmit(capsule);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const mediaFile: MediaFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type: file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('audio/') ? 'audio' : 'video',
          url: event.target?.result as string,
          filename: file.name
        };
        setMediaFiles(prev => [...prev, mediaFile]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMediaFile = (id: string) => {
    setMediaFiles(prev => prev.filter(file => file.id !== id));
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 50);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Create Time Capsule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Display */}
          {location && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{location.address}</span>
              <Badge variant="outline" className="ml-auto">
                {location.radius}m radius
              </Badge>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your time capsule a title..."
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message for the future..."
              rows={4}
              required
            />
          </div>

          {/* Media Files */}
          <div className="space-y-2">
            <Label>Media Files</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*,audio/*,video/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="media-upload"
              />
              <Label htmlFor="media-upload" className="cursor-pointer">
                <Button type="button" variant="outline" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Media
                </Button>
              </Label>
            </div>
            
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {mediaFiles.map((file) => (
                  <div key={file.id} className="relative p-2 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm truncate">{file.filename}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMediaFile(file.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {file.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unlock Date */}
          <div className="space-y-2">
            <Label htmlFor="unlockDate">Unlock Date *</Label>
            <Input
              id="unlockDate"
              type="date"
              value={unlockDate}
              onChange={(e) => setUnlockDate(e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              required
            />
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label>Visibility</Label>
              <p className="text-sm text-muted-foreground">
                {isPublic ? 'Anyone can discover this capsule' : 'Only people with the access key can open'}
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {/* Access Key for Private Capsules */}
          {!isPublic && (
            <div className="space-y-2">
              <Label htmlFor="accessKey">Access Key</Label>
              <Input
                id="accessKey"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Enter a secret key for this capsule..."
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                Share this key with people you want to access the capsule
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Clock className="w-4 h-4 mr-2" />
              Create Capsule
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};