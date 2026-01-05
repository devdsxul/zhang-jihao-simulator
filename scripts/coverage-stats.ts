#!/usr/bin/env npx ts-node
/**
 * Ending Coverage Statistics
 * Simulates 10000 game runs and calculates ending coverage
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../src/data');
const SCENES_DIR = path.join(DATA_DIR, 'scenes');
const ENDINGS_FILE = path.join(DATA_DIR, 'endings.json');
const TOTAL_SCENES = 10;
const SIMULATION_RUNS = 10000;

interface GameStats {
  academicStanding: number;
  digitalSafety: number;
  wealth: number;
  billiardsSkill: number;
  sanity: number;
}

interface StatEffect {
  stat: keyof GameStats;
  change: number;
}

interface Choice {
  id: string;
  effects: StatEffect[];
}

interface Scene {
  id: string;
  choices: Choice[];
}

interface EndingCondition {
  stat: keyof GameStats;
  operator: 'lt' | 'lte' | 'gt' | 'gte' | 'eq';
  value: number;
}

interface Ending {
  id: string;
  type: 'negative' | 'positive' | 'rare';
  title: string;
  conditions: EndingCondition[];
  priority: number;
}

const INITIAL_STATS: GameStats = {
  academicStanding: 20,
  digitalSafety: 40,
  wealth: 30,
  billiardsSkill: 50,
  sanity: 60,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function checkCondition(stats: GameStats, condition: EndingCondition): boolean {
  const statValue = stats[condition.stat];
  switch (condition.operator) {
    case 'lt': return statValue < condition.value;
    case 'lte': return statValue <= condition.value;
    case 'gt': return statValue > condition.value;
    case 'gte': return statValue >= condition.value;
    case 'eq': return statValue === condition.value;
    default: return false;
  }
}

function calculateEnding(stats: GameStats, endings: Ending[]): Ending {
  const sorted = [...endings].sort((a, b) => b.priority - a.priority);
  for (const ending of sorted) {
    if (ending.conditions.every((c) => checkCondition(stats, c))) {
      return ending;
    }
  }
  // Fallback to random by type
  const avg = Object.values(stats).reduce((a, b) => a + b, 0) / 5;
  const filtered = endings.filter((e) =>
    avg >= 70 ? e.type === 'rare' : avg >= 50 ? e.type === 'positive' : e.type === 'negative'
  );
  return filtered[Math.floor(Math.random() * filtered.length)] || endings[0];
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function selectScenes(allScenes: Scene[], count: number): Scene[] {
  return shuffleArray(allScenes).slice(0, count);
}

function simulateGame(allScenes: Scene[], allEndings: Ending[]): string {
  const stats: GameStats = { ...INITIAL_STATS };
  const selectedScenes = selectScenes(allScenes, TOTAL_SCENES);

  for (const scene of selectedScenes) {
    const choice = scene.choices[Math.floor(Math.random() * scene.choices.length)];
    for (const effect of choice.effects || []) {
      stats[effect.stat] = clamp(stats[effect.stat] + effect.change, 0, 100);
    }
  }

  return calculateEnding(stats, allEndings).id;
}

async function main() {
  console.log('🎮 Ending Coverage Simulation\n');
  console.log(`Running ${SIMULATION_RUNS.toLocaleString()} simulations...\n`);

  // Load data
  const sceneFiles = fs.readdirSync(SCENES_DIR).filter((f) => f.endsWith('.json'));
  const allScenes: Scene[] = [];
  for (const file of sceneFiles) {
    const scenes = JSON.parse(fs.readFileSync(path.join(SCENES_DIR, file), 'utf-8'));
    allScenes.push(...scenes);
  }

  const allEndings: Ending[] = JSON.parse(fs.readFileSync(ENDINGS_FILE, 'utf-8'));

  console.log(`📊 Data: ${allScenes.length} scenes, ${allEndings.length} endings\n`);

  // Run simulations
  const hitCounts = new Map<string, number>();
  allEndings.forEach((e) => hitCounts.set(e.id, 0));

  for (let i = 0; i < SIMULATION_RUNS; i++) {
    const endingId = simulateGame(allScenes, allEndings);
    hitCounts.set(endingId, (hitCounts.get(endingId) || 0) + 1);
  }

  // Calculate statistics
  const triggered = [...hitCounts.entries()].filter(([_, count]) => count > 0);
  const untriggered = [...hitCounts.entries()].filter(([_, count]) => count === 0);
  const hitRate = (triggered.length / allEndings.length * 100).toFixed(1);

  // Distribution by type
  const byType = { negative: 0, positive: 0, rare: 0 };
  hitCounts.forEach((count, id) => {
    const ending = allEndings.find((e) => e.id === id);
    if (ending && count > 0) byType[ending.type]++;
  });

  // Top 10 endings
  const sorted = [...hitCounts.entries()].sort((a, b) => b[1] - a[1]);
  const top10 = sorted.slice(0, 10);

  // Generate report
  console.log('# Ending Coverage Report\n');
  console.log(`## Summary\n`);
  console.log(`- **Simulations**: ${SIMULATION_RUNS.toLocaleString()}`);
  console.log(`- **Hit Rate**: ${hitRate}% (${triggered.length}/${allEndings.length})`);
  console.log(`- **Untriggered**: ${untriggered.length} endings\n`);

  console.log(`## Distribution by Type\n`);
  console.log(`| Type | Triggered | Total | Rate |`);
  console.log(`|------|-----------|-------|------|`);
  ['negative', 'positive', 'rare'].forEach((type) => {
    const total = allEndings.filter((e) => e.type === type).length;
    const rate = total > 0 ? ((byType[type as keyof typeof byType] / total) * 100).toFixed(1) : '0.0';
    console.log(`| ${type} | ${byType[type as keyof typeof byType]} | ${total} | ${rate}% |`);
  });

  console.log(`\n## Top 10 Endings\n`);
  console.log(`| Rank | ID | Title | Hits | Rate |`);
  console.log(`|------|----|-------|------|------|`);
  top10.forEach(([id, count], i) => {
    const ending = allEndings.find((e) => e.id === id);
    const rate = ((count / SIMULATION_RUNS) * 100).toFixed(2);
    console.log(`| ${i + 1} | ${id} | ${ending?.title || 'Unknown'} | ${count} | ${rate}% |`);
  });

  if (untriggered.length > 0) {
    console.log(`\n## Untriggered Endings\n`);
    untriggered.forEach(([id]) => {
      const ending = allEndings.find((e) => e.id === id);
      console.log(`- [${ending?.type}] ${id}: ${ending?.title || 'Unknown'}`);
    });
  }

  console.log(`\n---\n*Generated at ${new Date().toISOString()}*`);
}

main();
