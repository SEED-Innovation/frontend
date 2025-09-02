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
import { MapPin, Image, Trash2, Plus } from 'lucide-react';
import { CreateCourtRequest } from '@/lib/api/services/courtService';
import { toast } from '@/hooks/use-toast';

interface EnhancedCourtFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (courtData: CreateCourtRequest) => void;
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

export default function EnhancedCourtForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  admins, 
  adminsLoading 
}: EnhancedCourtFormProps) {
  const [formData, setFormData] = useState<CreateCourtRequest & { managerId?: string }>({
    name: '',
    type: '',
    location: '',
    hourlyFee: 0,
    hasSeedSystem: false,
    amenities: [],
    imageUrl: '',
    description: '',
    latitude: undefined,
    longitude: undefined,
    managerId: ''
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [locationEditable, setLocationEditable] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
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

  const handleLocationSearch = async (address: string) => {
    // Simple geocoding simulation - in production use Google Places API
    if (address.toLowerCase().includes('jeddah')) {
      setFormData(prev => ({
        ...prev,
        latitude: 21.485800,
        longitude: 39.192500
      }));
    } else if (address.toLowerCase().includes('riyadh')) {
      setFormData(prev => ({
        ...prev,
        latitude: 24.7136,
        longitude: 46.6753
      }));
    }
  };

  const isFormValid = () => {
    return !!(
      formData.name.trim() &&
      formData.type &&
      formData.location.trim() &&
      formData.hourlyFee >= 0
    );
  };

  const handleSubmit = () => {
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
      location: formData.location,
      type: formData.type,
      hourlyFee: formData.hourlyFee,
      hasSeedSystem: formData.hasSeedSystem,
      amenities: formData.amenities,
      imageUrl: formData.imageUrl || undefined,
      description: formData.description || undefined,
      latitude: formData.latitude,
      longitude: formData.longitude,
      manager_id: formData.managerId && formData.managerId !== 'none' 
        ? { id: parseInt(formData.managerId) } 
        : undefined
    };

    onSubmit(submitData);
    
    // Reset form
    setFormData({
      name: '',
      type: '',
      location: '',
      hourlyFee: 0,
      hasSeedSystem: false,
      amenities: [],
      imageUrl: '',
      description: '',
      latitude: undefined,
      longitude: undefined,
      managerId: ''
    });
    setImagePreview(null);
    setSelectedImageFile(null);
    // Reset file input
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  useEffect(() => {
    if (formData.location) {
      const timeoutId = setTimeout(() => handleLocationSearch(formData.location), 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.location]);

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
                <Label htmlFor="name">Court Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Court 1 – Center"
                />
              </div>

              <div>
                <Label htmlFor="type">Court Type *</Label>
                <Select onValueChange={(value) => handleInputChange('type', value)}>
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
                  min="0"
                  step="0.01"
                  value={formData.hourlyFee}
                  onChange={(e) => handleInputChange('hourlyFee', Number(e.target.value))}
                  placeholder="120.00"
                />
                <p className="text-sm text-muted-foreground mt-1">Per hour (SAR)</p>
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
                <Select 
                  onValueChange={(value) => handleInputChange('managerId', value)}
                  disabled={adminsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={adminsLoading ? "Loading admins..." : "Select manager"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No manager assigned</SelectItem>
                    {admins.map((admin, index) => (
                      <SelectItem key={admin} value={index.toString()}>
                        {admin}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="King Abdulaziz Rd, Jeddah, SA"
                />
                <p className="text-sm text-muted-foreground mt-1">Search address or drop the pin</p>
              </div>

              {/* Map placeholder */}
              <div className="bg-muted rounded-lg p-8 text-center">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Interactive map will be here</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Lat: {formData.latitude?.toFixed(6) || 'N/A'}, 
                  Lng: {formData.longitude?.toFixed(6) || 'N/A'}
                </p>
              </div>

              {/* Manual Coordinates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    value={formData.latitude || ''}
                    onChange={(e) => handleInputChange('latitude', Number(e.target.value))}
                    disabled={!locationEditable}
                    placeholder="21.485800"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    value={formData.longitude || ''}
                    onChange={(e) => handleInputChange('longitude', Number(e.target.value))}
                    disabled={!locationEditable}
                    placeholder="39.192500"
                  />
                </div>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => setLocationEditable(!locationEditable)}
                className="px-0"
              >
                {locationEditable ? 'Lock coordinates' : 'Edit manually'}
              </Button>
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
                      variant={formData.amenities.includes(amenity) ? "default" : "outline"}
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
                  value={formData.description}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      handleInputChange('description', e.target.value);
                    }
                  }}
                  placeholder="Shaded seating; wind from west in afternoons."
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.description?.length || 0}/500
                </p>
              </div>

              {/* Image Upload */}
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
                      className="w-full h-32 object-cover rounded-lg border"
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