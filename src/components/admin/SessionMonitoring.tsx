import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Construction } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const SessionMonitoring = () => {
  const { t } = useTranslation('admin');
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.menu.sessions')}</h1>
        <p className="text-gray-600 mt-1">{t('admin.pages.sessionMonitoring.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="w-5 h-5 text-orange-500" />
            {t('admin.pages.sessionMonitoring.underConstruction')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.pages.sessionMonitoring.comingSoon')}</h3>
            <p className="text-gray-600">
              {t('admin.pages.sessionMonitoring.description')}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SessionMonitoring;