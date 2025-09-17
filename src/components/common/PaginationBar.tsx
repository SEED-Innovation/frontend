import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  page: number;
  setPage: (n: number) => void;
  hasPrev: boolean;
  hasNext: boolean;
  totalPages?: number;
}

export function PaginationBar({ page, setPage, hasPrev, hasNext, totalPages }: PaginationBarProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Button 
        variant="outline" 
        size="sm" 
        disabled={!hasPrev} 
        onClick={() => setPage(page - 1)}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      
      <span className="px-4 py-2 text-sm text-muted-foreground">
        Page {page + 1}{totalPages ? ` of ${totalPages}` : ''}
      </span>
      
      <Button 
        variant="outline" 
        size="sm" 
        disabled={!hasNext} 
        onClick={() => setPage(page + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}