import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Phone, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminProfile } from '@/hooks/useAdminProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

const AdminProfile = () => {
  const { profile, loading, error } = useAdminProfile();
  const { t } = useTranslation('web');

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.menu.myProfile')}</h1>
          <p className="text-gray-600 mt-1">{t('admin.pages.profile.subtitle')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t('admin.pages.profile.information')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View your admin account details</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <XCircle className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Failed to load profile</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!profile) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRole = (role: string) => {
    return role.toLowerCase().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">View your admin account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <img
              src={profile.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=843dff&color=fff`}
              alt={profile.fullName}
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=843dff&color=fff`;
              }}
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{profile.fullName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={profile.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
                  {formatRole(profile.role)}
                </Badge>
                <Badge variant={profile.enabled ? 'default' : 'destructive'} className="flex items-center gap-1">
                  {profile.enabled ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('admin.pages.profile.emailAddress')}</p>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-gray-900">{formatRole(profile.role)}</p>
                </div>
              </div>

              {profile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('admin.pages.profile.phoneNumber')}</p>
                    <p className="text-gray-900">{profile.phone}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('admin.pages.profile.username')}</p>
                  <p className="text-gray-900">{profile.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('admin.pages.profile.accountCreated')}</p>
                  <p className="text-gray-900">{formatDate(profile.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Login</p>
                  <p className="text-gray-900">{formatDate(profile.lastLoginAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {profile.assignedCourts && profile.assignedCourts.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-500 mb-2">{t('admin.pages.profile.assignedCourts')}</h4>
              <div className="flex flex-wrap gap-2">
                {profile.assignedCourts.map((court, index) => (
                  <Badge key={index} variant="outline">
                    {court}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminProfile;