import { getInsforgeClient } from '../lib/insforgeClient';
import type { Vehicle } from '../domain/models';

interface VehicleSummary {
  id: string;
  name: string;
  year: number | null;
  mileage: string | null;
  type: string | null;
  health: number | null;
  nextService: string | null;
  imageUrl: string | null;
  status: 'optimal' | 'warning' | 'unknown';
}

const FALLBACK_VEHICLES: VehicleSummary[] = [
  {
    id: '1',
    name: 'Tesla Model 3',
    year: 2022,
    mileage: '24,500',
    type: 'Electric',
    health: 98,
    nextService: 'Tire Rotation (in 500 mi)',
    imageUrl:
      'https://images.unsplash.com/photo-1561580125-028ee3bd62eb?q=80&w=800&auto=format&fit=crop',
    status: 'optimal',
  },
  {
    id: '2',
    name: 'Honda Civic',
    year: 2018,
    mileage: '68,200',
    type: 'Gasoline',
    health: 82,
    nextService: 'Oil Change (Due Now)',
    imageUrl:
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop',
    status: 'warning',
  },
  {
    id: '3',
    name: 'Ford F-150',
    year: 2020,
    mileage: '45,100',
    type: 'Gasoline',
    health: 95,
    nextService: 'Brake Inspection (in 2,000 mi)',
    imageUrl:
      'https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=800&auto=format&fit=crop',
    status: 'optimal',
  },
];

export type { VehicleSummary };

export async function fetchAccountVehicles(): Promise<VehicleSummary[]> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('vehicles')
      .select('id, make, model, year, current_mileage, fuel_type, health_score')
      .order('created_at', { ascending: false });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load vehicles from backend, using fallback data.', error);
      return FALLBACK_VEHICLES;
    }

    return (data as Vehicle[]).map((v) => {
      const mileageNumber = v.current_mileage ?? null;
      const mileage = mileageNumber != null ? mileageNumber.toLocaleString() : null;

      return {
        id: v.id,
        name: `${v.year ?? ''} ${v.make} ${v.model}`.trim(),
        year: v.year ?? null,
        mileage,
        type: v.fuel_type ?? null,
        health: v.health_score ?? null,
        nextService: null,
        imageUrl: null,
        status:
          v.health_score != null
            ? v.health_score >= 90
              ? 'optimal'
              : v.health_score >= 80
                ? 'warning'
                : 'unknown'
            : 'unknown',
      };
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Vehicles service unavailable, using fallback data.', err);
    return FALLBACK_VEHICLES;
  }
}

