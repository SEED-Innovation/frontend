import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ExportCsvButtonProps {
  data: any[];
  filename: string;
  columns: Array<{ key: string; label: string }>;
  className?: string;
}

export const ExportCsvButton: React.FC<ExportCsvButtonProps> = ({
  data,
  filename,
  columns,
  className = ""
}) => {
  const exportToCsv = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      // Create CSV header
      const headers = columns.map(col => col.label).join(',');
      
      // Create CSV rows
      const rows = data.map(item => 
        columns.map(col => {
          const value = item[col.key] || '';
          // Escape values containing commas, quotes, or newlines
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      );

      const csvContent = [headers, ...rows].join('\n');
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${data.length} records to ${filename}.csv`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportToCsv}
      className={`flex items-center gap-2 ${className}`}
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
};