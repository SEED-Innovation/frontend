import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cameraService } from '@/services/cameraService';
import { Loader2, Cloud, CheckCircle, XCircle } from 'lucide-react';

export default function HikConnectTest() {
  const { t } = useTranslation('admin');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setLoginStatus('idle');

      const result = await cameraService.loginToHikConnect(credentials);

      setLoginStatus('success');
      toast({
        title: "Login successful",
        description: result.message,
      });
    } catch (error) {
      setLoginStatus('error');
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Failed to login to Hik-Connect",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCameras = async () => {
    try {
      setLoading(true);
      const result = await cameraService.getAvailableHikConnectCameras();
      setCameras(result.cameras);

      toast({
        title: "Cameras loaded",
        description: `Found ${result.count} cameras`,
      });
    } catch (error) {
      toast({
        title: "Failed to load cameras",
        description: error instanceof Error ? error.message : "Failed to get cameras",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCameras = async () => {
    try {
      setLoading(true);
      const result = await cameraService.syncHikConnectCameras();

      toast({
        title: "Sync completed",
        description: result.message,
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Failed to sync cameras",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestApiFormats = async () => {
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both username and password first",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cameras/hik-connect/test-formats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();

      toast({
        title: "API Format Test",
        description: result.message || "Test completed. Check browser console and server logs.",
      });
    } catch (error) {
      toast({
        title: "Test failed",
        description: error instanceof Error ? error.message : "Failed to test API formats",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="w-5 h-5" />
            <span>{t('hikConnect.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t('hikConnect.username')}</Label>
            <Input
              id="username"
              type="email"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('hikConnect.password')}</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Your Hik-Connect password"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={handleLogin} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Login
            </Button>

            {loginStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {loginStatus === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleLoadCameras} disabled={loading}>
              Load Available Cameras
            </Button>
            <Button variant="outline" onClick={handleSyncCameras} disabled={loading}>
              Sync All Cameras
            </Button>
            <Button variant="outline" onClick={handleTestApiFormats} disabled={loading}>
              Test API Formats
            </Button>
          </div>

          {cameras.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Available Cameras ({cameras.length})</h3>
              <div className="space-y-2">
                {cameras.map((camera, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium">{camera.deviceName}</div>
                    <div className="text-sm text-muted-foreground">
                      Serial: {camera.deviceSerial} | Channel: {camera.channelNo} |
                      Status: {camera.isOnline ? 'Online' : 'Offline'}
                    </div>
                    {camera.model && (
                      <div className="text-sm text-muted-foreground">Model: {camera.model}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}