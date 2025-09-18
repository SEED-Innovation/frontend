import React, { useState, useEffect, useCallback } from 'react';
import { Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { courtService } from '@/lib/api/services/courtService';
import { Court } from '@/types/court';

interface CourtSearchInputProps {
  placeholder?: string;
  onSelect: (court: Court) => void;
  value?: Court | null;
  className?: string;
}

export const CourtSearchInput: React.FC<CourtSearchInputProps> = ({
  placeholder = "Search courts...",
  onSelect,
  value,
  className = ""
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(false);

  const searchCourts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setCourts([]);
      return;
    }

    setLoading(true);
    try {
      const results = await courtService.searchCourts(searchQuery);
      setCourts(results);
    } catch (error) {
      console.error('Failed to search courts:', error);
      setCourts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchCourts(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchCourts]);

  const handleSelect = (court: Court) => {
    onSelect(court);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value ? (
              <div className="flex items-center space-x-2">
                <span>{value.name}</span>
                <Badge variant="secondary" className="ml-auto">
                  {value.sportType}
                </Badge>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Type to search courts..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {loading && (
                <div className="p-4 text-sm text-muted-foreground">
                  Searching...
                </div>
              )}
              {!loading && query && courts.length === 0 && (
                <CommandEmpty>No courts found.</CommandEmpty>
              )}
              {!loading && courts.length > 0 && (
                <CommandGroup>
                  {courts.map((court) => (
                    <CommandItem
                      key={court.id}
                      value={court.name}
                      onSelect={() => handleSelect(court)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span>{court.name}</span>
                        {court.location && (
                          <span className="text-xs text-muted-foreground">
                            {court.location}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {court.sportType}
                        </Badge>
                        {value?.id === court.id && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};