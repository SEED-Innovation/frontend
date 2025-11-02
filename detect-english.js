#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Common English words that should be translated
const commonWords = [
  'Add', 'Edit', 'Delete', 'Save', 'Cancel', 'Submit', 'Create', 'Update', 'Remove',
  'View', 'Show', 'Hide', 'Open', 'Close', 'Back', 'Next', 'Previous', 'Continue',
  'Loading', 'Search', 'Filter', 'Sort', 'Export', 'Import', 'Refresh', 'Settings',
  'Profile', 'Dashboard', 'Management', 'Analytics', 'Reports', 'Users', 'Admin',
  'Status', 'Active', 'Inactive', 'Pending', 'Approved', 'Rejected', 'Total',
  'Name', 'Email', 'Phone', 'Address', 'Description', 'Actions', 'Details',
  'All', 'None', 'Select', 'Choose', 'Find', 'Browse', 'Upload', 'Download'
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];
    
    // Skip if already has translations
    if (content.includes('useTranslation') || content.includes('t(')) {
      return findings;
    }
    
    // Look for hardcoded strings in JSX
    const patterns = [
      />\s*([A-Z][a-zA-Z\s]{2,30})\s*</g,  // Text between tags
      /placeholder="([^"]{3,})"/g,          // Placeholder text
      /title="([^"]{3,})"/g,               // Title attributes
      /alt="([^"]{3,})"/g,                 // Alt text
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1];
        if (text && commonWords.some(word => text.includes(word))) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          findings.push({ file: filePath, line: lineNumber, text: text.trim() });
        }
      }
    });
    
    return findings;
  } catch (error) {
    return [];
  }
}

function scanDirectory(dirPath) {
  const findings = [];
  try {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        findings.push(...scanDirectory(fullPath));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        findings.push(...scanFile(fullPath));
      }
    }
  } catch (error) {
    // Ignore errors
  }
  return findings;
}

// Scan admin components
const findings = scanDirectory('src/components/admin');
console.log('Hardcoded English text found:');
findings.forEach(f => console.log(`${f.file}:${f.line} - "${f.text}"`));