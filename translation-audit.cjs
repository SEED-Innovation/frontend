#!/usr/bin/env node

const fs =require('fs');
const path = require('path');

// Common English words/phrases that should be translated
const translatablePatterns = [
  // Form titles and actions
  'Create User', 'Create Admin', 'Create Booking', 'Create Court', 'Create New',
  'Edit User', 'Edit Admin', 'Edit Booking', 'Edit Court', 'Update User',
  'Delete User', 'Delete Admin', 'Delete Booking', 'Delete Court',
  'Add New', 'Add User', 'Add Admin', 'Add Court', 'Add Camera',
  
  // Form labels
  'Full Name', 'First Name', 'Last Name', 'Email Address', 'Phone Number',
  'Username', 'Password', 'Confirm Password', 'Description', 'Location',
  'Start Date', 'End Date', 'Start Time', 'End Time', 'Date', 'Time',
  'Court Type', 'Sport Type', 'Surface Type', 'Price', 'Amount', 'Total',
  
  // Status and states
  'Active', 'Inactive', 'Pending', 'Approved', 'Rejected', 'Cancelled',
  'Available', 'Unavailable', 'Online', 'Offline', 'Connected', 'Disconnected',
  
  // Common actions
  'Save', 'Cancel', 'Submit', 'Confirm', 'Delete', 'Remove', 'Add', 'Edit',
  'Update', 'Create', 'Search', 'Filter', 'Sort', 'Export', 'Import',
  'Refr', 'Reset', 'Clear', 'Select', 'Choose', 'Browse', 'Upload',
  
  // Table headers
  'Name', 'Email', 'Phone', 'Status', 'Type', 'Date', 'Time', 'Actions',
  'Court', 'User', 'Admin', 'Booking', 'Payment', 'Amount', 'Total',
  
  // Messages and notifications
  'Loading', 'Success', 'Error', 'Warning', 'Info', 'No data', 'Not found',
  'Coming Soon', 'Under Construction', 'Please wait', 'Try again',
  
  // Navigation and UI
  'Dashboard', 'Settings', 'Profile', 'Users', 'Admins', 'Courts', 'Bookings',
  'Payments', 'Analytics', 'Reports', 'Sessions', 'Cameras', 'Management'
];

function analyzeComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, '.tsx');
    
    // Check if component has translation implementation
    const hasTranslationImport = content.includes('useTranslation') || content.includes('import.*i18n');
    const hasTranslationUsage = content.includes('t(') && hasTranslationImport;
    
    // Find hardcoded translatable strings
    const hardcodedStrings = [];
    
    // Pattern 1: Text between JSX tags
    const jsxTextPattern = />\s*([A-Z][a-zA-Z\s&]{2,50})\s*</g;
    let match;
    while ((match = jsxTextPattern.exec(content)) !== null) {
      const text = match[1].trim();
      if (isTranslatable(text)) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        hardcodedStrings.push({ text, line: lineNumber, type: 'jsx-text' });
      }
    }
    
    // Pattern 2: String literals in attributes
    const attributePattern = /(placeholder|title|alt|label)="([^"]{3,})"/g;
    while ((match = attributePattern.exec(content)) !== null) {
      const text = match[2];
      if (isTranslatable(text)) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        hardcodedStrings.push({ text, line: lineNumber, type: 'attribute' });
      }
    }
    
    // Pattern 3: Button text and form labels
    const buttonPattern = /Button[^>]*>\s*([A-Z][a-zA-Z\s]{2,30})\s*</g;
    while ((match = buttonPattern.exec(content)) !== null) {
      const text = match[1].trim();
      if (isTranslatable(text)) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        hardcodedStrings.push({ text, line: lineNumber, type: 'button' });
      }
    }
    
    return {
      file: filePath,
      fileName,
      hasTranslationImport,
      hasTranslationUsage,
      implemented: hasTranslationImport && hasTranslationUsage,
      hardcodedStrings,
      priority: calculatePriority(fileName, hardcodedStrings)
    };
  } catch (error) {
    return null;
  }
}

function isTranslatable(text) {
  // Skip if it's obviously not translatable
  if (!text || 
      text.length < 3 || 
      text.includes('{') || 
      text.includes('}') || 
      text.includes('className') ||
      text.includes('onClick') ||
      text.includes('www.') ||
      text.includes('http') ||
      text.includes('@') ||
      text.match(/^[a-z][a-zA-Z0-9]*$/) || // camelCase
      text.match(/^[A-Z_]+$/) || // CONSTANTS
      text.match(/^\d+$/) // numbers only
  ) {
    return false;
  }
  
  // Check if it matches common translatable patterns
  return translatablePatterns.some(pattern => 
    text.toLowerCase().includes(pattern.toLowerCase()) ||
    pattern.toLowerCase().includes(text.toLowerCase())
  );
}

function calculatePriority(fileName, hardcodedStrings) {
  let priority = 0;
  
  // High priority for form components
  if (fileName.toLowerCase().includes('create') || 
      fileName.toLowerCase().includes('edit') ||
      fileName.toLowerCase().includes('form') ||
      fileName.toLowerCase().includes('modal') ||
      fileName.toLowerCase().includes('dialog')) {
    priority += 10;
  }
  
  // Medium priority for management components
  if (fileName.toLowerCase().includes('management') ||
      fileName.toLowerCase().includes('admin')) {
    priority += 5;
  }
  
  // Add points for number of hardcoded strings
  priority += hardcodedStrings.length;
  
  return priority;
}

function scanDirectory(dirPath) {
  const results = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        results.push(...scanDirectory(fullPath));
      } else if (item.endsWith('.tsx')) {
        const analysis = analyzeComponent(fullPath);
        if (analysis && analysis.hardcodedStrings.length > 0) {
          results.push(analysis);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dirPath}:`, error.message);
  }
  
  return results;
}

function main() {
  console.log('🔍 COMPREHENSIVE TRANSLATION AUDIT\n');
  console.log('Scanning all admin components for missing translations...\n');
  
  const results = scanDirectory('src/components/admin');
  
  // Sort by priority (highest first)
  results.sort((a, b) => b.priority - a.priority);
  
  // Categorize results
  const notImplemented = results.filter(r => !r.implemented);
  const partiallyImplemented = results.filter(r => r.hasTranslationImport && !r.hasTranslationUsage);
  const needsMoreWork = results.filter(r => r.implemented && r.hardcodedStrings.length > 5);
  
  console.log('📊 AUDIT SUMMARY:');
  console.log(`🔴 Not Implemented: ${notImplemented.length} components`);
  console.log(`🟡 Partially Implemented: ${partiallyImplemented.length} components`);
  console.log(`🟠 Needs More Work: ${needsMoreWork.length} components`);
  console.log(`📝 Total Components: ${results.length}\n`);
  
  console.log('🎯 HIGH PRIORITY COMPONENTS (Forms & Dialogs):\n');
  
  const highPriority = results.filter(r => r.priority >= 10).slice(0, 10);
  highPriority.forEach((comp, index) => {
    const status = comp.implemented ? '🟡' : '🔴';
    console.log(`${index + 1}. ${status} ${comp.fileName} (Priority: ${comp.priority})`);
    console.log(`   📁 ${comp.file}`);
    console.log(`   📝 ${comp.hardcodedStrings.length} hardcoded strings`);
    
    // Show top 3 strings
    comp.hardcodedStrings.slice(0, 3).forEach(str => {
      console.log(`   Line ${str.line}: "${str.text}" (${str.type})`);
    });
    
    if (comp.hardcodedStrings.length > 3) {
      console.log(`   ... and ${comp.hardcodedStrings.length - 3} more`);
    }
    console.log('');
  });
  
  console.log('📋 RECOMMENDED TRANSLATION ORDER:\n');
  
  // Show recommended order for translation
  const translationQueue = [
    ...notImplemented.filter(r => r.priority >= 10),
    ...notImplemented.filter(r => r.priority >= 5 && r.priority < 10),
    ...partiallyImplemented.filter(r => r.priority >= 5),
    ...needsMoreWork.filter(r => r.priority >= 10)
  ].slice(0, 15);
  
  translationQueue.forEach((comp, index) => {
    const statusIcon = comp.implemented ? '🟡' : '🔴';
    const typeIcon = comp.fileName.toLowerCase().includes('create') ? '➕' :
                    comp.fileName.toLowerCase().includes('edit') ? '✏️' :
                    comp.fileName.toLowerCase().includes('form') ? '📝' :
                    comp.fileName.toLowerCase().includes('modal') ? '🔲' : '📄';
    
    console.log(`${index + 1}. ${statusIcon} ${typeIcon} ${comp.fileName}`);
    console.log(`   Priority: ${comp.priority} | Strings: ${comp.hardcodedStrings.length}`);
  });
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Start with the highest priority components (Create/Edit forms)');
  console.log('2. Add useTranslation hook to each component');
  console.log('3. Replace hardcoded strings with t() calls');
  console.log('4. Add missing translation keys to JSON files');
  console.log('5. Test each component in both languages');
  
  // Generate translation keys suggestions
  console.log('\n💡 SUGGESTED TRANSLATION KEYS TO ADD:\n');
  const allStrings = results.flatMap(r => r.hardcodedStrings.map(s => s.text));
  const uniqueStrings = [...new Set(allStrings)].slice(0, 20);
  
  uniqueStrings.forEach(text => {
    const key = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/^_+|_+$/g, '');
    console.log(`"${key}": "${text}",`);
  });
}

if (require.main === module) {
  main();
}

module.exports = { analyzeComponent, scanDirectory };