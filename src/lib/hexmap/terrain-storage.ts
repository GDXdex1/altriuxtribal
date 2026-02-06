import type { TerrainType, TerrainFeature } from './types';

/**
 * Storage system for terrain modifications
 * Saves and loads custom terrain changes from localStorage
 */

export interface TerrainModification {
  q: number;
  r: number;
  terrain: TerrainType;
  features?: TerrainFeature[];
  timestamp: number;
}

const STORAGE_KEY = 'altriux_terrain_modifications';

/**
 * Save terrain modification to localStorage
 */
export function saveTerrainModification(q: number, r: number, terrain: TerrainType, features?: TerrainFeature[]): void {
  const modifications = loadAllModifications();
  
  // Remove existing modification for this coordinate if it exists
  const filtered = modifications.filter(mod => !(mod.q === q && mod.r === r));
  
  // Add new modification
  filtered.push({
    q,
    r,
    terrain,
    features,
    timestamp: Date.now()
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Load all terrain modifications from localStorage
 */
export function loadAllModifications(): TerrainModification[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading terrain modifications:', error);
    return [];
  }
}

/**
 * Get modification for specific coordinates
 */
export function getModification(q: number, r: number): TerrainModification | null {
  const modifications = loadAllModifications();
  return modifications.find(mod => mod.q === q && mod.r === r) || null;
}

/**
 * Clear all terrain modifications
 */
export function clearAllModifications(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export modifications as JSON string
 */
export function exportModifications(): string {
  const modifications = loadAllModifications();
  return JSON.stringify(modifications, null, 2);
}

/**
 * Import modifications from JSON string
 */
export function importModifications(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid format: expected array');
    }
    
    // Validate each modification
    for (const mod of parsed) {
      if (typeof mod.q !== 'number' || typeof mod.r !== 'number' || typeof mod.terrain !== 'string') {
        throw new Error('Invalid modification format');
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return true;
  } catch (error) {
    console.error('Error importing modifications:', error);
    return false;
  }
}

/**
 * Get count of modifications
 */
export function getModificationCount(): number {
  return loadAllModifications().length;
}
