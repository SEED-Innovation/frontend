import React, { useEffect } from 'react';
import { X, Mail, Phone, Calendar, Crown, Users, UserX, Building, MapPin, Globe, Shield, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface DetailDrawerProps {
  user: any;
  userType: 'user' | 'manager';
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  user,
  userType,
  isOpen,
  onClose,
  isLoading = false
}) => {
  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!user) return null;

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'Premium': return <Crown className="w-4 h-4" />;
      case 'Basic': return <Users className="w-4 h-4" />;
      default: return <UserX className="w-4 h-4" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Premium': return 'bg-yellow-100 text-yellow-800';
      case 'Basic': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'ADMIN': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return <Crown className="w-4 h-4" />;
      case 'ADMIN': return <Shield className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const displayValue = (value: any, fallback = 'null') => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground italic">{fallback}</span>;
    }
    return value;
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {userType === 'manager' ? (
              <>
                <Shield className="w-5 h-5" />
                Admin Details
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                User Details
              </>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="animate-pulse bg-muted/30 rounded-lg p-4 h-32"></div>
              <div className="animate-pulse bg-muted/30 rounded-lg p-4 h-24"></div>
              <div className="animate-pulse bg-muted/30 rounded-lg p-4 h-40"></div>
            </div>
          ) : (
            <>
          {/* Enhanced Profile Section */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 ring-2 ring-background shadow-lg">
                  <AvatarImage src={user.profilePictureUrl} />
                  <AvatarFallback className="text-xl bg-gradient-to-br from-primary/20 to-primary/10">
                    {user.fullName?.split(' ').map((n: string) => n[0]).join('') || user.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getStatusColor(user.status)}`}>
                  {user.status === 'Active' ? '✓' : '!'}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-semibold">{displayValue(user.fullName || user.name, 'No Name')}</h3>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm break-all">{displayValue(user.email, 'No Email')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{displayValue(user.phone, 'No Phone')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">
                      Joined {displayValue(
                        user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : null,
                        'Unknown Date'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status & Role/Plan Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge className={`${getStatusColor(user.status)} w-fit`}>
                {displayValue(user.status, 'Unknown')}
              </Badge>
            </div>
            
            {userType === 'user' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Plan</label>
                <Badge className={`${getPlanColor(user.plan)} w-fit`}>
                  {getPlanIcon(user.plan)}
                  <span className="ml-1">{displayValue(user.plan, 'No Plan')}</span>
                </Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Courts Managed</label>
                <div className="text-lg font-bold text-primary">
                  {displayValue(user.courtsCount || user.managedCourtsCount || user.assignedCourts?.length, '0')} Courts
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Enhanced Activity & Statistics */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Building className="w-5 h-5" />
              Activity & Statistics
            </h4>
            
            <div className="grid gap-4">
              {/* Last Login Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium">Last Login</span>
                  </div>
                  <span 
                    className="text-sm font-semibold text-blue-700 dark:text-blue-300"
                    title={user.lastLogin ? formatLastLogin(user.lastLogin) : 'Never logged in'}
                  >
                    {user.lastLogin ? (
                      // Calculate days ago from lastLogin
                      (() => {
                        const lastLoginDate = new Date(user.lastLogin);
                        const now = new Date();
                        const diffTime = Math.abs(now.getTime() - lastLoginDate.getTime());
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                        
                        if (diffDays === 0 && diffHours < 24) {
                          return diffHours === 0 ? 'Just now' : `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                        } else if (diffDays === 0) {
                          return 'Today';
                        } else if (diffDays === 1) {
                          return 'Yesterday';
                        } else {
                          return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                        }
                      })()
                    ) : displayValue(null, 'Never')}
                  </span>
                </div>
                {user.lastLogin && (
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                    {formatLastLogin(user.lastLogin)}
                  </p>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-3">
                {userType === 'user' ? (
                  <>
                    <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200/50 dark:border-green-800/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium">Total Sessions</span>
                        </div>
                        <span className="text-lg font-bold text-green-700 dark:text-green-300">
                          {displayValue(user.totalSessions ?? 0, '0')}
                        </span>
                      </div>
                    </div>
                    
                    {user.rank && (
                      <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4 border border-yellow-200/50 dark:border-yellow-800/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-sm font-medium">Global Rank</span>
                          </div>
                          <span className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                            #{displayValue(user.rank, 'Unranked')}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-200/50 dark:border-purple-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium">Courts Managed</span>
                      </div>
                      <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                        {displayValue(user.courtsCount || user.managedCourtsCount || user.assignedCourts?.length, '0')}
                      </span>
                    </div>
                    {((user.courtsPreview && user.courtsPreview.length > 0) || (user.assignedCourts && user.assignedCourts.length > 0)) && (
                      <div className="mt-2 pt-2 border-t border-purple-200/50 dark:border-purple-800/30">
                        <p className="text-xs text-purple-600/70 dark:text-purple-400/70">
                          Assigned to {user.courtsCount || user.managedCourtsCount || user.assignedCourts?.length || 0} court{(user.courtsCount || user.managedCourtsCount || user.assignedCourts?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information for Admins */}
          {userType === 'manager' && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Administrative Details
                </h4>
                
                <div className="space-y-3 bg-muted/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">User ID</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      {displayValue(user.id, 'N/A')}
                    </code>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Username</span>
                    <span className="text-sm font-mono">
                      @{displayValue(user.username, 'N/A')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Assigned Courts</span>
                    <span className="text-sm">
                      {(user.courtsPreview && user.courtsPreview.length > 0) 
                        ? user.courtsPreview.slice(0, 2).join(', ') + (user.courtsPreview.length > 2 ? '...' : '')
                        : (user.assignedCourts && user.assignedCourts.length > 0)
                          ? user.assignedCourts.slice(0, 2).join(', ') + (user.assignedCourts.length > 2 ? '...' : '')
                          : 'No courts assigned'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
          </>
        )}
        </div>
      </SheetContent>
    </Sheet>
  );
};