import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, SearchIcon, FilterIcon, CarIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useVehicles, useArchiveVehicle } from '../../hooks/queries';
import { useAccount } from '../../account/AccountProvider';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { MyVehiclesSkeleton } from '../../components/states/pageSkeletons';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export function MyVehicles() {
  const { accountId, loading: accountLoading } = useAccount();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: vehiclesResult, isLoading, isError, error, refetch } = useVehicles(accountId);
  const vehicles = vehiclesResult?.items ?? [];
  const archiveMutation = useArchiveVehicle(accountId);
  const [vehicleToArchive, setVehicleToArchive] = useState<string | null>(null);

  const handleArchive = (vehicleId: string) => {
    setVehicleToArchive(vehicleId);
  };

  const filtered = vehicles.filter((vehicle) => {
    const term = search.toLowerCase();
    return (
      !term ||
      vehicle.name.toLowerCase().includes(term) ||
      (vehicle.year?.toString().includes(term) ?? false)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            My Vehicles
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your garage and view vehicle details.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<PlusIcon className="w-4 h-4" />}
          onClick={() => navigate('/dashboard/vehicles/new')}>
          Add Vehicle
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search vehicles by make, model, or year..."
            icon={<SearchIcon className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)} />

        </div>
        <Button variant="secondary" icon={<FilterIcon className="w-4 h-4" />}>
          Filters
        </Button>
      </div>

      {accountLoading || isLoading ? (
        <MyVehiclesSkeleton />
      ) : isError ? (
        <div className="rounded-2xl border border-border bg-cardToken p-6">
          <ErrorState
            title="Failed to load vehicles"
            description={error instanceof Error ? error.message : 'Unable to load your vehicles.'}
            onRetry={() => refetch()}
          />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="rounded-2xl border border-border bg-cardToken p-12">
          <EmptyState
            icon={<CarIcon className="w-16 h-16" />}
            title="No vehicles yet"
            description="Add your first vehicle to start tracking maintenance, fuel, and documents."
            action={
              <Button
                variant="primary"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={() => navigate('/dashboard/vehicles/new')}>
                Add Vehicle
              </Button>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-cardToken p-12">
          <EmptyState
            icon={<SearchIcon className="w-16 h-16" />}
            title="No matching vehicles"
            description="Try adjusting your search to find what you're looking for."
            action={
              <Button variant="secondary" onClick={() => setSearch('')}>
                Clear search
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((vehicle) =>
        <Card
          key={vehicle.id}
          hover
          className="overflow-hidden flex flex-col h-full">

            <div className="h-48 relative">
              {vehicle.imageUrl ? (
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm">
                  No photo
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <h3 className="text-xl font-bold text-white font-heading">
                  {vehicle.name}
                </h3>
                <Badge
                  variant={
                    vehicle.status === 'optimal'
                      ? 'success'
                      : vehicle.status === 'critical'
                        ? 'critical'
                        : 'warning'
                  }
                  className="shadow-sm backdrop-blur-md bg-white/90">

                  {vehicle.health != null ? `${vehicle.health}% Health` : 'Health N/A'}
                </Badge>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                    Year
                  </p>
                  <p className="font-medium text-slate-900">
                    {vehicle.year ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                    Mileage
                  </p>
                  <p className="font-medium text-slate-900">
                    {vehicle.mileage != null ? `${Number(vehicle.mileage).toLocaleString()} km` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                    Engine
                  </p>
                  <p className="font-medium text-slate-900">{vehicle.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                    Next Service
                  </p>
                  <p
                  className={`font-medium ${vehicle.status === 'warning' ? 'text-amber-600' : 'text-slate-900'} truncate`}
                  title={vehicle.nextService ?? undefined}>

                    {vehicle.nextService ?? 'No upcoming service'}
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3">
                <Link to={`/dashboard/vehicles/${vehicle.id}`} className="flex-1">
                  <Button variant="secondary" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="px-4"
                  onClick={() => navigate(`/dashboard/vehicles/${vehicle.id}/edit`)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  className="px-4 text-red-600"
                  disabled={archiveMutation.isPending && archiveMutation.variables === vehicle.id}
                  onClick={() => handleArchive(vehicle.id)}>
                  {archiveMutation.isPending && archiveMutation.variables === vehicle.id
                    ? 'Archiving…'
                    : 'Archive'}
                </Button>
              </div>
            </div>
          </Card>
        )}
        </div>
      )}

      <ConfirmDialog
        open={vehicleToArchive != null}
        onOpenChange={(open) => !open && setVehicleToArchive(null)}
        title="Archive vehicle?"
        description="This will hide the vehicle from your garage but keep its history for reporting. You can restore it later from admin tools."
        confirmLabel="Archive vehicle"
        variant="destructive"
        loading={archiveMutation.isPending}
        onConfirm={() => {
          if (!vehicleToArchive) return;
          archiveMutation.mutate(vehicleToArchive, {
            onSettled: () => setVehicleToArchive(null),
          });
        }}
      />
    </div>);

}