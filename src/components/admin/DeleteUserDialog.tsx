import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2 } from 'lucide-react';
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
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);

    try {
      await userService.deleteUser({ email: user.email });
      toast.success('User account deleted successfully');
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  const displayName = user.fullName || user.username || user.email;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-red-900">Delete User Account</DialogTitle>
              <DialogDescription className="text-red-700">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <div className="flex items-start space-x-3">
              <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-900">
                  You are about to permanently delete:
                </p>
                <div className="text-sm text-red-800">
                  <p><strong>Name:</strong> {displayName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              This will permanently delete:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• User profile and account information</li>
              <li>• All booking history and records</li>
              <li>• Match statistics and performance data</li>
              <li>• Payment history and transactions</li>
              <li>• All personal data and preferences</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-sm font-medium">
              Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> to confirm:
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              className="font-mono"
            />
          </div>

          <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> This action complies with data protection regulations 
              and user rights to account deletion. The user will be immediately logged out 
              from all devices.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE' || isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};