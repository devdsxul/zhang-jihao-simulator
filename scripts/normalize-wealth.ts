/**
 * Wealth Normalization Script
 * Converts extreme wealth values to the 0-100 scale wealth index.
 *
 * Mapping rules:
 * - ±3000 → ±30 (Major financial event)
 * - ±2000 → ±25 (Severe financial impact)
 * - ±1000 → ±20 (Significant financial change)
 * - ±500  → ±15 (Medium financial change)
 * - ±200~±300 → ±10 (Normal financial change)
 * - ±100  → ±5 (Minor financial change)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface StatEffect {
  stat: string;
  change: number;
}

interface Choice {
  id: string;
  text: string;
  effects: StatEffect[];
  triggerMinigame?: boolean;
}

interface Scene {
  id: string;
  category: string;
  text: string;
  animation: string;
  choices: Choice[];
  minigame?: unknown;
}

function mapWealthValue(value: number): number {
  const sign = value >= 0 ? 1 : -1;
  const absValue = Math.abs(value);

  if (absValue >= 3000) return sign * 30;
  if (absValue >= 2000) return sign * 25;
  if (absValue >= 1000) return sign * 20;
  if (absValue >= 500) return sign * 15;
  if (absValue >= 200) return sign * 10;
  if (absValue >= 100) return sign * 5;

  // Values already in valid range
  return value;
}

function normalizeScenes(scenes: Scene[]): { modified: number; scenes: Scene[] } {
  let modified = 0;

  const normalizedScenes = scenes.map(scene => ({
    ...scene,
    choices: scene.choices.map(choice => ({
      ...choice,
      effects: choice.effects.map(effect => {
        if (effect.stat === 'wealth' && Math.abs(effect.change) >= 100) {
          const newValue = mapWealthValue(effect.change);
          if (newValue !== effect.change) {
            console.log(`  Scene ${scene.id}, Choice ${choice.id}: wealth ${effect.change} → ${newValue}`);
            modified++;
          }
          return { ...effect, change: newValue };
        }
        return effect;
      })
    }))
  }));

  return { modified, scenes: normalizedScenes };
}

async function main() {
  const scenesDir = path.join(__dirname, '../src/data/scenes');
  const files = fs.readdirSync(scenesDir).filter(f => f.endsWith('.json'));

  let totalModified = 0;

  for (const file of files) {
    const filePath = path.join(scenesDir, file);
    console.log(`\nProcessing ${file}...`);

    const content = fs.readFileSync(filePath, 'utf-8');
    const scenes: Scene[] = JSON.parse(content);

    const { modified, scenes: normalizedScenes } = normalizeScenes(scenes);

    if (modified > 0) {
      fs.writeFileSync(filePath, JSON.stringify(normalizedScenes, null, 2));
      console.log(`  Modified ${modified} wealth values`);
      totalModified += modified;
    } else {
      console.log(`  No changes needed`);
    }
  }

  console.log(`\n✅ Total wealth values normalized: ${totalModified}`);
}

main().catch(console.error);
