import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, UserPlus, Download, Eye, Ban, Crown, Users, UserX, Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { userService } from '@/services/userService';
import { UpdateUserRequest, DeleteUserRequest } from '@/types/user';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adminNames, setAdminNames] = useState<string[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
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

  // Mock user data
  const users = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1234567890',
      plan: 'Premium',
      status: 'Active',
      joinDate: '2024-01-15',
      totalSessions: 45,
      rank: 12
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1234567891',
      plan: 'Basic',
      status: 'Active',
      joinDate: '2024-02-20',
      totalSessions: 28,
      rank: 23
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike@example.com',
      phone: '+1234567892',
      plan: 'Free',
      status: 'Suspended',
      joinDate: '2024-03-10',
      totalSessions: 5,
      rank: 156
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleViewUser = (user: any) => {
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

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                All Users ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{user.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">{user.totalSessions}</div>
                        <div className="text-xs text-gray-600">Total Sessions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">#{user.rank}</div>
                        <div className="text-xs text-gray-600">Rank</div>
                      </div>
                      <Badge className={`${getPlanColor(user.plan)} flex items-center space-x-1`}>
                        {getPlanIcon(user.plan)}
                        <span>{user.plan}</span>
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.email)}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="premium" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="w-5 h-5 mr-2" />
                Admin Managers ({adminNames.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAdmins ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600">Loading admin names...</div>
                </div>
              ) : adminNames.length > 0 ? (
                <div className="space-y-3">
                  {adminNames.map((adminName, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {adminName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{adminName}</h4>
                          <p className="text-sm text-gray-600">Admin User</p>
                        </div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800 flex items-center space-x-1">
                        <Crown className="w-3 h-3" />
                        <span>Admin</span>
                      </Badge>
                    </div>
                  ))}
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
    </motion.div>
  );
};

export default UserManagement;