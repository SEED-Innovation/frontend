import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UsersList from './UsersList';

import { useState, useEffect } from 'react';
import { Search, Plus, UserPlus, Download, Eye, Ban, Crown, Users, UserX, Mail, Phone, Calendar, Building, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { userService } from '@/services/userService';
import { UpdateUserRequest, DeleteUserRequest } from '@/types/user';
// New imports for enhanced functionality
import { RefreshButton } from './RefreshButton';
import { ActionMenu } from './ActionMenu';
import { FilterChips } from './FilterChips';
import { DetailDrawer } from './DetailDrawer';
import { CreateAdminModal } from './CreateAdminModal';
import { DeleteUserDialog } from './DeleteUserDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const UserManagement = () => {
  const { t } = useTranslation('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adminNames, setAdminNames] = useState<string[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);

  // New state for enhanced functionality
  const [statusFilter, setStatusFilter] = useState('All');
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [detailUser, setDetailUser] = useState<any>(null);
  const [detailUserType, setDetailUserType] = useState<'user' | 'manager'>('user');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'PLAYER'
  });
  const [editUser, setEditUser] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'PLAYER',
    plan: 'Free',
    status: 'Active'
  });

  // Manager data state and backend integration
  const [managersPage, setManagersPage] = useState(0);
  const [managersData, setManagersData] = useState<any>(null);
  const [managersLoading, setManagersLoading] = useState(true);
  const [managersError, setManagersError] = useState<string | null>(null);

  // Load managers from backend
  async function loadAdmins(page = 0, size = 10) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/admin/users/admins-paged?page=${page}&size=${size}`, {
        credentials: "include",
        headers: {
          "Accept": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Backend error:', res.status, errorText);
        throw new Error(`Failed to load managers (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      console.log('Managers data loaded:', data);
      return data;
    } catch (error) {
      console.error('Error loading managers:', error);
      throw error;
    }
  }

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
      case 'Disabled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced filtering function for managers only
  const getFilteredManagers = () => {
    if (!managersData?.users || !Array.isArray(managersData.users)) return [];
    return managersData.users.filter((item: any) => {
      const name = item.fullName || item.username || '';
      const email = item.email || '';
      const phone = item.phone || '';
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phone.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const filteredManagers = getFilteredManagers();

  // Fetch admin names and managers when component mounts
  useEffect(() => {
    fetchAdminNames();
  }, []);

  // Load managers from backend
  useEffect(() => {
    let alive = true;
    setManagersLoading(true);
    loadAdmins(managersPage, 10)
      .then(d => {
        if (alive) {
          setManagersData(d);
          setManagersError(null);
        }
      })
      .catch(e => {
        if (alive) setManagersError(e.message || "Failed to load managers");
      })
      .finally(() => {
        if (alive) setManagersLoading(false);
      });
    return () => { alive = false; };
  }, [managersPage]);

  const fetchAdminNames = async () => {
    setIsLoadingAdmins(true);
    try {
      const names = await userService.getAllAdminNames();
      setAdminNames(names);
      console.log('✅ Admin names loaded:', names);
    } catch (error) {
      console.error('❌ Failed to fetch admin names:', error);
      toast.error('Failed to load admin names. You may not have permission to view this data.');
      // Fallback to mock data for demonstration
      setAdminNames(['Admin User 1', 'Admin User 2', 'Manager John']);
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    // TODO: Connect to backend API - POST /admin/users
    console.log('Creating user:', newUser);
    toast.success('User created successfully');
    setShowCreateUser(false);
    setNewUser({ fullName: '', email: '', phone: '', role: 'PLAYER' });
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditUser({
      fullName: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'PLAYER',
      plan: user.plan || 'Free',
      status: user.status
    });
    setShowEditUser(true);
  };

  const handleSaveUserChanges = async () => {
    if (!selectedUser) return;

    try {
      // Map the form data to UpdateUserRequest format
      const updates: Partial<UpdateUserRequest> = {
        fullName: editUser.fullName,
        phone: editUser.phone,
        role: editUser.role as any,
        plan: editUser.plan as any,
        enabled: editUser.status === 'Active'
      };

      await handleUpdateUser(selectedUser.id, updates);
      setShowEditUser(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to save user changes:', error);
    }
  };

  const handleUpdateUser = async (userId: string | number, updates: Partial<UpdateUserRequest>) => {
    try {
      const updateRequest: UpdateUserRequest = {
        id: typeof userId === 'string' ? parseInt(userId) : userId,
        ...updates
      };

      console.log('Updating user:', updateRequest);

      const updatedUser = await userService.updateUser(updateRequest);

      console.log('User updated successfully:', updatedUser);
      toast.success('User updated successfully');

    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userEmail: string) => {
    try {
      const deleteRequest: DeleteUserRequest = {
        email: userEmail
      };

      console.log('Deleting user by email:', deleteRequest);

      await userService.deleteUser(deleteRequest);

      console.log('User deleted successfully');
      toast.success('User deleted successfully');

    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user. Please try again.');
    }
  };

  // New enhanced functions
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAdminNames();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEnableDisable = (user: any) => {
    const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
    toast.success(`User ${newStatus.toLowerCase()} successfully`);
  };

  const handleChangeRole = (user: any) => {
    toast.info('Plan change functionality to be implemented');
  };

  const handleAssignCourts = (user: any) => {
    toast.info('Court assignment functionality to be implemented');
  };

  const handleEdit = (user: any) => {
    handleEditUser(user);
  };

  const handleDelete = (user: any) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleDeleteSuccess = () => {
    // Refresh the data after successful deletion
    handleRefresh();
  };

  const handleViewUser = async (user: any, userType: 'user' | 'manager') => {
    setDetailUserType(userType);
    setShowDetailDrawer(true);
    setDetailUser(null); // Clear previous data
    setIsLoadingUserDetail(true);

    try {
      if (userType === 'user') {
        // Use the optimized approach: fetch detailed user data on-demand
        const fullUserData = await userService.getUserDetails(user.id);
        setDetailUser(fullUserData);
      } else {
        // For managers, use the existing mock data (until backend implements admin details endpoint)
        setDetailUser(user);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      toast.error('Failed to fetch user details');
      // Fallback to basic user data from the list
      setDetailUser(user);
    } finally {
      setIsLoadingUserDetail(false);
    }
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name || typeof name !== 'string') return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'ADMIN': return <Users className="w-4 h-4 text-blue-600" />;
      default: return <UserX className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-yellow-100 text-yellow-800';
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('userManagement.title')}</h2>
        <div className="flex space-x-2">
          <RefreshButton onRefresh={handleRefresh} isLoading={isRefreshing} />
          <Button onClick={() => setShowCreateAdmin(true)} className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>{t('userManagement.createAdmin')}</span>
          </Button>
          <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>{t('userManagement.createUser')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('userManagement.createNewUser')}</DialogTitle>
                <DialogDescription>
                  {t('userManagement.addNewUserDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('userManagement.fullName')} *</Label>
                  <Input
                    id="fullName"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    placeholder={t('userManagement.enterFullName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('userManagement.email')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder={t('userManagement.enterEmailAddress')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('userManagement.phone')} *</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder={t('userManagement.enterPhoneNumber')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">{t('userManagement.role')}</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLAYER">{t('userManagement.player')}</SelectItem>
                      <SelectItem value="ADMIN">{t('userManagement.admin')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                    {t('userManagement.cancel')}
                  </Button>
                  <Button onClick={handleCreateUser}>
                    {t('userManagement.createUser')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('userManagement.editUser')}</DialogTitle>
                <DialogDescription>
                  {t('userManagement.updateUserDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="editFullName">{t('userManagement.fullName')} *</Label>
                  <Input
                    id="editFullName"
                    value={editUser.fullName}
                    onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                    placeholder={t('userManagement.enterFullName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmail">{t('userManagement.emailReadOnly')}</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editUser.email}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone">{t('userManagement.phone')} *</Label>
                  <Input
                    id="editPhone"
                    value={editUser.phone}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                    placeholder={t('userManagement.enterPhoneNumber')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRole">{t('userManagement.role')}</Label>
                  <Select
                    value={editUser.role}
                    onValueChange={(value) => setEditUser({ ...editUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLAYER">{t('userManagement.player')}</SelectItem>
                      <SelectItem value="ADMIN">{t('userManagement.admin')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPlan">{t('userManagement.plan')}</Label>
                  <Select
                    value={editUser.plan}
                    onValueChange={(value) => setEditUser({ ...editUser, plan: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free">{t('userManagement.free')}</SelectItem>
                      <SelectItem value="Basic">{t('userManagement.basic')}</SelectItem>
                      <SelectItem value="Premium">{t('userManagement.premium')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editStatus">{t('userManagement.status')}</Label>
                  <Select
                    value={editUser.status}
                    onValueChange={(value) => setEditUser({ ...editUser, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">{t('userManagement.active')}</SelectItem>
                      <SelectItem value="Disabled">{t('userManagement.disabled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowEditUser(false)}>
                    {t('userManagement.cancel')}
                  </Button>
                  <Button onClick={handleSaveUserChanges}>
                    {t('userManagement.saveChanges')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('userManagement.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('userManagement.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">{t('userManagement.allStatus')}</SelectItem>
                  <SelectItem value="Active">{t('userManagement.active')}</SelectItem>
                  <SelectItem value="Suspended">{t('userManagement.suspended')}</SelectItem>
                  <SelectItem value="Disabled">{t('userManagement.disabled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Users and Managers */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 p-2 bg-gradient-to-r from-admin-surface to-admin-secondary border-2 border-border rounded-xl h-16">
          <TabsTrigger
            value="users"
            className="flex items-center space-x-2 h-12 rounded-lg font-medium text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
          >
            <Users className="w-4 h-4" />
            <span>{t('userManagement.users')}</span>
          </TabsTrigger>
          <TabsTrigger
            value="managers"
            className="flex items-center space-x-2 h-12 rounded-lg font-medium text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
          >
            <Crown className="w-4 h-4" />
            <span>{t('userManagement.managers')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UsersList
            onViewUser={(user) => handleViewUser(user, 'user')}
            onDeleteUser={handleDelete}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            isManagersTab={false}
            userType="users"
          />
        </TabsContent>

        <TabsContent value="managers" className="space-y-4">
          <UsersList
            onViewUser={(user) => handleViewUser(user, 'manager')}
            onDeleteUser={handleDelete}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            isManagersTab={true}
            userType="admins"
          />
        </TabsContent>
      </Tabs>

      {/* Create Admin Modal */}
      <CreateAdminModal
        open={showCreateAdmin}
        onOpenChange={setShowCreateAdmin}
        onSuccess={(admin) => {
          console.log('Admin created:', admin);
          handleRefresh();
        }}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={showDetailDrawer}
        onClose={() => {
          setShowDetailDrawer(false);
          setDetailUser(null);
        }}
        user={detailUser}
        userType={detailUserType}
        isLoading={isLoadingUserDetail}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setUserToDelete(null);
        }}
        user={userToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </motion.div>
  );
};

export default UserManagement;
