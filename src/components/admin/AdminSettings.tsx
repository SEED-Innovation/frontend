
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Settings, Building, DollarSign, Bell, Shield, Database, Globe, Users, Camera } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    facilityName: 'Elite Tennis Center',
    contactEmail: 'admin@tenniscenter.com',
    contactPhone: '+1234567890',
    address: '123 Tennis Drive, Sports City',
    defaultHourlyRate: 50,
    taxRate: 8.25,
    allowOnlineBooking: true,
    requireEmailVerification: true,
    enableAIFeatures: true,
    enableNotifications: true,
    autoBackup: true,
    maintenanceMode: false
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <Button onClick={handleSave} className="bg-tennis-green-600 hover:bg-tennis-green-700">
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="facility" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="facility">Facility</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="facility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2 text-tennis-purple-600" />
                Facility Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facility Name
                  </label>
                  <Input
                    value={settings.facilityName}
                    onChange={(e) => handleSettingChange('facilityName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <Input
                    value={settings.contactEmail}
                    onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <Input
                    value={settings.contactPhone}
                    onChange={(e) => handleSettingChange('contactPhone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <Input
                    value={settings.address}
                    onChange={(e) => handleSettingChange('address', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-600" />
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monday</label>
                  <Input placeholder="06:00 - 22:00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tuesday</label>
                  <Input placeholder="06:00 - 22:00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wednesday</label>
                  <Input placeholder="06:00 - 22:00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thursday</label>
                  <Input placeholder="06:00 - 22:00" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Pricing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Hourly Rate ($)
                  </label>
                  <Input
                    type="number"
                    value={settings.defaultHourlyRate}
                    onChange={(e) => handleSettingChange('defaultHourlyRate', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.taxRate}
                    onChange={(e) => handleSettingChange('taxRate', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Court-Specific Pricing</h4>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Elite Court #1</span>
                    <Input className="w-24" placeholder="$65" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Standard Court #2</span>
                    <Input className="w-24" placeholder="$45" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Practice Court #3</span>
                    <Input className="w-24" placeholder="$35" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="w-5 h-5 mr-2 text-tennis-purple-600" />
                AI & Feature Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Enable AI Features</h4>
                    <p className="text-sm text-gray-600">Motion tracking, performance analytics</p>
                  </div>
                  <Switch
                    checked={settings.enableAIFeatures}
                    onCheckedChange={(checked) => handleSettingChange('enableAIFeatures', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Online Booking</h4>
                    <p className="text-sm text-gray-600">Allow customers to book online</p>
                  </div>
                  <Switch
                    checked={settings.allowOnlineBooking}
                    onCheckedChange={(checked) => handleSettingChange('allowOnlineBooking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Verification</h4>
                    <p className="text-sm text-gray-600">Require email verification for new users</p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Send booking reminders and updates</p>
                  </div>
                  <Switch
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Security & Access Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Admin Access Levels</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>Super Admin</span>
                      <Badge className="bg-red-100 text-red-800">Full Access</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>Court Manager</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Limited Access</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>Front Desk</span>
                      <Badge className="bg-blue-100 text-blue-800">Booking Only</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Session Management</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Session Timeout (minutes)
                      </label>
                      <Input placeholder="30" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Login Attempts
                      </label>
                      <Input placeholder="5" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-green-600" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Automatic Backup</h4>
                    <p className="text-sm text-gray-600">Daily backup of all data</p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                    <p className="text-sm text-gray-600">Disable user access for maintenance</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">System Actions</h4>
                <div className="flex space-x-3">
                  <Button variant="outline">Export Data</Button>
                  <Button variant="outline">Clear Cache</Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    Reset System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
