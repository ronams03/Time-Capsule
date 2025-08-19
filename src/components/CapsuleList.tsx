import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Lock, 
  Unlock, 
  Eye, 
  Trash2,
  Link,
  Clock
} from 'lucide-react';
import { TimeCapsule } from '@/types';

interface CapsuleListProps {
  capsules: TimeCapsule[];
  title: string;
  onView: (capsule: TimeCapsule) => void;
  onDelete?: (capsuleId: string) => void;
  showDeleteButton?: boolean;
}

export const CapsuleList: React.FC<CapsuleListProps> = ({ 
  capsules, 
  title, 
  onView, 
  onDelete,
  showDeleteButton = false
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeRemaining = (unlockDate: Date) => {
    const now = new Date();
    const unlock = new Date(unlockDate);
    const diff = unlock.getTime() - now.getTime();
    
    if (diff <= 0) return "Ready to unlock!";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 365) {
      const years = Math.floor(days / 365);
      return `${years} year${years > 1 ? 's' : ''} remaining`;
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    }
  };

  if (capsules.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-2">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="font-medium">No capsules found</h3>
            <p className="text-sm text-muted-foreground">
              {title === "My Capsules" 
                ? "Create your first time capsule to get started" 
                : "Explore the map to discover time capsules near you"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {title}
          <Badge variant="secondary" className="ml-auto">
            {capsules.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {capsules.map((capsule) => (
            <div key={capsule.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium flex items-center gap-2">
                    {capsule.isUnlocked ? (
                      <Unlock className="w-4 h-4 text-green-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-orange-600" />
                    )}
                    {capsule.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={capsule.isPublic ? "default" : "secondary"} className="text-xs">
                      {capsule.isPublic ? "Public" : "Private"}
                    </Badge>
                    {capsule.chainId && (
                      <Badge variant="outline" className="text-xs">
                        <Link className="w-3 h-3 mr-1" />
                        Chain
                      </Badge>
                    )}
                    {capsule.mediaFiles.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {capsule.mediaFiles.length} media
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onView(capsule)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {showDeleteButton && onDelete && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDelete(capsule.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{capsule.location.address}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeRemaining(capsule.unlockDate)}</span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Created {formatDate(capsule.createdDate)} • 
                Unlocks {formatDate(capsule.unlockDate)}
              </div>

              {capsule.isUnlocked && (
                <div className="p-2 bg-green-50 dark:bg-green-950 rounded text-sm">
                  <p className="text-green-700 dark:text-green-300 line-clamp-2">
                    "{capsule.message.substring(0, 100)}..."
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};