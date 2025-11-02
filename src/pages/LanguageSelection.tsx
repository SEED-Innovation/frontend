import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageSelectionPage } from '@/components/common/LanguageSelectionModal';

const LanguageSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleLanguageSelected = (language: 'en' | 'ar') => {
    // Store that user has completed language selection
    localStorage.setItem('languageSelectionCompleted', 'true');
    
    // Navigate to auth page
    navigate('/auth');
  };

  return (
    <LanguageSelectionPage
      onLanguageSelected={handleLanguageSelected}
      showSkip={true}
    />
  );
};

export default LanguageSelection;