
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Trophy, User, MapPin, Video, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { LanguageSelectionModal } from '@/components/common/LanguageSelectionModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation('web');
  const { needsLanguageSelection, checkLanguageSelectionStatus } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const needsSelection = await checkLanguageSelectionStatus();
      setShowLanguageModal(needsSelection);
    };
    checkStatus();
  }, [checkLanguageSelectionStatus]);
  const upcomingSessions = [
    {
      id: 1,
      court: "Riverside Tennis Club",
      date: "Today",
      time: "2:00 PM - 4:00 PM",
      type: t('dashboard.upcomingSessions.practiceSession'),
      status: t('dashboard.upcomingSessions.confirmed')
    },
    {
      id: 2,
      court: "Downtown Sports Center",
      date: "Tomorrow",
      time: "10:00 AM - 12:00 PM",
      type: t('dashboard.upcomingSessions.match'),
      status: t('dashboard.upcomingSessions.confirmed')
    }
  ];

  const recentMatches = [
    {
      id: 1,
      opponent: "Sarah M.",
      score: "6-4, 6-2",
      date: "2 days ago",
      result: t('dashboard.recentMatches.win'),
      duration: "1h 45m",
      thumbnail: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      opponent: "Alex R.",
      score: "4-6, 6-3, 6-4",
      date: "1 week ago",
      result: t('dashboard.recentMatches.win'),
      duration: "2h 15m",
      thumbnail: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop"
    }
  ];

  const stats = [
    { label: t('dashboard.stats.matchesPlayed'), value: "24", icon: Trophy },
    { label: t('dashboard.stats.winRate'), value: "78%", icon: Calendar },
    { label: t('dashboard.stats.hoursPlayed'), value: "156", icon: Clock },
    { label: t('dashboard.stats.rank'), value: "#45", icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Language Selection Modal for first-time users */}
      <LanguageSelectionModal 
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onLanguageSelected={() => setShowLanguageModal(false)}
      />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('dashboard.welcomeUser', { name: 'AMMAR' })}
            </h1>
            <p className="text-gray-600">{t('dashboard.readyForSession')}</p>
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
                <CardTitle className="text-xl font-bold">{t('dashboard.upcomingSessions.title')}</CardTitle>
                <Link to="/courts">
                  <Button variant="outline" size="sm" className="btn-outline">
                    {t('dashboard.upcomingSessions.bookNew')}
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
                          {t('dashboard.upcomingSessions.checkIn')}
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
                <CardTitle className="text-xl font-bold">{t('dashboard.recentMatches.title')}</CardTitle>
                <Link to="/recordings">
                  <Button variant="outline" size="sm" className="btn-outline">
                    {t('dashboard.recentMatches.viewAll')}
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
                            alt={t('dashboard.matchThumbnail')}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900">{t('dashboard.recentMatches.vs')} {match.opponent}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              match.result === t('dashboard.recentMatches.win')
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.quickActionsItems.findCourts.title')}</h3>
                  <p className="text-gray-600">{t('dashboard.quickActionsItems.findCourts.description')}</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/leaderboard">
              <Card className="premium-card cursor-pointer animate-fade-in interactive-hover" style={{ animationDelay: '1s' }}>
                <CardContent className="p-6 text-center">
                  <div className="tennis-gradient p-4 rounded-xl inline-flex mb-4">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.quickActionsItems.leaderboard.title')}</h3>
                  <p className="text-gray-600">{t('dashboard.quickActionsItems.leaderboard.description')}</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/recordings">
              <Card className="premium-card cursor-pointer animate-fade-in interactive-hover" style={{ animationDelay: '1.2s' }}>
                <CardContent className="p-6 text-center">
                  <div className="tennis-gradient p-4 rounded-xl inline-flex mb-4">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.quickActionsItems.recordings.title')}</h3>
                  <p className="text-gray-600">{t('dashboard.quickActionsItems.recordings.description')}</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/challenges">
              <Card className="premium-card cursor-pointer animate-fade-in interactive-hover" style={{ animationDelay: '1.4s' }}>
                <CardContent className="p-6 text-center">
                  <div className="tennis-gradient p-4 rounded-xl inline-flex mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.quickActionsItems.challenges.title')}</h3>
                  <p className="text-gray-600">{t('dashboard.quickActionsItems.challenges.description')}</p>
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
