import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LanguageToggleProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = 'outline',
  size = 'default',
  showText = false,
}) => {
  const { language, changeLanguage, isLoading } = useLanguage();

  const languages = [
    { code: 'en' as const, name: 'English', nativeName: 'English' },
    { code: 'ar' as const, name: 'Arabic', nativeName: 'العربية' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          {showText && (
            <span className="hidden sm:inline">
              {currentLanguage?.nativeName}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`flex items-center justify-between ${
              language === lang.code ? 'bg-accent' : ''
            }`}
          >
            <span>{lang.nativeName}</span>
            {language === lang.code && (
              <span className="ml-2 text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Simple toggle button version
export const SimpleLanguageToggle: React.FC = () => {
  const { language, changeLanguage, isLoading } = useLanguage();

  return (
    <div className="flex items-center space-x-1 rtl:space-x-reverse">
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => changeLanguage('en')}
        disabled={isLoading}
        className="px-3 py-1"
      >
        EN
      </Button>
      <Button
        variant={language === 'ar' ? 'default' : 'outline'}
        size="sm"
        onClick={() => changeLanguage('ar')}
        disabled={isLoading}
        className="px-3 py-1"
      >
        ع
      </Button>
    </div>
  );
};