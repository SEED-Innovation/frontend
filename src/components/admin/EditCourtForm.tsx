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
import { UpdateCourtRequest } from '@/lib/api/services/courtService';
import { Court, SportType } from '@/types/court';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { facilityService } from '@/lib/api/services/facilityService';
import { Facility } from '@/types/facility';
import { AdminUser } from '@/types/admin';
import { useRTLClasses } from '@/hooks/useRTLClasses';

interface EditCourtFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  court: Court | null;
  onSubmit: (courtData: UpdateCourtRequest, imageFile?: File) => Promise<boolean>;
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

type CourtType = "HARD" | "CLAY" | "GRASS" | "INDOOR" | "OUTDOOR" | "PADEL";

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
  const { t } = useTranslation('admin');
  const rtlClasses = useRTLClasses();
  
  const [formData, setFormData] = useState<UpdateCourtRequest & { managerId?: string }>({
    name: '',
    facilityId: undefined,
    type: undefined,
    sportType: undefined,
    hourlyFee: undefined,
    hasSeedSystem: undefined,
    managerId: undefined
  });

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [managerSearchOpen, setManagerSearchOpen] = useState(false);
  const [managerSearchValue, setManagerSearchValue] = useState("");
  const [facilitySearchOpen, setFacilitySearchOpen] = useState(false);
  const [facilitySearchValue, setFacilitySearchValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch facilities when dialog opens
  useEffect(() => {
    if (open) {
      fetchFacilities();
    }
  }, [open]);

  // Initialize form data when court changes
  useEffect(() => {
    if (court && open) {
      // Find the current manager name from the managerId
      const currentManagerName = court.manager?.name || 'none';
      
      setFormData({
        name: court.name,
        facilityId: court.facilityId,
        type: court.type as CourtType,
        sportType: court.sportType,
        hourlyFee: court.hourlyFee,
        hasSeedSystem: court.hasSeedSystem,
        managerId: currentManagerName
      });
      setImagePreview(court.imageUrl || null);
      setSelectedImageFile(null);
    }
  }, [court, open, admins]);

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

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-set court type when sport type changes
      if (field === 'sportType') {
        if (value === 'PADEL') {
          updated.type = null; // Pass null for PADEL courts
        } else if (prev.type === 'PADEL' || prev.type === null) {
          // If changing from PADEL to TENNIS, reset type
          updated.type = undefined;
        }
      }
      return updated;
    });
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
    const isValidType = formData.type && formData.type.trim() !== '';
    
    return !!(
      formData.name?.trim() &&
      isValidType &&
      formData.facilityId &&
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
      if (formData.facilityId && formData.facilityId !== court?.facilityId) {
        submitData.facilityId = formData.facilityId;
      }
      // Handle sport type and court type together
      const sport = formData.sportType || 'TENNIS';
      if (sport !== court?.sportType) {
        submitData.sportType = sport;
      }
      
      if (formData.type !== court?.type) {
        submitData.type = (formData.sportType || 'TENNIS') === 'PADEL' ? null : (formData.type || null);
      }
      if (formData.hourlyFee !== undefined && formData.hourlyFee !== court?.hourlyFee) {
        submitData.hourlyFee = formData.hourlyFee;
      }
      if (formData.hasSeedSystem !== undefined && formData.hasSeedSystem !== court?.hasSeedSystem) {
        submitData.hasSeedSystem = formData.hasSeedSystem;
      }

      // Handle manager assignment (SUPER_ADMIN only)
      const currentManagerName = court?.manager?.name || 'none';
      
      if (isSuperAdmin && formData.managerId !== currentManagerName) {
        if (formData.managerId && formData.managerId !== 'none') {
          // Find admin by name to get the ID
          console.log('Finding admin with name:', formData.managerId);
          console.log('Available admins:', admins);
          const selectedAdmin = admins.find(admin => admin.name === formData.managerId);
          console.log('Selected admin:', selectedAdmin);
          if (selectedAdmin && selectedAdmin.id) {
            submitData.manager_id = parseInt(selectedAdmin.id);
          }
        } else {
          // Remove manager assignment
          submitData.manager_id = null;
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
              <h3 className={cn("text-lg font-semibold", rtlClasses.textAlign)}>Basics</h3>
              
              <div>
                <Label htmlFor="name" className={rtlClasses.textAlign}>{t('courts.courtName')} *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Court 1 – Center"
                  className={rtlClasses.textAlign}
                />
              </div>

              <div>
                <Label htmlFor="sportType" className={rtlClasses.textAlign}>Sport Type</Label>
                {hasPermission('SUPER_ADMIN') ? (
                  <div className={cn("flex gap-4 mt-2", rtlClasses.flexDirection)}>
                    <label className={cn("flex items-center gap-2 cursor-pointer", rtlClasses.flexDirection)}>
                      <input
                        type="radio"
                        name="sportType"
                        value="TENNIS"
                        checked={(formData.sportType || 'TENNIS') === 'TENNIS'}
                        onChange={(e) => handleInputChange('sportType', e.target.value as SportType)}
                        className="text-primary"
                      />
                      <span className={cn("flex items-center gap-1", rtlClasses.flexDirection)}>
                        🎾 Tennis
                      </span>
                    </label>
                    <label className={cn("flex items-center gap-2 cursor-pointer", rtlClasses.flexDirection)}>
                      <input
                        type="radio"
                        name="sportType"
                        value="PADEL"
                        checked={(formData.sportType || 'TENNIS') === 'PADEL'}
                        onChange={(e) => handleInputChange('sportType', e.target.value as SportType)}
                        className="text-primary"
                      />
                      <span className={cn("flex items-center gap-1", rtlClasses.flexDirection)}>
                        🟩 Padel
                      </span>
                    </label>
                  </div>
                ) : (
                  <Badge variant="secondary" className="w-fit mt-2">
                    {(formData.sportType || 'TENNIS') === 'PADEL' ? '🟩 Padel' : '🎾 Tennis'}
                  </Badge>
                )}
              </div>

              <div>
                <Label htmlFor="type" className={rtlClasses.textAlign}>Court Surface *</Label>
                <Select 
                  value={(formData.sportType || 'TENNIS') === 'PADEL' ? 'PADEL' : (formData.type || '')} 
                  onValueChange={(value) => handleInputChange('type', value)}
                  disabled={(formData.sportType || 'TENNIS') === 'PADEL'}
                >
                  <SelectTrigger className={rtlClasses.textAlign}>
                    <SelectValue placeholder={
                      (formData.sportType || 'TENNIS') === 'PADEL' 
                        ? "PADEL (Auto-selected by backend)" 
                        : "Select court surface"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.sportType || 'TENNIS') === 'PADEL' ? (
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
                {(formData.sportType || 'TENNIS') === 'PADEL' && (
                  <p className={cn("text-sm text-muted-foreground mt-1", rtlClasses.textAlign)}>
                    Court type will be automatically set to PADEL by the backend
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="facility" className={rtlClasses.textAlign}>Facility *</Label>
                <Popover open={facilitySearchOpen} onOpenChange={setFacilitySearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={facilitySearchOpen}
                      className={cn("w-full justify-between", rtlClasses.textAlign)}
                      disabled={facilitiesLoading}
                    >
                      {facilitiesLoading ? "Loading facilities..." : 
                       formData.facilityId === 0 || !formData.facilityId
                        ? "Select facility"
                        : facilities.find(f => f.id === formData.facilityId)?.name || "Select facility"}
                      <ChevronsUpDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50", rtlClasses.textAlign === 'text-end' ? 'mr-2 ml-0' : '')} />
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
                                    formData.facilityId === facility.id ? "opacity-100" : "opacity-0",
                                    rtlClasses.textAlign === 'text-end' ? 'ml-2 mr-0' : ''
                                  )}
                                />
                                <div className={cn("flex flex-col", rtlClasses.textAlign)}>
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

              <div>
                <Label htmlFor="hourlyFee" className={rtlClasses.textAlign}>Hourly Fee (SAR) *</Label>
                <Input
                  id="hourlyFee"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.hourlyFee || ''}
                  onChange={(e) => handleInputChange('hourlyFee', Number(e.target.value))}
                  placeholder="120.00"
                  className={rtlClasses.textAlign}
                />
                <p className={cn("text-sm text-muted-foreground mt-1", rtlClasses.textAlign)}>Must be greater than 0</p>
              </div>

              <div className={cn("flex items-center space-x-2", rtlClasses.flexDirection, rtlClasses.textAlign)}>
                <Switch
                  id="hasSeedSystem"
                  checked={formData.hasSeedSystem || false}
                  onCheckedChange={(checked) => handleInputChange('hasSeedSystem', checked)}
                />
                <Label htmlFor="hasSeedSystem" className={rtlClasses.textAlign}>{t('forms.labels.hasSeedSystem')}</Label>
              </div>
            </div>

            <Separator />

            {/* Manager Selection - Only for SUPER_ADMIN */}
            {isSuperAdmin && (
              <div className="space-y-4">
                <h3 className={cn("text-lg font-semibold", rtlClasses.textAlign)}>Manager Assignment</h3>
                
                <div>
                  <Label htmlFor="managerId" className={rtlClasses.textAlign}>Court Manager</Label>
                  <Popover open={managerSearchOpen} onOpenChange={setManagerSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={managerSearchOpen}
                        className={cn("w-full justify-between", rtlClasses.textAlign)}
                        disabled={adminsLoading}
                      >
                        {adminsLoading ? "Loading admins..." : 
                         formData.managerId === '' || formData.managerId === 'none'
                          ? "No manager assigned"
                          : formData.managerId && formData.managerId !== 'none'
                          ? formData.managerId
                          : "Select manager"}
                          <div className={cn("flex items-center gap-1", rtlClasses.flexDirection)}>
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
                            <ChevronsUpDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50", rtlClasses.textAlign === 'text-end' ? 'mr-2 ml-0' : '')} />
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
                                  formData.managerId === 'none' ? "opacity-100" : "opacity-0",
                                  rtlClasses.textAlign === 'text-end' ? 'ml-2 mr-0' : ''
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
                                      formData.managerId === admin.name ? "opacity-100" : "opacity-0",
                                      rtlClasses.textAlign === 'text-end' ? 'ml-2 mr-0' : ''
                                    )}
                                  />
                                  <div className={cn("flex flex-col", rtlClasses.textAlign)}>
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
            )}
          </div>

          {/* Right Column - Image Upload & Facility Info */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className={cn("text-lg font-semibold", rtlClasses.textAlign)}>Court Image</h3>
              
              <div>
                <Label htmlFor="editImageFile" className={rtlClasses.textAlign}>Court Image</Label>
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
                        className={cn("absolute top-2", rtlClasses.textAlign === 'text-end' ? 'left-2' : 'right-2')}
                        onClick={removeImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className={cn("border-2 border-dashed border-gray-300 rounded-lg p-8 text-center", rtlClasses.textAlign)}>
                      <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">No image selected</p>
                    </div>
                  )}
                  <input
                    id="editImageFile"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className={cn(
                      "mt-2 block w-full text-sm text-gray-500",
                      "file:mr-4 file:py-2 file:px-4",
                      "file:rounded-md file:border-0",
                      "file:text-sm file:font-semibold",
                      "file:bg-blue-50 file:text-blue-700",
                      "hover:file:bg-blue-100",
                      rtlClasses.textAlign
                    )}
                  />
                  <p className={cn("text-sm text-muted-foreground mt-1", rtlClasses.textAlign)}>
                    JPG, PNG, or WebP. Max 10MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Facility Info Display */}
            {formData.facilityId && (
              <div className="space-y-4">
                <h3 className={cn("text-lg font-semibold", rtlClasses.textAlign)}>Selected Facility</h3>
                {(() => {
                  const selectedFacility = facilities.find(f => f.id === formData.facilityId);
                  return selectedFacility ? (
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className={cn("font-medium", rtlClasses.textAlign)}>{selectedFacility.name}</h4>
                      <p className={cn("text-sm text-muted-foreground flex items-center gap-1 mt-1", rtlClasses.flexDirection, rtlClasses.textAlign)}>
                        <span>📍</span>
                        {selectedFacility.location}
                      </p>
                      {selectedFacility.description && (
                        <p className={cn("text-sm text-muted-foreground mt-2", rtlClasses.textAlign)}>
                          {selectedFacility.description}
                        </p>
                      )}
                      {selectedFacility.amenities && selectedFacility.amenities.length > 0 && (
                        <div className="mt-2">
                          <p className={cn("text-xs font-medium text-muted-foreground mb-1", rtlClasses.textAlign)}>Facility Amenities:</p>
                          <div className={cn("flex flex-wrap gap-1", rtlClasses.flexDirection)}>
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

        {/* Submit Button */}
        <div className={cn("flex justify-end gap-4 pt-4", rtlClasses.flexDirection)}>
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