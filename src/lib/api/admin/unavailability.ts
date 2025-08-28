import { UnavailabilityRow, SetUnavailabilityRequest, UnavailabilityFilters } from './types';

/**
 * TODO[BE-LINK][AdminCourtUnavailabilityController.list]
 * Endpoint (placeholder): GET /admin/courts/unavailability?courtId=&day=&page=&size=&sort=
 * Token: Authorization: Bearer <JWT>
 * Replace mock call with real service when backend is ready.
 */
export async function getUnavailabilitiesMock(filters?: UnavailabilityFilters): Promise<UnavailabilityRow[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const mockData: UnavailabilityRow[] = [
    { 
      id: 101, 
      courtId: 2, 
      courtName: 'Jeddah Corniche Court B', 
      date: '2025-08-22'
    },
    { 
      id: 102, 
      courtId: 1, 
      courtName: 'Jeddah Central Court A', 
      date: '2025-08-25'
    },
    { 
      id: 103, 
      courtId: 3, 
      courtName: 'Faisaliyah Court C', 
      date: '2025-08-28'
    },
    { 
      id: 104, 
      courtId: 4, 
      courtName: 'King Fahd Court D', 
      date: '2025-08-30'
    },
  ];

  // Apply client-side filtering for demo
  if (filters) {
    return mockData.filter(item => {
      if (filters.searchTerm && !item.courtName.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      // Date filtering can be added here if needed
      return true;
    });
  }

  return mockData;
}

/**
 * TODO[BE-LINK][AdminCourtUnavailabilityController.create]
 * Endpoint (placeholder): POST /admin/courts/{courtId}/unavailability
 * Token: Authorization: Bearer <JWT>
 * Replace mock call with real service when backend is ready.
 */
export async function createUnavailabilityMock(data: SetUnavailabilityRequest): Promise<UnavailabilityRow> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate created unavailability
  return {
    id: Date.now(), // Mock ID
    courtId: data.courtId,
    courtName: `Court ${data.courtId}`, // Would be resolved by backend
    date: data.date,
  };
}

/**
 * TODO[BE-LINK][AdminCourtUnavailabilityController.delete]
 * Endpoint (placeholder): DELETE /admin/courts/{courtId}/unavailability/{id}
 * Token: Authorization: Bearer <JWT>
 * Replace mock call with real service when backend is ready.
 */
export async function deleteUnavailabilityMock(id: number): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  // no-op mock - real implementation would delete from backend
}

/**
 * TODO[BE-LINK][AdminCourtUnavailabilityController.bulkDelete]
 * Endpoint (placeholder): DELETE /admin/courts/unavailability/bulk
 * Token: Authorization: Bearer <JWT>
 * Replace mock call with real service when backend is ready.
 */
export async function bulkDeleteUnavailabilityMock(ids: number[]): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  // no-op mock - real implementation would bulk delete from backend
}