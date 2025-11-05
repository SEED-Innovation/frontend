import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Send,
  Users,
  Globe,
  Target,
  BarChart3,
  TestTube,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { notificationService, NotificationStats, PromotionalNotificationResponse } from '@/services/notificationService';

interface NotificationForm {
  title: string;
  body: string;
  targetType: 'ALL' | 'BY_LANGUAGE' | 'SPECIFIC_USERS';
  targetLanguage?: string;
  targetUserIds?: string[];
  language: string;
  customData?: { [key: string]: any };
  scheduledAt?: string;
}

const NotificationManagement: React.FC = () => {
  const { t } = useTranslation('web');
  const { toast } = useToast();
  
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [lastResult, setLastResult] = useState<PromotionalNotificationResponse | null>(null);
  
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    body: '',
    targetType: 'ALL',
    language: 'en',
    customData: {}
  });

  const [testForm, setTestForm] = useState({
    title: '',
    body: '',
    language: 'en'
  });

  // Load notification statistics
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await notificationService.getPromotionalStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification statistics',
        variant: 'destructive',
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and message are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const request = {
        title: form.title,
        body: form.body,
        targetType: form.targetType,
        language: form.language,
        targetLanguage: form.targetType === 'BY_LANGUAGE' ? form.targetLanguage : undefined,
        targetUserIds: form.targetType === 'SPECIFIC_USERS' ? form.targetUserIds : undefined,
        customData: form.customData,
        scheduledAt: form.scheduledAt
      };

      const response = await notificationService.sendPromotionalNotification(request);
      setLastResult(response.data);
      
      toast({
        title: 'Success',
        description: `Notification sent to ${response.data.successCount} users`,
      });

      // Reset form
      setForm({
        title: '',
        body: '',
        targetType: 'ALL',
        language: 'en',
        customData: {}
      });

      // Refresh stats
      loadStats();
      
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!testForm.title.trim() || !testForm.body.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and message are required for test',
        variant: 'destructive',
      });
      return;
    }

    try {
      setTestLoading(true);
      
      const response = await notificationService.testPromotionalNotification(testForm);
      
      toast({
        title: 'Test Sent',
        description: 'Test notification sent to your device',
      });

      // Reset test form
      setTestForm({
        title: '',
        body: '',
        language: 'en'
      });
      
    } catch (error: any) {
      console.error('Failed to send test notification:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send test notification',
        variant: 'destructive',
      });
    } finally {
      setTestLoading(false);
    }
  };

  const getTargetDescription = () => {
    switch (form.targetType) {
      case 'ALL':
        return `All ${stats?.totalActiveDevices || 0} active users`;
      case 'BY_LANGUAGE':
        const langCount = form.targetLanguage ? stats?.devicesByLanguage[form.targetLanguage] || 0 : 0;
        return `${langCount} users with ${form.targetLanguage === 'ar' ? 'Arabic' : 'English'} language`;
      case 'SPECIFIC_USERS':
        return `${form.targetUserIds?.length || 0} specific users`;
      default:
        return 'No target selected';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            Broadcast Notifications
          </h1>
          <p className="text-gray-600 mt-2">
            Send promotional messages and announcements to mobile app users
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" disabled={statsLoading}>
          {statsLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BarChart3 className="w-4 h-4 mr-2" />}
          Refresh Stats
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Devices</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.totalActiveDevices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered mobile devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Language Distribution</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm">English:</span>
                    <Badge variant="secondary">{stats?.devicesByLanguage?.en || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Arabic:</span>
                    <Badge variant="secondary">{stats?.devicesByLanguage?.ar || 0}</Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Distribution</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm">Android:</span>
                    <Badge variant="secondary">{stats?.devicesByPlatform?.ANDROID || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">iOS:</span>
                    <Badge variant="secondary">{stats?.devicesByPlatform?.IOS || 0}</Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

export default NotificationManagement;      {
/* Main Content */}
      <Tabs defaultValue="broadcast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="broadcast">Broadcast Notification</TabsTrigger>
          <TabsTrigger value="test">Test Notification</TabsTrigger>
        </TabsList>

        {/* Broadcast Tab */}
        <TabsContent value="broadcast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Broadcast Notification
              </CardTitle>
              <CardDescription>
                Send promotional messages, announcements, or important updates to your users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Message Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Notification Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter notification title..."
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {form.title.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="body">Message Content</Label>
                    <Textarea
                      id="body"
                      placeholder="Enter your message content..."
                      value={form.body}
                      onChange={(e) => setForm({ ...form, body: e.target.value })}
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {form.body.length}/500 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="language">Message Language</Label>
                    <Select value={form.language} onValueChange={(value) => setForm({ ...form, language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="targetType">Target Audience</Label>
                    <Select value={form.targetType} onValueChange={(value: any) => setForm({ ...form, targetType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Users</SelectItem>
                        <SelectItem value="BY_LANGUAGE">By Language</SelectItem>
                        <SelectItem value="SPECIFIC_USERS">Specific Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {form.targetType === 'BY_LANGUAGE' && (
                    <div>
                      <Label htmlFor="targetLanguage">Target Language</Label>
                      <Select value={form.targetLanguage} onValueChange={(value) => setForm({ ...form, targetLanguage: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English Users</SelectItem>
                          <SelectItem value="ar">Arabic Users</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {form.targetType === 'SPECIFIC_USERS' && (
                    <div>
                      <Label htmlFor="targetUsers">Target User IDs</Label>
                      <Textarea
                        id="targetUsers"
                        placeholder="Enter user IDs separated by commas..."
                        onChange={(e) => {
                          const userIds = e.target.value.split(',').map(id => id.trim()).filter(id => id);
                          setForm({ ...form, targetUserIds: userIds });
                        }}
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter user IDs separated by commas (max 1000 users)
                      </p>
                    </div>
                  )}

                  {/* Target Summary */}
                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Target:</strong> {getTargetDescription()}
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Send Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleSendNotification} 
                  disabled={loading || !form.title.trim() || !form.body.trim()}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Last Result */}
          {lastResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Last Notification Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Title</p>
                    <p className="text-sm">{lastResult.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Target Type</p>
                    <Badge variant="outline">{lastResult.targetType}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{lastResult.successCount}/{lastResult.totalUsers}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">{lastResult.failureCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Test Notification
              </CardTitle>
              <CardDescription>
                Send a test notification to your own device to preview how it will look
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testTitle">Test Title</Label>
                  <Input
                    id="testTitle"
                    placeholder="Test notification title..."
                    value={testForm.title}
                    onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="testLanguage">Language</Label>
                  <Select value={testForm.language} onValueChange={(value) => setTestForm({ ...testForm, language: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="testBody">Test Message</Label>
                <Textarea
                  id="testBody"
                  placeholder="Test message content..."
                  value={testForm.body}
                  onChange={(e) => setTestForm({ ...testForm, body: e.target.value })}
                  rows={3}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The test notification will be sent only to your registered device with a [TEST] prefix.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end">
                <Button 
                  onClick={handleTestNotification} 
                  disabled={testLoading || !testForm.title.trim() || !testForm.body.trim()}
                  variant="outline"
                >
                  {testLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending Test...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Send Test
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationManagement;