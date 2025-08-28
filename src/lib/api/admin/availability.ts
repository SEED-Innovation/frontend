import { AvailabilityRow, SetAvailabilityRequest, AvailabilityFilters } from './types';

/**
 * TODO[BE-LINK][AdminCourtAvailabilityController.list]
 * Endpoint (placeholder): GET /admin/courts/availability?courtId=&day=&page=&size=&sort=
 * Token: Authorization: Bearer <JWT>
 * Replace mock call with real service when backend is ready.
 */
export async function getAvailabilitiesMock(filters?: AvailabilityFilters): Promise<AvailabilityRow[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const mockData: AvailabilityRow[] = [
    { id: 1, courtId: 1, courtName: 'Jeddah Central Court A', dayOfWeek: 'MONDAY', start: '08:00:00', end: '18:00:00' },
    { id: 2, courtId: 2, courtName: 'Jeddah Corniche Court B', dayOfWeek: 'TUESDAY', start: '10:00:00', end: '22:00:00' },
    { id: 3, courtId: 3, courtName: 'Faisaliyah Court C', dayOfWeek: 'WEDNESDAY', start: '07:00:00', end: '19:00:00' },
    { id: 4, courtId: 1, courtName: 'Jeddah Central Court A', dayOfWeek: 'THURSDAY', start: '09:00:00', end: '21:00:00' },
    { id: 5, courtId: 4, courtName: 'King Fahd Court D', dayOfWeek: 'FRIDAY', start: '08:00:00', end: '18:00:00' },
    { id: 6, courtId: 2, courtName: 'Jeddah Corniche Court B', dayOfWeek: 'SATURDAY', start: '06:00:00', end: '20:00:00' },
    { id: 7, courtId: 5, courtName: 'Al-Andalus Court E', dayOfWeek: 'SUNDAY', start: '09:00:00', end: '17:00:00' },
    { id: 8, courtId: 3, courtName: 'Faisaliyah Court C', dayOfWeek: 'MONDAY', start: '14:00:00', end: '22:00:00' },
    { id: 9, courtId: 4, courtName: 'King Fahd Court D', dayOfWeek: 'TUESDAY', start: '10:00:00', end: '16:00:00' },
    { id: 10, courtId: 5, courtName: 'Al-Andalus Court E', dayOfWeek: 'WEDNESDAY', start: '12:00:00', end: '20:00:00' },
  ];

  // Apply client-side filtering for demo
  if (filters) {
    return mockData.filter(item => {
      if (filters.searchTerm && !item.courtName.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.dayOfWeek && filters.dayOfWeek !== 'ALL' && item.dayOfWeek !== filters.dayOfWeek) {
        return false;
      }
      return true;
    });
  }

  return mockData;
}

/**
 * TODO[BE-LINK][AdminCourtAvailabilityController.create]
 * Endpoint (placeholder): POST /admin/courts/{courtId}/availability
 * Token: Authorization: Bearer <JWT>
 * Replace mock call with real service when backend is ready.
 */
export async function createAvailabilityMock(data: SetAvailabilityRequest): Promise<AvailabilityRow> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate created availability
  return {
    id: Date.now(), // Mock ID
    courtId: data.courtId,
    courtName: `Court ${data.courtId}`, // Would be resolved by backend
    dayOfWeek: data.dayOfWeek,
    start: data.start,
    end: data.end,
  };
}

/**
 * TODO[BE-LINK][AdminCourtAvailabilityController.delete]
 * Endpoint (placeholder): DELETE /admin/courts/{courtId}/availability/{id}
 * Token: Authorization: Bearer <JWT>
 * Replace mock call with real service when backend is ready.
 */
export async function deleteAvailabilityMock(id: number): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  // no-op mock - real implementation would delete from backend
}

/**
 * TODO[BE-LINK][AdminCourtAvailabilityController.bulkDelete]
 * Endpoint (placeholder): DELETE /admin/courts/availability/bulk
 * Token: Authorization: Bearer <JWT>
 * Replace mock call with real service when backend is ready.
 */
export async function bulkDeleteAvailabilityMock(ids: number[]): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  // no-op mock - real implementation would bulk delete from backend
}