import { computeVehicleHealthScore } from '../vehicleHealth';
import type { Vehicle } from '../../domain/models';

function makeVehicle(overrides: Partial<Vehicle>): Vehicle {
  return {
    id: 'v1',
    accountId: 'a1',
    ownerUserId: 'u1',
    nickname: null,
    make: 'Test',
    model: 'Car',
    year: 2020,
    vin: null,
    licensePlate: null,
    fuelType: 'gasoline',
    currentMileage: 10_000,
    healthScore: null,
    heroImageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archivedAt: null,
    ...overrides,
  };
}

describe('computeVehicleHealthScore', () => {
  it('keeps high score for new low-mileage vehicle', () => {
    const v = makeVehicle({ year: new Date().getFullYear(), currentMileage: 5_000 });
    const score = computeVehicleHealthScore({
      vehicle: v,
      latestSnapshot: null,
      lastServiceDate: new Date().toISOString(),
    });
    expect(score).toBeGreaterThanOrEqual(80);
  });

  it('reduces score for very old, high-mileage vehicle', () => {
    const v = makeVehicle({ year: 2000, currentMileage: 220_000 });
    const score = computeVehicleHealthScore({
      vehicle: v,
      latestSnapshot: null,
      lastServiceDate: null,
    });
    expect(score).toBeLessThanOrEqual(50);
  });

  it('reduces score when service is overdue', () => {
    const v = makeVehicle({});
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const score = computeVehicleHealthScore({
      vehicle: v,
      latestSnapshot: null,
      lastServiceDate: twoYearsAgo.toISOString(),
    });
    expect(score).toBeLessThan(100);
  });
});

