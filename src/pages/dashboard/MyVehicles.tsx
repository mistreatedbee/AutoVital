import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { fetchAccountVehicles, type VehicleSummary } from '../../services/vehicles';

export function MyVehicles() {
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;

    fetchAccountVehicles()
      .then((data) => {
        if (isMounted) {
          setVehicles(data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
        <Button variant="primary" icon={<PlusIcon className="w-4 h-4" />}>
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

      {loading ? (
        <p className="text-slate-500">Loading vehicles...</p>
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
                  variant={vehicle.status === 'optimal' ? 'accent' : 'warning'}
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
                    {vehicle.mileage ? `${vehicle.mileage} mi` : '—'}
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
                <Button variant="ghost" className="px-4">
                  Edit
                </Button>
              </div>
            </div>
          </Card>
        )}
        </div>
      )}
    </div>);

}