import { TimeCapsule, MemoryChain, User } from '@/types';

const STORAGE_KEYS = {
  CAPSULES: 'timecapsule_capsules',
  CHAINS: 'timecapsule_chains',
  USER: 'timecapsule_user',
  DISCOVERED: 'timecapsule_discovered'
};

export const storageService = {
  // TimeCapsules
  getCapsules: (): TimeCapsule[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.CAPSULES);
    return stored ? JSON.parse(stored) : [];
  },

  saveCapsule: (capsule: TimeCapsule): void => {
    const capsules = storageService.getCapsules();
    const existingIndex = capsules.findIndex(c => c.id === capsule.id);
    
    if (existingIndex >= 0) {
      capsules[existingIndex] = capsule;
    } else {
      capsules.push(capsule);
    }
    
    localStorage.setItem(STORAGE_KEYS.CAPSULES, JSON.stringify(capsules));
  },

  deleteCapsule: (id: string): void => {
    const capsules = storageService.getCapsules().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CAPSULES, JSON.stringify(capsules));
  },

  // Memory Chains
  getChains: (): MemoryChain[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAINS);
    return stored ? JSON.parse(stored) : [];
  },

  saveChain: (chain: MemoryChain): void => {
    const chains = storageService.getChains();
    const existingIndex = chains.findIndex(c => c.id === chain.id);
    
    if (existingIndex >= 0) {
      chains[existingIndex] = chain;
    } else {
      chains.push(chain);
    }
    
    localStorage.setItem(STORAGE_KEYS.CHAINS, JSON.stringify(chains));
  },

  // User
  getUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },

  saveUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // Discovered capsules
  getDiscoveredCapsules: (): string[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.DISCOVERED);
    return stored ? JSON.parse(stored) : [];
  },

  addDiscoveredCapsule: (capsuleId: string): void => {
    const discovered = storageService.getDiscoveredCapsules();
    if (!discovered.includes(capsuleId)) {
      discovered.push(capsuleId);
      localStorage.setItem(STORAGE_KEYS.DISCOVERED, JSON.stringify(discovered));
    }
  }
};