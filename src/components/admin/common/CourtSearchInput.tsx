import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, ChevronDown, Loader2, Building2, MapPin } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { courtService } from '@/services';
import { CourtResponse } from '@/types/booking';

interface CourtSearchInputProps {
  onCourtSelect: (court: CourtResponse | null) => void;
  selectedCourt?: CourtResponse | null;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
}

const CourtSearchInput: React.FC<CourtSearchInputProps> = ({
  onCourtSelect,
  selectedCourt,
  placeholder = "Search courts...",
  className = "",
  disabled = false,
  allowClear = true
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [courts, setCourts] = useState<CourtResponse[]>([]);
  const [recentCourts, setRecentCourts] = useState<CourtResponse[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    if (open && recentCourts.length === 0) {
      loadRecentCourts();
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [open]);

  useEffect(() => {
    if (searchTerm.trim()) {
      // Debounce search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        searchCourts(searchTerm, 1);
      }, 300);
    } else {
      setCourts([]);
      setPage(1);
      setHasMore(true);
    }
  }, [searchTerm]);

  const loadRecentCourts = async () => {
    try {
      setLoading(true);
      const response = await courtService.getAllCourts();
      // Take first 6 as "recent"
      const recentItems = response.slice(0, ITEMS_PER_PAGE).map(court => ({
        id: parseInt(court.id),
        name: court.name,
        location: court.location,
        type: court.type,
        hourlyFee: court.hourlyFee,
        hasSeedSystem: court.hasSeedSystem,
        imageUrl: court.imageUrl || '',
        amenities: court.amenities || [],
        techFeatures: court.techFeatures || [],
        description: court.description || '',
        openingTimes: court.openingTimes || {},
        rating: null,
        totalRatings: null,
        distanceInMeters: null,
        formattedDistance: null,
        latitude: null,
        longitude: null
      }));
      setRecentCourts(recentItems);
    } catch (error) {
      console.error('Failed to load recent courts:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchCourts = async (term: string, pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await courtService.getAllCourts();
      
      // Client-side filtering for search
      const filtered = response.filter(court =>
        court.name.toLowerCase().includes(term.toLowerCase()) ||
        court.location.toLowerCase().includes(term.toLowerCase()) ||
        court.type.toLowerCase().includes(term.toLowerCase())
      );

      // Convert to CourtResponse format
      const convertedCourts = filtered.map(court => ({
        id: parseInt(court.id),
        name: court.name,
        location: court.location,
        type: court.type,
        hourlyFee: court.hourlyFee,
        hasSeedSystem: court.hasSeedSystem,
        imageUrl: court.imageUrl || '',
        amenities: court.amenities || [],
        techFeatures: court.techFeatures || [],
        description: court.description || '',
        openingTimes: court.openingTimes || {},
        rating: null,
        totalRatings: null,
        distanceInMeters: null,
        formattedDistance: null,
        latitude: null,
        longitude: null
      }));

      // Paginate results
      const startIndex = (pageNum - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedResults = convertedCourts.slice(startIndex, endIndex);

      if (pageNum === 1) {
        setCourts(paginatedResults);
      } else {
        setCourts(prev => [...prev, ...paginatedResults]);
      }

      setHasMore(endIndex < convertedCourts.length);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to search courts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleCourtSelect = (court: CourtResponse) => {
    onCourtSelect(court);
    setOpen(false);
    setSearchTerm('');
  };

  const handleClearSelection = () => {
    onCourtSelect(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchTerm('');
      setCourts([]);
      setPage(1);
      setHasMore(true);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading && searchTerm.trim()) {
      searchCourts(searchTerm, page + 1);
    }
  };

  const getCourtInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const highlightMatch = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  };

  const renderCourtItem = (court: CourtResponse, isRecent = false) => (
    <CommandItem
      key={`${isRecent ? 'recent' : 'search'}-${court.id}`}
      value={court.name}
      onSelect={() => handleCourtSelect(court)}
      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={court.imageUrl} alt={court.name} />
        <AvatarFallback className="text-xs">
          {getCourtInitials(court.name)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" 
           dangerouslySetInnerHTML={{ 
             __html: highlightMatch(court.name, searchTerm) 
           }} 
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate"
                dangerouslySetInnerHTML={{ 
                  __html: highlightMatch(court.location, searchTerm) 
                }} 
          />
          <Badge variant="outline" className="text-xs">
            {court.type}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium">{court.hourlyFee} SAR/hr</span>
        {selectedCourt?.id === court.id && (
          <Check className="h-4 w-4 text-primary" />
        )}
      </div>
    </CommandItem>
  );

  const renderSelectedCourt = () => (
    <div className={cn("flex items-center gap-2 p-2 border rounded-md bg-background", className)}>
      <Avatar className="h-6 w-6">
        <AvatarImage src={selectedCourt?.imageUrl} alt={selectedCourt?.name} />
        <AvatarFallback className="text-xs">
          {selectedCourt ? getCourtInitials(selectedCourt.name) : ''}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{selectedCourt?.name}</p>
        <p className="text-xs text-muted-foreground truncate">{selectedCourt?.location}</p>
      </div>
      
      {allowClear && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearSelection}
          className="h-6 w-6 p-0 hover:bg-muted"
        >
          <span className="sr-only">Clear selection</span>
          ×
        </Button>
      )}
    </div>
  );

  const renderSearchContent = () => (
    <Command shouldFilter={false}>
      <CommandInput
        ref={inputRef}
        placeholder={placeholder}
        value={searchTerm}
        onValueChange={handleSearchChange}
        className="border-0 focus:ring-0"
      />
      
      <CommandList className="max-h-[300px] overflow-auto">
        {loading && searchTerm.trim() && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Searching courts...</span>
          </div>
        )}

        {!searchTerm.trim() && !loading && (
          <CommandGroup heading="Recent Courts">
            {recentCourts.length > 0 ? (
              recentCourts.map(court => renderCourtItem(court, true))
            ) : (
              <div className="flex items-center justify-center py-6">
                <Building2 className="h-8 w-8 text-muted-foreground/50" />
                <span className="text-sm text-muted-foreground ml-2">No recent courts</span>
              </div>
            )}
          </CommandGroup>
        )}

        {searchTerm.trim() && !loading && (
          <CommandGroup heading={`Search Results (${courts.length}${hasMore ? '+' : ''})`}>
            {courts.length > 0 ? (
              <>
                {courts.map(court => renderCourtItem(court))}
                {hasMore && (
                  <CommandItem onSelect={loadMore} className="justify-center py-3">
                    <Button variant="ghost" size="sm" onClick={loadMore}>
                      Load more courts...
                    </Button>
                  </CommandItem>
                )}
              </>
            ) : (
              <CommandEmpty>
                <div className="flex flex-col items-center py-6">
                  <Search className="h-8 w-8 text-muted-foreground/50" />
                  <span className="text-sm text-muted-foreground mt-2">
                    No courts found for "{searchTerm}"
                  </span>
                </div>
              </CommandEmpty>
            )}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );

  if (selectedCourt && !open) {
    return renderSelectedCourt();
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">
              {selectedCourt ? selectedCourt.name : placeholder}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[400px] p-0" align="start">
        {renderSearchContent()}
      </PopoverContent>
    </Popover>
  );
};

export default CourtSearchInput;