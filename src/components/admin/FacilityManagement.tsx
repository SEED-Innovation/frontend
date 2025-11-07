import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Settings, MapPin, Building, Loader2, Search, Filter, X, RefreshCw, Eye, Users, Image, Clock, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [activeTab, setActiveTab] = useState<string>(
    hasPermission('SUPER_ADMIN') ? 'all' : 'my-facility'
  );

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
    locationAndroid: '',
    locationIos: '',
    amenities: [],
    techFeatures: [],
    managerId: undefined,
    hourlyFee: 0,
    discountAmount: 0,
    discountPercentage: 0,
    isPercentageDiscount: false,
    seedRecordingFee: 40
  });

  // Amenities and tech features input states
  const [newAmenity, setNewAmenity] = useState('');
  const [newTechFeature, setNewTechFeature] = useState('');
  const [editAmenity, setEditAmenity] = useState('');
  const [editTechFeature, setEditTechFeature] = useState('');

  // Image upload states
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
  const [createSelectedImageFile, setCreateSelectedImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editSelectedImageFile, setEditSelectedImageFile] = useState<File | null>(null);

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

  const handleCreateImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setCreateSelectedImageFile(null);
      setCreateImagePreview(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please select an image smaller than 5MB');
      return;
    }

    setCreateSelectedImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCreateImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleEditImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setEditSelectedImageFile(null);
      setEditImagePreview(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please select an image smaller than 5MB');
      return;
    }

    setEditSelectedImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setEditImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const removeCreateImage = () => {
    setCreateSelectedImageFile(null);
    setCreateImagePreview(null);
    // Reset the file input
    const fileInput = document.getElementById('createImageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const removeEditImage = () => {
    setEditSelectedImageFile(null);
    setEditImagePreview(null);
    // Reset the file input
    const fileInput = document.getElementById('editImageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Amenities management for create form
  const addAmenity = () => {
    if (newAmenity.trim() && !newFacility.amenities?.includes(newAmenity.trim())) {
      setNewFacility({
        ...newFacility,
        amenities: [...(newFacility.amenities || []), newAmenity.trim()]
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setNewFacility({
      ...newFacility,
      amenities: newFacility.amenities?.filter(a => a !== amenity) || []
    });
  };

  // Tech features management for create form
  const addTechFeature = () => {
    if (newTechFeature.trim() && !newFacility.techFeatures?.includes(newTechFeature.trim())) {
      setNewFacility({
        ...newFacility,
        techFeatures: [...(newFacility.techFeatures || []), newTechFeature.trim()]
      });
      setNewTechFeature('');
    }
  };

  const removeTechFeature = (feature: string) => {
    setNewFacility({
      ...newFacility,
      techFeatures: newFacility.techFeatures?.filter(f => f !== feature) || []
    });
  };

  // Amenities management for edit form
  const addEditAmenity = () => {
    if (editAmenity.trim() && editingFacility && !editingFacility.amenities?.includes(editAmenity.trim())) {
      setEditingFacility({
        ...editingFacility,
        amenities: [...(editingFacility.amenities || []), editAmenity.trim()]
      });
      setEditAmenity('');
    }
  };

  const removeEditAmenity = (amenity: string) => {
    if (editingFacility) {
      setEditingFacility({
        ...editingFacility,
        amenities: editingFacility.amenities?.filter(a => a !== amenity) || []
      });
    }
  };

  // Tech features management for edit form
  const addEditTechFeature = () => {
    if (editTechFeature.trim() && editingFacility && !editingFacility.techFeatures?.includes(editTechFeature.trim())) {
      setEditingFacility({
        ...editingFacility,
        techFeatures: [...(editingFacility.techFeatures || []), editTechFeature.trim()]
      });
      setEditTechFeature('');
    }
  };

  const removeEditTechFeature = (feature: string) => {
    if (editingFacility) {
      setEditingFacility({
        ...editingFacility,
        techFeatures: editingFacility.techFeatures?.filter(f => f !== feature) || []
      });
    }
  };

  const handleCreateFacility = async () => {
    try {
      let createdFacility;
      if (createSelectedImageFile) {
        createdFacility = await facilityService.createFacilityWithImage(newFacility, createSelectedImageFile);
      } else {
        createdFacility = await facilityService.createFacility(newFacility);
      }
      
      setFacilities([...facilities, createdFacility]);
      setCreateDialogOpen(false);
      setNewFacility({
        name: '',
        location: '',
        description: '',
        openingTimes: { weekdays: '', weekends: '' },
        locationAndroid: '',
        locationIos: '',
        amenities: [],
        techFeatures: [],
        managerId: undefined,
        hourlyFee: 0,
        discountAmount: 0,
        discountPercentage: 0,
        isPercentageDiscount: false,
        seedRecordingFee: 40
      });
      
      // Reset amenities and tech features input states
      setNewAmenity('');
      setNewTechFeature('');
      
      // Reset image states
      setCreateImagePreview(null);
      setCreateSelectedImageFile(null);
      const fileInput = document.getElementById('createImageFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
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
    // Reset image states when opening edit dialog
    setEditImagePreview(null);
    setEditSelectedImageFile(null);
    const fileInput = document.getElementById('editImageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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
        locationAndroid: editingFacility.locationAndroid,
        locationIos: editingFacility.locationIos,
        amenities: editingFacility.amenities,
        techFeatures: editingFacility.techFeatures,
        managerId: editingFacility.managerId,
        hourlyFee: editingFacility.hourlyFee,
        discountAmount: editingFacility.discountAmount,
        discountPercentage: editingFacility.discountPercentage,
        isPercentageDiscount: editingFacility.isPercentageDiscount,
        seedRecordingFee: editingFacility.seedRecordingFee
      };

      let updatedFacility;
      if (editSelectedImageFile) {
        updatedFacility = await facilityService.updateFacilityWithImage(editingFacility.id, updateData, editSelectedImageFile);
      } else {
        updatedFacility = await facilityService.updateFacility(editingFacility.id, updateData);
      }
      
      setFacilities(prevFacilities =>
        prevFacilities.map(facility =>
          facility.id === editingFacility.id ? updatedFacility : facility
        )
      );

      setEditDialogOpen(false);
      setEditingFacility(null);
      
      // Reset image states
      setEditImagePreview(null);
      setEditSelectedImageFile(null);
      const fileInput = document.getElementById('editImageFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
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
      return facility.managerId === Number(user.id);
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

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md" style={{ gridTemplateColumns: hasPermission('SUPER_ADMIN') ? '1fr 1fr' : '1fr' }}>
          {hasPermission('SUPER_ADMIN') && (
            <TabsTrigger value="all">All Facilities</TabsTrigger>
          )}
          <TabsTrigger value="my-facility">My Facility</TabsTrigger>
        </TabsList>

        {/* All Facilities Tab (Super Admin Only) */}
        {hasPermission('SUPER_ADMIN') && (
          <TabsContent value="all" className="space-y-4">
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
          </TabsContent>
        )}

        {/* My Facility Tab (For Admins) */}
        <TabsContent value="my-facility" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading your facility...</span>
            </div>
          ) : facilities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Facility Assigned</h3>
              <p className="text-gray-600 mb-4">
                You don't have a facility assigned to you yet. Please contact a super admin to get assigned to a facility.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {facilities.map((facility) => (
                <Card key={facility.id} className="overflow-hidden">
                  {/* Facility Header with Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5">
                    {facility.imageUrl ? (
                      <img
                        src={facility.imageUrl}
                        alt={`${facility.name} facility`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                            <Building className="w-8 h-8 text-primary/60" />
                          </div>
                          <p className="text-sm text-muted-foreground">No facility image</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge
                        variant={facility.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className="text-sm"
                      >
                        {facility.status}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{facility.name}</CardTitle>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{facility.location}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditFacility(facility)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCourts(facility)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Courts
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Description */}
                    {facility.description && (
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-gray-600">{facility.description}</p>
                      </div>
                    )}

                    {/* Key Information Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Courts</p>
                        <p className="text-2xl font-bold">{facility.courtCount || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Hourly Fee</p>
                        <p className="text-2xl font-bold">﷼{facility.hourlyFee || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">SEED Fee</p>
                        <p className="text-2xl font-bold">﷼{facility.seedRecordingFee || 40}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <p className="text-2xl font-bold">
                          {facility.averageRating ? `${facility.averageRating.toFixed(1)}⭐` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Opening Hours */}
                    {facility.openingTimes && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Opening Hours
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Weekdays</p>
                            <p className="font-medium">{facility.openingTimes.weekdays || 'Not set'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Weekends</p>
                            <p className="font-medium">{facility.openingTimes.weekends || 'Not set'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Map Links */}
                    {(facility.locationAndroid || facility.locationIos) && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          Map Links
                        </h4>
                        <div className="flex gap-2">
                          {facility.locationAndroid && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(facility.locationAndroid, '_blank')}
                            >
                              Android/Google Maps
                            </Button>
                          )}
                          {facility.locationIos && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(facility.locationIos, '_blank')}
                            >
                              iOS/Apple Maps
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Amenities */}
                    {facility.amenities && facility.amenities.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {facility.amenities.map((amenity, index) => (
                            <Badge key={index} variant="secondary">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tech Features */}
                    {facility.techFeatures && facility.techFeatures.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Tech Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {facility.techFeatures.map((feature, index) => (
                            <Badge key={index} variant="outline">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Facility Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Facility</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
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
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Opening Hours
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weekdays" className="text-sm text-muted-foreground">Weekdays</Label>
                    <Input
                      id="weekdays"
                      type="time"
                      value={newFacility.openingTimes?.weekdays?.split('-')[0] || ''}
                      onChange={(e) => {
                        const endTime = newFacility.openingTimes?.weekdays?.split('-')[1] || '22:00';
                        setNewFacility({ 
                          ...newFacility, 
                          openingTimes: { 
                            ...newFacility.openingTimes, 
                            weekdays: `${e.target.value}-${endTime}` 
                          } 
                        });
                      }}
                      placeholder="08:00"
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={newFacility.openingTimes?.weekdays?.split('-')[1] || ''}
                      onChange={(e) => {
                        const startTime = newFacility.openingTimes?.weekdays?.split('-')[0] || '08:00';
                        setNewFacility({ 
                          ...newFacility, 
                          openingTimes: { 
                            ...newFacility.openingTimes, 
                            weekdays: `${startTime}-${e.target.value}` 
                          } 
                        });
                      }}
                      placeholder="22:00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weekends" className="text-sm text-muted-foreground">Weekends</Label>
                    <Input
                      id="weekends"
                      type="time"
                      value={newFacility.openingTimes?.weekends?.split('-')[0] || ''}
                      onChange={(e) => {
                        const endTime = newFacility.openingTimes?.weekends?.split('-')[1] || '20:00';
                        setNewFacility({ 
                          ...newFacility, 
                          openingTimes: { 
                            ...newFacility.openingTimes, 
                            weekends: `${e.target.value}-${endTime}` 
                          } 
                        });
                      }}
                      placeholder="09:00"
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={newFacility.openingTimes?.weekends?.split('-')[1] || ''}
                      onChange={(e) => {
                        const startTime = newFacility.openingTimes?.weekends?.split('-')[0] || '09:00';
                        setNewFacility({ 
                          ...newFacility, 
                          openingTimes: { 
                            ...newFacility.openingTimes, 
                            weekends: `${startTime}-${e.target.value}` 
                          } 
                        });
                      }}
                      placeholder="20:00"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourlyFee">Hourly Fee (SAR)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">﷼</span>
                    <Input
                      id="hourlyFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newFacility.hourlyFee}
                      onChange={(e) => setNewFacility({ ...newFacility, hourlyFee: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="seedRecordingFee">SEED Recording Fee (SAR)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">﷼</span>
                    <Input
                      id="seedRecordingFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newFacility.seedRecordingFee}
                      onChange={(e) => setNewFacility({ ...newFacility, seedRecordingFee: parseFloat(e.target.value) || 40 })}
                      placeholder="40.00"
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Map Links
                </Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Android/Google Maps link"
                    value={newFacility.locationAndroid || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, locationAndroid: e.target.value })}
                  />
                  <Input
                    placeholder="iOS/Apple Maps link"
                    value={newFacility.locationIos || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, locationIos: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Image Upload and Additional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Facility Image</h3>
              
              <div>
                <Label htmlFor="createImageFile">Cover Image</Label>
                <div className="space-y-2">
                  <Input
                    id="createImageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleCreateImageUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload an image file (max 5MB). Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </div>
                
                {createImagePreview && (
                  <div className="mt-3 relative">
                    <img
                      src={createImagePreview}
                      alt="Facility preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeCreateImage}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {createSelectedImageFile && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Selected: {createSelectedImageFile.name} ({(createSelectedImageFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="flex gap-2">
                  <Input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    placeholder="Add amenity (e.g., Parking)"
                  />
                  <Button type="button" onClick={addAmenity} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {newFacility.amenities && newFacility.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newFacility.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {amenity}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-destructive"
                          onClick={() => removeAmenity(amenity)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Tech Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTechFeature}
                    onChange={(e) => setNewTechFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechFeature())}
                    placeholder="Add tech feature (e.g., SEED System)"
                  />
                  <Button type="button" onClick={addTechFeature} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {newFacility.techFeatures && newFacility.techFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newFacility.techFeatures.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {feature}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-destructive"
                          onClick={() => removeTechFeature(feature)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
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
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFacility}>
              Create Facility
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Facility Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Facility</DialogTitle>
          </DialogHeader>
          {editingFacility && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
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
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Opening Hours
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-weekdays" className="text-sm text-muted-foreground">Weekdays</Label>
                      <Input
                        id="edit-weekdays"
                        type="time"
                        value={editingFacility.openingTimes?.weekdays?.split('-')[0] || ''}
                        onChange={(e) => {
                          const endTime = editingFacility.openingTimes?.weekdays?.split('-')[1] || '22:00';
                          setEditingFacility({ 
                            ...editingFacility, 
                            openingTimes: { 
                              ...editingFacility.openingTimes, 
                              weekdays: `${e.target.value}-${endTime}` 
                            } 
                          });
                        }}
                        placeholder="08:00"
                      />
                      <span className="text-xs text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={editingFacility.openingTimes?.weekdays?.split('-')[1] || ''}
                        onChange={(e) => {
                          const startTime = editingFacility.openingTimes?.weekdays?.split('-')[0] || '08:00';
                          setEditingFacility({ 
                            ...editingFacility, 
                            openingTimes: { 
                              ...editingFacility.openingTimes, 
                              weekdays: `${startTime}-${e.target.value}` 
                            } 
                          });
                        }}
                        placeholder="22:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-weekends" className="text-sm text-muted-foreground">Weekends</Label>
                      <Input
                        id="edit-weekends"
                        type="time"
                        value={editingFacility.openingTimes?.weekends?.split('-')[0] || ''}
                        onChange={(e) => {
                          const endTime = editingFacility.openingTimes?.weekends?.split('-')[1] || '20:00';
                          setEditingFacility({ 
                            ...editingFacility, 
                            openingTimes: { 
                              ...editingFacility.openingTimes, 
                              weekends: `${e.target.value}-${endTime}` 
                            } 
                          });
                        }}
                        placeholder="09:00"
                      />
                      <span className="text-xs text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={editingFacility.openingTimes?.weekends?.split('-')[1] || ''}
                        onChange={(e) => {
                          const startTime = editingFacility.openingTimes?.weekends?.split('-')[0] || '09:00';
                          setEditingFacility({ 
                            ...editingFacility, 
                            openingTimes: { 
                              ...editingFacility.openingTimes, 
                              weekends: `${startTime}-${e.target.value}` 
                            } 
                          });
                        }}
                        placeholder="20:00"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-hourlyFee">Hourly Fee (SAR)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">﷼</span>
                      <Input
                        id="edit-hourlyFee"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingFacility.hourlyFee || 0}
                        onChange={(e) => setEditingFacility({ ...editingFacility, hourlyFee: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-seedRecordingFee">SEED Recording Fee (SAR)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">﷼</span>
                      <Input
                        id="edit-seedRecordingFee"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingFacility.seedRecordingFee || 40}
                        onChange={(e) => setEditingFacility({ ...editingFacility, seedRecordingFee: parseFloat(e.target.value) || 40 })}
                        placeholder="40.00"
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Map Links
                  </Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Android/Google Maps link"
                      value={editingFacility.locationAndroid || ''}
                      onChange={(e) => setEditingFacility({ ...editingFacility, locationAndroid: e.target.value })}
                    />
                    <Input
                      placeholder="iOS/Apple Maps link"
                      value={editingFacility.locationIos || ''}
                      onChange={(e) => setEditingFacility({ ...editingFacility, locationIos: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Image Upload and Additional Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Facility Image</h3>
                
                {/* Current Image Display */}
                {editingFacility.imageUrl && !editImagePreview && (
                  <div className="space-y-2">
                    <Label>Current Image</Label>
                    <div className="relative">
                      <img
                        src={editingFacility.imageUrl}
                        alt="Current facility image"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        Current
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="editImageFile">Upload New Image</Label>
                  <div className="space-y-2">
                    <Input
                      id="editImageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground">
                      Upload a new image file (max 5MB). This will replace the current image.
                    </p>
                  </div>
                  
                  {editImagePreview && (
                    <div className="mt-3 relative">
                      <img
                        src={editImagePreview}
                        alt="New facility preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeEditImage}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        New
                      </div>
                    </div>
                  )}
                  
                  {editSelectedImageFile && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Selected: {editSelectedImageFile.name} ({(editSelectedImageFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <div className="flex gap-2">
                    <Input
                      value={editAmenity}
                      onChange={(e) => setEditAmenity(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEditAmenity())}
                      placeholder="Add amenity (e.g., Parking)"
                    />
                    <Button type="button" onClick={addEditAmenity} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {editingFacility.amenities && editingFacility.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editingFacility.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {amenity}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeEditAmenity(amenity)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Tech Features</Label>
                  <div className="flex gap-2">
                    <Input
                      value={editTechFeature}
                      onChange={(e) => setEditTechFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEditTechFeature())}
                      placeholder="Add tech feature (e.g., SEED System)"
                    />
                    <Button type="button" onClick={addEditTechFeature} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {editingFacility.techFeatures && editingFacility.techFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editingFacility.techFeatures.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {feature}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeEditTechFeature(feature)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-2 pt-6 border-t">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateFacility}>
                  Update Facility
                </Button>
              </div>
            </>
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