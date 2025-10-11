import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Loader2, KeyRound, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validation/adminUserSchemas';
import { resetUserPassword } from '@/lib/api/services/adminUserService';
import { toast } from '@/hooks/use-toast';
import { CredentialsDialog } from './CredentialsDialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  onSuccess?: () => void;
  isSuperAdmin?: boolean;
}

export function ResetPasswordModal({ 
  open, 
  onOpenChange, 
  user, 
  onSuccess,
  isSuperAdmin = false 
}: ResetPasswordModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string; isTemporary?: boolean } | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
      requirePasswordResetOnFirstLogin: false,
      returnPlainPassword: false,
    },
  });

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[@$!%*?&]/.test(password)) strength += 15;
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (value: string) => {
    form.setValue('newPassword', value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    try {
      const response = await resetUserPassword(user.id, {
        newPassword: data.newPassword,
        requirePasswordResetOnFirstLogin: data.requirePasswordResetOnFirstLogin,
        returnPlainPassword: data.returnPlainPassword,
      });

      toast({
        title: 'Password reset successfully',
        description: `Password for ${user.email} has been updated.`,
      });

      // Show credentials if plain password was returned
      if (response.passwordPlain) {
        setCredentials({
          email: user.email,
          password: response.passwordPlain,
          isTemporary: response.temporaryPassword,
        });
      }

      onSuccess?.();
      
      if (!response.passwordPlain) {
        form.reset();
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: 'Failed to reset password',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCredentialsClose = () => {
    setCredentials(null);
    form.reset();
    onOpenChange(false);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Moderate';
    return 'Strong';
  };

  return (
    <>
      <Dialog open={open && !credentials} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Reset password for <span className="font-medium text-foreground">{user.fullName}</span> ({user.email})
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          {...field}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    {field.value && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Password strength:</span>
                          <span className={passwordStrength >= 70 ? 'text-green-600' : passwordStrength >= 40 ? 'text-amber-600' : 'text-red-600'}>
                            {getPasswordStrengthLabel()}
                          </span>
                        </div>
                        <Progress value={passwordStrength} className={`h-1 ${getPasswordStrengthColor()}`} />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          {...field}
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirePasswordResetOnFirstLogin"
                render={({ field }) => (
                  <>
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Require password reset on next login
                        </FormLabel>
                        <FormDescription>
                          User will be prompted to change this password when they log in
                        </FormDescription>
                      </div>
                    </FormItem>
                    
                    {field.value && (
                      <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <AlertDescription className="text-sm text-amber-700 dark:text-amber-400">
                          This will create a temporary password using the NEW_PASSWORD_REQUIRED flow. 
                          The user must change it on first login.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              />

              {isSuperAdmin && (
                <FormField
                  control={form.control}
                  name="returnPlainPassword"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-blue-500/50 bg-blue-500/10">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-blue-700 dark:text-blue-400">
                          Show password after reset (Super Admin only)
                        </FormLabel>
                        <FormDescription className="text-blue-600 dark:text-blue-500">
                          Display the new password for copying. Use with caution.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Reset Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {credentials && (
        <CredentialsDialog
          open={!!credentials}
          onOpenChange={(open) => !open && handleCredentialsClose()}
          credentials={credentials}
          onClose={handleCredentialsClose}
        />
      )}
    </>
  );
}
