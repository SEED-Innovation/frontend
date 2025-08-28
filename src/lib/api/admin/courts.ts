import { CourtLite } from './types';

/**
 * TODO[BE-LINK][AdminCourtController.list]
 * Endpoint (placeholder): GET /admin/courts?projection=lite
 * Token: Authorization: Bearer <JWT>
 * Replace mock call with real service when backend is ready.
 */
export async function getCourtsLite(): Promise<CourtLite[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    { id: 1, name: 'Jeddah Central Court A' },
    { id: 2, name: 'Jeddah Corniche Court B' },
    { id: 3, name: 'Faisaliyah Court C' },
    { id: 4, name: 'King Fahd Court D' },
    { id: 5, name: 'Al-Andalus Court E' },
  ];
}