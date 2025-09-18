import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UsersList from './UsersList';

// Keep the existing managers mock data and functionality
import { useState, useEffect } from 'react';
import { Search, Plus, UserPlus, Download, Eye, Ban, Crown, Users, UserX, Mail, Phone, Calendar, Building, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
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
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  // Mock manager data with enhanced fields
  const managers = [
    {
      id: 101,
      name: 'Ahmed Al-Mansouri',
      email: 'ahmed.admin@seed.com',
      phone: '+966-50-123-4567',
      role: 'ADMIN',
      status: 'Active',
      joinDate: '2023-12-01',
      managedCourtsCount: 5,
      assignedCourts: ['Court A', 'Court B', 'Court C', 'Court D', 'Court E'],
      lastLogin: '2024-03-15T08:15:00Z',
      avatar: null
    },
    {
      id: 102,
      name: 'Sarah Al-Zahra',
      email: 'sarah.super@seed.com',
      phone: '+966-55-987-6543',
      role: 'SUPER_ADMIN',
      status: 'Active',
      joinDate: '2023-11-15',
      managedCourtsCount: 12,
      assignedCourts: ['All Courts'],
      lastLogin: '2024-03-15T09:30:00Z',
      avatar: null
    },
    {
      id: 103,
      name: 'Omar Hassan',
      email: 'omar.admin@seed.com',
      phone: null,
      role: 'ADMIN',
      status: 'Suspended',
      joinDate: '2024-01-20',
      managedCourtsCount: 0,
      assignedCourts: [],
      lastLogin: null,
      avatar: null
    }
  ];

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
    return managers.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesRole = roleFilter === 'All' || item.role === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  };

  const filteredManagers = getFilteredManagers();

  // Fetch admin names when component mounts
  useEffect(() => {
    fetchAdminNames();
  }, []);

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

  const handleViewUser = (user: any, userType: 'user' | 'manager') => {
    setDetailUser({ ...user, userType });
    setShowDetailDrawer(true);
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

  const getInitials = (name: string) => {
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
          <UsersList />
        </TabsContent>

        <TabsContent value="managers" className="space-y-4">
          {/* Managers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Managers ({filteredManagers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Courts</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredManagers.map((manager) => (
                    <TableRow key={manager.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(manager.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{manager.name}</div>
                            <div className="text-sm text-muted-foreground">ID: {manager.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <a href={`mailto:${manager.email}`} className="text-sm text-blue-600 hover:underline">
                              {manager.email}
                            </a>
                          </div>
                          {manager.phone ? (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <a href={`tel:${manager.phone}`} className="text-sm text-blue-600 hover:underline">
                                {manager.phone}
                              </a>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No phone</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(manager.role)}>
                          <div className="flex items-center space-x-1">
                            {getRoleIcon(manager.role)}
                            <span>{manager.role.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(manager.status)}>
                          {manager.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{manager.managedCourtsCount} courts</div>
                          <div className="text-sm text-muted-foreground">
                            {manager.assignedCourts.length > 0 
                              ? manager.assignedCourts.slice(0, 2).join(', ') + 
                                (manager.assignedCourts.length > 2 ? '...' : '')
                              : 'No courts assigned'
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatLastLogin(manager.lastLogin)}</span>
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
                            onEnableDisable={handleEnableDisable}
                            onChangeRole={handleChangeRole}
                            onAssignCourts={handleAssignCourts}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={showDetailDrawer}
        onClose={() => setShowDetailDrawer(false)}
        user={detailUser}
      />
    </motion.div>
  );

  // Fetch admin names when component mounts
  useEffect(() => {
    fetchAdminNames();
  }, []);

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
      role: 'PLAYER', // Default role since mock data doesn't have this
      plan: user.plan,
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
        role: editUser.role as any, // Cast to UserRole
        plan: editUser.plan as any, // Cast to SubscriptionPlan
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
      // Create the update request object with the user identifier and updates
      const updateRequest: UpdateUserRequest = {
        id: typeof userId === 'string' ? parseInt(userId) : userId,
        ...updates
      };

      console.log('Updating user:', updateRequest);
      
      // Call the backend API
      const updatedUser = await userService.updateUser(updateRequest);
      
      console.log('User updated successfully:', updatedUser);
      toast.success('User updated successfully');
      
      // TODO: Refresh the user list or update local state if needed
      
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userEmail: string) => {
    try {
      // Create the delete request object with email identifier
      const deleteRequest: DeleteUserRequest = {
        email: userEmail
      };

      console.log('Deleting user by email:', deleteRequest);
      
      // Call the backend API
      await userService.deleteUser(deleteRequest);
      
      console.log('User deleted successfully');
      toast.success('User deleted successfully');
      
      // TODO: Refresh the user list or remove from local state if needed
      
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

  const handleViewUser = (user: any, userType: 'user' | 'manager') => {
    setDetailUser({ ...user, userType });
    setShowDetailDrawer(true);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
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
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Users</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="premium">Managers</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Search Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                All Users ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Name</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Contact</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Plan</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Stats</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Last Login</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">ID: {user.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-900">{user.email}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600">{user.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={`${getPlanColor(user.plan)} flex items-center space-x-1 w-fit`}>
                              {getPlanIcon(user.plan)}
                              <span>{user.plan}</span>
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={`${getStatusColor(user.status)} w-fit`}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="font-medium text-gray-900">{user.totalSessions}</span>
                                <span className="text-gray-500 ml-1">sessions</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Rank </span>
                                <span className="font-medium text-gray-900">#{user.rank}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {formatLastLogin(user.lastLogin)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewUser(user, 'user')}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <ActionMenu
                                user={user}
                                userType="user"
                                onEnableDisable={handleEnableDisable}
                                onChangeRole={handleChangeRole}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="premium" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="w-5 h-5 mr-2" />
                Admin Managers ({filteredManagers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingAdmins ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600">Loading admin names...</div>
                </div>
              ) : filteredManagers.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Name</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Contact</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Role</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Status</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Managed Courts</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Last Login</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredManagers.map((manager) => (
                          <tr key={manager.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Crown className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{manager.name}</div>
                                  <div className="text-sm text-gray-500">ID: {manager.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-sm">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-900">{manager.email}</span>
                                </div>
                                {manager.phone && (
                                  <div className="flex items-center space-x-2 text-sm">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-600">{manager.phone}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={`${manager.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'} w-fit flex items-center space-x-1`}>
                                <Crown className="w-3 h-3" />
                                <span>{manager.role.replace('_', ' ')}</span>
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={`${getStatusColor(manager.status)} w-fit`}>
                                {manager.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="text-sm">
                                  <span className="font-medium text-gray-900">{manager.managedCourtsCount}</span>
                                  <span className="text-gray-500 ml-1">courts</span>
                                </div>
                                {manager.assignedCourts.length > 0 && (
                                  <div className="text-xs text-gray-500">
                                    {manager.assignedCourts.slice(0, 2).join(', ')}
                                    {manager.assignedCourts.length > 2 && '...'}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {formatLastLogin(manager.lastLogin)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewUser(manager, 'manager')}
                                  className="flex items-center gap-1.5 text-xs"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Crown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No admin users found.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    You may not have permission to view admin data.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Drawer */}
      {showDetailDrawer && detailUser && (
        <DetailDrawer
          isOpen={showDetailDrawer}
          onClose={() => setShowDetailDrawer(false)}
          user={detailUser}
        />
      )}
    </motion.div>
  );
};

export default UserManagement;