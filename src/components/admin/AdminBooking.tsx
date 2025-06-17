
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Phone, Mail, CreditCard, MapPin, Star } from 'lucide-react';
import { toast } from 'sonner';

const AdminBooking = () => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Mock courts data
  const courts = [
    {
      id: 1,
      name: "Elite Tennis Academy",
      address: "123 Champion Drive, Tennis District",
      pricePerHour: 65,
      rating: 4.9,
      availableSlots: ["09:00", "10:00", "11:00", "14:00", "16:00", "18:00"]
    },
    {
      id: 2,
      name: "Riverside Tennis Club",
      address: "456 River Road, Downtown",
      pricePerHour: 45,
      rating: 4.7,
      availableSlots: ["10:00", "12:00", "15:00", "17:00", "19:00"]
    }
  ];

  const handleSlotSelect = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleBooking = () => {
    if (!customerInfo.name || !customerInfo.phone || !selectedCourt || selectedSlots.length === 0) {
      toast.error('Please fill all required fields and select time slots');
      return;
    }

    const totalPrice = selectedSlots.length * selectedCourt.pricePerHour;
    
    toast.success(`Booking confirmed for ${customerInfo.name} - Total: $${totalPrice}`);
    
    // Reset form
    setCustomerInfo({ name: '', email: '', phone: '' });
    setSelectedSlots([]);
    setSelectedCourt(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Admin Booking System</h2>
        <Badge className="bg-blue-100 text-blue-800">Point of Sale</Badge>
      </div>

      <Tabs defaultValue="new-booking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new-booking">New Booking</TabsTrigger>
          <TabsTrigger value="walk-in">Walk-in</TabsTrigger>
          <TabsTrigger value="group-booking">Group Booking</TabsTrigger>
        </TabsList>

        <TabsContent value="new-booking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-tennis-purple-600" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <Input
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <Input
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <Input
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="flex space-x-2">
                    <Button
                      variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentMethod('cash')}
                      className="flex-1"
                    >
                      Cash
                    </Button>
                    <Button
                      variant={paymentMethod === 'card' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentMethod('card')}
                      className="flex-1"
                    >
                      <CreditCard className="w-4 h-4 mr-1" />
                      Card
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Court Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-tennis-green-600" />
                  Court Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courts.map((court) => (
                  <div
                    key={court.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCourt?.id === court.id
                        ? 'border-tennis-purple-500 bg-tennis-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCourt(court)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{court.name}</h3>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium">{court.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{court.address}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-tennis-purple-700">
                        ${court.pricePerHour}/hr
                      </span>
                      <Badge variant="outline">
                        {court.availableSlots.length} slots available
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Time Slots */}
          {selectedCourt && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Available Time Slots - {selectedCourt.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                  {selectedCourt.availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => handleSlotSelect(slot)}
                      className={`p-3 rounded-lg border-2 font-medium transition-all ${
                        selectedSlots.includes(slot)
                          ? 'border-tennis-green-500 bg-tennis-green-50 text-tennis-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                {selectedSlots.length > 0 && (
                  <div className="bg-tennis-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-tennis-green-700 mb-2">Booking Summary:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Selected Slots:</span>
                        <span>{selectedSlots.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{selectedSlots.length} hour{selectedSlots.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total Price:</span>
                        <span>${selectedSlots.length * selectedCourt.pricePerHour}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleBooking}
                  disabled={!customerInfo.name || !customerInfo.phone || selectedSlots.length === 0}
                  className="w-full mt-4 bg-tennis-green-600 hover:bg-tennis-green-700 text-lg py-3"
                >
                  Confirm Booking
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="walk-in">
          <Card>
            <CardHeader>
              <CardTitle>Walk-in Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Quick registration for walk-in customers
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="group-booking">
          <Card>
            <CardHeader>
              <CardTitle>Group Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Manage group bookings and tournaments
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBooking;
