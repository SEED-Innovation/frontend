import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { updateUserStatus } from '@/lib/api/services/adminUserService';
import { toast } from '@/hooks/use-toast';

interface DisableUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: number;
    fullName: string;
    email: string;
    enabled: boolean;
  };
  onSuccess?: () => void;
}

export function DisableUserDialog({ open, onOpenChange, user, onSuccess }: DisableUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceLogout, setForceLogout] = useState(true);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await updateUserStatus(user.id, {
        enabled: !user.enabled,
        forceLogout: !user.enabled ? false : forceLogout, // Only force logout when disabling
      });

      toast({
        title: user.enabled ? 'User disabled' : 'User enabled',
        description: `${user.fullName} has been ${user.enabled ? 'disabled' : 'enabled'} successfully.`,
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: user.enabled ? 'Failed to disable user' : 'Failed to enable user',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {user.enabled ? (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                </div>
                Disable User
              </>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                </div>
                Enable User
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {user.enabled ? (
              <>
                Are you sure you want to disable <span className="font-medium text-foreground">{user.fullName}</span>?
                <br />
                This user will no longer be able to access the system.
              </>
            ) : (
              <>
                Enable <span className="font-medium text-foreground">{user.fullName}</span>?
                <br />
                This user will be able to access the system again.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {user.enabled && (
          <div className="flex items-start space-x-3 rounded-md border p-4">
            <Checkbox
              id="force-logout"
              checked={forceLogout}
              onCheckedChange={(checked) => setForceLogout(checked === true)}
              disabled={isSubmitting}
            />
            <div className="space-y-1 leading-none">
              <Label
                htmlFor="force-logout"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Force logout active sessions
              </Label>
              <p className="text-sm text-muted-foreground">
                Immediately terminate all active sessions for this user
              </p>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant={user.enabled ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {user.enabled ? 'Disabling...' : 'Enabling...'}
              </>
            ) : (
              <>
                {user.enabled ? (
                  <>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Disable User
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Enable User
                  </>
                )}
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
