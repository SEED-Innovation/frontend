
import React, { useState } from 'react';
import { Search, MapPin, Star, Calendar, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';

const Courts = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const courts = [
    {
      id: 1,
      name: "Riverside Tennis Club",
      address: "123 River Road, Downtown",
      distance: "0.8 mi",
      rating: 4.8,
      pricePerHour: 45,
      images: ["https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&h=400&fit=crop"],
      amenities: ["AI Camera", "Showers", "Cafe", "Parking"],
      features: ["AI Processing", "Live Streaming", "Motion Analysis"],
      availability: ["2:00 PM", "4:00 PM", "6:00 PM"],
      type: "Premium"
    },
    {
      id: 2,
      name: "Downtown Sports Center",
      address: "456 Main Street, City Center",
      distance: "1.2 mi",
      rating: 4.6,
      pricePerHour: 35,
      images: ["https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop"],
      amenities: ["Wi-Fi", "Showers", "Equipment Rental"],
      features: ["AI Camera", "Performance Tracking"],
      availability: ["10:00 AM", "1:00 PM", "3:00 PM"],
      type: "Standard"
    },
    {
      id: 3,
      name: "Elite Tennis Academy",
      address: "789 Tennis Avenue, Uptown",
      distance: "2.1 mi",
      rating: 4.9,
      pricePerHour: 65,
      images: ["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop"],
      amenities: ["AI Camera", "Pro Shop", "Coaching", "Lounge"],
      features: ["Advanced AI", "3D Analysis", "Coaching AI"],
      availability: ["9:00 AM", "11:00 AM", "2:00 PM"],
      type: "Elite"
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Elite':
        return 'bg-tennis-purple-100 text-tennis-purple-700';
      case 'Premium':
        return 'bg-tennis-green-100 text-tennis-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Tennis Courts</h1>
            <p className="text-gray-600">Discover AI-enabled courts with advanced tracking technology</p>
          </div>

          {/* Search and Filters */}
          <Card className="court-card mb-8 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search courts by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl border-gray-200"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-tennis-purple-200 text-tennis-purple-700">
                    Distance
                  </Button>
                  <Button variant="outline" className="border-tennis-purple-200 text-tennis-purple-700">
                    Price
                  </Button>
                  <Button variant="outline" className="border-tennis-purple-200 text-tennis-purple-700">
                    Features
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {courts.map((court, index) => (
              <Card key={court.id} className="court-card animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="relative">
                  <img
                    src={court.images[0]}
                    alt={court.name}
                    className="w-full h-48 object-cover rounded-t-2xl"
                  />
                  <Badge className={`absolute top-4 left-4 ${getTypeColor(court.type)}`}>
                    {court.type}
                  </Badge>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-medium">{court.rating}</span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{court.name}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {court.address}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{court.distance} away</span>
                      <span className="text-lg font-bold text-tennis-purple-700">
                        ${court.pricePerHour}/hour
                      </span>
                    </div>
                  </div>

                  {/* AI Features */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <Eye className="w-4 h-4 mr-1 text-tennis-purple-600" />
                      AI Features
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {court.features.map((feature, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-1">
                      {court.amenities.map((amenity, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Available Times */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Available Today
                    </h4>
                    <div className="flex gap-2">
                      {court.availability.map((time, i) => (
                        <Badge key={i} className="bg-tennis-green-100 text-tennis-green-700 hover:bg-tennis-green-200 cursor-pointer">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-tennis-purple-200 text-tennis-purple-700">
                      View Details
                    </Button>
                    <Button className="flex-1 tennis-button">
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-tennis-purple-200 text-tennis-purple-700">
              Load More Courts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courts;
