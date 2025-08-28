import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Settings, Calendar, DollarSign, Loader2, Search, Filter, X, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { courtService, Court, CreateCourtRequest, SetCourtAvailabilityRequest, AdminCourtAvailabilityResponse } from '@/lib/api/services/courtService';
import { adminService } from '@/services';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import new components
import { AvailabilityTable } from './availability/AvailabilityTable';
import { UnavailabilityTable } from './unavailability/UnavailabilityTable';
import { UnavailabilityForm } from './unavailability/UnavailabilityForm';

const CourtManagement = () => {
  const { user, hasPermission } = useAdminAuth();
  const [courts, setCourts] = useState<Court[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [managerComboboxOpen, setManagerComboboxOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courtToDelete, setCourtToDelete] = useState<Court | null>(null);

  const [newCourt, setNewCourt] = useState<CreateCourtRequest & {managerId?: string}>({
    name: '',
    type: '',
    location: '',
    hourlyFee: 0,
    hasSeedSystem: false,
    amenities: [],
    managerId: ''
  });

  const [availabilityData, setAvailabilityData] = useState({
    courtId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: ''
  });
  const [courtSearchOpen, setCourtSearchOpen] = useState(false);
  const [courtSearchValue, setCourtSearchValue] = useState("");
  
  // Location filter state
  const [locationSearchOpen, setLocationSearchOpen] = useState(false);
  const [locationSearchValue, setLocationSearchValue] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [customLocationInput, setCustomLocationInput] = useState("");
  const [showCustomLocationInput, setShowCustomLocationInput] = useState(false);
  
  // Advanced filtering state
  const [filters, setFilters] = useState({
    searchTerm: '',
    type: '',
    location: '',
    status: '',
    priceRange: [0, 300],
    hasSeedSystem: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch courts on component mount
  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      const fetchedCourts = await courtService.getAllCourts();
      console.log('Fetched courts:', fetchedCourts);
      setCourts(fetchedCourts);
    } catch (error) {
      console.error('Error fetching courts:', error);
      toast.error('Failed to load courts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setAdminsLoading(true);
      const adminsList = await adminService.getAllAdmins();
      setAdmins(adminsList);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admins');
    } finally {
      setAdminsLoading(false);
    }
  };

  const handleCreateCourt = async () => {
    if (!newCourt.name || !newCourt.type || !newCourt.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const courtData: any = {
        name: newCourt.name,
        type: newCourt.type,
        location: newCourt.location,
        hourlyFee: newCourt.hourlyFee,
        hasSeedSystem: newCourt.hasSeedSystem,
        amenities: newCourt.amenities
      };

      // Add managerId if selected
      if (newCourt.managerId) {
        courtData.managerId = newCourt.managerId;
      }
      const createdCourt = await courtService.createCourt(courtData);
      setCourts([...courts, createdCourt]);
      setNewCourt({
        name: '',
        type: '',
        location: '',
        hourlyFee: 0,
        hasSeedSystem: false,
        amenities: [],
        managerId: ''
      });
      setCreateDialogOpen(false);
      toast.success('Court created successfully');
    } catch (error) {
      console.error('Error creating court:', error);
      toast.error('Failed to create court');
    }
  };

  const handleEditCourt = async (court: Court) => {
    setEditingCourt(court);
    setEditDialogOpen(true);
  };

  const handleUpdateCourt = async () => {
    if (!editingCourt) return;

    try {
      const updatedCourt = await courtService.updateCourt(editingCourt.id, {
        name: editingCourt.name,
        type: editingCourt.type,
        location: editingCourt.location,
        hourlyFee: editingCourt.hourlyFee,
        hasSeedSystem: editingCourt.hasSeedSystem,
        amenities: editingCourt.amenities
      });
      
      setCourts(courts.map(court => 
        court.id === editingCourt.id ? updatedCourt : court
      ));
      
      setEditDialogOpen(false);
      setEditingCourt(null);
      toast.success('Court updated successfully');
    } catch (error) {
      console.error('Error updating court:', error);
      toast.error('Failed to update court');
    }
  };

  const canManageCourt = (court: Court) => {
    // SUPER_ADMIN can manage all courts
    if (hasPermission('SUPER_ADMIN')) return true;
    
    // ADMIN can manage courts assigned to them
    if (user?.role === 'ADMIN') {
      console.log('Checking ADMIN permissions for court:', {
        courtId: court.id,
        courtManagerId: court.managerId,
        userId: user.id,
        userRole: user.role,
        managerIdType: typeof court.managerId,
        userIdType: typeof user.id
      });
      
      // For now, let ADMIN manage all courts to test
      console.log('ADMIN can manage court - testing all courts');
      return true;
    }
    
    return false;
  };

  const handleToggleStatus = async (court: Court) => {
    try {
      const newStatus = court.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
      const updatedCourt = await courtService.updateCourtStatus(court.id, newStatus);
      
      setCourts(courts.map(c => 
        c.id === court.id ? updatedCourt : c
      ));
      
      toast.success(`Court status updated to ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating court status:', error);
      toast.error('Failed to update court status');
    }
  };

  const handleDeleteCourt = async (courtId: string) => {
    try {
      await courtService.deleteCourt(courtId);
      setCourts(courts.filter(court => court.id !== courtId));
      toast.success('Court deleted successfully');
      setDeleteDialogOpen(false);
      setCourtToDelete(null);
    } catch (error) {
      console.error('Error deleting court:', error);
      toast.error('Failed to delete court');
    }
  };

  const confirmDeleteCourt = (court: Court) => {
    setCourtToDelete(court);
    setDeleteDialogOpen(true);
  };

  const handleSetAvailability = async () => {
    if (!availabilityData.courtId || !availabilityData.dayOfWeek || !availabilityData.startTime || !availabilityData.endTime) {
      toast.error('Please fill in all availability fields');
      return;
    }

    try {
      const requestData: SetCourtAvailabilityRequest = {
        courtId: parseInt(availabilityData.courtId),
        dayOfWeek: availabilityData.dayOfWeek.toUpperCase(),
        start: availabilityData.startTime,
        end: availabilityData.endTime
      };

      await courtService.setAvailability(requestData);
      
      toast.success('Court availability updated successfully');
      setAvailabilityData({
        courtId: '',
        dayOfWeek: '',
        startTime: '',
        endTime: ''
      });
    } catch (error) {
      console.error('Error setting court availability:', error);
      toast.error('Failed to update court availability');
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'UNAVAILABLE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status?: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Available';
      case 'UNAVAILABLE': return 'Unavailable';
      default: return 'Unknown';
    }
  };

  // Advanced filtering logic
  const filteredCourts = courts.filter((court) => {
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        court.name.toLowerCase().includes(searchLower) ||
        court.type.toLowerCase().includes(searchLower) ||
        court.location.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Type filter
    if (filters.type && filters.type !== 'all-types' && court.type !== filters.type) return false;

    // Location filter
    if (selectedLocations.length > 0 && !selectedLocations.includes('all-locations')) {
      if (!selectedLocations.includes(court.location)) return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'all-status' && court.status !== filters.status) return false;

    // Price range filter
    if (court.hourlyFee < filters.priceRange[0] || court.hourlyFee > filters.priceRange[1]) return false;

    // Seed system filter
    if (filters.hasSeedSystem !== '' && filters.hasSeedSystem !== 'all-courts') {
      const hasSeed = filters.hasSeedSystem === 'true';
      if (court.hasSeedSystem !== hasSeed) return false;
    }

    return true;
  });

  // Get unique values for filter dropdowns
  const uniqueTypes = [...new Set(courts.map(court => court.type))].filter(Boolean);
  const uniqueLocations = [...new Set(courts.map(court => court.location))].filter(Boolean);
  const maxPrice = Math.max(...courts.map(court => court.hourlyFee || 0), 300);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      type: 'all-types',
      location: 'all-locations',
      status: 'all-status',
      priceRange: [0, maxPrice],
      hasSeedSystem: 'all-courts',
    });
    setSelectedLocations([]);
  };

  // Check if any filters are active
  const hasActiveFilters = 
    filters.searchTerm !== '' || 
    (filters.type !== '' && filters.type !== 'all-types') ||
    selectedLocations.length > 0 ||
    (filters.status !== '' && filters.status !== 'all-status') ||
    (filters.hasSeedSystem !== '' && filters.hasSeedSystem !== 'all-courts') ||
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== maxPrice;

  // Location filter handlers
  const handleLocationSelect = (location: string) => {
    if (location === 'all-locations') {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(prev => 
        prev.includes(location) 
          ? prev.filter(loc => loc !== location)
          : [...prev, location]
      );
    }
  };

  const handleAddCustomLocation = () => {
    if (customLocationInput.trim() && !uniqueLocations.includes(customLocationInput.trim())) {
      const newLocation = customLocationInput.trim();
      setSelectedLocations(prev => [...prev, newLocation]);
      setCustomLocationInput("");
      setShowCustomLocationInput(false);
    }
  };

  const removeLocationFilter = (locationToRemove: string) => {
    setSelectedLocations(prev => prev.filter(loc => loc !== locationToRemove));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Court Management</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'SUPER_ADMIN' 
              ? 'Manage all courts, availability, and pricing' 
              : 'Manage your assigned courts, availability, and pricing'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCourts} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {hasPermission('SUPER_ADMIN') && (
            <Dialog open={createDialogOpen} onOpenChange={(open) => {
              setCreateDialogOpen(open);
              if (open && hasPermission('SUPER_ADMIN')) {
                fetchAdmins();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Court
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Court</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Court Name *</Label>
                <Input
                  id="name"
                  value={newCourt.name}
                  onChange={(e) => setNewCourt({...newCourt, name: e.target.value})}
                  placeholder="e.g., Court 1 - Center"
                />
              </div>
              <div>
                <Label htmlFor="type">Court Type *</Label>
                                  <Select onValueChange={(value) => setNewCourt({...newCourt, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select court type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HARD">Hard Court</SelectItem>
                      <SelectItem value="CLAY">Clay Court</SelectItem>
                      <SelectItem value="GRASS">Grass Court</SelectItem>
                      <SelectItem value="INDOOR">Indoor Court</SelectItem>
                      <SelectItem value="OUTDOOR">Outdoor Court</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={newCourt.location}
                  onChange={(e) => setNewCourt({...newCourt, location: e.target.value})}
                  placeholder="e.g., Main Building"
                />
              </div>
              <div>
                <Label htmlFor="hourlyFee">Hourly Fee (SAR)</Label>
                <Input
                  id="hourlyFee"
                  type="number"
                  value={newCourt.hourlyFee}
                  onChange={(e) => setNewCourt({...newCourt, hourlyFee: Number(e.target.value)})}
                  placeholder="120"
                />
              </div>
              <div>
                <Label htmlFor="managerId">Court Manager</Label>
                <Popover open={managerComboboxOpen} onOpenChange={setManagerComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={managerComboboxOpen}
                      className="w-full justify-between"
                      disabled={adminsLoading}
                    >
                      {newCourt.managerId && newCourt.managerId !== "none"
                        ? admins.find((admin) => admin === newCourt.managerId) || newCourt.managerId
                        : adminsLoading 
                          ? "Loading admins..." 
                          : "Search and select an admin..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search admins..." />
                      <CommandList>
                        <CommandEmpty>No admin found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="none"
                            onSelect={() => {
                              setNewCourt({...newCourt, managerId: "none"});
                              setManagerComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                newCourt.managerId === "none" ? "opacity-100" : "opacity-0"
                              )}
                            />
                            No manager assigned
                          </CommandItem>
                          {admins.map((admin) => (
                            <CommandItem
                              key={admin}
                              value={admin}
                              onSelect={(currentValue) => {
                                setNewCourt({...newCourt, managerId: currentValue === newCourt.managerId ? "" : currentValue});
                                setManagerComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  newCourt.managerId === admin ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {admin}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleCreateCourt} className="w-full">
                Create Court
              </Button>
            </div>
          </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Edit Court Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Court</DialogTitle>
            </DialogHeader>
            {editingCourt && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Court Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingCourt.name}
                    onChange={(e) => setEditingCourt({...editingCourt, name: e.target.value})}
                    placeholder="e.g., Court 1 - Center"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Court Type *</Label>
                  <Select 
                    value={editingCourt.type} 
                    onValueChange={(value) => setEditingCourt({...editingCourt, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select court type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HARD">Hard Court</SelectItem>
                      <SelectItem value="CLAY">Clay Court</SelectItem>
                      <SelectItem value="GRASS">Grass Court</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-location">Location *</Label>
                  <Input
                    id="edit-location"
                    value={editingCourt.location}
                    onChange={(e) => setEditingCourt({...editingCourt, location: e.target.value})}
                    placeholder="e.g., Main Building"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-hourlyFee">Hourly Fee (SAR)</Label>
                  <Input
                    id="edit-hourlyFee"
                    type="number"
                    value={editingCourt.hourlyFee}
                    onChange={(e) => setEditingCourt({...editingCourt, hourlyFee: Number(e.target.value)})}
                    placeholder="120"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateCourt} className="flex-1">
                    Update Court
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            {courtToDelete && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Are you sure you want to delete <strong>{courtToDelete.name}</strong>?
                  This action cannot be undone and will remove all related data.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteCourt(courtToDelete.id)}
                    className="flex-1"
                  >
                    Delete Court
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="courts" className="space-y-6">
        <TabsList className={`grid w-full ${hasPermission('SUPER_ADMIN') ? 'grid-cols-3' : 'grid-cols-1'}`}>
          <TabsTrigger value="courts">Courts</TabsTrigger>
          {hasPermission('SUPER_ADMIN') && (
            <>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="unavailability">Unavailability</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="courts" className="space-y-4">
          {/* Advanced Search and Filters */}
          <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search courts by name, type, or location..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10 max-w-md"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                  {[
                    filters.searchTerm !== '',
                    filters.type !== '' && filters.type !== 'all-types',
                    selectedLocations.length > 0,
                    filters.status !== '' && filters.status !== 'all-status',
                    filters.hasSeedSystem !== '' && filters.hasSeedSystem !== 'all-courts',
                    filters.priceRange[0] !== 0 || filters.priceRange[1] !== maxPrice
                  ].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-muted/30 rounded-lg p-6 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Type Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Court Type</Label>
                    <Select 
                      value={filters.type} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-types">All Types</SelectItem>
                        {uniqueTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Location</Label>
                    <Popover open={locationSearchOpen} onOpenChange={setLocationSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={locationSearchOpen}
                          className="w-full justify-between"
                        >
                          {selectedLocations.length === 0
                            ? "All Locations"
                            : selectedLocations.length === 1
                            ? selectedLocations[0]
                            : `${selectedLocations.length} locations selected`}
                          <div className="flex items-center gap-1">
                            {selectedLocations.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLocations([]);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search locations..."
                            value={locationSearchValue}
                            onValueChange={setLocationSearchValue}
                          />
                          <CommandList>
                            <CommandEmpty>
                              <div className="p-2 space-y-2">
                                <p className="text-sm text-muted-foreground">No location found.</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowCustomLocationInput(true)}
                                  className="w-full"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Custom Location
                                </Button>
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="all-locations"
                                onSelect={() => handleLocationSelect('all-locations')}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedLocations.length === 0 ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                All Locations
                              </CommandItem>
                              {uniqueLocations
                                .filter((location) =>
                                  location.toLowerCase().includes(locationSearchValue.toLowerCase())
                                )
                                .map((location) => (
                                  <CommandItem
                                    key={location}
                                    value={location}
                                    onSelect={() => handleLocationSelect(location)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedLocations.includes(location) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {location}
                                  </CommandItem>
                                ))}
                              <CommandItem
                                value="add-custom"
                                onSelect={() => setShowCustomLocationInput(true)}
                                className="border-t"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Custom Location
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    
                    {/* Custom Location Input */}
                    {showCustomLocationInput && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Enter location name..."
                          value={customLocationInput}
                          onChange={(e) => setCustomLocationInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddCustomLocation();
                            }
                            if (e.key === 'Escape') {
                              setShowCustomLocationInput(false);
                              setCustomLocationInput("");
                            }
                          }}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={handleAddCustomLocation}
                          disabled={!customLocationInput.trim()}
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowCustomLocationInput(false);
                            setCustomLocationInput("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {/* Selected Locations Tags */}
                    {selectedLocations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedLocations.map((location) => (
                          <Badge
                            key={location}
                            variant="secondary"
                            className="text-xs flex items-center gap-1"
                          >
                            {location}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeLocationFilter(location)}
                            >
                              <X className="h-2 w-2" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Select 
                      value={filters.status} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-status">All Status</SelectItem>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Seed System Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Seed System</Label>
                    <Select 
                      value={filters.hasSeedSystem} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, hasSeedSystem: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Courts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-courts">All Courts</SelectItem>
                        <SelectItem value="true">With Seed System</SelectItem>
                        <SelectItem value="false">Without Seed System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Price Range (per hour)</Label>
                    <span className="text-sm text-muted-foreground">
                      {filters.priceRange[0]} SAR - {filters.priceRange[1]} SAR
                    </span>
                  </div>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                    max={maxPrice}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 SAR</span>
                    <span>{maxPrice} SAR</span>
                  </div>
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredCourts.length} of {courts.length} courts
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading courts...</span>
            </div>
          ) : courts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {user?.role === 'SUPER_ADMIN' 
                  ? 'No courts found. Create your first court to get started.' 
                  : 'No courts assigned to you yet.'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredCourts.map((court) => (
                <Card key={court.id} className="overflow-hidden">
                  {/* Court Image Placeholder */}
                  <div className="relative h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    {court.imageUrl ? (
                      <img 
                        src={court.imageUrl} 
                        alt={`${court.name} court`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                          <Settings className="w-6 h-6 text-primary/60" />
                        </div>
                        <p className="text-sm text-muted-foreground">Court Image</p>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-lg">{court.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{court.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{court.location}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Hourly Fee:</span>
                      <span className="font-medium">{court.hourlyFee} SAR</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">SEED System:</span>
                      <span className={`font-medium ${court.hasSeedSystem ? 'text-green-600' : 'text-gray-600'}`}>
                        {court.hasSeedSystem ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {canManageCourt(court) && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Status:</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`text-xs ${court.status === 'AVAILABLE' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}`}
                          onClick={() => handleToggleStatus(court)}
                        >
                          {court.status === 'AVAILABLE' ? 'Available' : 'Unavailable'}
                        </Button>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      {canManageCourt(court) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEditCourt(court)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      {canManageCourt(court) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-red-600 hover:text-red-700"
                          onClick={() => confirmDeleteCourt(court)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {hasPermission('SUPER_ADMIN') && (
          <TabsContent value="availability" className="space-y-6">
          {/* Keep existing availability form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Set Court Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="court">Select Court</Label>
                  <Popover open={courtSearchOpen} onOpenChange={setCourtSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={courtSearchOpen}
                        className="w-full justify-between"
                      >
                        {availabilityData.courtId
                          ? courts.find((court) => court.id === availabilityData.courtId)?.name
                          : "Select court..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search courts..."
                          value={courtSearchValue}
                          onValueChange={setCourtSearchValue}
                        />
                        <CommandList>
                          <CommandEmpty>No court found.</CommandEmpty>
                          <CommandGroup>
                            {courts
                              .filter((court) =>
                                court.name.toLowerCase().includes(courtSearchValue.toLowerCase())
                              )
                              .map((court) => (
                                <CommandItem
                                  key={court.id}
                                  value={court.name}
                                  onSelect={() => {
                                    setAvailabilityData({...availabilityData, courtId: court.id})
                                    setCourtSearchOpen(false)
                                    setCourtSearchValue("")
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      availabilityData.courtId === court.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {court.name}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="dayOfWeek">Day of Week</Label>
                  <Select onValueChange={(value) => setAvailabilityData({...availabilityData, dayOfWeek: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={availabilityData.startTime}
                    onChange={(e) => setAvailabilityData({...availabilityData, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={availabilityData.endTime}
                    onChange={(e) => setAvailabilityData({...availabilityData, endTime: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleSetAvailability} className="w-full">
                Set Availability
              </Button>
            </CardContent>
          </Card>

          {/* New Availability Table */}
          <AvailabilityTable />
          </TabsContent>
        )}

        {hasPermission('SUPER_ADMIN') && (
          <TabsContent value="unavailability" className="space-y-6">
            {/* Unavailability Form */}
            <UnavailabilityForm />

            {/* Unavailability Table */}
            <UnavailabilityTable />
          </TabsContent>
        )}

      </Tabs>
    </motion.div>
  );
};

export default CourtManagement;