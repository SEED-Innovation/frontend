
import React, { useState } from 'react';
import { Trophy, Target, Clock, Star, Lock, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Challenge {
  id: number;
  title: string;
  description: string;
  target: number;
  current: number;
  points: number;
  timeLimit: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isJoined: boolean;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: any;
  isUnlocked: boolean;
  unlockedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ChallengesAndBadgesProps {
  onJoinChallenge: (challengeId: number) => void;
}

const ChallengesAndBadges: React.FC<ChallengesAndBadgesProps> = ({ onJoinChallenge }) => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'badges'>('challenges');

  const challenges: Challenge[] = [
    {
      id: 1,
      title: "Week Warrior",
      description: "Play 5 matches this week",
      target: 5,
      current: 2,
      points: 150,
      timeLimit: "6 days left",
      difficulty: 'easy',
      isJoined: true
    },
    {
      id: 2,
      title: "Ace Master",
      description: "Hit 20 aces in matches",
      target: 20,
      current: 12,
      points: 300,
      timeLimit: "2 weeks left",
      difficulty: 'medium',
      isJoined: true
    },
    {
      id: 3,
      title: "Marathon Player",
      description: "Play for 10 hours this month",
      target: 10,
      current: 0,
      points: 500,
      timeLimit: "3 weeks left",
      difficulty: 'hard',
      isJoined: false
    }
  ];

  const achievements: Achievement[] = [
    {
      id: 1,
      title: "First Win",
      description: "Win your first match",
      icon: Trophy,
      isUnlocked: true,
      unlockedDate: "March 15, 2024",
      rarity: 'common'
    },
    {
      id: 2,
      title: "Consistent Player",
      description: "Play 10 days in a row",
      icon: Target,
      isUnlocked: true,
      unlockedDate: "April 2, 2024",
      rarity: 'rare'
    },
    {
      id: 3,
      title: "Speed Demon",
      description: "Hit a serve over 100 mph",
      icon: Zap,
      isUnlocked: false,
      rarity: 'epic'
    },
    {
      id: 4,
      title: "Perfect Game",
      description: "Win a match 6-0, 6-0",
      icon: Star,
      isUnlocked: false,
      rarity: 'legendary'
    }
  ];

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-tennis-green-100 text-tennis-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
    }
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-700';
      case 'rare': return 'bg-blue-100 text-blue-700';
      case 'epic': return 'bg-tennis-purple-100 text-tennis-purple-700';
      case 'legendary': return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Challenges & Achievements</h2>
        <p className="text-gray-600">Level up your game and earn rewards</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              activeTab === 'challenges'
                ? 'bg-white text-tennis-purple-700 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Challenges
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              activeTab === 'badges'
                ? 'bg-white text-tennis-purple-700 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Achievement Badges
          </button>
        </div>
      </div>

      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge, index) => (
            <Card 
              key={challenge.id} 
              className="premium-card animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900 mb-1">
                      {challenge.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm">{challenge.description}</p>
                  </div>
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {challenge.current}/{challenge.target}
                    </span>
                  </div>
                  <Progress 
                    value={(challenge.current / challenge.target) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-tennis-purple-600">
                    <Trophy className="w-4 h-4 mr-1" />
                    <span className="font-medium">{challenge.points} points</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{challenge.timeLimit}</span>
                  </div>
                </div>

                {challenge.isJoined ? (
                  <div className="flex items-center justify-center p-3 bg-tennis-green-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-tennis-green-600 mr-2" />
                    <span className="text-tennis-green-700 font-medium">Joined</span>
                  </div>
                ) : (
                  <Button 
                    onClick={() => onJoinChallenge(challenge.id)}
                    className="w-full tennis-button glow-button"
                  >
                    Join Challenge
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => {
            const IconComponent = achievement.icon;
            
            return (
              <Card 
                key={achievement.id}
                className={`premium-card text-center animate-fade-in ${
                  achievement.isUnlocked ? 'bg-white' : 'bg-gray-50'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className={`achievement-badge mx-auto mb-4 ${
                    achievement.isUnlocked ? 'achievement-earned' : 'achievement-locked'
                  }`}>
                    {achievement.isUnlocked ? (
                      <IconComponent className="w-8 h-8" />
                    ) : (
                      <Lock className="w-8 h-8" />
                    )}
                  </div>

                  <h3 className={`font-bold mb-2 ${
                    achievement.isUnlocked ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {achievement.title}
                  </h3>

                  <p className={`text-sm mb-3 ${
                    achievement.isUnlocked ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>

                  <Badge className={getRarityColor(achievement.rarity)}>
                    {achievement.rarity}
                  </Badge>

                  {achievement.isUnlocked && achievement.unlockedDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Unlocked {achievement.unlockedDate}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChallengesAndBadges;
