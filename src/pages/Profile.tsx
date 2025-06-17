
import React, { useState } from 'react';
import { Settings, Trophy, Star, Target, Award, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('stats');

  const userStats = {
    name: 'John Doe',
    rank: 45,
    monthlyRank: 12,
    points: 2450,
    plan: 'Premium',
    totalShots: 1247,
    gamesPlayed: 28,
    accuracyRate: 78,
    winsCount: 18
  };

  const badges = [
    { id: 1, name: 'First Win', icon: '🏆', earned: true, description: 'Win your first match' },
    { id: 2, name: 'Ace Master', icon: '⚡', earned: true, description: 'Hit 10 aces in a match' },
    { id: 3, name: 'Consistent Player', icon: '🎯', earned: true, description: 'Play 5 matches in a row' },
    { id: 4, name: 'Speed Demon', icon: '💨', earned: false, description: 'Serve at 120+ mph' },
    { id: 5, name: 'Marathon Player', icon: '⏱️', earned: false, description: 'Play a 3+ hour match' },
    { id: 6, name: 'Perfect Game', icon: '💎', earned: false, description: 'Win without losing a game' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <Card className="premium-card mb-8 animate-fade-in">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 bg-tennis-gradient rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                    {userStats.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-tennis-green-500 rounded-full flex items-center justify-center">
                    <Edit className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{userStats.name}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                    <Badge className="bg-tennis-purple-100 text-tennis-purple-700 px-3 py-1">
                      {userStats.plan} Member
                    </Badge>
                    <div className="flex items-center text-gray-600">
                      <Trophy className="w-4 h-4 mr-1" />
                      Rank #{userStats.rank}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Star className="w-4 h-4 mr-1" />
                      {userStats.points} Points
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-tennis-purple-700">{userStats.accuracyRate}%</div>
                      <div className="text-xs text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-tennis-green-700">{userStats.winsCount}</div>
                      <div className="text-xs text-gray-600">Wins</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-700">{userStats.gamesPlayed}</div>
                      <div className="text-xs text-gray-600">Games</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-yellow-700">#{userStats.monthlyRank}</div>
                      <div className="text-xs text-gray-600">Monthly</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-3">
                  <Link to="/subscription">
                    <Button className="tennis-button">
                      Manage Plan
                    </Button>
                  </Link>
                  <Button variant="outline" className="btn-outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-6">
              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="premium-card animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-tennis-purple-600" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Shots</span>
                      <span className="font-bold text-lg">{userStats.totalShots}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Accuracy Rate</span>
                      <span className="font-bold text-lg text-tennis-green-600">{userStats.accuracyRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Win Rate</span>
                      <span className="font-bold text-lg text-tennis-purple-600">
                        {Math.round((userStats.winsCount / userStats.gamesPlayed) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Session</span>
                      <span className="font-bold text-lg">1h 32m</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="premium-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="w-5 h-5 mr-2 text-tennis-purple-600" />
                      Rankings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Global Rank</span>
                      <span className="font-bold text-lg">#{userStats.rank}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Monthly Rank</span>
                      <span className="font-bold text-lg text-tennis-green-600">#{userStats.monthlyRank}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Points</span>
                      <span className="font-bold text-lg text-tennis-purple-600">{userStats.points}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">League</span>
                      <span className="font-bold text-lg">Advanced</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="badges" className="space-y-6">
              {/* Badges Collection */}
              <Card className="premium-card animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-tennis-purple-600" />
                    Badge Collection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {badges.map((badge, index) => (
                      <div
                        key={badge.id}
                        className={`text-center p-6 rounded-xl transition-all duration-300 hover:scale-105 animate-fade-in ${
                          badge.earned
                            ? 'bg-tennis-green-50 border border-tennis-green-200'
                            : 'bg-gray-50 border border-gray-200 opacity-60'
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="text-4xl mb-3">{badge.icon}</div>
                        <h3 className={`font-semibold mb-2 ${
                          badge.earned ? 'text-tennis-green-700' : 'text-gray-500'
                        }`}>
                          {badge.name}
                        </h3>
                        <p className="text-sm text-gray-600">{badge.description}</p>
                        {badge.earned && (
                          <Badge className="mt-3 bg-tennis-green-100 text-tennis-green-700">
                            Earned
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
