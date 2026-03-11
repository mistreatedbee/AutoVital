import { getInsforgeClient } from '../lib/insforgeClient';

export interface DocumentCard {
  id: string | number;
  name: string;
  type: string;
  size: string;
  date: string;
  vehicle: string;
}

const FALLBACK_DOCUMENTS: DocumentCard[] = [
  {
    id: 1,
    name: 'Geico Insurance Policy 2024.pdf',
    type: 'Insurance',
    size: '2.4 MB',
    date: 'Oct 05, 2023',
    vehicle: 'All',
  },
  {
    id: 2,
    name: 'Tesla_Purchase_Agreement.pdf',
    type: 'Registration',
    size: '4.1 MB',
    date: 'Jan 12, 2022',
    vehicle: 'Tesla Model 3',
  },
  {
    id: 3,
    name: 'Brake_Repair_Invoice.jpg',
    type: 'Receipt',
    size: '1.2 MB',
    date: 'Aug 15, 2023',
    vehicle: 'Ford F-150',
  },
  {
    id: 4,
    name: 'State_Inspection_2023.pdf',
    type: 'Inspection',
    size: '0.8 MB',
    date: 'Nov 20, 2022',
    vehicle: 'Tesla Model 3',
  },
];

export async function fetchAccountDocuments(
  accountId: string | null,
): Promise<DocumentCard[]> {
  if (!accountId) {
    return FALLBACK_DOCUMENTS;
  }

  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('documents')
      .select('id, name, type, size_bytes, created_at, vehicles(make, model)')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load documents from backend, using fallback.', error);
      return FALLBACK_DOCUMENTS;
    }

    return (data as any[]).map((row) => {
      const vehicleName =
        row.vehicles?.make && row.vehicles?.model
          ? row.vehicles.make + ' ' + row.vehicles.model
          : 'All';

      const size =
        row.size_bytes != null
          ? `${(Number(row.size_bytes) / (1024 * 1024)).toFixed(1)} MB`
          : '—';

      return {
        id: row.id,
        name: row.name,
        type: row.type,
        size,
        date: row.created_at,
        vehicle: vehicleName,
      } as DocumentCard;
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Documents service unavailable, using fallback.', err);
    return FALLBACK_DOCUMENTS;
  }
}

