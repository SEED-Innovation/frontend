import React, { useEffect } from 'react';
import { X, Mail, Phone, Calendar, Crown, Users, UserX, Building } from 'lucide-react';
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
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  user,
  userType,
  isOpen,
  onClose
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
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Profile Section */}
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-lg">
                {user.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Status & Role/Plan */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge className={getStatusColor(user.status)}>
                {user.status}
              </Badge>
            </div>
            
            {userType === 'user' ? (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Plan</span>
                <Badge className={getPlanColor(user.plan)}>
                  {getPlanIcon(user.plan)}
                  <span className="ml-1">{user.plan}</span>
                </Badge>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Role</span>
                <Badge variant="outline">
                  {user.role || 'Admin'}
                </Badge>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-sm font-medium">Join Date</span>
              <span className="text-sm text-muted-foreground">
                {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          <Separator />

          {/* Activity Section */}
          <div className="space-y-3">
            <h4 className="font-medium">Activity</h4>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium">Last Login</span>
              <span 
                className="text-sm text-muted-foreground"
                title={user.lastLogin ? formatLastLogin(user.lastLogin) : 'Never logged in'}
              >
                {user.lastLogin ? (
                  // Mock time ago calculation
                  (() => {
                    const days = Math.floor(Math.random() * 30);
                    return days === 0 ? 'Today' : `${days} day${days > 1 ? 's' : ''} ago`;
                  })()
                ) : 'Never'}
              </span>
            </div>

            {userType === 'user' ? (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Sessions</span>
                <span className="text-sm text-muted-foreground">
                  {user.totalSessions || 0}
                </span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Courts Managed</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {user.managedCourtsCount || Math.floor(Math.random() * 10) + 1}
                </span>
              </div>
            )}

            {user.rank && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Rank</span>
                <span className="text-sm text-muted-foreground">
                  #{user.rank}
                </span>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};