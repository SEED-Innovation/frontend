
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Trophy, User, MapPin, Video, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';

const Dashboard = () => {
  const upcomingSessions = [
    {
      id: 1,
      court: "Riverside Tennis Club",
      date: "Today",
      time: "2:00 PM - 4:00 PM",
      type: "Practice Session",
      status: "confirmed"
    },
    {
      id: 2,
      court: "Downtown Sports Center",
      date: "Tomorrow",
      time: "10:00 AM - 12:00 PM",
      type: "Match",
      status: "confirmed"
    }
  ];

  const recentMatches = [
    {
      id: 1,
      opponent: "Sarah M.",
      score: "6-4, 6-2",
      date: "2 days ago",
      result: "win",
      duration: "1h 45m",
      thumbnail: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      opponent: "Alex R.",
      score: "4-6, 6-3, 6-4",
      date: "1 week ago",
      result: "win",
      duration: "2h 15m",
      thumbnail: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop"
    }
  ];

  const stats = [
    { label: "Matches Played", value: "24", icon: Trophy },
    { label: "Win Rate", value: "78%", icon: Calendar },
    { label: "Hours Played", value: "156", icon: Clock },
    { label: "Rank", value: "#45", icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, AMMAR!
            </h1>
            <p className="text-gray-600">Ready for your next tennis session?</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="premium-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className="tennis-gradient p-3 rounded-xl">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Sessions */}
            <Card className="premium-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Upcoming Sessions</CardTitle>
                <Link to="/courts">
                  <Button variant="outline" size="sm" className="btn-outline">
                    Book New
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{session.court}</h3>
                      <span className="text-xs bg-tennis-green-100 text-tennis-green-700 px-2 py-1 rounded-full">
                        {session.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {session.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {session.time}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-medium text-tennis-purple-600">{session.type}</span>
                      <Link to="/checkin">
                        <Button size="sm" className="tennis-button glow-button">
                          Check In
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card className="premium-card animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Recent Matches</CardTitle>
                <Link to="/recordings">
                  <Button variant="outline" size="sm" className="btn-outline">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentMatches.map((match) => (
                  <Link key={match.id} to="/recordings">
                    <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden">
                          <img 
                            src={match.thumbnail} 
                            alt="Match thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900">vs {match.opponent}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              match.result === 'win' 
                                ? 'bg-tennis-green-100 text-tennis-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {match.result.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 space-x-3">
                            <span className="font-medium">{match.score}</span>
                            <span>{match.duration}</span>
                            <span>{match.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link to="/courts">
              <Card className="premium-card cursor-pointer animate-fade-in interactive-hover" style={{ animationDelay: '0.8s' }}>
                <CardContent className="p-6 text-center">
                  <div className="tennis-gradient p-4 rounded-xl inline-flex mb-4">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Courts</h3>
                  <p className="text-gray-600">Discover AI-enabled courts near you</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/leaderboard">
              <Card className="premium-card cursor-pointer animate-fade-in interactive-hover" style={{ animationDelay: '1s' }}>
                <CardContent className="p-6 text-center">
                  <div className="tennis-gradient p-4 rounded-xl inline-flex mb-4">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Leaderboard</h3>
                  <p className="text-gray-600">See how you rank against others</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/recordings">
              <Card className="premium-card cursor-pointer animate-fade-in interactive-hover" style={{ animationDelay: '1.2s' }}>
                <CardContent className="p-6 text-center">
                  <div className="tennis-gradient p-4 rounded-xl inline-flex mb-4">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Recordings</h3>
                  <p className="text-gray-600">Watch and analyze your matches</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/challenges">
              <Card className="premium-card cursor-pointer animate-fade-in interactive-hover" style={{ animationDelay: '1.4s' }}>
                <CardContent className="p-6 text-center">
                  <div className="tennis-gradient p-4 rounded-xl inline-flex mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Challenges</h3>
                  <p className="text-gray-600">Join challenges and earn badges</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
