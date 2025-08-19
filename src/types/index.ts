export interface TimeCapsule {
  id: string;
  title: string;
  message: string;
  mediaFiles: MediaFile[];
  location: Location;
  unlockDate: Date;
  createdDate: Date;
  createdBy: string;
  isPublic: boolean;
  accessKey?: string;
  isUnlocked: boolean;
  chainId?: string;
  chainOrder?: number;
}

export interface MediaFile {
  id: string;
  type: 'image' | 'audio' | 'video';
  url: string;
  filename: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  radius: number; // in meters for geofencing
}

export interface MemoryChain {
  id: string;
  title: string;
  description: string;
  capsuleIds: string[];
  createdBy: string;
  isPublic: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface MapHotspot {
  id: string;
  location: Location;
  capsuleCount: number;
  hasUnlocked: boolean;
}