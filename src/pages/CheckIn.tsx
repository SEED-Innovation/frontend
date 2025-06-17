
import React, { useState } from 'react';
import { Clock, MapPin, Calendar, Play, Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';

const CheckIn = () => {
  const [checkedIn, setCheckedIn] = useState(false);

  const upcomingBookings = [
    {
      id: 1,
      court: "Riverside Tennis Club",
      address: "123 River Road, Downtown",
      date: "Today",
      time: "2:00 PM - 4:00 PM",
      duration: "2 hours",
      features: ["AI Camera", "Live Streaming", "Motion Analysis"],
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&h=300&fit=crop"
    },
    {
      id: 2,
      court: "Elite Tennis Academy",
      address: "789 Tennis Avenue, Uptown",
      date: "Tomorrow",
      time: "10:00 AM - 12:00 PM",
      duration: "2 hours",
      features: ["Advanced AI", "3D Analysis", "Coaching AI"],
      status: "confirmed",
      image: "https://plus.unsplash.com/premium_photo-1707486516761-0e2516920755?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
  ];

  const handleCheckIn = () => {
    setCheckedIn(true);
  };

  if (checkedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Check-in Success */}
            <div className="text-center mb-8 animate-scale-in">
              <div className="w-24 h-24 tennis-gradient rounded-full flex items-center justify-center mx-auto mb-6 animate-glow">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">You're Checked In!</h1>
              <p className="text-xl text-gray-600">Ready to start your tennis session</p>
            </div>

            {/* Session Info */}
            <Card className="court-card mb-8">
              <CardContent className="p-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Riverside Tennis Club</h2>
                  <div className="flex items-center justify-center text-gray-600 space-x-6 mb-8">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Today, 2:00 PM - 4:00 PM
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Court 3
                    </div>
                  </div>
                  
                  <Button size="lg" className="tennis-button px-12 py-4 text-xl">
                    <Play className="w-6 h-6 mr-3" />
                    Start Session
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Features Status */}
            <Card className="court-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-tennis-purple-600" />
                  AI Features Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-tennis-green-50 rounded-xl">
                    <div className="w-3 h-3 bg-tennis-green-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-tennis-green-700">Camera Active</p>
                  </div>
                  <div className="text-center p-4 bg-tennis-green-50 rounded-xl">
                    <div className="w-3 h-3 bg-tennis-green-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-tennis-green-700">AI Processing</p>
                  </div>
                  <div className="text-center p-4 bg-tennis-green-50 rounded-xl">
                    <div className="w-3 h-3 bg-tennis-green-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-tennis-green-700">Recording Ready</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Check-In</h1>
            <p className="text-gray-600">Confirm your presence and start your tennis session</p>
          </div>

          {/* Upcoming Bookings */}
          <div className="space-y-6">
            {upcomingBookings.map((booking, index) => (
              <Card key={booking.id} className="court-card card-with-buttons animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="md:flex">
                  {/* Court Image */}
                  <div className="md:w-1/3">
                    <img
                      src={booking.image}
                      alt={booking.court}
                      className="w-full h-48 md:h-full object-cover rounded-l-2xl"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="md:w-2/3 p-6 card-content">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.court}</h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.address}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {booking.date}, {booking.time}
                        </div>
                      </div>
                      <Badge className={
                        booking.status === 'upcoming' 
                          ? 'bg-tennis-green-100 text-tennis-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }>
                        {booking.status === 'upcoming' ? 'Today' : 'Tomorrow'}
                      </Badge>
                    </div>

                    {/* AI Features */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                        <Eye className="w-4 h-4 mr-1 text-tennis-purple-600" />
                        AI Features Available
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {booking.features.map((feature, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {booking.status === 'upcoming' ? (
                        <>
                          <Button 
                            onClick={handleCheckIn} 
                            className="tennis-button flex-1 clickable-element"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Check In Now
                          </Button>
                          <Button 
                            variant="outline" 
                            className="border-tennis-purple-200 text-tennis-purple-700 clickable-element"
                          >
                            View Details
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            className="flex-1 border-gray-300 text-gray-700 clickable-element" 
                            disabled
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Not Yet Available
                          </Button>
                          <Button 
                            variant="outline" 
                            className="border-tennis-purple-200 text-tennis-purple-700 clickable-element"
                          >
                            View Details
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* No Bookings State */}
          {upcomingBookings.length === 0 && (
            <Card className="court-card text-center p-12">
              <div className="max-w-md mx-auto">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Bookings</h3>
                <p className="text-gray-600 mb-6">You don't have any upcoming tennis sessions. Book a court to get started!</p>
                <Button className="tennis-button clickable-element">
                  Book a Court
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
