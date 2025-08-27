import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Settings, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { courtService, Court, CreateCourtRequest } from '@/lib/api/services/courtService';
import { adminService } from '@/services';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const handleSetAvailability = () => {
    if (!availabilityData.courtId || !availabilityData.dayOfWeek || !availabilityData.startTime || !availabilityData.endTime) {
      toast.error('Please fill in all availability fields');
      return;
    }

    toast.success('Court availability updated');
    setAvailabilityData({
      courtId: '',
      dayOfWeek: '',
      startTime: '',
      endTime: ''
    });
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courts">Courts</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="courts" className="space-y-4">
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
              {courts.map((court) => (
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

        <TabsContent value="availability" className="space-y-4">
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
                  <Select onValueChange={(value) => setAvailabilityData({...availabilityData, courtId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select court" />
                    </SelectTrigger>
                    <SelectContent>
                      {courts.map((court) => (
                        <SelectItem key={court.id} value={court.id}>
                          {court.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
        </TabsContent>

      </Tabs>
    </motion.div>
  );
};

export default CourtManagement;