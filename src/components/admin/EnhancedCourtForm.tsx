import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Image, Trash2, Plus, Check, ChevronsUpDown, X } from 'lucide-react';
import { CreateCourtRequest } from '@/lib/api/services/courtService';
import { SportType } from '@/types/court';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { AdminUser } from '@/types/admin';
import { facilityService } from '@/lib/api/services/facilityService';
import { Facility } from '@/types/facility';

interface EnhancedCourtFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (courtData: CreateCourtRequest, imageFile?: File) => Promise<boolean>;
  admins: AdminUser[];
  adminsLoading: boolean;
}



const SPORT_TYPES = [
  { value: 'TENNIS', label: 'Tennis' },
  { value: 'PADEL', label: 'Padel' }
];

const TENNIS_COURT_TYPES = [
  { value: 'HARD', label: 'Hard Court' },
  { value: 'CLAY', label: 'Clay Court' },
  { value: 'GRASS', label: 'Grass Court' },
  { value: 'PADEL', label: 'Padel Court' }
];

const PADEL_COURT_TYPES = [
  { value: 'INDOOR', label: 'Indoor Court' },
  { value: 'OUTDOOR', label: 'Outdoor Court' }
];

export default function EnhancedCourtForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  admins, 
  adminsLoading 
}: EnhancedCourtFormProps) {
  const { t } = useTranslation('admin');
  const [formData, setFormData] = useState<CreateCourtRequest & { managerId?: string }>({
    name: '',
    sportType: 'TENNIS' as SportType,
    type: '',
    facilityId: 0,
    hasSeedSystem: false,
    imageUrl: '',
    managerId: ''
  });

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [managerSearchOpen, setManagerSearchOpen] = useState(false);
  const [managerSearchValue, setManagerSearchValue] = useState("");
  const [facilitySearchOpen, setFacilitySearchOpen] = useState(false);
  const [facilitySearchValue, setFacilitySearchValue] = useState("");

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-set court type when sport type changes
      if (field === 'sportType') {
        if (value === 'PADEL') {
          updated.type = null; // Pass null for PADEL courts
        } else {
          updated.type = '';
        }
      }
      return updated;
    });
  };

  // Fetch facilities when dialog opens
  useEffect(() => {
    if (open) {
      fetchFacilities();
    }
  }, [open]);

  const fetchFacilities = async () => {
    try {
      setFacilitiesLoading(true);
      const fetchedFacilities = await facilityService.getAllFacilities();
      setFacilities(fetchedFacilities);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast({ 
        title: t('common.error'), 
        description: "Failed to load facilities",
        variant: "destructive"
      });
    } finally {
      setFacilitiesLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedImageFile(null);
      setImagePreview(null);
      setFormData(prev => ({ ...prev, imageUrl: '' }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Invalid file type", 
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "File too large", 
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      // For now, store the data URL in imageUrl - in production you'd upload to a server
      setFormData(prev => ({ ...prev, imageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    // Reset the file input
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const validateImageUrl = (url: string) => {
    // This function is no longer needed since we're using file upload
    // Keeping for backward compatibility if needed
  };



  const isFormValid = () => {
    const isValidSport = formData.sportType === 'TENNIS' || formData.sportType === 'PADEL';
    const isValidType = formData.type && formData.type.trim() !== '';
    
    return !!(
      formData.name.trim() &&
      isValidSport &&
      isValidType &&
      formData.facilityId > 0
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const submitData: CreateCourtRequest = {
      name: formData.name,
      facilityId: formData.facilityId,
      sportType: formData.sportType,
      type: formData.sportType === 'PADEL' ? null : formData.type,
      hasSeedSystem: formData.hasSeedSystem,
      manager_id: formData.managerId && formData.managerId !== 'none' 
        ? (() => {
            console.log('Finding admin with name:', formData.managerId);
            console.log('Available admins:', admins);
            const selectedAdmin = admins.find(admin => admin.name === formData.managerId);
            console.log('Selected admin:', selectedAdmin);
            return selectedAdmin ? parseInt(selectedAdmin.id) : undefined;
          })()
        : undefined
    };

    // Pass the selected image file to the service
    const success = await onSubmit(submitData, selectedImageFile || undefined);
    
    // Only reset form on successful creation
    if (success) {
      setFormData({
        name: '',
        sportType: 'TENNIS' as SportType,
        type: '',
        facilityId: 0,
        hasSeedSystem: false,
        imageUrl: '',
        managerId: ''
      });
      setImagePreview(null);
      setSelectedImageFile(null);
      // Reset file input
      const fileInput = document.getElementById('imageFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Court</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basics */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basics</h3>
              
              <div>
                <Label htmlFor="name">{t('courts.courtName')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Court 1 – Center"
                />
              </div>

              <div>
                <Label htmlFor="sportType">Sport Type *</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sportType"
                      value="TENNIS"
                      checked={formData.sportType === 'TENNIS'}
                      onChange={(e) => handleInputChange('sportType', e.target.value)}
                      className="text-primary"
                    />
                    <span className="flex items-center gap-1">
                      🎾 Tennis
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sportType"
                      value="PADEL"
                      checked={formData.sportType === 'PADEL'}
                      onChange={(e) => handleInputChange('sportType', e.target.value)}
                      className="text-primary"
                    />
                    <span className="flex items-center gap-1">
                      🟩 Padel
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="type">Court Surface *</Label>
                <Select 
                  value={formData.sportType === 'PADEL' ? 'PADEL' : formData.type} 
                  onValueChange={(value) => handleInputChange('type', value)}
                  disabled={formData.sportType === 'PADEL'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      formData.sportType === 'PADEL' 
                        ? "PADEL (Auto-selected by backend)" 
                        : "Select court surface"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.sportType === 'PADEL' ? (
                      <SelectItem value="PADEL">Padel Court</SelectItem>
                    ) : (
                      TENNIS_COURT_TYPES.filter(type => type.value !== 'PADEL').map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formData.sportType === 'PADEL' && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Court type will be automatically set to PADEL by the backend
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="facility">Facility *</Label>
                <Popover open={facilitySearchOpen} onOpenChange={setFacilitySearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={facilitySearchOpen}
                      className="w-full justify-between"
                      disabled={facilitiesLoading}
                    >
                      {facilitiesLoading ? "Loading facilities..." : 
                       formData.facilityId === 0
                        ? "Select facility"
                        : facilities.find(f => f.id === formData.facilityId)?.name || "Select facility"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search facilities..."
                        value={facilitySearchValue}
                        onValueChange={setFacilitySearchValue}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-2">
                            <p className="text-sm text-muted-foreground">
                              {facilitiesLoading ? "Loading facilities..." : "No facility found."}
                            </p>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {facilities
                            .filter((facility) => {
                              const searchTerm = facilitySearchValue.toLowerCase();
                              return (facility.name?.toLowerCase() || '').includes(searchTerm) || 
                                     (facility.location?.toLowerCase() || '').includes(searchTerm);
                            })
                            .map((facility) => (
                              <CommandItem
                                key={facility.id}
                                value={facility.name}
                                onSelect={() => {
                                  handleInputChange('facilityId', facility.id);
                                  setFacilitySearchOpen(false);
                                  setFacilitySearchValue("");
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.facilityId === facility.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{facility.name}</span>
                                  <span className="text-xs text-muted-foreground">{facility.location}</span>
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>



              <div className="flex items-center space-x-2">
                <Switch
                  id="hasSeedSystem"
                  checked={formData.hasSeedSystem}
                  onCheckedChange={(checked) => handleInputChange('hasSeedSystem', checked)}
                />
                <Label htmlFor="hasSeedSystem">Has Seed System</Label>
              </div>
            </div>

            <Separator />

            {/* Manager Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Manager Assignment</h3>
              
              <div>
                <Label htmlFor="managerId">Court Manager</Label>
                <Popover open={managerSearchOpen} onOpenChange={setManagerSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={managerSearchOpen}
                      className="w-full justify-between"
                      disabled={adminsLoading}
                    >
                      {adminsLoading ? "Loading admins..." : 
                       formData.managerId === '' || formData.managerId === 'none'
                        ? "Select manager"
                        : formData.managerId === 'none'
                        ? "No manager assigned"
                        : formData.managerId || "Select manager"}
                        <div className="flex items-center gap-1">
                          {formData.managerId && formData.managerId !== '' && formData.managerId !== 'none' && (
                            <div
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded cursor-pointer flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInputChange('managerId', 'none');
                              }}
                            >
                              <X className="h-3 w-3" />
                            </div>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </div>
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
                        <CommandEmpty>
                          <div className="p-2">
                            <p className="text-sm text-muted-foreground">
                              {adminsLoading ? "Loading admins..." : "No manager found."}
                            </p>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="none"
                            onSelect={() => {
                              handleInputChange('managerId', 'none');
                              setManagerSearchOpen(false);
                              setManagerSearchValue("");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.managerId === 'none' ? "opacity-100" : "opacity-0"
                              )}
                            />
                            No manager assigned
                          </CommandItem>
                          {admins
                            .filter((admin) => {
                              const searchTerm = managerSearchValue.toLowerCase();
                              return (admin.name?.toLowerCase() || '').includes(searchTerm) || 
                                     (admin.email?.toLowerCase() || '').includes(searchTerm);
                            })
                            .map((admin) => (
                              <CommandItem
                                key={admin.id}
                                value={admin.name}
                                onSelect={() => {
                                  handleInputChange('managerId', admin.name);
                                  setManagerSearchOpen(false);
                                  setManagerSearchValue("");
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.managerId === admin.name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{admin.name}</span>
                                  <span className="text-xs text-muted-foreground">{admin.email}</span>
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Court Image</h3>
              
              <div>
                <Label htmlFor="imageFile">Cover Image</Label>
                <div className="space-y-2">
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload an image file (max 5MB). Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </div>
                
                {imagePreview && (
                  <div className="mt-3 relative">
                    <img
                      src={imagePreview}
                      alt="Court preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {selectedImageFile && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Selected: {selectedImageFile.name} ({(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            </div>

            {/* Facility Info Display */}
            {formData.facilityId > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Selected Facility</h3>
                {(() => {
                  const selectedFacility = facilities.find(f => f.id === formData.facilityId);
                  return selectedFacility ? (
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium">{selectedFacility.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {selectedFacility.location}
                      </p>
                      {selectedFacility.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {selectedFacility.description}
                        </p>
                      )}
                      {selectedFacility.hourlyFee && (
                        <p className="text-sm font-medium text-primary mt-2">
                          Hourly Fee: {selectedFacility.hourlyFee} SAR
                        </p>
                      )}
                      {selectedFacility.amenities && selectedFacility.amenities.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Facility Amenities:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedFacility.amenities.map(amenity => (
                              <Badge key={amenity} variant="secondary" className="text-xs">
                                {amenity.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid()}>
            Create Court
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}