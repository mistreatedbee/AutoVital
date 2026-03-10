import { getInsforgeClient } from '../lib/insforgeClient';

export interface FuelLogEntry {
  id: string | number;
  date: string;
  vehicle: string;
  gallons: string;
  cost: string;
  ppg: string;
  mileage: string;
}

export interface EfficiencyPoint {
  date: string;
  mpg: number;
}

const FALLBACK_EFFICIENCY: EfficiencyPoint[] = [
  { date: 'Oct 01', mpg: 28.5 },
  { date: 'Oct 08', mpg: 29.1 },
  { date: 'Oct 15', mpg: 27.8 },
  { date: 'Oct 22', mpg: 28.9 },
  { date: 'Oct 29', mpg: 30.2 },
  { date: 'Nov 05', mpg: 29.5 },
];

const FALLBACK_FUEL_LOGS: FuelLogEntry[] = [
  {
    id: 1,
    date: '2023-11-05',
    vehicle: 'Honda Civic',
    gallons: '10.5',
    cost: '$45.20',
    ppg: '$4.30',
    mileage: '68,200',
  },
  {
    id: 2,
    date: '2023-10-29',
    vehicle: 'Honda Civic',
    gallons: '11.2',
    cost: '$48.16',
    ppg: '$4.30',
    mileage: '67,880',
  },
  {
    id: 3,
    date: '2023-10-22',
    vehicle: 'Honda Civic',
    gallons: '9.8',
    cost: '$43.61',
    ppg: '$4.45',
    mileage: '67,560',
  },
];

export async function fetchFuelEfficiency(): Promise<EfficiencyPoint[]> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('fuel_logs')
      .select('fill_date, volume, total_cost_cents, odometer')
      .order('fill_date', { ascending: true });

    if (error || !data || data.length < 2) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load fuel efficiency from backend, using fallback.', error);
      return FALLBACK_EFFICIENCY;
    }

    // Very simple MPG approximation using consecutive fill-ups.
    const points: EfficiencyPoint[] = [];
    const rows = data as any[];
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1];
      const curr = rows[i];
      if (prev.odometer == null || curr.odometer == null || curr.volume == null) continue;
      const miles = Number(curr.odometer) - Number(prev.odometer);
      const gallons = Number(curr.volume);
      if (miles > 0 && gallons > 0) {
        points.push({
          date: curr.fill_date,
          mpg: Number((miles / gallons).toFixed(1)),
        });
      }
    }

    return points.length ? points : FALLBACK_EFFICIENCY;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Fuel efficiency service unavailable, using fallback.', err);
    return FALLBACK_EFFICIENCY;
  }
}

export async function fetchFuelLogs(): Promise<FuelLogEntry[]> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('fuel_logs')
      .select('id, fill_date, odometer, volume, total_cost_cents, currency, vehicles(make, model)')
      .order('fill_date', { ascending: false });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load fuel logs from backend, using fallback.', error);
      return FALLBACK_FUEL_LOGS;
    }

    return (data as any[]).map((row) => {
      const vehicleName =
        row.vehicles?.make && row.vehicles?.model
          ? `${row.vehicles.make} ${row.vehicles.model}`
          : 'Vehicle';
      const gallons = row.volume != null ? String(row.volume) : '0';
      const totalCost =
        row.total_cost_cents != null
          ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: row.currency ?? 'USD',
          }).format(row.total_cost_cents / 100)
          : '$0.00';
      const ppg =
        row.volume && row.total_cost_cents
          ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: row.currency ?? 'USD',
          }).format(row.total_cost_cents / 100 / Number(row.volume))
          : '$0.00';
      const mileage =
        row.odometer != null ? Number(row.odometer).toLocaleString() : '0';

      return {
        id: row.id,
        date: row.fill_date,
        vehicle: vehicleName,
        gallons,
        cost: totalCost,
        ppg,
        mileage,
      };
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Fuel logs service unavailable, using fallback.', err);
    return FALLBACK_FUEL_LOGS;
  }
}

