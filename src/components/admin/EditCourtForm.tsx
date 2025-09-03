import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Upload, Check, ChevronsUpDown } from 'lucide-react';
import { Court, UpdateCourtRequest } from '@/lib/api/services/courtService';
import { toast } from '@/hooks/use-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface EditCourtFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  court: Court | null;
  onSubmit: (courtData: UpdateCourtRequest, imageFile?: File) => Promise<boolean>;
  admins: string[];
  adminsLoading: boolean;
}

const AMENITIES_OPTIONS = [
  'LIGHTS', 'SHOWERS', 'LOCKERS', 'PARKING', 'CAFE', 'SHOP',
  'WIFI', 'AC', 'SOUND_SYSTEM', 'SEATING', 'WATER_FOUNTAIN'
];

const COURT_TYPES = [
  { value: 'HARD', label: 'Hard Court' },
  { value: 'CLAY', label: 'Clay Court' },
  { value: 'GRASS', label: 'Grass Court' },
  { value: 'INDOOR', label: 'Indoor Court' },
  { value: 'OUTDOOR', label: 'Outdoor Court' }
];

type CourtType = "HARD" | "CLAY" | "GRASS" | "INDOOR" | "OUTDOOR";

export default function EditCourtForm({ 
  open, 
  onOpenChange, 
  court,
  onSubmit, 
  admins, 
  adminsLoading 
}: EditCourtFormProps) {
  const { hasPermission } = useAdminAuth();
  const isSuperAdmin = hasPermission('SUPER_ADMIN');
  
  const [formData, setFormData] = useState<UpdateCourtRequest & { managerId?: string }>({
    name: '',
    location: '',
    type: undefined,
    hourlyFee: undefined,
    hasSeedSystem: undefined,
    amenities: [],
    description: '',
    latitude: undefined,
    longitude: undefined,
    managerId: undefined
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [managerSearchOpen, setManagerSearchOpen] = useState(false);
  const [managerSearchValue, setManagerSearchValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when court changes
  useEffect(() => {
    if (court && open) {
      // Find the current manager name from the managerId
      const currentManagerName = court.managerId && admins.length > 0 
        ? admins.find((_, index) => index.toString() === court.managerId?.toString()) || 'none'
        : 'none';
      
      setFormData({
        name: court.name,
        location: court.location,
        type: court.type as CourtType,
        hourlyFee: court.hourlyFee,
        hasSeedSystem: court.hasSeedSystem,
        amenities: [...court.amenities],
        description: court.description || '',
        latitude: court.latitude,
        longitude: court.longitude,
        managerId: currentManagerName
      });
      setImagePreview(court.imageUrl || null);
      setSelectedImageFile(null);
    }
  }, [court, open, admins]);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...(prev.amenities || []), amenity]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedImageFile(null);
      setImagePreview(court?.imageUrl || null);
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({ 
        title: "Invalid file type", 
        description: "Please select a JPG, PNG, or WebP image",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB as per backend spec)
    if (file.size > 10 * 1024 * 1024) {
      toast({ 
        title: "File too large", 
        description: "Please select an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('editImageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const isFormValid = () => {
    return !!(
      formData.name?.trim() &&
      formData.type &&
      formData.location?.trim() &&
      (formData.hourlyFee === undefined || formData.hourlyFee > 0)
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill in all required fields correctly",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare update data - only include changed fields
      const submitData: UpdateCourtRequest = {};
      
      if (formData.name && formData.name !== court?.name) {
        submitData.name = formData.name;
      }
      if (formData.location && formData.location !== court?.location) {
        submitData.location = formData.location;
      }
      if (formData.type && formData.type !== court?.type) {
        submitData.type = formData.type;
      }
      if (formData.hourlyFee !== undefined && formData.hourlyFee !== court?.hourlyFee) {
        submitData.hourlyFee = formData.hourlyFee;
      }
      if (formData.hasSeedSystem !== undefined && formData.hasSeedSystem !== court?.hasSeedSystem) {
        submitData.hasSeedSystem = formData.hasSeedSystem;
      }
      if (formData.amenities && JSON.stringify(formData.amenities.sort()) !== JSON.stringify((court?.amenities || []).sort())) {
        submitData.amenities = formData.amenities;
      }
      if (formData.description !== court?.description) {
        submitData.description = formData.description || undefined;
      }
      if (formData.latitude !== court?.latitude) {
        submitData.latitude = formData.latitude;
      }
      if (formData.longitude !== court?.longitude) {
        submitData.longitude = formData.longitude;
      }

      // Handle manager assignment (SUPER_ADMIN only)
      const currentManagerName = court?.managerId && admins.length > 0 
        ? admins.find((_, index) => index.toString() === court.managerId?.toString()) || 'none'
        : 'none';
      
      if (isSuperAdmin && formData.managerId !== currentManagerName) {
        if (formData.managerId && formData.managerId !== 'none') {
          // Find admin index by name to get the ID
          const adminIndex = admins.findIndex(admin => admin === formData.managerId);
          if (adminIndex !== -1) {
            submitData.manager_id = { id: adminIndex };
          }
        }
      }

      // If no file selected and no field changes, just update imageUrl if it was cleared
      if (!selectedImageFile && !imagePreview && court?.imageUrl) {
        submitData.imageUrl = null;
      }

      const success = await onSubmit(submitData, selectedImageFile || undefined);
      
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating court:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!court) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Court - {court.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basics */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basics</h3>
              
              <div>
                <Label htmlFor="name">Court Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Court 1 – Center"
                />
              </div>

              <div>
                <Label htmlFor="type">Court Type *</Label>
                <Select value={formData.type || ''} onValueChange={(value) => handleInputChange('type', value as CourtType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select court type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hourlyFee">Hourly Fee (SAR) *</Label>
                <Input
                  id="hourlyFee"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.hourlyFee || ''}
                  onChange={(e) => handleInputChange('hourlyFee', Number(e.target.value))}
                  placeholder="120.00"
                />
                <p className="text-sm text-muted-foreground mt-1">Must be greater than 0</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasSeedSystem"
                  checked={formData.hasSeedSystem || false}
                  onCheckedChange={(checked) => handleInputChange('hasSeedSystem', checked)}
                />
                <Label htmlFor="hasSeedSystem">Has Seed System</Label>
              </div>
            </div>

            <Separator />

            {/* Manager Selection - Only for SUPER_ADMIN */}
            {isSuperAdmin && (
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
                          ? "No manager assigned"
                          : formData.managerId && formData.managerId !== 'none'
                          ? formData.managerId
                          : "Select manager"}
                        <div className="flex items-center gap-1">
                          {formData.managerId && formData.managerId !== '' && formData.managerId !== 'none' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInputChange('managerId', 'none');
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
                              .filter((admin) =>
                                admin.toLowerCase().includes(managerSearchValue.toLowerCase())
                              )
                              .map((admin, index) => (
                                <CommandItem
                                  key={admin}
                                  value={admin}
                                  onSelect={() => {
                                    handleInputChange('managerId', admin);
                                    setManagerSearchOpen(false);
                                    setManagerSearchValue("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.managerId === admin ? "opacity-100" : "opacity-0"
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
              </div>
            )}
          </div>

          {/* Right Column - Location & Details */}
          <div className="space-y-6">
            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location</h3>
              
              <div>
                <Label htmlFor="location">Address *</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="King Abdulaziz Rd, Jeddah, SA"
                />
              </div>

              {/* Manual Coordinates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    min="-90"
                    max="90"
                    value={formData.latitude || ''}
                    onChange={(e) => handleInputChange('latitude', Number(e.target.value))}
                    placeholder="21.485800"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    min="-180"
                    max="180"
                    value={formData.longitude || ''}
                    onChange={(e) => handleInputChange('longitude', Number(e.target.value))}
                    placeholder="39.192500"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Details</h3>
              
              {/* Amenities */}
              <div>
                <Label>Amenities</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {AMENITIES_OPTIONS.map(amenity => (
                    <Badge
                      key={amenity}
                      variant={formData.amenities?.includes(amenity) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleAmenityToggle(amenity)}
                    >
                      {amenity.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Additional details about the court..."
                  maxLength={500}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {(formData.description || '').length}/500 characters
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="editImageFile">Court Image</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Court preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">No image selected</p>
                    </div>
                  )}
                  <input
                    id="editImageFile"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="mt-2 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG, or WebP. Max 10MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid() || isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Court'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}