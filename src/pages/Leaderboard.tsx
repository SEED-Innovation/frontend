
import React, { useState } from 'react';
import { Trophy, Medal, Crown, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { useTranslation } from 'react-i18next';

const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const { t } = useTranslation('web');

  const topPlayers = [
    {
      rank: 1,
      name: "Alex Rodriguez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      points: 2450,
      winRate: 89,
      matchesPlayed: 34,
      streak: 8
    },
    {
      rank: 2,
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=64&h=64&fit=crop&crop=face",
      points: 2380,
      winRate: 85,
      matchesPlayed: 41,
      streak: 5
    },
    {
      rank: 3,
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
      points: 2210,
      winRate: 82,
      matchesPlayed: 29,
      streak: 3
    }
  ];

  const otherPlayers = [
    {
      rank: 4,
      name: "Emily Davis",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      points: 2150,
      winRate: 78,
      matchesPlayed: 38,
      change: 2
    },
    {
      rank: 5,
      name: "James Wilson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face",
      points: 2080,
      winRate: 76,
      matchesPlayed: 32,
      change: -1
    },
    {
      rank: 6,
      name: "Lisa Thompson",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=64&h=64&fit=crop&crop=face",
      points: 1920,
      winRate: 74,
      matchesPlayed: 25,
      change: 3
    },
    {
      rank: 7,
      name: "You",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=face",
      points: 1850,
      winRate: 70,
      matchesPlayed: 24,
      change: 1,
      isCurrentUser: true
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return null;
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1:
        return 'h-32';
      case 2:
        return 'h-24';
      case 3:
        return 'h-20';
      default:
        return 'h-16';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('leaderboard.title')}</h1>
            <p className="text-xl text-gray-600">{t('leaderboard.subtitle')}</p>
          </div>

          {/* Time Filter */}
          <div className="flex justify-center mb-8">
            <Tabs value={timeframe} onValueChange={setTimeframe} className="w-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">{t('leaderboard.thisMonth')}</TabsTrigger>
                <TabsTrigger value="alltime">{t('leaderboard.allTime')}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Podium */}
          <Card className="court-card mb-8 animate-fade-in">
            <CardContent className="p-8">
              <div className="flex items-end justify-center space-x-8">
                {/* Second Place */}
                <div className="text-center">
                  <div className="relative mb-4">
                    <img
                      src={topPlayers[1].avatar}
                      alt={topPlayers[1].name}
                      className="w-20 h-20 rounded-full mx-auto border-4 border-gray-300"
                    />
                    <div className="absolute -top-2 -right-2 bg-gray-300 rounded-full p-2">
                      {getRankIcon(2)}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900">{topPlayers[1].name}</h3>
                  <p className="text-gray-600">{topPlayers[1].points} {t('leaderboard.points')}</p>
                  <div className={`${getPodiumHeight(2)} bg-gray-300 rounded-t-lg mt-4 flex items-end justify-center pb-2`}>
                    <span className="text-white font-bold text-2xl">2</span>
                  </div>
                </div>

                {/* First Place */}
                <div className="text-center">
                  <div className="relative mb-4">
                    <img
                      src={topPlayers[0].avatar}
                      alt={topPlayers[0].name}
                      className="w-24 h-24 rounded-full mx-auto border-4 border-yellow-400 animate-glow"
                    />
                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                      {getRankIcon(1)}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{topPlayers[0].name}</h3>
                  <p className="text-gray-600 font-semibold">{topPlayers[0].points} {t('leaderboard.points')}</p>
                  <div className={`${getPodiumHeight(1)} tennis-gradient rounded-t-lg mt-4 flex items-end justify-center pb-2`}>
                    <span className="text-white font-bold text-3xl">1</span>
                  </div>
                </div>

                {/* Third Place */}
                <div className="text-center">
                  <div className="relative mb-4">
                    <img
                      src={topPlayers[2].avatar}
                      alt={topPlayers[2].name}
                      className="w-20 h-20 rounded-full mx-auto border-4 border-orange-400"
                    />
                    <div className="absolute -top-2 -right-2 bg-orange-400 rounded-full p-2">
                      {getRankIcon(3)}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900">{topPlayers[2].name}</h3>
                  <p className="text-gray-600">{topPlayers[2].points} {t('leaderboard.points')}</p>
                  <div className={`${getPodiumHeight(3)} bg-orange-400 rounded-t-lg mt-4 flex items-end justify-center pb-2`}>
                    <span className="text-white font-bold text-2xl">3</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top 3 Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {topPlayers.map((player, index) => (
              <Card key={player.rank} className="court-card animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{player.name}</h4>
                        <p className="text-sm text-gray-600">#{player.rank}</p>
                      </div>
                    </div>
                    {getRankIcon(player.rank)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('leaderboard.winRate')}</span>
                      <span className="font-semibold">{player.winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('leaderboard.matches')}</span>
                      <span className="font-semibold">{player.matchesPlayed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('leaderboard.winStreak')}</span>
                      <Badge className="bg-tennis-green-100 text-tennis-green-700">
                        {player.streak} {t('leaderboard.wins')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full Rankings */}
          <Card className="court-card animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-tennis-purple-600" />
                {t('leaderboard.fullRankings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {otherPlayers.map((player, index) => (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      player.isCurrentUser 
                        ? 'bg-tennis-purple-50 border border-tennis-purple-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        player.isCurrentUser 
                          ? 'bg-tennis-purple-600 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {player.rank}
                      </div>
                      
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-12 h-12 rounded-full"
                      />
                      
                      <div>
                        <h4 className={`font-semibold ${player.isCurrentUser ? 'text-tennis-purple-900' : 'text-gray-900'}`}>
                          {player.name}
                          {player.isCurrentUser && (
                            <Badge className="ml-2 bg-tennis-purple-100 text-tennis-purple-700">{t('leaderboard.you')}</Badge>
                          )}
                        </h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span>{player.points} {t('leaderboard.points')}</span>
                          <span>•</span>
                          <span>{player.winRate}% {t('leaderboard.wins')}</span>
                          <span>•</span>
                          <span>{player.matchesPlayed} {t('leaderboard.matches')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {player.change && (
                        <div className={`flex items-center ${
                          player.change > 0 ? 'text-tennis-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className={`w-4 h-4 mr-1 ${
                            player.change < 0 ? 'transform rotate-180' : ''
                          }`} />
                          <span className="text-sm font-medium">{Math.abs(player.change)}</span>
                        </div>
                      )}
                      
                      <Button variant="ghost" size="sm" className="text-tennis-purple-600">
                        {t('leaderboard.viewProfile')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-6">
                <Button variant="outline" className="border-tennis-purple-200 text-tennis-purple-700">
                  {t('leaderboard.loadMorePlayers')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
