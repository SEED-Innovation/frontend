# Pagination and Status Update

## Overview
Added proper server-side pagination and included all backend recording statuses in the frontend.

## Changes Made

### Frontend Service (adminRecordingService.ts)

#### 1. Updated Status Type
Added all backend statuses to the TypeScript interface:
- `PENDING` - Recording request created
- `REQUESTING_CHUNKS` - Calling HikVision API
- `POLLING` - Polling HikVision for URLs
- `DOWNLOADING` - Downloading chunks
- `CONSOLIDATING` - Merging chunks
- `UPLOADING` - Uploading to S3
- `COMPLETED` - Successfully completed
- `FAILED` - Recording failed
- `CANCELLED` - Cancelled by admin
- Legacy statuses: `STARTING`, `RECORDING`, `PROCESSING`, `READY`, `ARCHIVED`

#### 2. Updated getAllRecordings Method
```typescript
async getAllRecordings(
  page: number = 0, 
  size: number = 20, 
  status?: string
): Promise<{
  content: MatchRecording[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}>
```

**Features:**
- Server-side pagination with page and size parameters
- Optional status filter
- Returns full Spring Data Page object with metadata
- Proper error handling and fallbacks

### Frontend Component (RecordingManagement.tsx)

#### 1. Pagination State
Added:
- `pageSize` - Number of items per page (default: 20)
- `totalElements` - Total number of recordings
- Proper page navigation

#### 2. Status Badges
Added badges for all statuses:
- **Pending/Starting**: Gray
- **Requesting/Recording**: Blue
- **Polling**: Indigo
- **Downloading**: Purple
- **Consolidating/Processing**: Yellow
- **Uploading**: Orange
- **Completed/Ready**: Green
- **Failed**: Red
- **Cancelled**: Orange
- **Archived**: Gray

#### 3. Status Filter Dropdown
Added all statuses to the filter:
- All Status
- Pending
- Requesting Chunks
- Recording
- Polling
- Downloading
- Consolidating
- Processing
- Uploading
- Completed
- Ready
- Failed
- Cancelled

#### 4. Enhanced Pagination Controls
- **First/Last buttons**: Jump to first or last page
- **Previous/Next buttons**: Navigate one page at a time
- **Page indicator**: Shows current page and total pages
- **Items counter**: Shows "Showing X to Y of Z recordings"
- **Page size selector**: Choose 10, 20, 50, or 100 items per page

#### 5. Cancel Button
Updated to show for all in-progress statuses:
- PENDING
- STARTING
- REQUESTING_CHUNKS
- RECORDING
- POLLING
- DOWNLOADING
- CONSOLIDATING
- PROCESSING
- UPLOADING

#### 6. Stats Calculation
Updated to properly count all status types:
- Groups similar statuses (e.g., RECORDING + REQUESTING_CHUNKS)
- Fetches all recordings for accurate stats (separate from paginated list)

## Usage

### Pagination
1. Use Previous/Next buttons to navigate pages
2. Use First/Last buttons to jump to start/end
3. Change page size from dropdown (10, 20, 50, 100)
4. Page resets to 0 when changing filters

### Filtering
1. Select status from dropdown
2. Backend filters results server-side
3. Pagination updates automatically
4. Search still works client-side on current page

### Performance
- Server-side pagination reduces data transfer
- Only loads current page of recordings
- Stats fetched separately with larger page size
- Efficient for large datasets

## API Endpoints

### Get Recordings (Paginated)
```
GET /api/admin/recordings/match?page=0&size=20&status=PROCESSING
```

**Query Parameters:**
- `page` (optional): Page number (0-indexed), default: 0
- `size` (optional): Page size, default: 20
- `status` (optional): Filter by status (uppercase)

**Response:**
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 5,
  "number": 0,
  "size": 20,
  "first": true,
  "last": false
}
```

## Benefits

1. **Performance**: Only loads necessary data
2. **Scalability**: Handles thousands of recordings
3. **User Experience**: Fast page loads, smooth navigation
4. **Flexibility**: Adjustable page size
5. **Completeness**: All backend statuses visible in UI
6. **Filtering**: Server-side status filtering
7. **Navigation**: Easy page jumping with First/Last buttons

## Notes

- Search is still client-side (only searches current page)
- Stats fetch all recordings for accuracy
- Page size preference could be saved to localStorage
- Filter changes reset to page 0 automatically
- All legacy statuses are supported for backward compatibility
