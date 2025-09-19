import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Eye, 
  Ban, 
  CheckCircle, 
  Crown, 
  Users, 
  UserX, 
  Mail, 
  Phone, 
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useQueryParam } from '@/hooks/useQueryParam';
import { useUsersPaged, useToggleUserEnabled } from '@/lib/hooks/useUsersPaged';
import type { UserListItem } from '@/types/user';

interface UsersListProps {
  onViewUser?: (user: UserListItem) => void;
}

export default function UsersList({ onViewUser }: UsersListProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [page, setPage] = useQueryParam('page', 0);
  const [size, setSize] = useQueryParam('size', 50);
  const [q, setQ] = useState('');

  const { data, isFetching, error } = useUsersPaged(page, size);
  const toggle = useToggleUserEnabled(page, size);

  const rows = useMemo(() => {
    const list = (data as any)?.users ?? [];
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter(u =>
      ((u.username ?? u.name ?? '') as string).toLowerCase().includes(s) ||
      (u.email ?? '').toLowerCase().includes(s) ||
      (u.phone ?? '').toLowerCase().includes(s)
    );
  }, [data, q]);

  // Reverted to original simple initials function — we now expect a display string (username/name)
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Prefer username, then name, then email local-part
  const getDisplayName = (user: any) => {
    if (!user) return '';
    if (user.username) return String(user.username);
    if (user.name) return String(user.name);
    if (user.email && typeof user.email === 'string') return user.email.split('@')[0];
    return '';
  };

  const getPlanBadge = (plan: string | null) => {
    if (!plan) return <Badge variant="secondary">—</Badge>;
    
    const variants = {
      Premium: { variant: 'default' as const, color: 'bg-yellow-100 text-yellow-800' },
      Basic: { variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      Free: { variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = variants[plan as keyof typeof variants] || variants.Free;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {plan}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    if (status === 'Disabled') {
      return <Badge variant="destructive">Disabled</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  // Render Last Login as a Badge with similar styling to Status
  const getLastLoginBadge = (lastLogin: string | null) => {
    const rec = getLastLoginRecency(lastLogin);
    // Never should be an amber-outline
    if (!lastLogin) return <Badge variant="outline" className="border-amber-200 text-amber-700">Never</Badge>;
    // Progressive amber: recent = stronger amber
    if (rec === 'recent') {
      return <Badge className="bg-amber-200 text-amber-900">{formatLastLogin(lastLogin)}</Badge>;
    }
    if (rec === 'week') {
      return <Badge className="bg-amber-100 text-amber-800">{formatLastLogin(lastLogin)}</Badge>;
    }
    return <Badge className="bg-amber-50 text-amber-700">{formatLastLogin(lastLogin)}</Badge>;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never';
    const d = new Date(lastLogin);
    const now = new Date();

    // Normalize to local dates (midnight) to calculate day difference
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfGiven = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const diffMs = startOfToday.getTime() - startOfGiven.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return formatDate(lastLogin);
  };

  // Recency: 'recent' = <=24h, 'week' = <=7d, 'older' = >7d
  const getLastLoginRecency = (lastLogin: string | null) => {
    if (!lastLogin) return 'older';
    const d = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffHours <= 24) return 'recent';
    if (diffDays <= 7) return 'week';
    return 'older';
  };

  const handleToggleEnabled = async (user: UserListItem) => {
    const isCurrentlyActive = user.status === 'Active';
    const action = isCurrentlyActive ? 'disable' : 'enable';
    
  if (!confirm(`Are you sure you want to ${action} ${getDisplayName(user)}?`)) return;
    
    try {
      await toggle.mutateAsync({ id: user.id, enabled: !isCurrentlyActive });
      toast({
        title: "User updated",
        description: `${getDisplayName(user)} has been ${isCurrentlyActive ? 'disabled' : 'enabled'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleViewUser = (user: UserListItem) => {
    if (onViewUser) {
      onViewUser(user);
    } else {
      navigate(`/admin/users/${user.id}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < (data?.totalPages ?? 0)) {
      setPage(newPage);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Failed to load users. Try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            All Users ({(data as any)?.totalElements ?? 0})
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-3 w-16" /></TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {q ? `No users found matching "${q}"` : "No users on this page"}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((user) => {
                  const rec = getLastLoginRecency(user.lastLogin);
                  const colorClass = rec === 'recent' ? 'text-green-600' : rec === 'week' ? 'text-amber-600' : 'text-gray-500';
                  return (
                    <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          {user.profilePictureUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.profilePictureUrl} alt={`${getDisplayName(user)} avatar`} />
                          ) : (
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(getDisplayName(user) || ' ')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="font-medium">{getDisplayName(user)}</div>
                          <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.email ? (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <a 
                              href={`mailto:${user.email}`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {user.email}
                            </a>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                        {user.phone ? (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <a 
                              href={`tel:${user.phone}`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {user.phone}
                            </a>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPlanBadge(user.plan)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{user.totalSessions ?? 0} sessions</div>
                        <div className="text-sm text-muted-foreground">
                          Rank {user.rank ? `#${user.rank}` : '—'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getLastLoginBadge(user.lastLogin)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleEnabled(user)}
                          disabled={toggle.isPending}
                        >
                          {user.status === 'Active' ? (
                            <Ban className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Page {page + 1} of {(data as any)?.totalPages || 1}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!(data as any)?.hasPrevious || isFetching}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!(data as any)?.hasNext || isFetching}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}