import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Settings, MapPin, Building, Loader2, Search, Filter, X, RefreshCw, Eye, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { facilityService } from '@/lib/api/services/facilityService';
import { Facility, CreateFacilityRequest, UpdateFacilityRequest, OpeningTimes } from '@/types/facility';
import { AdminUser } from '@/types/admin';
import { adminService } from '@/services/adminService';
import { userService } from '@/services/userService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const FacilityManagement = () => {
  const { user, hasPermission } = useAdminAuth();
  const { t } = useTranslation('web');
  const { language } = useLanguage();

  // State
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminsLoading, setAdminsLoading] = useState(false);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(null);
  const [courtsDialogOpen, setCourtsDialogOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [facilityCourts, setFacilityCourts] = useState<any[]>([]);
  const [courtsLoading, setCourtsLoading] = useState(false);

  // Form states
  const [newFacility, setNewFacility] = useState<CreateFacilityRequest>({
    name: '',
    location: '',
    description: '',
    openingTimes: { weekdays: '', weekends: '' },
    amenities: [],
    techFeatures: [],
    managerId: undefined,
    hourlyFee: 0,
    discountAmount: 0,
    discountPercentage: 0,
    isPercentageDiscount: false,
    seedRecordingFee: 40
  });

  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    manager: '',
    status: '',
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchFacilities();
    fetchAdmins();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const fetchedFacilities = await facilityService.getAllFacilities();
      console.log('Fetched facilities:', fetchedFacilities);
      setFacilities(fetchedFacilities);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setAdminsLoading(true);
      const allUsers = await userService.getAllUsers();
      const adminUsers = allUsers.filter(user =>
        user.role === 'ADMIN'
      ).map(user => ({
        id: user.id.toString(),
        name: user.fullName || `User ${user.id}`,
        email: user.email,
        role: 'ADMIN' as const,
        assignedCourts: [],
        avatar: user.profilePictureUrl || undefined
      }));
      setAdmins(adminUsers);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admins');
    } finally {
      setAdminsLoading(false);
    }
  };

  const handleCreateFacility = async () => {
    try {
      const createdFacility = await facilityService.createFacility(newFacility);
      setFacilities([...facilities, createdFacility]);
      setCreateDialogOpen(false);
      setNewFacility({
        name: '',
        location: '',
        description: '',
        openingTimes: { weekdays: '', weekends: '' },
        amenities: [],
        techFeatures: [],
        managerId: undefined,
        hourlyFee: 0,
        discountAmount: 0,
        discountPercentage: 0,
        isPercentageDiscount: false,
        seedRecordingFee: 40
      });
      toast.success('Facility created successfully');
    } catch (error) {
      console.error('Error creating facility:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create facility';
      toast.error(errorMessage);
    }
  };

  const handleEditFacility = (facility: Facility) => {
    setEditingFacility(facility);
    setEditDialogOpen(true);
  };

  const handleUpdateFacility = async () => {
    if (!editingFacility) return;

    try {
      const updateData: UpdateFacilityRequest = {
        name: editingFacility.name,
        location: editingFacility.location,
        description: editingFacility.description,
        titleAr: editingFacility.titleAr,
        descriptionAr: editingFacility.descriptionAr,
        openingTimes: editingFacility.openingTimes,
        latitude: editingFacility.latitude,
        longitude: editingFacility.longitude,
        amenities: editingFacility.amenities,
        techFeatures: editingFacility.techFeatures,
        managerId: editingFacility.managerId,
        hourlyFee: editingFacility.hourlyFee,
        discountAmount: editingFacility.discountAmount,
        discountPercentage: editingFacility.discountPercentage,
        isPercentageDiscount: editingFacility.isPercentageDiscount,
        seedRecordingFee: editingFacility.seedRecordingFee
      };

      const updatedFacility = await facilityService.updateFacility(editingFacility.id, updateData);
      
      setFacilities(prevFacilities =>
        prevFacilities.map(facility =>
          facility.id === editingFacility.id ? updatedFacility : facility
        )
      );

      setEditDialogOpen(false);
      setEditingFacility(null);
      toast.success('Facility updated successfully');
    } catch (error) {
      console.error('Error updating facility:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update facility';
      toast.error(errorMessage);
    }
  };

  const handleDeleteFacility = async (facilityId: number) => {
    try {
      await facilityService.deleteFacility(facilityId);
      setFacilities(facilities.filter(facility => facility.id !== facilityId));
      toast.success('Facility deleted successfully');
      setDeleteDialogOpen(false);
      setFacilityToDelete(null);
    } catch (error) {
      console.error('Error deleting facility:', error);
      toast.error('Failed to delete facility');
    }
  };

  const confirmDeleteFacility = (facility: Facility) => {
    setFacilityToDelete(facility);
    setDeleteDialogOpen(true);
  };

  const handleViewCourts = async (facility: Facility) => {
    setSelectedFacility(facility);
    setCourtsDialogOpen(true);
    setCourtsLoading(true);
    
    try {
      const courts = await facilityService.getFacilityCourts(facility.id);
      setFacilityCourts(courts);
    } catch (error) {
      console.error('Error fetching facility courts:', error);
      toast.error('Failed to load facility courts');
      setFacilityCourts([]);
    } finally {
      setCourtsLoading(false);
    }
  };

  const canManageFacility = (facility: Facility) => {
    if (hasPermission('SUPER_ADMIN')) return true;
    if (user?.role === 'ADMIN') {
      return facility.managerId === user.id;
    }
    return false;
  };

  // Filter facilities
  const filteredFacilities = facilities.filter((facility) => {
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        facility.name.toLowerCase().includes(searchLower) ||
        facility.location.toLowerCase().includes(searchLower) ||
        (facility.description && facility.description.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    if (filters.manager && filters.manager !== 'all-managers') {
      if (!facility.manager || facility.manager.name !== filters.manager) return false;
    }

    if (filters.status && filters.status !== 'all-status' && facility.status !== filters.status) return false;

    if (filters.location && filters.location !== 'all-locations' && facility.location !== filters.location) return false;

    return true;
  });

  // Get unique values for filters
  const uniqueManagers = [...new Set(facilities.map(facility => facility.manager?.name).filter(Boolean))];
  const uniqueLocations = [...new Set(facilities.map(facility => facility.location))].filter(Boolean);

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      manager: '',
      status: '',
      location: ''
    });
  };

  const hasActiveFilters = 
    filters.searchTerm !== '' ||
    (filters.manager !== '' && filters.manager !== 'all-managers') ||
    (filters.status !== '' && filters.status !== 'all-status') ||
    (filters.location !== '' && filters.location !== 'all-locations');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facility Management</h1>
          <p className="text-gray-600 mt-1">
            Manage facilities and their associated courts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchFacilities} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {hasPermission('SUPER_ADMIN') && (
            <Button
              className="flex items-center gap-2"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add New Facility
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search facilities by name, location, or description..."
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
                Active
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    {uniqueManagers.map((manager) => (
                      <SelectItem key={manager} value={manager}>
                        {manager}
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
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
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
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                Showing {filteredFacilities.length} of {facilities.length} facilities
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Facilities Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading facilities...</span>
        </div>
      ) : facilities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {user?.role === 'SUPER_ADMIN'
              ? 'No facilities found. Create your first facility to get started.'
              : 'No facilities assigned to you yet.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFacilities.map((facility) => (
            <Card key={facility.id} className="overflow-hidden">
              {/* Facility Image Placeholder */}
              <div className="relative h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                {facility.imageUrl ? (
                  <img
                    src={facility.imageUrl}
                    alt={`${facility.name} facility`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                      <Building className="w-6 h-6 text-primary/60" />
                    </div>
                    <p className="text-sm text-muted-foreground">Facility Image</p>
                  </div>
                )}
              </div>

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg">{facility.name}</CardTitle>
                <Badge
                  variant={facility.status === 'ACTIVE' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {facility.status}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {facility.location}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Courts:</span>
                  <span className="font-medium">{facility.courtCount || 0}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hourly Fee:</span>
                  <span className="font-medium">${facility.hourlyFee || 0}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">SEED Recording:</span>
                  <span className="font-medium">${facility.seedRecordingFee || 40}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hours:</span>
                  <span className="font-medium text-xs">
                    {facility.openingTimes?.weekdays || 'Not set'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Manager:</span>
                  <span className="font-medium">
                    {facility.manager ? facility.manager.name : 'No manager assigned'}
                  </span>
                </div>

                {facility.description && (
                  <div className="text-sm text-gray-600">
                    <p className="line-clamp-2">{facility.description}</p>
                  </div>
                )}

                {facility.techFeatures && facility.techFeatures.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600 mb-1">Tech Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {facility.techFeatures.slice(0, 2).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {facility.techFeatures.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{facility.techFeatures.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewCourts(facility)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Courts
                  </Button>
                  {canManageFacility(facility) && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditFacility(facility)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={() => confirmDeleteFacility(facility)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Facility Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Facility</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Facility Name</Label>
              <Input
                id="name"
                value={newFacility.name}
                onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                placeholder="Enter facility name"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newFacility.location}
                onChange={(e) => setNewFacility({ ...newFacility, location: e.target.value })}
                placeholder="Enter facility location"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newFacility.description}
                onChange={(e) => setNewFacility({ ...newFacility, description: e.target.value })}
                placeholder="Enter facility description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weekdays">Weekdays Hours</Label>
                <Input
                  id="weekdays"
                  value={newFacility.openingTimes?.weekdays || ''}
                  onChange={(e) => setNewFacility({ 
                    ...newFacility, 
                    openingTimes: { 
                      ...newFacility.openingTimes, 
                      weekdays: e.target.value 
                    } 
                  })}
                  placeholder="e.g., 08:00-22:00"
                />
              </div>
              <div>
                <Label htmlFor="weekends">Weekend Hours</Label>
                <Input
                  id="weekends"
                  value={newFacility.openingTimes?.weekends || ''}
                  onChange={(e) => setNewFacility({ 
                    ...newFacility, 
                    openingTimes: { 
                      ...newFacility.openingTimes, 
                      weekends: e.target.value 
                    } 
                  })}
                  placeholder="e.g., 09:00-20:00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hourlyFee">Hourly Fee ($)</Label>
                <Input
                  id="hourlyFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newFacility.hourlyFee}
                  onChange={(e) => setNewFacility({ ...newFacility, hourlyFee: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="seedRecordingFee">SEED Recording Fee ($)</Label>
                <Input
                  id="seedRecordingFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newFacility.seedRecordingFee}
                  onChange={(e) => setNewFacility({ ...newFacility, seedRecordingFee: parseFloat(e.target.value) || 40 })}
                  placeholder="40.00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                value={newFacility.amenities?.join(', ') || ''}
                onChange={(e) => setNewFacility({ 
                  ...newFacility, 
                  amenities: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                })}
                placeholder="e.g., Parking, Changing Rooms, Pro Shop"
              />
            </div>
            <div>
              <Label htmlFor="techFeatures">Tech Features (comma-separated)</Label>
              <Input
                id="techFeatures"
                value={newFacility.techFeatures?.join(', ') || ''}
                onChange={(e) => setNewFacility({ 
                  ...newFacility, 
                  techFeatures: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                })}
                placeholder="e.g., SEED System, LED Lighting, Sound System"
              />
            </div>
            {hasPermission('SUPER_ADMIN') && (
              <div>
                <Label htmlFor="manager">Manager</Label>
                <Select
                  value={newFacility.managerId?.toString() || 'no-manager'}
                  onValueChange={(value) => setNewFacility({ 
                    ...newFacility, 
                    managerId: value === 'no-manager' ? undefined : parseInt(value) 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-manager">No manager</SelectItem>
                    {admins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleCreateFacility} className="flex-1">
                Create Facility
              </Button>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Facility Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Facility</DialogTitle>
          </DialogHeader>
          {editingFacility && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Facility Name</Label>
                <Input
                  id="edit-name"
                  value={editingFacility.name}
                  onChange={(e) => setEditingFacility({ ...editingFacility, name: e.target.value })}
                  placeholder="Enter facility name"
                />
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editingFacility.location}
                  onChange={(e) => setEditingFacility({ ...editingFacility, location: e.target.value })}
                  placeholder="Enter facility location"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingFacility.description || ''}
                  onChange={(e) => setEditingFacility({ ...editingFacility, description: e.target.value })}
                  placeholder="Enter facility description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-weekdays">Weekdays Hours</Label>
                  <Input
                    id="edit-weekdays"
                    value={editingFacility.openingTimes?.weekdays || ''}
                    onChange={(e) => setEditingFacility({ 
                      ...editingFacility, 
                      openingTimes: { 
                        ...editingFacility.openingTimes, 
                        weekdays: e.target.value 
                      } 
                    })}
                    placeholder="e.g., 08:00-22:00"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-weekends">Weekend Hours</Label>
                  <Input
                    id="edit-weekends"
                    value={editingFacility.openingTimes?.weekends || ''}
                    onChange={(e) => setEditingFacility({ 
                      ...editingFacility, 
                      openingTimes: { 
                        ...editingFacility.openingTimes, 
                        weekends: e.target.value 
                      } 
                    })}
                    placeholder="e.g., 09:00-20:00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-hourlyFee">Hourly Fee ($)</Label>
                  <Input
                    id="edit-hourlyFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingFacility.hourlyFee || 0}
                    onChange={(e) => setEditingFacility({ ...editingFacility, hourlyFee: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-seedRecordingFee">SEED Recording Fee ($)</Label>
                  <Input
                    id="edit-seedRecordingFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingFacility.seedRecordingFee || 40}
                    onChange={(e) => setEditingFacility({ ...editingFacility, seedRecordingFee: parseFloat(e.target.value) || 40 })}
                    placeholder="40.00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-amenities">Amenities (comma-separated)</Label>
                <Input
                  id="edit-amenities"
                  value={editingFacility.amenities?.join(', ') || ''}
                  onChange={(e) => setEditingFacility({ 
                    ...editingFacility, 
                    amenities: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., Parking, Changing Rooms, Pro Shop"
                />
              </div>
              <div>
                <Label htmlFor="edit-techFeatures">Tech Features (comma-separated)</Label>
                <Input
                  id="edit-techFeatures"
                  value={editingFacility.techFeatures?.join(', ') || ''}
                  onChange={(e) => setEditingFacility({ 
                    ...editingFacility, 
                    techFeatures: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., SEED System, LED Lighting, Sound System"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateFacility} className="flex-1">
                  Update Facility
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
          {facilityToDelete && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{facilityToDelete.name}</strong>?
                This action cannot be undone and will affect all associated courts.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteFacility(facilityToDelete.id)}
                  className="flex-1"
                >
                  Delete Facility
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

      {/* Facility Courts Dialog */}
      <Dialog open={courtsDialogOpen} onOpenChange={setCourtsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Courts in {selectedFacility?.name}
            </DialogTitle>
          </DialogHeader>
          
          {courtsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading courts...</span>
            </div>
          ) : facilityCourts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">No Courts Found</p>
              <p className="text-gray-600">
                This facility doesn't have any courts yet. Courts can be added through the Court Management section.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Found {facilityCourts.length} court{facilityCourts.length !== 1 ? 's' : ''} in this facility
                </p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {facilityCourts.map((court) => (
                  <Card key={court.id} className="overflow-hidden">
                    {/* Court Image */}
                    <div className="relative h-24 bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                      {court.imageUrl ? (
                        <img
                          src={court.imageUrl}
                          alt={`${court.name} court`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center mx-auto">
                            <Users className="w-4 h-4 text-green-600" />
                          </div>
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{court.name}</CardTitle>
                        <Badge
                          variant={court.status === 'AVAILABLE' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {court.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{court.type || 'Not specified'}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sport:</span>
                        <span className="font-medium">{court.sportType || 'Tennis'}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Hourly Fee:</span>
                        <span className="font-medium">${court.hourlyFee || selectedFacility?.hourlyFee || 0} (from facility)</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">SEED System:</span>
                        <span className="font-medium">
                          {court.hasSeedSystem ? 'Yes' : 'No'}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Manager:</span>
                        <span className="font-medium">
                          {selectedFacility?.manager?.name || 'Managed by facility'}
                        </span>
                      </div>

                      {court.description && (
                        <div className="text-sm text-gray-600 pt-2 border-t">
                          <p className="line-clamp-2">{court.description}</p>
                        </div>
                      )}

                      {court.amenities && court.amenities.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-600 mb-1">Amenities:</p>
                          <div className="flex flex-wrap gap-1">
                            {court.amenities.slice(0, 3).map((amenity, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {court.amenities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{court.amenities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCourtsDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default FacilityManagement;