import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRTLClasses } from '@/hooks/useRTLClasses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '@/services/userService';

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: number;
    email: string;
    fullName?: string;
    username?: string;
  } | null;
  onSuccess?: () => void;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const { t } = useTranslation('admin');
  const { isRTL } = useLanguage();
  const rtlClasses = useRTLClasses();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    setConfirmText('');
    setIsDeleting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!user) return;

    if (confirmText !== 'DELETE') {
      toast.error(t('userManagement.typeDelete'));
      return;
    }

    setIsDeleting(true);

    try {
      await userService.deleteUser({ email: user.email });
      toast.success(t('userManagement.userAccountDeleted'));
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(t('userManagement.failedToDeleteUser'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  const displayName = user.fullName || user.username || user.email;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className={rtlClasses.textAlign}>
              <DialogTitle className="text-red-900">{t('userManagement.deleteUserTitle')}</DialogTitle>
              <DialogDescription className="text-red-700">
                {t('userManagement.deleteConfirmation')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <div className={`flex items-start space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
              <div className={`space-y-2 ${rtlClasses.textAlign}`}>
                <p className="text-sm font-medium text-red-900">
                  {t('userManagement.deleteWarning')}
                </p>
                <div className="text-sm text-red-800">
                  <p><strong>{t('userManagement.name')}:</strong> {displayName}</p>
                  <p><strong>{t('userManagement.email')}:</strong> {user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`space-y-3 ${rtlClasses.textAlign}`}>
            <p className="text-sm text-gray-700">
              {t('userManagement.deleteWillRemove')}
            </p>
            <ul className={`text-sm text-gray-600 space-y-1 ${isRTL ? 'mr-4' : 'ml-4'}`}>
              <li>• {t('userManagement.userProfileInfo')}</li>
              <li>• {t('userManagement.bookingHistoryRecords')}</li>
              <li>• {t('userManagement.matchStatsData')}</li>
              <li>• {t('userManagement.paymentHistoryTransactions')}</li>
              <li>• {t('userManagement.personalDataPreferences')}</li>
            </ul>
          </div>

          <div className={`space-y-2 ${rtlClasses.textAlign}`}>
            <Label htmlFor="confirm-delete" className="text-sm font-medium">
              {t('userManagement.typeDelete')}
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={t('userManagement.typeDeletePlaceholder')}
              className="font-mono"
            />
          </div>

          <div className={`rounded-lg bg-amber-50 p-3 border border-amber-200 ${rtlClasses.textAlign}`}>
            <p className="text-xs text-amber-800">
              <strong>{t('userManagement.dataProtectionWarning')}</strong> {t('userManagement.dataProtectionNote')}
            </p>
          </div>
        </div>

        <DialogFooter className={`flex-col sm:flex-row gap-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >{t('userManagement.cancel')}</Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE' || isDeleting}
            className={`w-full sm:w-auto ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {isDeleting ? (
              <>
                <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                {t('common.loading')}...
              </>
            ) : (
              <>
                <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('userManagement.deleteAccount')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};