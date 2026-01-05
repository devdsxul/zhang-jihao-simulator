/**
 * Script to add rarity field to all endings in endings.json
 * Rarity assignment logic:
 * - type=rare → rarity=secret
 * - priority >= 90 → rarity=legendary (hard to trigger)
 * - priority >= 75 → rarity=rare
 * - priority >= 50 → rarity=uncommon
 * - otherwise → rarity=common
 */

const fs = require('fs');
const path = require('path');

const endingsPath = path.join(__dirname, '../src/data/endings.json');

// Read the endings file
const endings = JSON.parse(fs.readFileSync(endingsPath, 'utf8'));

// Function to determine rarity based on type and priority
function determineRarity(ending) {
  // If type was 'rare', convert to 'secret' rarity
  if (ending.type === 'rare') {
    return 'secret';
  }

  // Based on priority (higher priority = harder to trigger = rarer)
  const priority = ending.priority || 50;

  if (priority >= 90) {
    return 'legendary';
  } else if (priority >= 75) {
    return 'rare';
  } else if (priority >= 50) {
    return 'uncommon';
  } else {
    return 'common';
  }
}

// Function to convert old type to new type
function convertType(ending) {
  // 'rare' type becomes 'positive' type with 'secret' rarity
  if (ending.type === 'rare') {
    return 'positive';
  }
  return ending.type;
}

// Update each ending
const updatedEndings = endings.map(ending => {
  const rarity = determineRarity(ending);
  const newType = convertType(ending);

  return {
    id: ending.id,
    type: newType,
    rarity: rarity,
    title: ending.title,
    description: ending.description,
    conditions: ending.conditions,
    priority: ending.priority,
    ...(ending.pathSequence && { pathSequence: ending.pathSequence })
  };
});

// Write back to file
fs.writeFileSync(endingsPath, JSON.stringify(updatedEndings, null, 2), 'utf8');

console.log(`Updated ${updatedEndings.length} endings with rarity field.`);

// Print summary
const rarityCounts = updatedEndings.reduce((acc, e) => {
  acc[e.rarity] = (acc[e.rarity] || 0) + 1;
  return acc;
}, {});

console.log('Rarity distribution:');
Object.entries(rarityCounts).forEach(([rarity, count]) => {
  console.log(`  ${rarity}: ${count}`);
});
