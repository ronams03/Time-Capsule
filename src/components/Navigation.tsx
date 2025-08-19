import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Map, 
  Plus, 
  List, 
  Compass, 
  Settings,
  Clock
} from 'lucide-react';

interface NavigationProps {
  activeView: 'map' | 'create' | 'my-capsules' | 'discover' | 'settings';
  onViewChange: (view: 'map' | 'create' | 'my-capsules' | 'discover' | 'settings') => void;
  myCapsuleCount: number;
  discoveredCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeView, 
  onViewChange, 
  myCapsuleCount,
  discoveredCount 
}) => {
  const navItems = [
    {
      key: 'map' as const,
      label: 'Map',
      icon: Map,
      badge: null
    },
    {
      key: 'create' as const,
      label: 'Create',
      icon: Plus,
      badge: null
    },
    {
      key: 'my-capsules' as const,
      label: 'My Capsules',
      icon: Clock,
      badge: myCapsuleCount > 0 ? myCapsuleCount : null
    },
    {
      key: 'discover' as const,
      label: 'Discovered',
      icon: Compass,
      badge: discoveredCount > 0 ? discoveredCount : null
    }
  ];

  return (
    <div className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">TimeCapsule</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant={activeView === item.key ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange(item.key)}
                className="relative"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 text-xs min-w-5 h-5 flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};