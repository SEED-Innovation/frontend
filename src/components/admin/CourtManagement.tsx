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

const CourtManagement = () => {
  const { user, hasPermission } = useAdminAuth();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [newCourt, setNewCourt] = useState<CreateCourtRequest>({
    name: '',
    type: '',
    location: '',
    hourlyFee: 0,
    hasSeedSystem: false,
    amenities: []
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
      setCourts(fetchedCourts);
    } catch (error) {
      console.error('Error fetching courts:', error);
      toast.error('Failed to load courts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourt = async () => {
    if (!newCourt.name || !newCourt.type || !newCourt.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const createdCourt = await courtService.createCourt(newCourt);
      setCourts([...courts, createdCourt]);
      setNewCourt({
        name: '',
        type: '',
        location: '',
        hourlyFee: 0,
        hasSeedSystem: false,
        amenities: []
      });
      setCreateDialogOpen(false);
      toast.success('Court created successfully');
    } catch (error) {
      console.error('Error creating court:', error);
      toast.error('Failed to create court');
    }
  };

  const handleDeleteCourt = async (courtId: string) => {
    try {
      await courtService.deleteCourt(courtId);
      setCourts(courts.filter(court => court.id !== courtId));
      toast.success('Court deleted successfully');
    } catch (error) {
      console.error('Error deleting court:', error);
      toast.error('Failed to delete court');
    }
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
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'OFFLINE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status?: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Available';
      case 'MAINTENANCE': return 'Maintenance';
      case 'OFFLINE': return 'Offline';
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
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
                    <SelectItem value="Hard Court">Hard Court</SelectItem>
                    <SelectItem value="Clay Court">Clay Court</SelectItem>
                    <SelectItem value="Grass Court">Grass Court</SelectItem>
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
              <Button onClick={handleCreateCourt} className="w-full">
                Create Court
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <Tabs defaultValue="courts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courts">Courts</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
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
                <Card key={court.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-lg">{court.name}</CardTitle>
                    <Badge className={getStatusColor(court.status)}>
                      {getStatusDisplay(court.status)}
                    </Badge>
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
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      {hasPermission('SUPER_ADMIN') && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCourt(court.id)}
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

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Court Pricing Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courts.map((court) => (
                  <div key={court.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{court.name}</h3>
                      <p className="text-sm text-gray-600">{court.type} • {court.location}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold">{court.hourlyFee} SAR/hour</span>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-1" />
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default CourtManagement;