import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageToggler = () => {
    const { i18n, t } = useTranslation('web');

    const languages = [
        { code: 'en', name: t('language.english'), flag: '🇺🇸' },
        { code: 'ar', name: t('language.arabic'), flag: '🇸🇦' }
    ];

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (languageCode: string) => {
        i18n.changeLanguage(languageCode);
        // Update document direction for RTL languages
        document.documentElement.dir = languageCode === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = languageCode;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-200"
                >
                    <Globe className="w-4 h-4 mr-2" />
                    <span className="mr-1">{currentLanguage.flag}</span>
                    <span className="hidden sm:inline">{currentLanguage.name}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                {languages.map((language) => (
                    <DropdownMenuItem
                        key={language.code}
                        onClick={() => changeLanguage(language.code)}
                        className={`cursor-pointer text-slate-300 hover:text-white hover:bg-slate-700 ${i18n.language === language.code ? 'bg-slate-700 text-white' : ''
                            }`}
                    >
                        <span className="mr-2">{language.flag}</span>
                        {language.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageToggler;