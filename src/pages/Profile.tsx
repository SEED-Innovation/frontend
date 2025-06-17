
import React, { useState } from 'react';
import { Edit, Settings, Trophy, Calendar, Clock, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/Navigation';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const userProfile = {
    name: "John Doe",
    username: "@johndoe",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
    rank: 7,
    points: 1850,
    joinDate: "March 2024",
    level: "Advanced",
    location: "San Francisco, CA"
  };

  const stats = [
    { label: "Matches Played", value: "24", icon: Calendar, change: "+3 this week" },
    { label: "Win Rate", value: "70%", icon: Trophy, change: "+5% this month" },
    { label: "Hours Played", value: "156", icon: Clock, change: "+12 this week" },
    { label: "Current Rank", value: "#7", icon: Star, change: "+1 position" }
  ];

  const recentMatches = [
    {
      id: 1,
      opponent: "Sarah M.",
      result: "win",
      score: "6-4, 6-2",
      date: "2 days ago",
      court: "Riverside Tennis Club"
    },
    {
      id: 2,
      opponent: "Alex R.",
      result: "win",
      score: "4-6, 6-3, 6-4",
      date: "1 week ago",
      court: "Downtown Sports Center"
    },
    {
      id: 3,
      opponent: "Mike L.",
      result: "loss",
      score: "3-6, 4-6",
      date: "2 weeks ago",
      court: "Elite Tennis Academy"
    }
  ];

  const achievements = [
    { name: "First Win", description: "Won your first match", earned: true, date: "March 2024" },
    { name: "Winning Streak", description: "Win 5 matches in a row", earned: true, date: "July 2024" },
    { name: "Marathon Player", description: "Play 100+ hours", earned: true, date: "November 2024" },
    { name: "Top 10", description: "Reach top 10 ranking", earned: false, progress: 70 },
    { name: "Consistency King", description: "Play 30 days in a row", earned: false, progress: 23 },
    { name: "Perfect Game", description: "Win a match 6-0, 6-0", earned: false, progress: 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <Card className="court-card mb-8 animate-fade-in">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="relative">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="w-32 h-32 rounded-full border-4 border-tennis-purple-200"
                  />
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 tennis-button"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{userProfile.name}</h1>
                  <p className="text-gray-600 mb-4">{userProfile.username}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-tennis-purple-700">#{userProfile.rank}</div>
                      <div className="text-sm text-gray-600">Rank</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-tennis-purple-700">{userProfile.points}</div>
                      <div className="text-sm text-gray-600">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-tennis-purple-700">{userProfile.level}</div>
                      <div className="text-sm text-gray-600">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-tennis-purple-700">{userProfile.joinDate}</div>
                      <div className="text-sm text-gray-600">Joined</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="tennis-button">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="border-tennis-purple-200 text-tennis-purple-700">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <Card key={index} className="court-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="tennis-gradient p-3 rounded-xl">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{stat.label}</h3>
                        <p className="text-sm text-tennis-green-600 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {stat.change}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Performance Chart Placeholder */}
              <Card className="court-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle>Performance Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                      <p>Performance chart coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <Card className="court-card animate-fade-in">
                <CardHeader>
                  <CardTitle>Recent Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentMatches.map((match) => (
                      <div key={match.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                              match.result === 'win' ? 'bg-tennis-green-500' : 'bg-red-500'
                            }`}>
                              {match.result === 'win' ? 'W' : 'L'}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">vs {match.opponent}</h4>
                              <p className="text-sm text-gray-600">{match.court}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{match.score}</div>
                            <div className="text-sm text-gray-600">{match.date}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-6">
                    <Button variant="outline" className="border-tennis-purple-200 text-tennis-purple-700">
                      View All Matches
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((achievement, index) => (
                  <Card key={index} className={`court-card animate-fade-in ${
                    achievement.earned ? 'border-tennis-green-200 bg-tennis-green-50' : ''
                  }`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-1 ${
                            achievement.earned ? 'text-tennis-green-700' : 'text-gray-900'
                          }`}>
                            {achievement.name}
                          </h3>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          achievement.earned 
                            ? 'bg-tennis-green-500 text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          <Trophy className="w-6 h-6" />
                        </div>
                      </div>
                      
                      {achievement.earned ? (
                        <Badge className="bg-tennis-green-100 text-tennis-green-700">
                          Earned {achievement.date}
                        </Badge>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
