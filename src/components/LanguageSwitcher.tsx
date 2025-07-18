import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'fr' : 'en');
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2"
            title={t('language.switch')}
        >
            <Languages className="h-4 w-4" />
            <span>{language === 'en' ? t('language.french') : t('language.english')}</span>
        </Button>
    );
};
