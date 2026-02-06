/**
 * River Generation System for Altriux Tribal
 * Complete logic for generating realistic rivers
 * 
 * RULES:
 * - Rivers MUST start in mountain_range (cordilleras)
 * - Rivers MUST end in coast tiles (NOT ocean)
 * - Rivers flow from higher to lower OR equal elevation
 * - Minimum 8 hexagons long
 */

import type { HexTile, HexCoordinates, TerrainType } from './types';
import type { 
  River, 
  RiverSegment, 
  RiverEdge, 
  RiverPath, 
  RiverGenerationConfig,
  SubLandRiverHex 
} from './river-types';
import { createRiverEdgeId } from './river-types';
import { getHexKey, getNeighbors, hexDistance } from './hex-utils';

/**
 * Default configuration for river generation
 */
const DEFAULT_CONFIG: RiverGenerationConfig = {
  minLength: 8, // Rivers must be at least 8 hexagons long
  maxAttempts: 100,
  flowToOcean: true,
  allowLakes: false
};

/**
 * Find all mountain_range hexagons in the map (potential river sources)
 */
export function findMountainRangeHexagons(tiles: Map<string, HexTile>): HexTile[] {
  const mountainRanges: HexTile[] = [];
  
  for (const tile of tiles.values()) {
    if (tile.terrain === 'mountain_range') {
      mountainRanges.push(tile);
    }
  }
  
  return mountainRanges;
}

/**
 * Calculate flow direction based on elevation
 * Rivers always flow from higher elevation to lower OR equal elevation
 */
function determineFlowDirection(
  current: HexTile,
  next: HexTile
): 'downstream' | 'upstream' {
  // Downstream: flowing to lower OR EQUAL elevation (allows flat terrain)
  // Upstream: flowing to higher elevation (not valid for river generation)
  return next.elevation <= current.elevation ? 'downstream' : 'upstream';
}

/**
 * Find the best next hexagon for river flow
 * Prioritizes: lowest elevation, then proximity to coast
 */
function findBestNextHex(
  current: HexTile,
  tiles: Map<string, HexTile>,
  visited: Set<string>
): HexTile | null {
  const neighbors = getNeighbors(current.coordinates);
  let bestNext: HexTile | null = null;
  let lowestElevation = current.elevation;
  
  // First pass: find neighbors with lower or equal elevation
  for (const neighborCoord of neighbors) {
    const key = getHexKey(neighborCoord.q, neighborCoord.r);
    
    // Skip if already visited
    if (visited.has(key)) continue;
    
    const neighborTile = tiles.get(key);
    if (!neighborTile) continue;
    
    // Skip ice terrain
    if (neighborTile.terrain === 'ice') continue;
    
    // Prefer tiles with lower elevation (strict downhill)
    if (neighborTile.elevation < lowestElevation) {
      lowestElevation = neighborTile.elevation;
      bestNext = neighborTile;
    }
    // If same elevation, prefer coast (river mouth)
    else if (neighborTile.elevation === lowestElevation) {
      if (neighborTile.terrain === 'coast') {
        bestNext = neighborTile;
      } else if (bestNext === null || bestNext.terrain !== 'coast') {
        // Only replace if current best is not coast
        bestNext = neighborTile;
      }
    }
  }
  
  return bestNext;
}

/**
 * Generate a river path from a mountain source
 * Uses greedy algorithm: always flow to lowest neighboring elevation
 */
export function generateRiverPath(
  source: HexTile,
  tiles: Map<string, HexTile>,
  config: RiverGenerationConfig = DEFAULT_CONFIG
): RiverPath {
  const path: HexCoordinates[] = [];
  const visited = new Set<string>();
  
  let current = source;
  path.push(current.coordinates);
  visited.add(getHexKey(current.coordinates.q, current.coordinates.r));
  
  let attempts = 0;
  const maxSteps = 200; // Prevent infinite loops
  
  while (attempts < maxSteps) {
    attempts++;
    
    // STRICT RULE: Rivers MUST end in coast (not ocean)
    if (current.terrain === 'coast') {
      // Valid river path found
      if (path.length >= config.minLength) {
        return {
          isValid: true,
          path,
          length: path.length
        };
      } else {
        return {
          isValid: false,
          path,
          length: path.length,
          reason: `River too short: ${path.length} < ${config.minLength}`
        };
      }
    }
    
    // Rivers cannot end in ocean - they must reach coast
    if (current.terrain === 'ocean') {
      return {
        isValid: false,
        path,
        length: path.length,
        reason: 'Rivers must end in coast, not ocean'
      };
    }
    
    // Find next hexagon
    const next = findBestNextHex(current, tiles, visited);
    
    if (!next) {
      // Dead end - river cannot continue
      return {
        isValid: false,
        path,
        length: path.length,
        reason: `River reached dead end at elevation ${current.elevation} (no valid next hexagon)`
      };
    }
    
    // Flow direction check
    const flowDir = determineFlowDirection(current, next);
    if (flowDir === 'upstream') {
      // Cannot flow uphill
      return {
        isValid: false,
        path,
        length: path.length,
        reason: 'River cannot flow uphill'
      };
    }
    
    // Add to path
    path.push(next.coordinates);
    visited.add(getHexKey(next.coordinates.q, next.coordinates.r));
    current = next;
  }
  
  return {
    isValid: false,
    path,
    length: path.length,
    reason: 'Max steps reached (river too long or loop detected)'
  };
}

/**
 * Create river edges from path
 * Identifies all borders crossed by the river
 */
function createRiverEdges(
  path: HexCoordinates[],
  riverId: string
): RiverEdge[] {
  const edges: RiverEdge[] = [];
  
  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];
    
    if (!current || !next) continue;
    
    // Create edge
    const edgeId = createRiverEdgeId(current, next);
    
    // Determine which direction (0-5) based on neighbor position
    const neighbors = getNeighbors(current);
    const direction = neighbors.findIndex(
      n => n.q === next.q && n.r === next.r
    );
    
    edges.push({
      edgeId,
      hex1: current,
      hex2: next,
      direction: direction >= 0 ? direction : 0,
      riverId
    });
  }
  
  return edges;
}

/**
 * Create river segments with flow information
 */
function createRiverSegments(
  path: HexCoordinates[],
  tiles: Map<string, HexTile>
): RiverSegment[] {
  const segments: RiverSegment[] = [];
  
  for (let i = 0; i < path.length; i++) {
    const coord = path[i];
    if (!coord) continue;
    
    const tile = tiles.get(getHexKey(coord.q, coord.r));
    if (!tile) continue;
    
    segments.push({
      coordinates: coord,
      elevation: tile.elevation,
      flowDirection: 'downstream', // All segments flow downstream
      distanceFromSource: i,
      distanceToMouth: path.length - 1 - i
    });
  }
  
  return segments;
}

/**
 * Generate a complete river from a mountain_range source
 */
export function generateRiver(
  source: HexTile,
  tiles: Map<string, HexTile>,
  config: RiverGenerationConfig = DEFAULT_CONFIG
): River | null {
  // Validate source is a mountain_range (cordillera)
  if (source.terrain !== 'mountain_range') {
    console.warn('River source must be a mountain_range (cordillera) hexagon');
    return null;
  }
  
  // Generate path
  const pathResult = generateRiverPath(source, tiles, config);
  
  if (!pathResult.isValid) {
    // Don't spam logs - only occasionally
    return null;
  }
  
  if (pathResult.path.length < config.minLength) {
    return null;
  }
  
  // Create river ID
  const riverId = `river-${source.coordinates.q}-${source.coordinates.r}-${Date.now()}`;
  
  // Create segments
  const segments = createRiverSegments(pathResult.path, tiles);
  
  // Create edges
  const edges = createRiverEdges(pathResult.path, riverId);
  
  // Mouth is the last coordinate
  const mouth = pathResult.path[pathResult.path.length - 1];
  if (!mouth) {
    return null;
  }
  
  return {
    id: riverId,
    source: source.coordinates,
    mouth,
    segments,
    edges,
    length: pathResult.path.length,
    flowDirection: 'downstream'
  };
}

/**
 * Generate all rivers for the map
 * Generates EXACTLY targetCount rivers from mountain ranges (cordilleras)
 * CRITICAL: Marks tiles with 'river' feature
 */
export function generateAllRivers(
  tiles: Map<string, HexTile>,
  config: RiverGenerationConfig = DEFAULT_CONFIG,
  targetCount: number = 40
): River[] {
  const rivers: River[] = [];
  const mountainRanges = findMountainRangeHexagons(tiles);
  
  console.log(`🌊🌊🌊 RIVER GENERATION START 🌊🌊🌊`);
  console.log(`   Found ${mountainRanges.length} mountain_range (cordillera) hexagons`);
  console.log(`   Target: Generate ${targetCount} rivers`);
  console.log(`   Min length: ${config.minLength} hexagons`);
  
  if (mountainRanges.length === 0) {
    console.error(`❌❌❌ CRITICAL: NO MOUNTAIN RANGES FOUND!`);
    console.error(`   Cannot generate rivers without cordilleras`);
    return [];
  }
  
  // Sample cordilleras and their elevations
  console.log(`   Sample cordilleras with elevations:`);
  for (let i = 0; i < Math.min(5, mountainRanges.length); i++) {
    const m = mountainRanges[i];
    if (m) {
      console.log(`     (${m.coordinates.q}, ${m.coordinates.r}) elevation=${m.elevation}`);
    }
  }
  
  // Shuffle mountain ranges to get varied river sources
  const shuffled = [...mountainRanges].sort(() => Math.random() - 0.5);
  
  // Attempt to generate exactly targetCount rivers
  const maxAttempts = Math.min(mountainRanges.length * 3, 500); // More attempts
  let attempts = 0;
  let failedAttempts = 0;
  const failureReasons: Record<string, number> = {};
  
  for (const mountainRange of shuffled) {
    if (rivers.length >= targetCount) break;
    if (attempts >= maxAttempts) break;
    
    attempts++;
    
    // Try to generate a river from this mountain range
    const river = generateRiver(mountainRange, tiles, config);
    
    if (river) {
      rivers.push(river);
      
      // ✅✅✅ CRITICAL: Mark all tiles in river path with 'river' feature ✅✅✅
      for (const segment of river.segments) {
        const tileKey = getHexKey(segment.coordinates.q, segment.coordinates.r);
        const tile = tiles.get(tileKey);
        if (tile) {
          // Add 'river' to features if not already present
          if (!tile.features) {
            tile.features = [];
          }
          if (!tile.features.includes('river')) {
            tile.features.push('river');
          }
          // Also set hasRiver flag for compatibility
          tile.hasRiver = true;
        }
      }
      
      console.log(`   ✓ River ${rivers.length}/${targetCount}: ${river.length} hexagons from (${mountainRange.coordinates.q},${mountainRange.coordinates.r})`);
    } else {
      failedAttempts++;
      // Track failure reasons
      const testPath = generateRiverPath(mountainRange, tiles, config);
      if (testPath.reason) {
        failureReasons[testPath.reason] = (failureReasons[testPath.reason] || 0) + 1;
      }
    }
  }
  
  console.log(`✅✅✅ RIVERS GENERATED ✅✅✅`);
  console.log(`   Successfully generated: ${rivers.length} rivers`);
  console.log(`   Failed attempts: ${failedAttempts}`);
  console.log(`   Success rate: ${((rivers.length / attempts) * 100).toFixed(1)}%`);
  
  // Show failure reasons
  if (Object.keys(failureReasons).length > 0) {
    console.log(`   Failure breakdown:`);
    for (const [reason, count] of Object.entries(failureReasons)) {
      console.log(`     - ${reason}: ${count} times`);
    }
  }
  
  // Verify tiles were marked
  let tilesWithRiver = 0;
  for (const tile of tiles.values()) {
    if (tile.features?.includes('river')) {
      tilesWithRiver++;
    }
  }
  
  console.log(`   Total tiles marked with river feature: ${tilesWithRiver}`);
  console.log(`   Average river length: ${rivers.length > 0 ? (tilesWithRiver / rivers.length).toFixed(1) : 0} tiles`);
  
  if (rivers.length === 0) {
    console.error(`❌❌❌ NO RIVERS GENERATED!`);
    console.error(`   Most common failure reason:`, Object.entries(failureReasons).sort((a, b) => b[1] - a[1])[0]);
  }
  
  return rivers;
}

/**
 * Get SubLand river hexagons for a given duchy hexagon
 * Returns hexagons that should be split by rivers
 */
export function getSubLandRiverHexagons(
  parentQ: number,
  parentR: number,
  riverEdges: RiverEdge[]
): SubLandRiverHex[] {
  const subLandRiverHexes: SubLandRiverHex[] = [];
  
  // Find all edges that involve this parent hexagon
  const relevantEdges = riverEdges.filter(edge => 
    (edge.hex1.q === parentQ && edge.hex1.r === parentR) ||
    (edge.hex2.q === parentQ && edge.hex2.r === parentR)
  );
  
  for (const edge of relevantEdges) {
    // Determine which side of the hexagon the river crosses
    const direction = edge.direction;
    
    // Map direction to side name
    const sides = ['east', 'northeast', 'northwest', 'west', 'southwest', 'southeast'] as const;
    const riverSide = sides[direction] || 'north';
    
    // Generate 3-5 river bank hexagons along the edge
    const numBankHexes = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numBankHexes; i++) {
      // Calculate subland coordinates along the edge
      const subQ = Math.floor((Math.random() - 0.5) * 10);
      const subR = Math.floor((Math.random() - 0.5) * 10);
      
      subLandRiverHexes.push({
        parentQ,
        parentR,
        subQ,
        subR,
        isRiverBank: true,
        riverSide,
        allowsRiverBuildings: true
      });
    }
  }
  
  return subLandRiverHexes;
}

/**
 * Check if a SubLand hexagon is a river bank
 */
export function isRiverBank(
  parentQ: number,
  parentR: number,
  subQ: number,
  subR: number,
  riverEdges: RiverEdge[]
): boolean {
  const riverHexes = getSubLandRiverHexagons(parentQ, parentR, riverEdges);
  
  return riverHexes.some(hex => 
    hex.subQ === subQ && hex.subR === subR && hex.isRiverBank
  );
}

/**
 * Determine if river flows upstream or downstream through a hexagon
 */
export function getRiverFlowDirection(
  coordinates: HexCoordinates,
  river: River
): 'upstream' | 'downstream' | null {
  const segment = river.segments.find(
    seg => seg.coordinates.q === coordinates.q && seg.coordinates.r === coordinates.r
  );
  
  return segment?.flowDirection || null;
}
