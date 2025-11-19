import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSecureClipboard } from '@/hooks/useSecureClipboard';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: {
    email: string;
    password: string;
    isTemporary?: boolean;
  };
  onClose?: () => void;
}

export function CredentialsDialog({ open, onOpenChange, credentials, onClose }: CredentialsDialogProps) {
  const { t } = useTranslation('admin');
  const [showPassword, setShowPassword] = useState(false);
  const { copyToClipboard, cleanup } = useSecureClipboard();
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);

  useEffect(() => {
    if (!open) {
      cleanup();
      setShowPassword(false);
      setCopiedField(null);
    }
  }, [open, cleanup]);

  const handleCopy = async (text: string, field: 'email' | 'password') => {
    const success = await copyToClipboard(text, field === 'email' ? 'Email' : 'Password');
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleClose = () => {
    cleanup();
    onOpenChange(false);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" onEscapeKeyDown={handleClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Admin Password Reset Successfully
          </DialogTitle>
          <DialogDescription>
            Save these credentials securely. This is the only time the password will be shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {credentials.isTemporary && (
            <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-700 dark:text-amber-400">
                This is a temporary password. The user must reset it on first login.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t('userManagement.email')}</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                value={credentials.email}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCopy(credentials.email, 'email')}
                aria-label="Copy email"
              >
                {copiedField === 'email' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  readOnly
                  className="font-mono text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCopy(credentials.password, 'password')}
                aria-label="Copy password"
              >
                {copiedField === 'password' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={handleClose} variant="default">
            I've Saved the Credentials
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
