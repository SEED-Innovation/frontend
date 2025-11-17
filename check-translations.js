#!/usr/bin/env node

/**
 * Translation Verification Script
 * Checks if all admin panel pages have proper translation coverage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load translation files
const enAdmin = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/locales/en/admin.json'), 'utf8'));
const arAdmin = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/locales/ar/admin.json'), 'utf8'));

// Function to get all keys from nested object
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Get all keys from both files
const enKeys = getAllKeys(enAdmin);
const arKeys = getAllKeys(arAdmin);

console.log('🔍 Translation Coverage Report\n');
console.log('=' .repeat(60));
console.log(`📊 English keys: ${enKeys.length}`);
console.log(`📊 Arabic keys: ${arKeys.length}`);
console.log('=' .repeat(60));

// Find missing keys
const missingInArabic = enKeys.filter(key => !arKeys.includes(key));
const missingInEnglish = arKeys.filter(key => !enKeys.includes(key));

if (missingInArabic.length > 0) {
  console.log('\n❌ Keys missing in Arabic:');
  missingInArabic.forEach(key => console.log(`   - ${key}`));
} else {
  console.log('\n✅ All English keys have Arabic translations');
}

if (missingInEnglish.length > 0) {
  console.log('\n❌ Keys missing in English:');
  missingInEnglish.forEach(key => console.log(`   - ${key}`));
} else {
  console.log('\n✅ All Arabic keys have English translations');
}

// Check for empty values
function findEmptyValues(obj, prefix = '', lang = '') {
  let empty = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      empty = empty.concat(findEmptyValues(obj[key], fullKey, lang));
    } else if (obj[key] === '' || obj[key] === null || obj[key] === undefined) {
      empty.push({ key: fullKey, lang });
    }
  }
  return empty;
}

const emptyEn = findEmptyValues(enAdmin, '', 'English');
const emptyAr = findEmptyValues(arAdmin, '', 'Arabic');

if (emptyEn.length > 0 || emptyAr.length > 0) {
  console.log('\n⚠️  Empty translation values found:');
  [...emptyEn, ...emptyAr].forEach(({ key, lang }) => {
    console.log(`   - ${lang}: ${key}`);
  });
} else {
  console.log('\n✅ No empty translation values found');
}

console.log('\n' + '=' .repeat(60));
console.log('✨ Translation check complete!\n');

// Exit with error code if there are issues
if (missingInArabic.length > 0 || missingInEnglish.length > 0 || emptyEn.length > 0 || emptyAr.length > 0) {
  process.exit(1);
} else {
  console.log('🎉 All translations are complete and consistent!\n');
  process.exit(0);
}
