
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation('web');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-purple-50 via-white to-tennis-green-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="text-9xl font-bold bg-gradient-to-r from-tennis-purple-600 to-tennis-green-500 bg-clip-text text-transparent">
            404
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            {t('notFound.title')}
          </h1>
          <p className="text-gray-600">
            {t('notFound.description')}
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/dashboard">
            <Button className="tennis-button w-full">
              <Home className="w-4 h-4 mr-2" />
              {t('notFound.goToDashboard')}
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="btn-outline w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('notFound.goBack')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
