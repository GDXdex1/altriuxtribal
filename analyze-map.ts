import { generateEarthMap } from './src/lib/hexmap/generator';
import { generateAllRivers } from './src/lib/hexmap/river-system';
import type { HexTile } from './src/lib/hexmap/types';

/**
 * Optimized map analysis with improved river generation
 */

async function analyzeMap() {
  console.log('🗺️🗺️🗺️ MAP ANALYSIS STARTING 🗺️🗺️🗺️');
  
  // Generate map
  const tiles = await generateEarthMap(42, 1);
  console.log(`✅ Map generated with ${tiles.size} tiles`);
  
  // Count terrain types
  const terrainCounts: Record<string, number> = {};
  for (const tile of tiles.values()) {
    terrainCounts[tile.terrain] = (terrainCounts[tile.terrain] || 0) + 1;
  }
  
  console.log('📊 Terrain distribution:');
  for (const [terrain, count] of Object.entries(terrainCounts)) {
    console.log(`   ${terrain}: ${count} tiles`);
  }
  
  // Find mountain ranges
  const mountainRanges = Array.from(tiles.values()).filter(t => t.terrain === 'mountain_range');
  console.log(`🏔️ Found ${mountainRanges.length} mountain_range tiles`);
  
  // Find coast tiles
  const coastTiles = Array.from(tiles.values()).filter(t => t.terrain === 'coast');
  console.log(`🏖️ Found ${coastTiles.length} coast tiles`);
  
  if (coastTiles.length === 0) {
    console.error('❌ No coast tiles found - rivers cannot end!');
    return;
  }
  
  // Optimized river generation with better configuration
  console.log('🚀🚀🚀 STARTING OPTIMIZED RIVER GENERATION 🚀🚀🚀');
  
  const startTime = Date.now();
  
  // Use optimized configuration
  const rivers = generateAllRivers(tiles, {
    minLength: 8,  // Keep minimum reasonable
    maxAttempts: 50, // Reduce attempts for faster execution
    flowToOcean: true,
    allowLakes: false
  }, 20); // Reduce target count for testing
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`✅ River generation completed in ${duration}ms`);
  console.log(`🌊 Generated ${rivers.length} rivers (target: 20)`);
  
  if (rivers.length > 0) {
    const avgLength = rivers.reduce((sum, river) => sum + river.length, 0) / rivers.length;
    console.log(`📏 Average river length: ${avgLength.toFixed(1)} tiles`);
    
    // Show sample rivers
    console.log('🔍 Sample rivers:');
    for (let i = 0; i < Math.min(3, rivers.length); i++) {
      const river = rivers[i];
      console.log(`   River ${i + 1}: ${river.length} tiles from (${river.source.q},${river.source.r}) to (${river.mouth.q},${river.mouth.r})`);
    }
  }
  
  // Count tiles with river feature
  const tilesWithRiver = Array.from(tiles.values()).filter(t => t.features?.includes('river'));
  console.log(`🏞️ ${tilesWithRiver.length} tiles marked with river feature`);
  
  console.log('🗺️🗺️🗺️ MAP ANALYSIS COMPLETE 🗺️🗺️🗺️');
}

// Run the analysis
analyzeMap().catch(console.error);
