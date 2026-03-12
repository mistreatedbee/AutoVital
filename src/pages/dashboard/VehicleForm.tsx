import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAccount } from '../../account/AccountProvider';
import { useAuth } from '../../auth/AuthProvider';
import { LoadingState } from '../../components/states/LoadingState';
import { fetchVehicleDetails } from '../../services/vehicles';
import { uploadVehicleImageFile } from '../../services/vehicleImageUpload';
import { useUpsertVehicle } from '../../hooks/queries';
import { validateYear, validateOdometerKm } from '../../lib/validation';

type VehicleFormMode = 'create' | 'edit';

interface VehicleFormProps {
  mode: VehicleFormMode;
}

export function VehicleForm({ mode }: VehicleFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { accountId } = useAccount();
  const { user } = useAuth();
  const upsertMutation = useUpsertVehicle(accountId);

  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nickname, setNickname] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<string>('');
  const [vin, setVin] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [fuelType, setFuelType] = useState<string>('');
  const [currentMileage, setCurrentMileage] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (mode === 'edit' && accountId && id) {
      let isMounted = true;
      setLoading(true);
      fetchVehicleDetails(accountId, id)
        .then((details) => {
          if (!isMounted || !details) return;
          const v = details.vehicle;
          setNickname(v.nickname ?? '');
          setMake(v.make);
          setModel(v.model);
          setYear(v.year != null ? String(v.year) : '');
          setVin(v.vin ?? '');
          setLicensePlate(v.licensePlate ?? '');
          setFuelType(v.fuelType ?? '');
          setCurrentMileage(v.currentMileage != null ? String(v.currentMileage) : '');
        })
        .catch((err: any) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load vehicle for editing', err);
          setError('Unable to load vehicle details.');
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [mode, accountId, id]);

  if (!accountId || !user) {
    return <LoadingState label="Loading account..." />;
  }

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!make.trim() || !model.trim()) {
        setError('Make and model are required.');
        setSaving(false);
        return;
      }

      if (year) {
        const yearError = validateYear(year);
        if (yearError) {
          setError(yearError);
          setSaving(false);
          return;
        }
      }

      if (currentMileage) {
        const mileageError = validateOdometerKm(currentMileage);
        if (mileageError) {
          setError(mileageError);
          setSaving(false);
          return;
        }
      }

      const vehicleWithHealth = await upsertMutation.mutateAsync({
        id: mode === 'edit' ? id : undefined,
        accountId: accountId!,
        ownerUserId: user.id,
        nickname: nickname.trim() || null,
        make: make.trim(),
        model: model.trim(),
        year: year ? Number(year) : null,
        vin: vin.trim() || null,
        licensePlate: licensePlate.trim() || null,
        fuelType: fuelType || null,
        currentMileage: currentMileage ? Number(currentMileage.replace(/,/g, '')) : null,
      });

      if (!vehicleWithHealth) {
        setError('Unable to save vehicle. Please try again.');
        setSaving(false);
        return;
      }

      if (imageFile) {
        await uploadVehicleImageFile({
          accountId,
          vehicleId: vehicleWithHealth.id,
          file: imageFile,
        });
      }

      navigate(`/dashboard/vehicles/${vehicleWithHealth.id}`);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Vehicle save failed', err);
      setError(err?.message ?? 'Unable to save vehicle.');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            {mode === 'create' ? 'Add Vehicle' : 'Edit Vehicle'}
          </h1>
          <p className="text-slate-500 mt-1">
            {mode === 'create'
              ? 'Add a new vehicle to your garage.'
              : 'Update details for this vehicle.'}
          </p>
        </div>
      </div>

      <Card className="p-6 max-w-3xl">
        {loading ? (
          <LoadingState label="Loading vehicle..." />
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-red-50 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nickname"
                placeholder="Family SUV"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <Input
                label="Make"
                placeholder="Toyota"
                required
                value={make}
                onChange={(e) => setMake(e.target.value)}
              />
              <Input
                label="Model"
                placeholder="RAV4"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
              <Input
                label="Year"
                type="number"
                placeholder="2020"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
              <Input
                label="VIN"
                placeholder="Optional"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
              />
              <Input
                label="License Plate"
                placeholder="ABC-1234"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fuel Type
                </label>
                <select
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}>
                  <option value="">Select fuel type</option>
                  <option value="gasoline">Gasoline</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input
                label="Current Mileage"
                type="number"
                placeholder="24500"
                value={currentMileage}
                onChange={(e) => setCurrentMileage(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Vehicle Photo (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setImageFile(file);
                }}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-slate-200 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/dashboard/vehicles')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={saving || upsertMutation.isPending}>
                {mode === 'create' ? 'Add Vehicle' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

