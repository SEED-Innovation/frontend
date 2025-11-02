import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Construction } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const SystemAnalytics = () => {
  const { t } = useTranslation('web');
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.pages.analytics.title')}</h1>
        <p className="text-gray-600 mt-1">{t('admin.pages.analytics.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="w-5 h-5 text-orange-500" />
            Under Construction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.pages.analytics.comingSoon')}</h3>
            <p className="text-gray-600">
              {t('admin.pages.analytics.underConstruction')}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SystemAnalytics;