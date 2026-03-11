export interface DocumentCard {
  id: string | number;
  name: string;
  type: string;
  size: string;
  date: string;
  vehicle: string;
  url: string | null;
  mimeType: string | null;
  expiresAt: string | null;
}

export interface DocumentCardDbRow {
  id: string;
  name: string;
  type: string;
  size_bytes?: number | null;
  created_at: string;
  public_url?: string | null;
  mime_type?: string | null;
  expires_at?: string | null;
  vehicles?: { make?: string; model?: string } | null;
}

export function rowToDocumentCard(
  row: DocumentCardDbRow,
  vehicleOverride?: string,
): DocumentCard {
  const vehicleName =
    vehicleOverride !== undefined
      ? vehicleOverride
      : row.vehicles?.make && row.vehicles?.model
        ? `${row.vehicles.make} ${row.vehicles.model}`
        : row.vehicles
          ? 'Vehicle'
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
    url: row.public_url ?? null,
    mimeType: row.mime_type ?? null,
    expiresAt: row.expires_at ?? null,
  };
}
