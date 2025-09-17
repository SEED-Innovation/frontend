
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Settings, Calendar, DollarSign, Loader2, Search, Filter, X, RefreshCw, Percent, TagIcon } from 'lucide-react';
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
import { courtService, CreateCourtRequest, UpdateCourtRequest, SetCourtAvailabilityRequest, AdminCourtAvailabilityResponse } from '@/lib/api/services/courtService';
import { Court, SportType } from '@/types/court';
import { useCourtsPaged } from '@/lib/hooks/useCourtsPaged';
import { USE_PAGINATED_COURTS } from '@/lib/config/flags';
import { PaginationBar } from '@/components/common/PaginationBar';
import { adminService } from '@/services/adminService';
import { userService } from '@/services/userService';
import { AdminUser } from '@/types/admin';
import EnhancedCourtForm from './EnhancedCourtForm';
import EditCourtForm from './EditCourtForm';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import new components
import { AvailabilityTable } from './availability/AvailabilityTable';
import { UnavailabilityTable } from './unavailability/UnavailabilityTable';
import { UnavailabilityForm } from './unavailability/UnavailabilityForm';
import { DiscountModal } from './DiscountModal';
import { CurrencyDisplay } from '@/components/ui/currency-display';

const CourtManagement = () => {
  const { user, hasPermission } = useAdminAuth();
  
  // Pagination state
  const [page, setPage] = useState(0);
  const pageSize = 20;
  
  // Use paginated courts hook
  const { data: pagedData, isLoading: pagedLoading, refetch: refetchPaged } = useCourtsPaged(page, pageSize);
  
  // Legacy state for backward compatibility
  const [courts, setCourts] = useState<Court[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [managerComboboxOpen, setManagerComboboxOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courtToDelete, setCourtToDelete] = useState<Court | null>(null);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountCourt, setDiscountCourt] = useState<Court | null>(null);
  const [removeDiscountDialogOpen, setRemoveDiscountDialogOpen] = useState(false);
  const [courtToRemoveDiscount, setCourtToRemoveDiscount] = useState<Court | null>(null);

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
    courtId: 0,
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
    manager: '',
    type: '',
    location: '',
    status: '',
    priceRange: [0, 300],
    hasSeedSystem: '',
  });
  
  // Sport type filter state
  const [selectedSportType, setSelectedSportType] = useState<SportType | 'ALL'>('ALL');
  
  // Manager filter state
  const [managerSearchOpen, setManagerSearchOpen] = useState(false);
  const [managerSearchValue, setManagerSearchValue] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Get current courts data based on feature flag
  const currentCourts = USE_PAGINATED_COURTS ? (pagedData?.courts || []) : courts;
  const isCurrentlyLoading = USE_PAGINATED_COURTS ? pagedLoading : loading;
  
  // Fetch courts on component mount - only if not using paginated API
  useEffect(() => {
    if (!USE_PAGINATED_COURTS) {
      fetchCourts();
    }
    // Always fetch admins for manager assignment functionality
    fetchAdmins();
  }, []);

  const fetchCourts = async () => {
    if (USE_PAGINATED_COURTS) return; // Skip if using paginated API
    
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
      console.log('Fetching admins...');
      
      // Get all users and filter for admins
      const allUsers = await userService.getAllUsers();
      console.log('All users:', allUsers);
      
      // Filter users to only include ADMIN role (since SUPER_ADMIN is from Cognito, not user table)
      const adminUsers = allUsers.filter(user => 
        user.role === 'ADMIN'
      ).map(user => ({
        id: user.id.toString(), // Convert to string for consistency
        name: user.fullName || `User ${user.id}`,
        email: user.email,
        role: 'ADMIN' as const,
        assignedCourts: [],
        avatar: user.profilePictureUrl || undefined
      }));
      
      console.log('Filtered admin users:', adminUsers);
      setAdmins(adminUsers);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admins');
    } finally {
      setAdminsLoading(false);
    }
  };

  const handleCreateCourt = async (courtData: CreateCourtRequest, imageFile?: File): Promise<boolean> => {
    try {
      const createdCourt = await courtService.createCourt(courtData, imageFile);
      setCourts([...courts, createdCourt]);
      setCreateDialogOpen(false);
      toast.success('Court created successfully');
      return true; // Success
    } catch (error) {
      console.error('Error creating court:', error);
      toast.error('Failed to create court');
      return false; // Failure
    }
  };

  const handleEditCourt = async (court: Court) => {
    setEditingCourt(court);
    setEditDialogOpen(true);
    // Ensure admins are loaded for the edit form
    if (hasPermission('SUPER_ADMIN') && admins.length === 0) {
      fetchAdmins();
    }
  };

  const handleDiscountCourt = (court: Court) => {
    setDiscountCourt(court);
    setDiscountModalOpen(true);
  };

  const handleRemoveDiscount = async (court: Court) => {
    try {
      const updatedCourt = await courtService.removeDiscount(court.id);
      
      setCourts(prev => prev.map(c => 
        c.id === court.id ? updatedCourt : c
      ));

      toast.success(`Discount removed from ${court.name}`);
    } catch (error: any) {
      console.error('Error removing discount:', error);
      
      // Handle specific case where no discount exists
      if (error.message?.includes('No discount') || error.message?.includes('not found')) {
        toast.error("No discount currently applied to this court");
      } else {
        toast.error(error.message || "Failed to remove discount. Please try again.");
      }
    }
  };

  const confirmRemoveDiscount = async () => {
    if (!courtToRemoveDiscount) return;

    try {
      const updatedCourt = await courtService.removeDiscount(courtToRemoveDiscount.id);
      
      // Update the court in local state
      setCourts(courts.map(court => 
        court.id === courtToRemoveDiscount.id ? updatedCourt : court
      ));
      
      toast.success('Discount removed successfully');
      setRemoveDiscountDialogOpen(false);
      setCourtToRemoveDiscount(null);
    } catch (error) {
      console.error('Error removing discount:', error);
      toast.error('Failed to remove discount');
    }
  };

  const handleCourtUpdated = (updatedCourt: Court) => {
    if (USE_PAGINATED_COURTS) {
      // Refetch paginated data
      refetchPaged();
    } else {
      // Update the court in the local state
      setCourts(prevCourts => 
        prevCourts.map(court => 
          court.id === updatedCourt.id ? updatedCourt : court
        )
      );
    }
  };

  const handleUpdateCourt = async (courtData: UpdateCourtRequest, imageFile?: File): Promise<boolean> => {
    if (!editingCourt) return false;

    try {
      const updatedCourt = await courtService.updateCourt(editingCourt.id, courtData, imageFile);
      
      // Use functional update to ensure we have the latest state
      setCourts(prevCourts => 
        prevCourts.map(court => 
          court.id === editingCourt.id ? updatedCourt : court
        )
      );
      
      setEditingCourt(null);
      toast.success('Court updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating court:', error);
      toast.error('Failed to update court');
      return false;
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

  const handleDeleteCourt = async (courtId: string | number) => {
    try {
      await courtService.deleteCourt(courtId);
      
      if (USE_PAGINATED_COURTS) {
        // Refetch paginated data
        await refetchPaged();
      } else {
        // Update local state
        setCourts(courts.filter(court => court.id !== Number(courtId)));
      }
      
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
        courtId: availabilityData.courtId,
        dayOfWeek: availabilityData.dayOfWeek.toUpperCase(),
        start: availabilityData.startTime,
        end: availabilityData.endTime
      };

      await courtService.setAvailability(requestData);
      
      toast.success('Court availability updated successfully');
      setAvailabilityData({
        courtId: 0,
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
  const filteredCourts = currentCourts.filter((court) => {
    // Sport type filter
    if (selectedSportType !== 'ALL' && court.sportType !== selectedSportType) {
      return false;
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        (court.name?.toLowerCase() || '').includes(searchLower) ||
        (court.type?.toLowerCase() || '').includes(searchLower) ||
        (court.location?.toLowerCase() || '').includes(searchLower) ||
        (court.manager?.name?.toLowerCase() || '').includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Manager filter
    if (filters.manager && filters.manager !== 'all-managers') {
      if (!court.manager || court.manager.name !== filters.manager) return false;
    }

    // Type filter
    if (filters.type && filters.type !== 'all-types' && court.type !== filters.type) return false;

    // Location filter
    if (selectedLocations.length > 0 && !selectedLocations.includes('all-locations')) {
      if (!selectedLocations.includes(court.location || '')) return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'all-status' && court.status !== filters.status) return false;

    // Price range filter
    if ((court.hourlyFee || 0) < filters.priceRange[0] || (court.hourlyFee || 0) > filters.priceRange[1]) return false;

    // Seed system filter
    if (filters.hasSeedSystem !== '' && filters.hasSeedSystem !== 'all-courts') {
      const hasSeed = filters.hasSeedSystem === 'true';
      if (court.hasSeedSystem !== hasSeed) return false;
    }

    return true;
  });

  // Get unique values for filter dropdowns
  const uniqueTypes = [...new Set(currentCourts.map(court => court.type))].filter(Boolean);
  const uniqueLocations = [...new Set(currentCourts.map(court => court.location))].filter(Boolean);
  const uniqueManagers = [...new Set(currentCourts.map(court => court.manager?.name).filter(Boolean))];
  const maxPrice = Math.max(...currentCourts.map(court => court.hourlyFee || 0), 300);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      manager: '',
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
    (filters.manager !== '' && filters.manager !== 'all-managers') ||
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
          <Button variant="outline" size="sm" onClick={() => fetchCourts()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {hasPermission('SUPER_ADMIN') && (
            <>
              <Button 
                className="flex items-center gap-2"
                onClick={() => {
                  setCreateDialogOpen(true);
                  if (hasPermission('SUPER_ADMIN')) {
                    fetchAdmins();
                  }
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Court
              </Button>

              <EnhancedCourtForm
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSubmit={handleCreateCourt}
                admins={admins}
                adminsLoading={adminsLoading}
              />
            </>
          )}
        </div>

        {/* Edit Court Dialog */}
        <EditCourtForm
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          court={editingCourt}
          onSubmit={handleUpdateCourt}
          admins={admins}
          adminsLoading={adminsLoading}
        />

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

        {/* Remove Discount Confirmation Dialog */}
        <Dialog open={removeDiscountDialogOpen} onOpenChange={setRemoveDiscountDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Remove Discount</DialogTitle>
            </DialogHeader>
            {courtToRemoveDiscount && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Are you sure you want to remove the discount from <strong>{courtToRemoveDiscount.name}</strong>?
                </p>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Current pricing:</div>
                  <div className="flex items-center gap-2">
                    <div className="line-through text-muted-foreground text-sm">
                      <CurrencyDisplay amount={courtToRemoveDiscount.hourlyFee || 0} size="sm" />
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="text-primary font-semibold">
                      <CurrencyDisplay 
                        amount={courtToRemoveDiscount.isPercentage 
                          ? Math.max(0, (courtToRemoveDiscount.hourlyFee || 0) * (1 - (courtToRemoveDiscount.discountAmount || 0) / 100))
                          : Math.max(0, (courtToRemoveDiscount.hourlyFee || 0) - (courtToRemoveDiscount.discountAmount || 0))
                        } 
                        size="md" 
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    After removal: <span className="font-medium text-foreground">
                      <CurrencyDisplay amount={courtToRemoveDiscount.hourlyFee || 0} size="sm" />
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={confirmRemoveDiscount}
                    className="flex-1"
                  >
                    Remove Discount
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setRemoveDiscountDialogOpen(false)}
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
          {/* Enhanced Sport Type Filter */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                🏟️ Sport Type Filter
              </h3>
              <Badge variant="outline" className="text-xs">
                {selectedSportType === 'ALL' ? 'All' : selectedSportType}
              </Badge>
            </div>
            <div className="flex gap-3">
              <Button
                variant={selectedSportType === 'ALL' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedSportType('ALL')}
                className="h-10 px-4 font-medium transition-all duration-200 hover:scale-105"
              >
                <span className="mr-2">🌟</span>
                All Sports
              </Button>
              <Button
                variant={selectedSportType === 'TENNIS' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedSportType('TENNIS')}
                className="h-10 px-4 font-medium transition-all duration-200 hover:scale-105"
              >
                <span className="mr-2">🎾</span>
                Tennis
              </Button>
              <Button
                variant={selectedSportType === 'PADEL' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedSportType('PADEL')}
                className="h-10 px-4 font-medium transition-all duration-200 hover:scale-105"
              >
                <span className="mr-2">🥎</span>
                Padel
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedSportType === 'ALL' 
                ? `Showing all ${USE_PAGINATED_COURTS ? (pagedData?.totalElements || 0) : currentCourts.length} courts` 
                : `Showing ${currentCourts.filter(court => court.sportType === selectedSportType).length} ${selectedSportType.toLowerCase()} courts`
              }
            </div>
          </div>

          {/* Advanced Search and Filters */}
          <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search courts by name, type, location, or manager..."
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
                    filters.manager !== '' && filters.manager !== 'all-managers',
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Manager Filter - First */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Manager</Label>
                    <Popover open={managerSearchOpen} onOpenChange={setManagerSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={managerSearchOpen}
                          className="w-full justify-between"
                        >
                          {filters.manager === '' || filters.manager === 'all-managers'
                            ? "All Managers"
                            : filters.manager}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search managers..."
                            value={managerSearchValue}
                            onValueChange={setManagerSearchValue}
                          />
                          <CommandList>
                            <CommandEmpty>No manager found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="all-managers"
                                onSelect={() => {
                                  setFilters(prev => ({ ...prev, manager: '' }));
                                  setManagerSearchOpen(false);
                                  setManagerSearchValue("");
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    filters.manager === '' || filters.manager === 'all-managers' ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                All Managers
                              </CommandItem>
                              {uniqueManagers
                                .filter((managerName) => {
                                  return managerName.toLowerCase().includes(managerSearchValue.toLowerCase());
                                })
                                .map((managerName) => {
                                  return (
                                    <CommandItem
                                      key={managerName}
                                      value={managerName}
                                      onSelect={() => {
                                        setFilters(prev => ({ ...prev, manager: managerName }));
                                        setManagerSearchOpen(false);
                                        setManagerSearchValue("");
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          filters.manager === managerName ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {managerName}
                                    </CommandItem>
                                  );
                                })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

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
                    Showing {filteredCourts.length} of {USE_PAGINATED_COURTS ? (pagedData?.totalElements || 0) : currentCourts.length} courts
                    {USE_PAGINATED_COURTS && (
                      <span className="ml-2 text-xs opacity-75">
                        (Page {page + 1} of {pagedData?.totalPages || 1})
                      </span>
                    )}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {isCurrentlyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading courts...</span>
            </div>
          ) : currentCourts.length === 0 ? (
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
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {court.sportType === 'PADEL' ? '🟩 Padel' : '🎾 Tennis'}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {court.sportType === 'TENNIS' && court.type && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Surface:</span>
                        <span className="font-medium">{court.type}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{court.location}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">SEED System:</span>
                      <span className={`font-medium ${court.hasSeedSystem ? 'text-green-600' : 'text-gray-600'}`}>
                        {court.hasSeedSystem ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Manager:</span>
                      <span className="font-medium">
                        {court.manager ? court.manager.name : 'No manager assigned'}
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
                    
                    {/* Pricing & Discount Section */}
                    <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border">
                      <div className="flex items-start justify-between gap-3">
                        {/* Left side - Pricing info */}
                        <div className="flex-1">
                          <span className="text-sm font-medium text-muted-foreground mb-2 block">Pricing</span>
                          <div className="flex items-center gap-2">
                            {(court.discountAmount != null && court.discountAmount > 0 && court.hourlyFee) ? (
                              <>
                                <div className="line-through text-muted-foreground text-sm">
                                  <CurrencyDisplay amount={court.hourlyFee || 0} size="sm" />
                                </div>
                                <span className="text-muted-foreground">→</span>
                                <div className="text-primary font-semibold">
                                  <CurrencyDisplay 
                                    amount={court.isPercentage 
                                      ? Math.max(0, (court.hourlyFee || 0) * (1 - (court.discountAmount || 0) / 100))
                                      : Math.max(0, (court.hourlyFee || 0) - (court.discountAmount || 0))
                                    } 
                                    size="md" 
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="font-semibold">
                                <CurrencyDisplay amount={court.hourlyFee || 0} size="md" />
                              </div>
                            )}
                          </div>
                          {(court.discountAmount != null && court.discountAmount > 0) && (
                            <Badge variant="secondary" className="text-xs mt-2 animate-fade-in">
                              {court.isPercentage ? `-${court.discountAmount}%` : `-${court.discountAmount} SAR`}
                            </Badge>
                          )}
                        </div>

                        {/* Right side - Discount controls */}
                        {canManageCourt(court) && (
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs px-3 py-1 whitespace-nowrap bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 hover:text-blue-800 transition-all duration-200 hover-scale"
                              onClick={() => handleDiscountCourt(court)}
                            >
                              <TagIcon className="w-3 h-3 mr-1" />
                              {(court.discountAmount != null && court.discountAmount > 0) ? 'Edit Discount' : 'Add Discount'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs px-3 py-1 whitespace-nowrap bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-700 hover:from-red-100 hover:to-rose-100 hover:border-red-300 hover:text-red-800 transition-all duration-200 hover-scale"
                              onClick={() => handleRemoveDiscount(court)}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Remove Discount
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
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
            
            {/* Pagination for paginated courts */}
            {USE_PAGINATED_COURTS && pagedData && (
              <PaginationBar
                page={page}
                setPage={setPage}
                hasPrev={pagedData.hasPrevious}
                hasNext={pagedData.hasNext}
                totalPages={pagedData.totalPages}
              />
            )}
          )}
          
          {/* Pagination for paginated courts */}
          {USE_PAGINATED_COURTS && pagedData && (
            <PaginationBar
              page={page}
              setPage={setPage}
              hasPrev={pagedData.hasPrevious}
              hasNext={pagedData.hasNext}
              totalPages={pagedData.totalPages}
            />
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
                           ? currentCourts.find((court) => court.id === availabilityData.courtId)?.name
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

      {/* Discount Modal */}
      {discountCourt && (
        <DiscountModal
          court={discountCourt}
          isOpen={discountModalOpen}
          onClose={() => {
            setDiscountModalOpen(false);
            setDiscountCourt(null);
          }}
          onCourtUpdated={handleCourtUpdated}
        />
      )}
    </motion.div>
  );
};

export default CourtManagement;