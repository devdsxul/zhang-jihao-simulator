#!/usr/bin/env npx ts-node
/**
 * Data Validation Script
 * Validates scenes and endings data integrity
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../src/data');
const SCENES_DIR = path.join(DATA_DIR, 'scenes');
const ENDINGS_FILE = path.join(DATA_DIR, 'endings.json');

const VALID_CATEGORIES = [
  'academic-struggles',
  'football-fandom',
  'billiards-progression',
  'great-firewall',
  'digital-survival',
  'financial-temptations',
  'tianjin-life',
  'hometown-pressure',
  'health-physique',
  'crisis-management',
];

const VALID_ANIMATIONS = [
  'studying', 'football', 'billiards', 'scrolling', 'running',
  'eating', 'talking', 'stressed', 'celebrating', 'arrested',
];

const VALID_STATS = [
  'academicStanding', 'digitalSafety', 'wealth', 'billiardsSkill', 'sanity',
];

const VALID_OPERATORS = ['lt', 'lte', 'gt', 'gte', 'eq'];
const VALID_FLAG_OPERATORS = ['hasFlag', 'notFlag'];
const VALID_ENDING_TYPES = ['negative', 'positive'];
const VALID_EFFECT_TYPES = ['setFlag', 'clearFlag'];

interface ValidationError {
  file: string;
  id: string;
  field: string;
  message: string;
}

const errors: ValidationError[] = [];

function validateScene(scene: any, file: string): void {
  if (!scene.id || typeof scene.id !== 'string') {
    errors.push({ file, id: scene.id || 'unknown', field: 'id', message: 'Missing or invalid id' });
  }

  if (!VALID_CATEGORIES.includes(scene.category)) {
    errors.push({ file, id: scene.id, field: 'category', message: `Invalid category: ${scene.category}` });
  }

  if (!scene.text || typeof scene.text !== 'string') {
    errors.push({ file, id: scene.id, field: 'text', message: 'Missing or invalid text' });
  }

  if (!VALID_ANIMATIONS.includes(scene.animation)) {
    errors.push({ file, id: scene.id, field: 'animation', message: `Invalid animation: ${scene.animation}` });
  }

  if (!Array.isArray(scene.choices) || scene.choices.length === 0) {
    errors.push({ file, id: scene.id, field: 'choices', message: 'Missing or empty choices array' });
  } else {
    scene.choices.forEach((choice: any, i: number) => {
      if (!choice.id || typeof choice.id !== 'string') {
        errors.push({ file, id: scene.id, field: `choices[${i}].id`, message: 'Missing choice id' });
      }
      if (!choice.text || typeof choice.text !== 'string') {
        errors.push({ file, id: scene.id, field: `choices[${i}].text`, message: 'Missing choice text' });
      }
      if (Array.isArray(choice.effects)) {
        choice.effects.forEach((effect: any, j: number) => {
          // Check if it's a StatEffect
          if ('stat' in effect && 'change' in effect) {
            if (!VALID_STATS.includes(effect.stat)) {
              errors.push({ file, id: scene.id, field: `choices[${i}].effects[${j}].stat`, message: `Invalid stat: ${effect.stat}` });
            }
            if (typeof effect.change !== 'number') {
              errors.push({ file, id: scene.id, field: `choices[${i}].effects[${j}].change`, message: 'change must be a number' });
            }
          }
          // Check if it's a FlagEffect
          else if ('type' in effect && 'flag' in effect) {
            if (!VALID_EFFECT_TYPES.includes(effect.type)) {
              errors.push({ file, id: scene.id, field: `choices[${i}].effects[${j}].type`, message: `Invalid effect type: ${effect.type}` });
            }
            if (typeof effect.flag !== 'string') {
              errors.push({ file, id: scene.id, field: `choices[${i}].effects[${j}].flag`, message: 'flag must be a string' });
            }
          }
          // Unknown effect structure
          else {
            errors.push({ file, id: scene.id, field: `choices[${i}].effects[${j}]`, message: 'Unknown effect structure' });
          }
        });
      }
    });
  }
}

function validateEnding(ending: any, file: string): void {
  if (!ending.id || typeof ending.id !== 'string') {
    errors.push({ file, id: ending.id || 'unknown', field: 'id', message: 'Missing or invalid id' });
  }

  if (!VALID_ENDING_TYPES.includes(ending.type)) {
    errors.push({ file, id: ending.id, field: 'type', message: `Invalid type: ${ending.type}` });
  }

  if (!ending.title || typeof ending.title !== 'string') {
    errors.push({ file, id: ending.id, field: 'title', message: 'Missing or invalid title' });
  }

  if (!ending.description || typeof ending.description !== 'string') {
    errors.push({ file, id: ending.id, field: 'description', message: 'Missing or invalid description' });
  }

  if (typeof ending.priority !== 'number') {
    errors.push({ file, id: ending.id, field: 'priority', message: 'Missing or invalid priority' });
  }

  if (!Array.isArray(ending.conditions)) {
    errors.push({ file, id: ending.id, field: 'conditions', message: 'Missing conditions array' });
  } else {
    ending.conditions.forEach((cond: any, i: number) => {
      // Check if it's a StatCondition
      if ('stat' in cond && 'value' in cond) {
        if (!VALID_STATS.includes(cond.stat)) {
          errors.push({ file, id: ending.id, field: `conditions[${i}].stat`, message: `Invalid stat: ${cond.stat}` });
        }
        if (!VALID_OPERATORS.includes(cond.operator)) {
          errors.push({ file, id: ending.id, field: `conditions[${i}].operator`, message: `Invalid operator: ${cond.operator}` });
        }
        if (typeof cond.value !== 'number') {
          errors.push({ file, id: ending.id, field: `conditions[${i}].value`, message: 'value must be a number' });
        }
      }
      // Check if it's a FlagCondition
      else if ('flag' in cond && 'operator' in cond) {
        if (!VALID_FLAG_OPERATORS.includes(cond.operator)) {
          errors.push({ file, id: ending.id, field: `conditions[${i}].operator`, message: `Invalid flag operator: ${cond.operator}` });
        }
        if (typeof cond.flag !== 'string') {
          errors.push({ file, id: ending.id, field: `conditions[${i}].flag`, message: 'flag must be a string' });
        }
      }
      // Unknown condition structure
      else {
        errors.push({ file, id: ending.id, field: `conditions[${i}]`, message: 'Unknown condition structure' });
      }
    });
  }
}

function checkDuplicateIds(items: any[], type: string): void {
  const ids = new Set<string>();
  items.forEach((item) => {
    if (ids.has(item.id)) {
      errors.push({ file: type, id: item.id, field: 'id', message: 'Duplicate id detected' });
    }
    ids.add(item.id);
  });
}

async function main() {
  console.log('🔍 Validating data files...\n');

  // Validate scenes
  const sceneFiles = fs.readdirSync(SCENES_DIR).filter((f) => f.endsWith('.json'));
  const allScenes: any[] = [];

  for (const file of sceneFiles) {
    const filePath = path.join(SCENES_DIR, file);
    try {
      const scenes = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (Array.isArray(scenes)) {
        scenes.forEach((scene) => {
          validateScene(scene, file);
          allScenes.push(scene);
        });
      }
    } catch (e) {
      errors.push({ file, id: 'N/A', field: 'JSON', message: `Parse error: ${e}` });
    }
  }

  checkDuplicateIds(allScenes, 'scenes');
  console.log(`✅ Validated ${allScenes.length} scenes from ${sceneFiles.length} files`);

  // Validate endings
  try {
    const endings = JSON.parse(fs.readFileSync(ENDINGS_FILE, 'utf-8'));
    if (Array.isArray(endings)) {
      endings.forEach((ending) => validateEnding(ending, 'endings.json'));
      checkDuplicateIds(endings, 'endings');
      console.log(`✅ Validated ${endings.length} endings`);
    }
  } catch (e) {
    errors.push({ file: 'endings.json', id: 'N/A', field: 'JSON', message: `Parse error: ${e}` });
  }

  // Report
  console.log('\n' + '='.repeat(60));
  if (errors.length === 0) {
    console.log('✅ All data validated successfully! No errors found.');
  } else {
    console.log(`❌ Found ${errors.length} validation errors:\n`);
    errors.forEach((err) => {
      console.log(`  [${err.file}] ${err.id}.${err.field}: ${err.message}`);
    });
    process.exit(1);
  }
}

main();
