import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Settings, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Court {
  id: string;
  name: string;
  type: string;
  location: string;
  hourlyFee: number;
  hasSeedSystem: boolean;
  amenities: string[];
  status: 'active' | 'maintenance' | 'offline';
}

const CourtManagement = () => {
  const [courts, setCourts] = useState<Court[]>([
    {
      id: '1',
      name: 'Court 1 - Center',
      type: 'Hard Court',
      location: 'Main Building',
      hourlyFee: 120,
      hasSeedSystem: true,
      amenities: ['Lighting', 'Sound System', 'Camera'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Court 2 - East',
      type: 'Clay Court',
      location: 'East Wing',
      hourlyFee: 100,
      hasSeedSystem: false,
      amenities: ['Lighting'],
      status: 'active'
    }
  ]);

  const [newCourt, setNewCourt] = useState({
    name: '',
    type: '',
    location: '',
    hourlyFee: 0,
    hasSeedSystem: false,
    amenities: [] as string[]
  });

  const [availabilityData, setAvailabilityData] = useState({
    courtId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: ''
  });

  const handleCreateCourt = () => {
    if (!newCourt.name || !newCourt.type || !newCourt.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const court: Court = {
      id: Date.now().toString(),
      ...newCourt,
      status: 'active'
    };

    setCourts([...courts, court]);
    setNewCourt({
      name: '',
      type: '',
      location: '',
      hourlyFee: 0,
      hasSeedSystem: false,
      amenities: []
    });
    toast.success('Court created successfully');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <p className="text-gray-600 mt-1">Manage courts, availability, and pricing</p>
        </div>
        <Dialog>
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
      </div>

      <Tabs defaultValue="courts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courts">Courts</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="courts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {courts.map((court) => (
              <Card key={court.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-lg">{court.name}</CardTitle>
                  <Badge className={getStatusColor(court.status)}>
                    {court.status}
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
                    <Button variant="outline" size="sm" className="flex-1">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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