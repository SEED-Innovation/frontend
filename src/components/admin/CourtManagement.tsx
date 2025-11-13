import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Settings, Calendar, Loader2, Search, Filter, X, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { courtService, CreateCourtRequest, UpdateCourtRequest, SetBulkCourtAvailabilityRequest } from '@/lib/api/services/courtService';
import { Court, SportType } from '@/types/court';
import { facilityService } from '@/lib/api/services/facilityService';
import { getLocalizedCourtTitle, courtMatchesSearch } from '@/utils/courtLocalization';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCourtsPaged } from '@/lib/hooks/useCourtsPaged';
import { USE_PAGINATED_COURTS } from '@/lib/config/flags';
import { PaginationBar } from '@/components/common/PaginationBar';
import { userService } from '@/services/userService';
import { AdminUser } from '@/types/admin';
import EnhancedCourtForm from './EnhancedCourtForm';
import EditCourtForm from './EditCourtForm';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AvailabilityTable } from './availability/AvailabilityTable';
import { UnavailabilityTable } from './unavailability/UnavailabilityTable';
import { UnavailabilityForm } from './unavailability/UnavailabilityForm';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { useTranslation } from 'react-i18next';

const CourtManagement = () => {
  const { user, hasPermission } = useAdminAuth();
  const { t } = useTranslation('admin');
  const { language } = useLanguage();

  // Pagination state
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Use paginated courts hook
  const { data: pagedData, isLoading: pagedLoading, refetch: refetchPaged } = useCourtsPaged(page, pageSize);

  // Legacy state for backward compatibility
  const [courts, setCourts] = useState<Court[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courtToDelete, setCourtToDelete] = useState<Court | null>(null);

  const [availabilityData, setAvailabilityData] = useState({
    facilityId: 0,
    courtId: 0,
    daysOfWeek: [] as string[],
    startTime: '',
    endTime: '',
    startDate: '',
    endDate: ''
  });
  const [courtSearchOpen, setCourtSearchOpen] = useState(false);
  const [courtSearchValue, setCourtSearchValue] = useState("");
  const [availabilityCourts, setAvailabilityCourts] = useState<Court[]>([]);

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
  const [showFilters, setShowFilters] = useState(false);

  // Get current courts data based on feature flag
  const currentCourts = USE_PAGINATED_COURTS ? (pagedData?.courts || []) : courts;
  const isCurrentlyLoading = USE_PAGINATED_COURTS ? pagedLoading : loading;

  // Fetch courts on component mount - only if not using paginated API
  useEffect(() => {
    if (!USE_PAGINATED_COURTS) {
      fetchCourts();
    }
    // Always fetch admins and facilities for manager assignment functionality
    fetchAdmins();
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setFacilitiesLoading(true);
      const fetchedFacilities = await facilityService.getMyFacilities();
      console.log('Fetched facilities:', fetchedFacilities);
      setFacilities(fetchedFacilities);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Failed to load facilities');
    } finally {
      setFacilitiesLoading(false);
    }
  };

  const fetchCourts = async () => {
    if (USE_PAGINATED_COURTS) return; // Skip if using paginated API

    try {
      setLoading(true);
      // Use my-courts endpoint for role-based filtering
      // SUPER_ADMIN sees all courts, ADMIN sees only their facility's courts
      const fetchedCourts = await courtService.getMyCourts();
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

  const fetchCourtsByFacility = async (facilityId: number) => {
    try {
      console.log('Fetching courts for facility:', facilityId);
      const courts = await courtService.getCourtsByFacility(facilityId);
      setAvailabilityCourts(courts);
      console.log('Loaded courts for facility:', courts);
    } catch (error) {
      console.error('Error fetching courts for facility:', error);
      toast.error('Failed to load courts for selected facility');
      setAvailabilityCourts([]);
    }
  };

  // Watch for facility changes in availability form
  useEffect(() => {
    if (availabilityData.facilityId > 0) {
      fetchCourtsByFacility(availabilityData.facilityId);
      // Reset court selection when facility changes
      setAvailabilityData(prev => ({ ...prev, courtId: 0 }));
    } else {
      setAvailabilityCourts([]);
    }
  }, [availabilityData.facilityId]);

  const handleCreateCourt = async (courtData: CreateCourtRequest, imageFile?: File): Promise<boolean> => {
    try {
      const createdCourt = await courtService.createCourt(courtData, imageFile);
      setCourts([...courts, createdCourt]);
      setCreateDialogOpen(false);
      toast.success('Court created successfully');
      return true; // Success
    } catch (error) {
      console.error('Error creating court:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create court';
      toast.error(errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to update court';
      toast.error(errorMessage);
      return false;
    }
  };

  const canManageCourt = (court: Court) => {
    // SUPER_ADMIN can manage all courts
    if (hasPermission('SUPER_ADMIN')) return true;

    // ADMIN can manage courts assigned to them
    if (user?.role === 'ADMIN') {
      return true; // For now, let ADMIN manage all courts
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to update court status';
      toast.error(errorMessage);
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
    if (!availabilityData.courtId || availabilityData.daysOfWeek.length === 0 || !availabilityData.startTime || !availabilityData.endTime) {
      toast.error('Please fill in all availability fields and select at least one day');
      return;
    }

    try {
      // Use bulk availability setting for better performance
      const requestData: SetBulkCourtAvailabilityRequest = {
        courtId: availabilityData.courtId,
        daysOfWeek: availabilityData.daysOfWeek,
        start: availabilityData.startTime,
        end: availabilityData.endTime,
        startDate: availabilityData.startDate || undefined,
        endDate: availabilityData.endDate || undefined
      };

      await courtService.setBulkAvailability(requestData);

      const dateRangeText = availabilityData.startDate && availabilityData.endDate
        ? ` for ${availabilityData.startDate} to ${availabilityData.endDate}`
        : availabilityData.startDate
          ? ` for ${availabilityData.startDate}`
          : ' (recurring weekly)';

      toast.success(`Court availability set for ${availabilityData.daysOfWeek.length} day(s)${dateRangeText} successfully`);
      setAvailabilityData({
        facilityId: 0,
        courtId: 0,
        daysOfWeek: [],
        startTime: '',
        endTime: '',
        startDate: '',
        endDate: ''
      });
      setAvailabilityCourts([]);
    } catch (error) {
      console.error('Error setting court availability:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update court availability';
      toast.error(errorMessage);
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
      const matchesSearch = courtMatchesSearch(court, filters.searchTerm, language) ||
        (court.manager?.name?.toLowerCase() || '').includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Manager filter
    if (filters.manager && filters.manager !== 'all-managers') {
      if (!court.manager || court.manager.name !== filters.manager) return false;
    }

    // Type filter
    if (filters.type && filters.type !== 'all-types' && court.type !== filters.type) return false;

    // Status filter
    if (filters.status && filters.status !== 'all-status' && court.status !== filters.status) return false;

    // Price range filter (using facility pricing)
    const courtHourlyFee = court.facility?.hourlyFee || 0;
    if (courtHourlyFee < filters.priceRange[0] || courtHourlyFee > filters.priceRange[1]) return false;

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
  const maxPrice = Math.max(...currentCourts.map(court => court.facility?.hourlyFee || 0), 300);

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
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.searchTerm !== '' ||
    (filters.manager !== '' && filters.manager !== 'all-managers') ||
    (filters.type !== '' && filters.type !== 'all-types') ||
    (filters.status !== '' && filters.status !== 'all-status') ||
    (filters.hasSeedSystem !== '' && filters.hasSeedSystem !== 'all-courts') ||
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== maxPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.pages.courtManagement.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('admin.pages.courtManagement.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchCourts()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('admin.common.refresh')}
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
                >{t('admin.common.cancel')}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="courts" className="space-y-6">
        <TabsList className={`grid w-full p-2 bg-gradient-to-r from-admin-surface to-admin-secondary border-2 border-border rounded-xl h-16 ${(hasPermission('SUPER_ADMIN') || hasPermission('ADMIN')) ? 'grid-cols-3' : 'grid-cols-1'}`}>
          <TabsTrigger
            value="courts"
            className="flex items-center space-x-2 h-12 rounded-lg font-medium text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
          >
            <Settings className="w-4 h-4" />
            <span>Courts</span>
          </TabsTrigger>
          {(hasPermission('SUPER_ADMIN') || hasPermission('ADMIN')) && (
            <>
              <TabsTrigger
                value="availability"
                className="flex items-center space-x-2 h-12 rounded-lg font-medium text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
              >
                <Calendar className="w-4 h-4" />
                <span>Availability</span>
              </TabsTrigger>
              <TabsTrigger
                value="unavailability"
                className="flex items-center space-x-2 h-12 rounded-lg font-medium text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
              >
                <X className="w-4 h-4" />
                <span>Unavailability</span>
              </TabsTrigger>
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
                  {/* Manager Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Manager</Label>
                    <Select
                      value={filters.manager}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, manager: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Managers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-managers">All Managers</SelectItem>
                        {uniqueManagers.map((managerName) => (
                          <SelectItem key={managerName} value={managerName}>
                            {managerName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                          <SelectItem key={type} value={type}>
                            {type === 'PADEL' ? 'Padel Court' : type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Location</Label>
                    <Select
                      value={filters.location}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-locations">All Locations</SelectItem>
                        {uniqueLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            <>
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
                      <CardTitle className="text-lg">{getLocalizedCourtTitle(court, language)}</CardTitle>
                      <Badge
                        variant="secondary"
                        className="text-xs"
                      >
                        {court.sportType === 'PADEL' ? '🟩 Padel' : '🎾 Tennis'}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {court.type && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Surface:</span>
                          <span className="font-medium">{court.type === 'PADEL' ? 'Padel Court' : court.type}</span>
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

                      {/* Pricing Section - Shows facility pricing */}
                      <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-muted-foreground mb-2 block">Pricing</span>
                            <div className="flex items-center gap-2">
                              <div className="font-semibold">
                                <CurrencyDisplay amount={court.facility?.hourlyFee || 0} size="md" />
                              </div>
                              <span className="text-xs text-muted-foreground">(from facility)</span>
                            </div>
                          </div>
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
                            <Edit className="w-4 h-4 mr-1" />{t('admin.common.edit')}
                          </Button>
                        )}
                        {canManageCourt(court) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-600 hover:text-red-700"
                            onClick={() => confirmDeleteCourt(court)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />{t('admin.common.delete')}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination for paginated courts */}
              {USE_PAGINATED_COURTS && pagedData && (
                <div className="mt-8 border-t pt-6">
                  <div className="text-sm text-muted-foreground mb-4 text-center">
                    Showing page {page + 1} of {pagedData.totalPages} • {pagedData.totalElements} total courts
                  </div>
                  <PaginationBar
                    page={page}
                    setPage={setPage}
                    hasPrev={pagedData.hasPrevious}
                    hasNext={pagedData.hasNext}
                    totalPages={pagedData.totalPages}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>

        {(hasPermission('SUPER_ADMIN') || hasPermission('ADMIN')) && (
          <TabsContent value="availability" className="space-y-6">
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
                    <Label htmlFor="facility">Select Facility</Label>
                    <Select
                      value={availabilityData.facilityId.toString()}
                      onValueChange={(value) => setAvailabilityData({ ...availabilityData, facilityId: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select facility..." />
                      </SelectTrigger>
                      <SelectContent>
                        {facilitiesLoading ? (
                          <SelectItem value="0" disabled>Loading facilities...</SelectItem>
                        ) : facilities.length === 0 ? (
                          <SelectItem value="0" disabled>No facilities available</SelectItem>
                        ) : (
                          facilities.map((facility) => (
                            <SelectItem key={facility.id} value={facility.id.toString()}>
                              {facility.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="court">Select Court</Label>
                    <Popover open={courtSearchOpen} onOpenChange={setCourtSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={courtSearchOpen}
                          className="w-full justify-between"
                          disabled={!availabilityData.facilityId}
                        >
                          {availabilityData.courtId
                            ? availabilityCourts.find((court) => court.id === availabilityData.courtId)?.name
                            : availabilityData.facilityId ? "Select court..." : "Select facility first"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search courts by name..."
                            value={courtSearchValue}
                            onValueChange={setCourtSearchValue}
                          />
                          <CommandList>
                            <CommandEmpty>No court found.</CommandEmpty>
                            <CommandGroup>
                              {availabilityCourts
                                .filter((court) =>
                                  court.name.toLowerCase().includes(courtSearchValue.toLowerCase())
                                )
                                .map((court) => (
                                  <CommandItem
                                    key={court.id}
                                    value={court.name}
                                    onSelect={() => {
                                      setAvailabilityData({ ...availabilityData, courtId: court.id })
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label>Days of Week</Label>
                        {availabilityData.daysOfWeek.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {availabilityData.daysOfWeek.length} selected
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAvailabilityData({
                            ...availabilityData,
                            daysOfWeek: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
                          })}
                        >
                          Select All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAvailabilityData({
                            ...availabilityData,
                            daysOfWeek: []
                          })}
                        >Clear All</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { value: 'SUNDAY', label: 'Sunday' },
                        { value: 'MONDAY', label: 'Monday' },
                        { value: 'TUESDAY', label: 'Tuesday' },
                        { value: 'WEDNESDAY', label: 'Wednesday' },
                        { value: 'THURSDAY', label: 'Thursday' },
                        { value: 'FRIDAY', label: 'Friday' },
                        { value: 'SATURDAY', label: 'Saturday' }
                      ].map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={day.value}
                            checked={availabilityData.daysOfWeek.includes(day.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setAvailabilityData({
                                  ...availabilityData,
                                  daysOfWeek: [...availabilityData.daysOfWeek, day.value]
                                });
                              } else {
                                setAvailabilityData({
                                  ...availabilityData,
                                  daysOfWeek: availabilityData.daysOfWeek.filter(d => d !== day.value)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={day.value} className="text-sm font-normal">
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={availabilityData.startTime}
                      onChange={(e) => setAvailabilityData({ ...availabilityData, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={availabilityData.endTime}
                      onChange={(e) => setAvailabilityData({ ...availabilityData, endTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date (Optional)</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={availabilityData.startDate}
                      onChange={(e) => setAvailabilityData({ ...availabilityData, startDate: e.target.value })}
                      placeholder="Leave empty for recurring weekly"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty for recurring weekly schedule
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={availabilityData.endDate}
                      onChange={(e) => setAvailabilityData({ ...availabilityData, endDate: e.target.value })}
                      placeholder="Leave empty for single date or recurring"
                      min={availabilityData.startDate}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Only needed if setting a date range
                    </p>
                  </div>
                </div>

                <Button onClick={handleSetAvailability} className="w-full">
                  Set Availability
                </Button>
              </CardContent>
            </Card>

            <AvailabilityTable />
          </TabsContent>
        )}

        {(hasPermission('SUPER_ADMIN') || hasPermission('ADMIN')) && (
          <TabsContent value="unavailability" className="space-y-6">
            <UnavailabilityForm />
            <UnavailabilityTable />
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  );
};

export default CourtManagement;