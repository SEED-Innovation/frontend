import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLanguageSelected?: (language: 'en' | 'ar') => void;
  showSkip?: boolean;
  title?: string;
  subtitle?: string;
}

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  isOpen,
  onClose,
  onLanguageSelected,
  showSkip = true,
  title,
  subtitle,
}) => {
  const { language, changeLanguage, isLoading } = useLanguage();
  const { t } = useTranslation('web');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>(language);

  const languages = [
    {
      code: 'en' as const,
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      description: t('language.englishDescription'),
    },
    {
      code: 'ar' as const,
      name: 'Arabic',
      nativeName: 'العربية',
      flag: '🇸🇦',
      description: t('language.arabicDescription'),
    },
  ];

  const handleLanguageSelect = async (langCode: 'en' | 'ar') => {
    setSelectedLanguage(langCode);
    try {
      await changeLanguage(langCode);
      if (onLanguageSelected) {
        onLanguageSelected(langCode);
      }
      onClose();
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md mx-4"
        >
          <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-6">
              {/* Close button */}
              <div className="absolute right-4 top-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-accent/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>

              {/* Title and subtitle */}
              <div className="space-y-2">
                <CardTitle className="text-xl font-bold text-foreground">
                  {title || t('language.selectLanguage')}
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  {subtitle || t('language.choosePreferred')}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Language options */}
              <div className="space-y-3">
                {languages.map((lang) => (
                  <motion.div
                    key={lang.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => handleLanguageSelect(lang.code)}
                      disabled={isLoading}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedLanguage === lang.code
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-accent/5'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          {/* Flag */}
                          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                            <span className="text-lg">{lang.flag}</span>
                          </div>
                          
                          {/* Language info */}
                          <div>
                            <div className="font-semibold text-foreground">
                              {lang.nativeName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {lang.description}
                            </div>
                          </div>
                        </div>

                        {/* Selection indicator */}
                        <div className="flex items-center">
                          {isLoading && selectedLanguage === lang.code ? (
                            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          ) : selectedLanguage === lang.code ? (
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded-full" />
                          )}
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Info note */}
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-start space-x-2 rtl:space-x-reverse">
                  <div className="w-5 h-5 text-accent mt-0.5">
                    <Globe className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-accent">
                    {t('language.canChangeAnytime')}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => handleLanguageSelect(selectedLanguage)}
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      {t('ui.loading')}
                    </div>
                  ) : (
                    t('language.continue')
                  )}
                </Button>

                {showSkip && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={isLoading}
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    {t('language.skip')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Standalone language selection page component
export const LanguageSelectionPage: React.FC<{
  onLanguageSelected?: (language: 'en' | 'ar') => void;
  showSkip?: boolean;
}> = ({ onLanguageSelected, showSkip = true }) => {
  const { language, changeLanguage, isLoading } = useLanguage();
  const { t } = useTranslation('web');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>(language);

  const languages = [
    {
      code: 'en' as const,
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      description: t('language.englishDescription'),
    },
    {
      code: 'ar' as const,
      name: 'Arabic',
      nativeName: 'العربية',
      flag: '🇸🇦',
      description: t('language.arabicDescription'),
    },
  ];

  const handleLanguageSelect = async (langCode: 'en' | 'ar') => {
    setSelectedLanguage(langCode);
    try {
      await changeLanguage(langCode);
      if (onLanguageSelected) {
        onLanguageSelected(langCode);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Globe className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>

            {/* Title and subtitle */}
            <div className="space-y-3">
              <CardTitle className="text-2xl font-bold text-foreground">
                {t('language.welcomeToSeed')}
              </CardTitle>
              <p className="text-muted-foreground">
                {t('language.selectToGetStarted')}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Language options */}
            <div className="space-y-4">
              {languages.map((lang) => (
                <motion.div
                  key={lang.code}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => handleLanguageSelect(lang.code)}
                    disabled={isLoading}
                    className={`w-full p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedLanguage === lang.code
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-border hover:border-primary/50 hover:bg-accent/5'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        {/* Flag */}
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                          <span className="text-xl">{lang.flag}</span>
                        </div>
                        
                        {/* Language info */}
                        <div>
                          <div className="font-semibold text-lg text-foreground">
                            {lang.nativeName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {lang.description}
                          </div>
                        </div>
                      </div>

                      {/* Selection indicator */}
                      <div className="flex items-center">
                        {isLoading && selectedLanguage === lang.code ? (
                          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        ) : selectedLanguage === lang.code ? (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-muted-foreground/30 rounded-full" />
                        )}
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Info note */}
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <div className="w-5 h-5 text-accent mt-0.5">
                  <Globe className="w-5 h-5" />
                </div>
                <p className="text-sm text-accent">
                  {t('language.canChangeAnytime')}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => handleLanguageSelect(selectedLanguage)}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-lg font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    {t('ui.loading')}
                  </div>
                ) : (
                  t('language.continue')
                )}
              </Button>

              {showSkip && (
                <Button
                  variant="ghost"
                  onClick={() => onLanguageSelected?.(language)}
                  disabled={isLoading}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  {t('language.skip')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};