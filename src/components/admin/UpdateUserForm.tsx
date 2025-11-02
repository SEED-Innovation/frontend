import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserResponse, UserRole, SubscriptionPlan, SkillLevel, AccountPrivacy } from '@/types/user';
import { User, Lock, Mail, Phone, Calendar, Ruler, Weight, Shield, Crown, Settings, Activity } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const updateUserSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional().or(z.literal('')),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50).optional().or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')),
  skillLevel: z.nativeEnum(SkillLevel).optional(),
  profileVisibility: z.nativeEnum(AccountPrivacy).optional(),
  height: z.string().refine((val) => !val || !isNaN(Number(val)), 'Height must be a number').optional(),
  weight: z.string().refine((val) => !val || !isNaN(Number(val)), 'Weight must be a number').optional(),
  role: z.nativeEnum(UserRole),
  plan: z.nativeEnum(SubscriptionPlan),
  enabled: z.boolean(),
  points: z.string().refine((val) => !val || !isNaN(Number(val)), 'Points must be a number').optional(),
  profilePictureUrl: z.string().url().optional().or(z.literal(''))
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface UpdateUserFormProps {
  user: UserResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateUserFormData) => Promise<void>;
  isManager?: boolean;
}

const getInitials = (name: string | null | undefined): string => {
  if (!name || typeof name !== 'string') return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export function UpdateUserForm({ user, isOpen, onClose, onSubmit, isManager = false }: UpdateUserFormProps) {
  const { t } = useTranslation('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      username: '', // Username not in UserResponse interface
      birthday: user?.birthday || '',
      skillLevel: user?.skillLevel || SkillLevel.BEGINNER,
      profileVisibility: user?.profileVisibility || AccountPrivacy.PUBLIC,
      height: user?.height?.toString() || '',
      weight: user?.weight?.toString() || '',
      role: user?.role || UserRole.USER,
      plan: user?.plan || SubscriptionPlan.FREE,
      enabled: user?.enabled || false,
      points: user?.points?.toString() || '',
      profilePictureUrl: user?.profilePictureUrl || ''
    }
  });

  const handleSubmit = async (data: UpdateUserFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-lg bg-primary/10">
              {isManager ? <Crown className="h-6 w-6 text-primary" /> : <User className="h-6 w-6 text-primary" />}
            </div>
            {isManager ? t('updateUser.updateManager') : t('updateUser.updateUser')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="h-5 w-5" />
                  {t('updateUser.profileInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.profilePictureUrl} />
                    <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{user.fullName}</h3>
                      <Badge variant={user.enabled ? "default" : "destructive"}>
                        {user.enabled ? t('updateUser.active') : t('updateUser.disabled')}
                      </Badge>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                    <p className="text-muted-foreground">ID: {user.id}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {t('updateUser.fullName')}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter full name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {t('updateUser.email')}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="Enter email address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {t('updateUser.phone')}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+966xxxxxxxxx" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {t('updateUser.username')}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profilePictureUrl"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {t('updateUser.profilePicture')}
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {/* File Upload Area */}
                            <div 
                              className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer bg-muted/10"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                // Static for now - will handle file upload later
                                console.log('File dropped:', e.dataTransfer.files[0]);
                              }}
                            >
                              <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                <div className="p-3 rounded-full bg-primary/10">
                                  <User className="h-8 w-8 text-primary" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">{t('updateUser.dropProfilePicture')}</p>
                                  <p className="text-xs text-muted-foreground">{t('updateUser.orClickToBrowse')}</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{t('updateUser.supportedFormats')}</span>
                                  <span>•</span>
                                  <span>{t('updateUser.maxSize')}</span>
                                </div>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  // Static for now - will handle file upload later
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    console.log('File selected:', file.name);
                                    // TODO: Handle file upload and set field.onChange with the uploaded URL
                                  }
                                }}
                              />
                            </div>
                            
                            {/* Current Profile Picture Preview */}
                            {(field.value || user?.profilePictureUrl) && (
                              <div className="flex items-center gap-3 p-3 bg-muted/5 rounded-lg border">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={field.value || user?.profilePictureUrl} />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {getInitials(user?.fullName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{t('updateUser.currentProfilePicture')}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {field.value || user?.profilePictureUrl || t('updateUser.noImageSet')}
                                  </p>
                                </div>
                                {field.value && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => field.onChange('')}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    {t('updateUser.remove')}
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Activity className="h-5 w-5" />
                  {t('updateUser.personalDetails')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="birthday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Birthday
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select skill level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(SkillLevel).map((level) => (
                            <SelectItem key={level} value={level}>
                              {level.charAt(0) + level.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Height (cm)
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="180" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Weight className="h-4 w-4" />
                        Weight (kg)
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="75" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileVisibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Visibility</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(AccountPrivacy).map((privacy) => (
                            <SelectItem key={privacy} value={privacy}>
                              {privacy.charAt(0) + privacy.slice(1).toLowerCase().replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Administrative Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {isManager ? <Crown className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                  {isManager ? 'Manager Controls' : 'Account Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Role
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(UserRole).map((role) => (
                              <SelectItem key={role} value={role}>
                                {role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription Plan</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(SubscriptionPlan).map((plan) => (
                              <SelectItem key={plan} value={plan}>
                                {plan.charAt(0) + plan.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <FormLabel className="text-base font-medium">
                            Account Status
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Enable or disable this user account
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {isManager && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary">Manager Privileges</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This user has administrative privileges and can manage courts assigned to them.
                    </p>
                    <div className="mt-3 text-sm">
                      <p><strong>Courts Managed:</strong> {user.allTimeRank || 0} courts</p>
                      <p><strong>Permission Level:</strong> {user.role === UserRole.SUPER_ADMIN ? 'Full Access' : 'Limited Access'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}