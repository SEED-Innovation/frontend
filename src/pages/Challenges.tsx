
import React from 'react';
import Navigation from '@/components/Navigation';
import ChallengesAndBadges from '@/components/ChallengesAndBadges';
import { toast } from 'sonner';

const Challenges = () => {
  const handleJoinChallenge = (challengeId: number) => {
    toast.success('Challenge joined successfully!', {
      description: 'Good luck reaching your goal!'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ChallengesAndBadges onJoinChallenge={handleJoinChallenge} />
        </div>
      </div>
    </div>
  );
};

export default Challenges;
