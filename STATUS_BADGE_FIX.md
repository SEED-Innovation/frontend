# Status Badge Display Fix

## Issue
Some recording statuses were not displaying properly in the Recording Management table.

## Root Cause
When a status from the backend didn't match any key in the `statusConfig` object, the `getStatusBadge` function returned `null`, causing nothing to be displayed in the Status column.

## Solution

### 1. Added Fallback for Unknown Statuses
Updated `getStatusBadge()` to show a gray badge with the actual status text when an unknown status is encountered:

```typescript
if (!config) {
  return (
    <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {status || 'Unknown'}
    </Badge>
  );
}
```

### 2. Added Debug Logging
Added console logging to show which statuses are being received from the API:

```typescript
const uniqueStatuses = [...new Set(response.content.map(r => r.status))];
console.log('Unique recording statuses:', uniqueStatuses);
```

### 3. Complete Status Badge Configuration

All backend statuses are now configured:

| Status | Color | Icon | Label |
|--------|-------|------|-------|
| PENDING | Gray | Clock | Pending |
| STARTING | Gray | Clock | Starting |
| REQUESTING_CHUNKS | Blue | RefreshCw | Requesting |
| RECORDING | Blue | Video | Recording |
| POLLING | Indigo | Clock | Polling |
| DOWNLOADING | Purple | Download | Downloading |
| CONSOLIDATING | Yellow | RefreshCw | Consolidating |
| PROCESSING | Yellow | RefreshCw | Processing |
| UPLOADING | Orange | RefreshCw | Uploading |
| COMPLETED | Green | CheckCircle | Completed |
| READY | Green | CheckCircle | Ready |
| FAILED | Red | XCircle | Failed |
| CANCELLED | Orange | XCircle | Cancelled |
| ARCHIVED | Gray | CheckCircle | Archived |

## Debugging

### Check Browser Console
Open browser console and look for:
```
Unique recording statuses: ['PROCESSING', 'FAILED', 'READY']
```

This will show you exactly which statuses are coming from the backend.

### Common Issues

1. **Status Case Mismatch**
   - Backend sends: `processing`
   - Frontend expects: `PROCESSING`
   - Solution: Backend should send uppercase status values

2. **New Status Added to Backend**
   - If a new status is added to `RecordingStatus.java`, it must be added to:
     - Frontend TypeScript type definition
     - `statusConfig` object in `getStatusBadge()`
     - Status filter dropdown

3. **Legacy Status Values**
   - Some recordings might have old status values
   - Fallback badge will display them with AlertCircle icon

## Testing

1. **View All Statuses**
   - Select "All Status" from filter
   - Check console for unique statuses
   - Verify all recordings show a status badge

2. **Filter by Status**
   - Try each status filter
   - Verify recordings are filtered correctly
   - Check that badges match the filter

3. **Unknown Status**
   - If you see a gray badge with AlertCircle
   - Check the status text displayed
   - Add it to `statusConfig` if it's a valid status

## Future Improvements

1. **Backend Status Validation**
   - Ensure backend only sends valid enum values
   - Add validation in DTO mapper

2. **Status Grouping**
   - Group similar statuses in UI (e.g., "In Progress" for all processing states)
   - Add status categories

3. **Status History**
   - Track status changes over time
   - Show status transition timeline

4. **Real-time Updates**
   - WebSocket or polling for status updates
   - Auto-refresh when status changes
