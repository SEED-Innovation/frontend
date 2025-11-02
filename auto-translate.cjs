#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Translation mappings for common admin text
const translations = {
  // Status
  'Pending': 'admin.status.pending',
  'Active': 'admin.status.active',
  'Inactive': 'admin.status.inactive',
  'Approved': 'admin.status.approved',
  'Rejected': 'admin.status.rejected',
  'Cancelled': 'admin.status.cancelled',
  
  // Common actions
  'Add': 'admin.common.add',
  'Edit': 'admin.common.edit',
  'Delete': 'admin.common.delete',
  'Save': 'admin.common.save',
  'Cancel': 'admin.common.cancel',
  'Create': 'admin.common.create',
  'Update': 'admin.common.update',
  'Remove': 'admin.common.remove',
  'View': 'admin.common.view',
  'Refresh': 'admin.common.refresh',
  'Search': 'admin.common.search',
  'Filter': 'admin.common.filter',
  'Export': 'admin.common.export',
  
  // Form labels
  'Name': 'admin.forms.labels.name',
  'Email': 'admin.forms.labels.email',
  'Phone': 'admin.forms.labels.phone',
  'Status': 'admin.forms.labels.status',
  'Type': 'admin.forms.labels.type',
  'Date': 'admin.forms.labels.date',
  'Time': 'admin.forms.labels.time',
  'Court': 'admin.forms.labels.court',
  'User': 'admin.forms.labels.user',
  'Amount': 'admin.forms.labels.amount',
  'Total': 'admin.forms.labels.total',
  'Description': 'admin.forms.labels.description',
  'Location': 'admin.forms.labels.location',
  
  // Table headers
  'Actions': 'admin.tables.headers.actions',
  
  // Buttons
  'Create Booking': 'admin.forms.buttons.createBooking',
  'Save Changes': 'admin.forms.buttons.saveChanges',
  'View Details': 'admin.forms.buttons.viewDetails',
  'Clear All': 'admin.forms.buttons.clearAll',
  
  // Placeholders
  'Search by name, email, or phone...': 'admin.pages.userManagement.searchPlaceholder',
  'Search courts...': 'admin.forms.placeholders.searchCourtsByName',
  'Select user': 'admin.forms.placeholders.selectUser',
  'Select court': 'admin.forms.placeholders.selectCourt'
};

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Skip if already has translation hook
    if (!content.includes('useTranslation')) {
      return false;
    }
    
    // Replace hardcoded strings with translation keys
    Object.entries(translations).forEach(([text, key]) => {
      const patterns = [
        new RegExp(`>\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<`, 'g'),
        new RegExp(`"${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'),
        new RegExp(`'${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g')
      ];
      
      patterns.forEach(pattern => {
        const replacement = pattern.source.includes('>') ? 
          `>{t('${key}')}<` : 
          `{t('${key}')}`;
        
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          updated = true;
        }
      });
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function scanDirectory(dirPath) {
  let updatedCount = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        updatedCount += scanDirectory(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        if (updateFile(fullPath)) {
          updatedCount++;
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dirPath}:`, error.message);
  }
  
  return updatedCount;
}

console.log('🔄 Auto-translating admin components...\n');

const updatedFiles = scanDirectory('src/components/admin');

console.log(`\n✅ Auto-translation complete! Updated ${updatedFiles} files.`);
console.log('\n💡 Remember to:');
console.log('1. Add useTranslation hook to components that need it');
console.log('2. Test the translations in both languages');
console.log('3. Add any missing translation keys to the JSON files');