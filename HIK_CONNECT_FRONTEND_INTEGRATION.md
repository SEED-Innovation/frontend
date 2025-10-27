# Hik-Connect Frontend Integration

This document describes the frontend implementation for Hikvision Hik-Connect camera management.

## Overview

The frontend now supports both traditional IP cameras and Hik-Connect cloud cameras with the following features:

- **Dual Camera Types**: Support for both IP cameras and Hik-Connect cameras
- **Cloud Authentication**: Login to Hik-Connect accounts
- **Camera Discovery**: Browse and add cameras from Hik-Connect
- **Live Streaming**: View live streams from both camera types
- **Unified Management**: Single interface for all camera types

## Components Updated

### 1. CameraManagement.tsx
- **Enhanced UI**: Added Hik-Connect login and camera browsing
- **Camera Type Detection**: Visual indicators for IP vs Cloud cameras
- **Stream Viewer**: Integrated live stream viewing
- **Sync Functionality**: Automatic camera synchronization

### 2. Camera Service (cameraService.ts)
- **Hik-Connect APIs**: Login, camera discovery, streaming
- **Unified Interface**: Single service for all camera operations
- **Error Handling**: Comprehensive error management

### 3. Type Definitions (camera.ts)
- **Extended Types**: Support for Hik-Connect specific fields
- **Status Enums**: New camera statuses for cloud integration

## Key Features

### Camera Type Support
```typescript
// IP Camera
{
  hikConnectEnabled: false,
  ipAddress: "192.168.1.100",
  port: 554,
  username: "admin",
  password: "password"
}

// Hik-Connect Camera
{
  hikConnectEnabled: true,
  deviceSerial: "DS-2CD2xxx-xxx",
  channelNo: 1,
  deviceName: "Front Door Camera"
}
```

### Hik-Connect Workflow
1. **Login**: Authenticate with Hik-Connect account
2. **Browse**: View available cameras in account
3. **Add**: Select and add cameras to system
4. **Sync**: Automatic synchronization of camera status
5. **Stream**: View live streams from cloud cameras

### UI Enhancements
- **Camera Type Badges**: Visual distinction between IP and Cloud cameras
- **Connection Status**: Real-time online/offline indicators
- **Stream Actions**: Quick access to live streaming
- **Sync Controls**: Manual and automatic synchronization

## API Integration

### Authentication
```typescript
// Login to Hik-Connect
const result = await cameraService.loginToHikConnect({
  username: "user@example.com",
  password: "password"
});
```

### Camera Discovery
```typescript
// Get available cameras
const cameras = await cameraService.getAvailableHikConnectCameras();

// Sync all cameras
await cameraService.syncHikConnectCameras();

// Add specific camera
await cameraService.addHikConnectCamera({
  deviceSerial: "DS-2CD2xxx-xxx",
  channelNo: 1
});
```

### Streaming
```typescript
// Get live stream URL
const stream = await cameraService.getLiveStreamUrl(cameraId);

// Get playback URL
const playback = await cameraService.getPlaybackUrl(
  cameraId, 
  startTime, 
  endTime
);
```

## Error Handling

### Common Scenarios
- **Authentication Failures**: Invalid credentials, expired tokens
- **Network Issues**: Connection timeouts, API unavailable
- **Camera Offline**: Device not responding, stream unavailable
- **Permission Errors**: Insufficient access rights

### User Feedback
- **Toast Notifications**: Success/error messages
- **Loading States**: Visual feedback during operations
- **Status Indicators**: Real-time camera status updates

## Testing

### HikConnectTest Component
A dedicated test component is available at `/src/components/admin/HikConnectTest.tsx` for:
- Testing authentication
- Verifying camera discovery
- Debugging API issues

### Usage
```typescript
import HikConnectTest from '@/components/admin/HikConnectTest';

// Add to admin routes for testing
<Route path="/admin/hik-connect-test" component={HikConnectTest} />
```

## Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:8080
```

### Backend Dependencies
- Backend must be running with Hik-Connect integration
- Database must include updated camera schema
- Network access to Hik-Connect APIs required

## Troubleshooting

### Common Issues

1. **Import Error: 'Sync' not found**
   - **Solution**: Use `RefreshCw` instead of `Sync` from lucide-react

2. **API Response Format Mismatch**
   - **Solution**: Handle both array and object responses in `loadData()`

3. **Stream Not Loading**
   - **Check**: Camera online status
   - **Verify**: Stream URL validity
   - **Ensure**: Browser supports video format

4. **Authentication Failures**
   - **Verify**: Correct Hik-Connect credentials
   - **Check**: Network connectivity
   - **Confirm**: Account is active

### Debug Steps
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Test with HikConnectTest component
4. Check network tab for failed requests
5. Verify backend logs for errors

## Future Enhancements

### Planned Features
- **Playback Viewer**: Timeline-based video playback
- **Motion Detection**: Real-time alerts and notifications
- **Camera Groups**: Organize cameras by location/type
- **Bulk Operations**: Mass camera management
- **Mobile Optimization**: Responsive design improvements

### Performance Optimizations
- **Stream Caching**: Reduce API calls for stream URLs
- **Lazy Loading**: Load camera data on demand
- **WebSocket Integration**: Real-time status updates
- **Image Thumbnails**: Preview images for cameras

## Security Considerations

### Best Practices
- **Credential Storage**: Never store passwords in localStorage
- **Token Management**: Automatic refresh and secure storage
- **HTTPS Only**: Ensure all API calls use HTTPS
- **Input Validation**: Sanitize all user inputs

### Access Control
- **Role-Based**: Admin-only access to camera management
- **Permission Checks**: Verify user permissions before operations
- **Audit Logging**: Track camera management actions