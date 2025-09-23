import React from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adminNames, setAdminNames] = useState<string[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  
  // New state for enhanced functionality
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [detailUser, setDetailUser] = useState<any>(null);
  const [detailUserType, setDetailUserType] = useState<'user' | 'manager'>('user');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
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
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced filtering function for managers only
  const getFilteredManagers = () => {
    if (!managersData?.users || !Array.isArray(managersData.users)) return [];
    return managersData.users.filter((item: any) => {
      const name = item.fullName || item.username || '';
      const email = item.email || '';
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesRole = roleFilter === 'All' || item.role === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
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
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
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
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      handleDeleteUser(user.email);
    }
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
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex space-x-2">
          <RefreshButton onRefresh={handleRefresh} isLoading={isRefreshing} />
          <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Create User</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system. All fields marked with * are required.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({...newUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLAYER">Player</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser}>
                    Create User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Edit User Dialog */}
          <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user information. Some fields like email cannot be changed for security reasons.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="editFullName">Full Name *</Label>
                  <Input
                    id="editFullName"
                    value={editUser.fullName}
                    onChange={(e) => setEditUser({...editUser, fullName: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmail">Email (Read-only)</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editUser.email}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Phone *</Label>
                  <Input
                    id="editPhone"
                    value={editUser.phone}
                    onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRole">Role</Label>
                  <Select
                    value={editUser.role}
                    onValueChange={(value) => setEditUser({...editUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLAYER">Player</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPlan">Plan</Label>
                  <Select
                    value={editUser.plan}
                    onValueChange={(value) => setEditUser({...editUser, plan: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free">Free</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    value={editUser.status}
                    onValueChange={(value) => setEditUser({...editUser, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowEditUser(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveUserChanges}>
                    Save Changes
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
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Roles</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Users and Managers */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="managers">Managers</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UsersList onViewUser={(user) => handleViewUser(user, 'user')} />
        </TabsContent>

        <TabsContent value="managers" className="space-y-4">
          {managersError && (
            <div className="text-red-600 p-4 bg-red-50 rounded-md">
              Error: {managersError}
            </div>
          )}
          
          {/* Managers Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Managers ({managersLoading ? '...' : filteredManagers.length})
                {managersData && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    Page {managersData.currentPage + 1} of {managersData.totalPages}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Courts</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managersLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      </TableRow>
                    ))
                  ) : filteredManagers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No managers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredManagers.map((manager: any) => (
                      <TableRow key={manager.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(manager.fullName || manager.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{manager.fullName || manager.username || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">ID: {manager.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {manager.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <a href={`mailto:${manager.email}`} className="text-sm text-blue-600 hover:underline">
                                  {manager.email}
                                </a>
                              </div>
                            )}
                            {manager.phone ? (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <a href={`tel:${manager.phone}`} className="text-sm text-blue-600 hover:underline">
                                  {manager.phone}
                                </a>
                              </div>
                          ) : !manager.email ? (
                            <span className="text-sm text-muted-foreground">No email</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">No phone</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(manager.status || 'Unknown')}>
                          {manager.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {manager.courtsCount || 0} {(manager.courtsCount || 0) === 1 ? "court" : "courts"}
                            </span>
                            <span className="text-sm text-gray-500 truncate">
                              {manager.courtsPreview?.join(", ") || 'No courts'}{manager.courtsHasMore ? "..." : ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {manager.lastLogin ? new Date(manager.lastLogin).toLocaleDateString() : "Never"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewUser(manager, 'manager')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <ActionMenu 
                              user={manager}
                              userType="manager"
                              onEnableDisable={handleEnableDisable}
                              onChangeRole={handleChangeRole}
                              onAssignCourts={handleAssignCourts}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {managersData && managersData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!managersData.hasPrevious} 
                    onClick={() => setManagersPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    Page {managersData.currentPage + 1} of {managersData.totalPages}
                  </span>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!managersData.hasNext} 
                    onClick={() => setManagersPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
    </motion.div>
  );
};

export default UserManagement;
