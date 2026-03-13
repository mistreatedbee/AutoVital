import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CarIcon,
  UserIcon,
  BellIcon,
  WrenchIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../auth/AuthProvider';
import { useAccount } from '../../account/AccountProvider';
import { LoadingState } from '../../components/states/LoadingState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { fetchCurrentProfile, updateProfile } from '../../services/profile';
import { uploadAvatarFile } from '../../services/avatarUpload';
import { upsertVehicle } from '../../services/vehicles';
import { uploadVehicleImageFile } from '../../services/vehicleImageUpload';
import { recomputeAndPersistVehicleHealth } from '../../services/vehicleHealth';
import { upsertServicePreferences } from '../../services/servicePreferences';
import { upsertAlertPreference } from '../../services/alerts';
import {
  fetchOnboardingProgress,
  upsertOnboardingProgress,
  completeOnboarding,
  resetOnboardingProgress,
  type OnboardingStepData,
} from '../../services/onboarding';
import { recordOnboardingEvent } from '../../services/onboardingAnalytics';
import { validateYear, validateOdometerKm } from '../../lib/validation';
import { queryKeys } from '../../lib/queryKeys';

const COMMON_MAKES = [
  'Toyota', 'Ford', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Honda', 'Nissan',
  'Hyundai', 'Kia', 'Mazda', 'Audi', 'Chevrolet', 'Renault', 'Peugeot',
  'Isuzu', 'Suzuki', 'Datsun', 'Lexus', 'Volvo', 'Land Rover', 'Other',
];

const TIMEZONES = [
  'Africa/Johannesburg',
  'Africa/Cairo',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Singapore',
  'Australia/Sydney',
];

const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'af', label: 'Afrikaans' },
  { value: 'zu', label: 'Zulu' },
  { value: 'xh', label: 'Xhosa' },
];

const LEAD_DAY_OPTIONS = [
  { value: 30, label: '30 days before' },
  { value: 14, label: '14 days before' },
  { value: 7, label: '7 days before' },
  { value: 0, label: 'Due date' },
];

const STEPS = [
  { id: 1, title: 'Profile', icon: UserIcon },
  { id: 2, title: 'Vehicle', icon: CarIcon },
  { id: 3, title: 'Service baseline', icon: WrenchIcon },
  { id: 4, title: 'Reminders', icon: BellIcon },
  { id: 5, title: 'Complete', icon: CheckCircle2Icon },
];

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  return Promise.race<T>([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
  ]);
}

type FieldErrors = Record<string, string>;

export function OnboardingFlow() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { accountId, refresh: refreshAccount } = useAccount();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('ZA');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [currency, setCurrency] = useState('ZAR');
  const [mileageUnit, setMileageUnit] = useState('km');
  const [fuelUnit, setFuelUnit] = useState('litres');
  const [timezone, setTimezone] = useState('Africa/Johannesburg');
  const [locale, setLocale] = useState('en');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);

  // Vehicle state
  const [vehicleSkipped, setVehicleSkipped] = useState(false);
  const [nickname, setNickname] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [registration, setRegistration] = useState('');
  const [vin, setVin] = useState('');
  const [currentMileage, setCurrentMileage] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [engineType, setEngineType] = useState('');
  const [color, setColor] = useState('');
  const [vehicleImageFile, setVehicleImageFile] = useState<File | null>(null);

  // Service baseline state
  const [lastServiceDate, setLastServiceDate] = useState('');
  const [lastServiceMileage, setLastServiceMileage] = useState('');
  const [serviceIntervalMonths, setServiceIntervalMonths] = useState('');
  const [serviceIntervalMileage, setServiceIntervalMileage] = useState('');
  const [expandedServiceDetails, setExpandedServiceDetails] = useState(false);
  const [lastOilChangeDate, setLastOilChangeDate] = useState('');
  const [lastOilChangeMileage, setLastOilChangeMileage] = useState('');
  const [lastBrakeServiceDate, setLastBrakeServiceDate] = useState('');
  const [lastBatteryDate, setLastBatteryDate] = useState('');
  const [lastTireRotationDate, setLastTireRotationDate] = useState('');
  const [knownIssues, setKnownIssues] = useState('');
  const [workshopName, setWorkshopName] = useState('');

  // Reminders state
  const [emailReminders, setEmailReminders] = useState(true);
  const [inAppReminders, setInAppReminders] = useState(true);
  const [leadDays, setLeadDays] = useState<number[]>([14, 7, 0]);
  const [reminderBasis, setReminderBasis] = useState<'time' | 'mileage' | 'both'>('both');
  const [weeklySummary, setWeeklySummary] = useState(false);

  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const stepDataRef = useRef<OnboardingStepData>({});
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | HTMLInputElement | HTMLSelectElement | null>>({});

  const registerFieldRef = useCallback(
    (field: string) => (node: HTMLElement | HTMLInputElement | HTMLSelectElement | null) => {
      fieldRefs.current[field] = node;
    },
    [],
  );

  const focusFirstInvalidField = useCallback((errors: FieldErrors) => {
    const [firstField] = Object.keys(errors);
    if (!firstField) return;
    const target = fieldRefs.current[firstField];
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if ('focus' in target) {
      target.focus();
    }
  }, []);

  const applyFieldErrors = useCallback(
    (errors: FieldErrors, fallbackMessage?: string | null) => {
      setFieldErrors(errors);
      setError(fallbackMessage ?? null);
      if (Object.keys(errors).length > 0) {
        focusFirstInvalidField(errors);
      }
    },
    [focusFirstInvalidField],
  );

  const loadInitialData = useCallback(async () => {
    if (!user?.id) {
      setInitializing(false);
      return;
    }
    setInitializing(true);
    try {
      const [progress, profile] = await Promise.all([
        withTimeout(fetchOnboardingProgress(user.id), 10000, null),
        withTimeout(fetchCurrentProfile(user.id), 10000, null),
      ]);
      if (!progress && user?.id) {
        recordOnboardingEvent(user.id, 'started', 1);
      }
      if (profile) {
        setDisplayName(profile.displayName ?? '');
        setCountry(profile.country ?? 'ZA');
        setCity(profile.city ?? '');
        setProvince(profile.province ?? '');
        setPostalCode(profile.postalCode ?? '');
        setCurrency(profile.currency ?? 'ZAR');
        setMileageUnit(profile.mileageUnit ?? 'km');
        setFuelUnit(profile.fuelUnit ?? 'litres');
        setTimezone(profile.timezone ?? 'Africa/Johannesburg');
        setLocale(profile.locale ?? 'en');
        setAvatarUrl(profile.avatarUrl ?? null);
      }
      if (progress) {
        setStep(Math.min(progress.currentStep, 5));
        setVehicleSkipped(progress.currentStep > 2 && !progress.vehicleAdded);
        const stepData = progress.stepData;
        if (stepData) {
          const sd1 = stepData[1 as keyof OnboardingStepData];
          const sd2 = stepData[2 as keyof OnboardingStepData];
          const sd3 = stepData[3 as keyof OnboardingStepData];
          const sd4 = stepData[4 as keyof OnboardingStepData];
          if (sd1 && typeof sd1 === 'object') {
            if (sd1.displayName != null) setDisplayName(String(sd1.displayName));
            if (sd1.country != null) setCountry(String(sd1.country));
            if (sd1.city != null) setCity(String(sd1.city));
            if (sd1.province != null) setProvince(String(sd1.province));
            if (sd1.postalCode != null) setPostalCode(String(sd1.postalCode));
            if (sd1.currency != null) setCurrency(String(sd1.currency));
            if (sd1.mileageUnit != null) setMileageUnit(String(sd1.mileageUnit));
            if (sd1.fuelUnit != null) setFuelUnit(String(sd1.fuelUnit));
            if (sd1.timezone != null) setTimezone(String(sd1.timezone));
            if (sd1.locale != null) setLocale(String(sd1.locale));
          }
          if (sd2 && typeof sd2 === 'object') {
            if (sd2.nickname != null) setNickname(String(sd2.nickname));
            if (sd2.make != null) setMake(String(sd2.make));
            if (sd2.model != null) setModel(String(sd2.model));
            if (sd2.year != null) setYear(String(sd2.year));
            if (sd2.registration != null) setRegistration(String(sd2.registration));
            if (sd2.vin != null) setVin(String(sd2.vin));
            if (sd2.currentMileage != null) setCurrentMileage(String(sd2.currentMileage));
            if (sd2.fuelType != null) setFuelType(String(sd2.fuelType));
            if (sd2.transmission != null) setTransmission(String(sd2.transmission));
            if (sd2.engineType != null) setEngineType(String(sd2.engineType));
            if (sd2.color != null) setColor(String(sd2.color));
          }
          if (sd3 && typeof sd3 === 'object') {
            if (sd3.lastServiceDate != null) setLastServiceDate(String(sd3.lastServiceDate));
            if (sd3.lastServiceMileage != null) setLastServiceMileage(String(sd3.lastServiceMileage));
            if (sd3.serviceIntervalMonths != null) setServiceIntervalMonths(String(sd3.serviceIntervalMonths));
            if (sd3.serviceIntervalMileage != null) setServiceIntervalMileage(String(sd3.serviceIntervalMileage));
            if (sd3.lastOilChangeDate != null) setLastOilChangeDate(String(sd3.lastOilChangeDate));
            if (sd3.lastOilChangeMileage != null) setLastOilChangeMileage(String(sd3.lastOilChangeMileage));
            if (sd3.lastBrakeServiceDate != null) setLastBrakeServiceDate(String(sd3.lastBrakeServiceDate));
            if (sd3.lastBatteryDate != null) setLastBatteryDate(String(sd3.lastBatteryDate));
            if (sd3.lastTireRotationDate != null) setLastTireRotationDate(String(sd3.lastTireRotationDate));
            if (sd3.knownIssues != null) setKnownIssues(String(sd3.knownIssues));
            if (sd3.workshopName != null) setWorkshopName(String(sd3.workshopName));
          }
          if (sd4 && typeof sd4 === 'object') {
            if (sd4.emailReminders != null) setEmailReminders(Boolean(sd4.emailReminders));
            if (sd4.inAppReminders != null) setInAppReminders(Boolean(sd4.inAppReminders));
            if (Array.isArray(sd4.leadDays)) setLeadDays(sd4.leadDays.map(Number));
            if (sd4.reminderBasis != null) setReminderBasis(String(sd4.reminderBasis) as 'time' | 'mileage' | 'both');
            if (sd4.weeklySummary != null) setWeeklySummary(Boolean(sd4.weeklySummary));
          }
        }
        stepDataRef.current = progress?.stepData ?? {};
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load onboarding data', err);
    } finally {
      setInitializing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    setFieldErrors({});
  }, [step]);

  useEffect(() => {
    if (!avatarFile) return undefined;
    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const persistStepData = useCallback(async () => {
    if (!user?.id || step >= 5) return;
    const next: OnboardingStepData = { ...stepDataRef.current };
    if (step === 1) {
      next[1] = { displayName, country, city, province, postalCode, currency, mileageUnit, fuelUnit, timezone, locale };
    } else if (step === 2) {
      next[2] = { nickname, make, model, year, registration, vin, currentMileage, fuelType, transmission, engineType, color };
    } else if (step === 3) {
      next[3] = { lastServiceDate, lastServiceMileage, serviceIntervalMonths, serviceIntervalMileage, lastOilChangeDate, lastOilChangeMileage, lastBrakeServiceDate, lastBatteryDate, lastTireRotationDate, knownIssues, workshopName };
    } else if (step === 4) {
      next[4] = { emailReminders, inAppReminders, leadDays, reminderBasis, weeklySummary };
    }
    stepDataRef.current = next;
    await upsertOnboardingProgress(user.id, { stepData: next });
  }, [user?.id, step, displayName, country, city, province, postalCode, currency, mileageUnit, fuelUnit, timezone, locale, nickname, make, model, year, registration, vin, currentMileage, fuelType, transmission, engineType, color, lastServiceDate, lastServiceMileage, serviceIntervalMonths, serviceIntervalMileage, lastOilChangeDate, lastOilChangeMileage, lastBrakeServiceDate, lastBatteryDate, lastTireRotationDate, knownIssues, workshopName, emailReminders, inAppReminders, leadDays, reminderBasis, weeklySummary]);

  useEffect(() => {
    if (!user?.id || step >= 5 || initializing) return;
    autoSaveTimerRef.current = setTimeout(persistStepData, 500);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [user?.id, step, initializing, persistStepData, displayName, country, city, province, postalCode, currency, mileageUnit, fuelUnit, timezone, locale, nickname, make, model, year, registration, vin, currentMileage, fuelType, transmission, engineType, color, lastServiceDate, lastServiceMileage, serviceIntervalMonths, serviceIntervalMileage, lastOilChangeDate, lastOilChangeMileage, lastBrakeServiceDate, lastBatteryDate, lastTireRotationDate, knownIssues, workshopName, emailReminders, inAppReminders, leadDays, reminderBasis, weeklySummary]);

  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);

  const handleStartOver = useCallback(async () => {
    if (!user?.id) return;
    setShowStartOverConfirm(true);
  }, [user?.id]);

  const handleStartOverConfirm = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const ok = await resetOnboardingProgress(user.id);
      if (ok) {
        await queryClient.invalidateQueries({ queryKey: ['onboarding', user.id] });
        stepDataRef.current = {};
        setStep(1);
        setVehicleSkipped(false);
        setDisplayName('');
        setCountry('ZA');
        setCity('');
        setProvince('');
        setPostalCode('');
        setCurrency('ZAR');
        setMileageUnit('km');
        setFuelUnit('litres');
        setTimezone('Africa/Johannesburg');
        setLocale('en');
        setAvatarFile(null);
        setAvatarUrl(null);
        setAvatarUploadError(null);
        setNickname('');
        setMake('');
        setModel('');
        setYear('');
        setRegistration('');
        setVin('');
        setCurrentMileage('');
        setFuelType('');
        setTransmission('');
        setEngineType('');
        setColor('');
        setVehicleImageFile(null);
        setVehicleId(null);
        setLastServiceDate('');
        setLastServiceMileage('');
        setServiceIntervalMonths('');
        setServiceIntervalMileage('');
        setLastOilChangeDate('');
        setLastOilChangeMileage('');
        setLastBrakeServiceDate('');
        setLastBatteryDate('');
        setLastTireRotationDate('');
        setKnownIssues('');
        setWorkshopName('');
        setEmailReminders(true);
        setInAppReminders(true);
        setLeadDays([14, 7, 0]);
        setReminderBasis('both');
        setWeeklySummary(false);
      }
    } finally {
      setLoading(false);
      setShowStartOverConfirm(false);
    }
  }, [user?.id, queryClient]);

  const validateProfileStep = useCallback((): FieldErrors => {
    const nextErrors: FieldErrors = {};
    if (!country.trim()) {
      nextErrors.country = 'Country is required.';
    }
    if (!currency.trim()) {
      nextErrors.currency = 'Currency is required.';
    }
    if (!timezone.trim()) {
      nextErrors.timezone = 'Timezone is required.';
    }
    if (!locale.trim()) {
      nextErrors.locale = 'Notification language is required.';
    }
    return nextErrors;
  }, [country, currency, timezone, locale]);

  const validateVehicleStep = useCallback((): FieldErrors => {
    const nextErrors: FieldErrors = {};
    if (vehicleSkipped) {
      return nextErrors;
    }
    if (!make.trim()) {
      nextErrors.make = 'Select a vehicle make.';
    }
    if (!model.trim()) {
      nextErrors.model = 'Model is required.';
    }
    if (year) {
      const yearError = validateYear(year);
      if (yearError) {
        nextErrors.year = yearError;
      }
    }
    if (currentMileage) {
      const mileageError = validateOdometerKm(currentMileage);
      if (mileageError) {
        nextErrors.currentMileage = mileageError;
      }
    }
    return nextErrors;
  }, [vehicleSkipped, make, model, year, currentMileage]);

  const validateServiceStep = useCallback((): FieldErrors => {
    const nextErrors: FieldErrors = {};
    const numericMileageFields: Array<[string, string]> = [
      ['lastServiceMileage', lastServiceMileage],
      ['lastOilChangeMileage', lastOilChangeMileage],
      ['serviceIntervalMileage', serviceIntervalMileage],
    ];
    for (const [field, value] of numericMileageFields) {
      if (!value) continue;
      const mileageError = validateOdometerKm(value);
      if (mileageError) {
        nextErrors[field] = mileageError;
      }
    }
    const positiveNumberFields: Array<[string, string, string]> = [
      ['serviceIntervalMonths', serviceIntervalMonths, 'Service interval months must be greater than 0.'],
    ];
    for (const [field, value, message] of positiveNumberFields) {
      if (!value) continue;
      if (Number.isNaN(Number(value)) || Number(value) <= 0) {
        nextErrors[field] = message;
      }
    }
    return nextErrors;
  }, [lastOilChangeMileage, lastServiceMileage, serviceIntervalMileage, serviceIntervalMonths]);

  const resolveAccountId = useCallback(async () => {
    if (!user?.id) return null;
    if (accountId) return accountId;
    await refreshAccount();
    const profile = await fetchCurrentProfile(user.id);
    return profile?.defaultAccountId ?? null;
  }, [accountId, refreshAccount, user?.id]);

  const saveProfileStep = useCallback(async () => {
    if (!user?.id) return false;
    setError(null);
    setAvatarUploadError(null);
    const ok = await updateProfile(user.id, {
      displayName: displayName.trim() || null,
      country: country || 'ZA',
      city: city.trim() || null,
      province: province.trim() || null,
      postalCode: postalCode.trim() || null,
      currency: currency || 'ZAR',
      mileageUnit: mileageUnit || 'km',
      fuelUnit: fuelUnit || 'litres',
      timezone: timezone || 'Africa/Johannesburg',
      locale: locale || 'en',
    });
    if (!ok) {
      return false;
    }
    if (avatarFile) {
      const uploaded = await uploadAvatarFile(user.id, avatarFile);
      if (!uploaded?.url) {
        setAvatarUploadError('Failed to upload profile photo.');
        return false;
      }
      setAvatarUrl(uploaded.url);
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.current(user.id) });
    }
    return true;
  }, [user?.id, displayName, country, city, province, postalCode, currency, mileageUnit, fuelUnit, timezone, locale, avatarFile, queryClient]);

  const saveVehicleStep = useCallback(async () => {
    if (vehicleSkipped || !user?.id) return true;
    const resolvedAccountId = await resolveAccountId();
    if (!resolvedAccountId) {
      setError('Account setup is still pending. Skip vehicle for now and continue.');
      return false;
    }
    if (!make.trim() || !model.trim()) return false;

    let yearNum: number | null = null;
    if (year) {
      const yearError = validateYear(year);
      if (yearError) {
        setError(yearError);
        return false;
      }
      yearNum = Number(year);
    }

    let mileageNum: number | null = null;
    if (currentMileage) {
      const mileageError = validateOdometerKm(currentMileage);
      if (mileageError) {
        setError(mileageError);
        return false;
      }
      mileageNum = Number(currentMileage.replace(/,/g, ''));
    }
    const vehicle = await upsertVehicle({
      id: vehicleId ?? undefined,
      accountId: resolvedAccountId,
      ownerUserId: user.id,
      nickname: nickname.trim() || null,
      make: make.trim(),
      model: model.trim(),
      year: yearNum,
      vin: vin.trim() || null,
      licensePlate: registration.trim() || null,
      fuelType: fuelType || null,
      currentMileage: mileageNum,
      transmission: transmission.trim() || null,
      engineType: engineType.trim() || null,
      color: color.trim() || null,
    });
    if (!vehicle) return false;
    const withHealth = await recomputeAndPersistVehicleHealth(vehicle, null);
    if (vehicleImageFile && withHealth) {
      await uploadVehicleImageFile({
        accountId: resolvedAccountId,
        vehicleId: withHealth.id,
        file: vehicleImageFile,
      });
    }
    setVehicleId(withHealth.id);
    return true;
  }, [
    vehicleSkipped, resolveAccountId, user?.id, vehicleId, nickname, make, model, year,
    registration, vin, currentMileage, fuelType, transmission, engineType, color, vehicleImageFile,
  ]);

  const saveServiceStep = useCallback(async () => {
    const resolvedAccountId = await resolveAccountId();
    if (!resolvedAccountId) return false;
    const lastDate = lastServiceDate || null;
    const lastMileage = lastServiceMileage ? Number(lastServiceMileage) : null;
    const intervalMonths = serviceIntervalMonths ? Number(serviceIntervalMonths) : null;
    const intervalMileage = serviceIntervalMileage ? Number(serviceIntervalMileage) : null;
    const oilDate = lastOilChangeDate || null;
    const oilMileage = lastOilChangeMileage ? Number(lastOilChangeMileage) : null;
    const brakeDate = lastBrakeServiceDate || null;
    const batteryDate = lastBatteryDate || null;
    const tireDate = lastTireRotationDate || null;
    const result = await upsertServicePreferences({
      accountId: resolvedAccountId,
      vehicleId: vehicleId ?? null,
      lastServiceDate: lastDate,
      lastServiceMileage: lastMileage,
      serviceIntervalMonths: intervalMonths,
      serviceIntervalMileage: intervalMileage,
      lastOilChangeDate: oilDate,
      lastOilChangeMileage: oilMileage,
      lastBrakeServiceDate: brakeDate,
      lastBatteryDate: batteryDate,
      lastTireRotationDate: tireDate,
      knownIssues: knownIssues.trim() || null,
      workshopName: workshopName.trim() || null,
    });
    return Boolean(result);
  }, [
    resolveAccountId, vehicleId, lastServiceDate, lastServiceMileage, serviceIntervalMonths,
    serviceIntervalMileage, lastOilChangeDate, lastOilChangeMileage, lastBrakeServiceDate,
    lastBatteryDate, lastTireRotationDate, knownIssues, workshopName,
  ]);

  const saveRemindersStep = useCallback(async () => {
    if (!user?.id) return false;
    const resolvedAccountId = await resolveAccountId();
    if (!resolvedAccountId) return false;
    const emailOk = await upsertAlertPreference({
      userId: user.id,
      accountId: resolvedAccountId,
      channel: 'email',
      enabled: emailReminders,
      maintenanceLeadDaysArray: leadDays.length ? leadDays : [14, 7, 0],
      reminderBasis: reminderBasis,
      weeklySummaryEmail: weeklySummary,
    });
    const inAppOk = await upsertAlertPreference({
      userId: user.id,
      accountId: resolvedAccountId,
      channel: 'in_app',
      enabled: inAppReminders,
      maintenanceLeadDaysArray: leadDays.length ? leadDays : [14, 7, 0],
      reminderBasis: reminderBasis,
      weeklySummaryEmail: weeklySummary,
    });
    return emailOk && inAppOk;
  }, [user?.id, resolveAccountId, emailReminders, inAppReminders, leadDays, reminderBasis, weeklySummary]);

  const toggleLeadDay = (day: number) => {
    setLeadDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => b - a),
    );
  };

  const handleNext = useCallback(async () => {
    setError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      if (step === 1) {
        const nextErrors = validateProfileStep();
        if (Object.keys(nextErrors).length > 0) {
          applyFieldErrors(nextErrors, 'Please review the highlighted profile fields.');
          setLoading(false);
          return;
        }
        const ok = await saveProfileStep();
        if (!ok) {
          setError('Failed to save profile.');
          setLoading(false);
          return;
        }
        await queryClient.invalidateQueries({ queryKey: queryKeys.profile.current(user!.id) });
        await upsertOnboardingProgress(user!.id, {
          currentStep: 2,
          profileCompleted: true,
        });
        recordOnboardingEvent(user!.id, 'step_1_done', 1);
      } else if (step === 2) {
        const nextErrors = validateVehicleStep();
        if (Object.keys(nextErrors).length > 0) {
          applyFieldErrors(nextErrors, 'Please review the highlighted vehicle fields.');
          setLoading(false);
          return;
        }
        if (!vehicleSkipped) {
          const ok = await saveVehicleStep();
          if (!ok) {
            if (!error) {
              setError('Unable to save the vehicle. Please review the highlighted fields.');
            }
            setLoading(false);
            return;
          }
        }
        if (accountId) {
          await queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.list(accountId) });
          await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview(accountId) });
        }
        await upsertOnboardingProgress(user!.id, {
          currentStep: 3,
          vehicleAdded: !vehicleSkipped,
        });
        recordOnboardingEvent(user!.id, 'step_2_done', 2);
      } else if (step === 3) {
        const nextErrors = validateServiceStep();
        if (Object.keys(nextErrors).length > 0) {
          applyFieldErrors(nextErrors, 'Please review the highlighted service fields.');
          setLoading(false);
          return;
        }
        const ok = await saveServiceStep();
        if (!ok) {
          setError('Failed to save service baseline.');
          setLoading(false);
          return;
        }
        await upsertOnboardingProgress(user!.id, {
          currentStep: 4,
          serviceBaselineCompleted: true,
        });
        recordOnboardingEvent(user!.id, 'step_3_done', 3);
      } else if (step === 4) {
        const ok = await saveRemindersStep();
        if (!ok) {
          setError('Failed to save reminder preferences.');
          setLoading(false);
          return;
        }
        await upsertOnboardingProgress(user!.id, {
          currentStep: 5,
          remindersCompleted: true,
        });
        recordOnboardingEvent(user!.id, 'step_4_done', 4);
      }
      if (step < 5) setStep(step + 1);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [
    step, user, vehicleSkipped, accountId, error, queryClient, applyFieldErrors,
    validateProfileStep, validateVehicleStep, validateServiceStep,
    saveProfileStep, saveVehicleStep, saveServiceStep, saveRemindersStep,
  ]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  const handleSkipVehicle = useCallback(async () => {
    setVehicleSkipped(true);
    setError(null);
    setLoading(true);
    try {
      await upsertOnboardingProgress(user!.id, {
        currentStep: 3,
        vehicleAdded: false,
      });
      setStep(3);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleFinish = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const ok = await completeOnboarding(user!.id, {
        vehicleAdded: !vehicleSkipped && Boolean(vehicleId || make.trim() || model.trim()),
      });
      if (ok) {
        recordOnboardingEvent(user!.id, 'completed', 5);
        await queryClient.invalidateQueries({ queryKey: ['onboarding', user!.id] });
        await queryClient.invalidateQueries({ queryKey: queryKeys.profile.current(user!.id) });
        if (accountId) {
          await queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.list(accountId) });
          await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview(accountId) });
          await queryClient.invalidateQueries({ queryKey: queryKeys.alerts.preferences(accountId) });
        }
        navigate('/dashboard', { replace: true });
      } else {
        setError('Failed to complete. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [user, vehicleSkipped, vehicleId, make, model, accountId, navigate, queryClient]);

  if (!user) return null;
  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingState label="Loading…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body">
      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
              <CarIcon className="w-5 h-5" />
            </div>
            AutoVital
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500">
              Step {step} of 5
            </span>
            <button
              type="button"
              onClick={handleStartOver}
              disabled={loading}
              className="text-xs text-slate-400 hover:text-slate-600 hover:underline"
            >
              Start over
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-12 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full">
              <motion.div
                className="h-full bg-primary-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${((step - 1) / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                    step >= s.id ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium ${step >= s.id ? 'text-slate-900' : 'text-slate-500'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>

          <Card className="p-8 md:p-10 bg-white shadow-xl border-slate-100">
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-heading mb-2">Profile</h2>
                    <p className="text-slate-500">Tell us a bit about yourself.</p>
                  </div>
                  <div className="space-y-4">
                    <Input
                      label="Preferred display name"
                      placeholder="e.g. Sipho"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                    <Input
                      label="Country"
                      placeholder="South Africa"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      error={fieldErrors.country}
                      ref={registerFieldRef('country')}
                    />
                    <Input
                      label="City / Region"
                      placeholder="e.g. Johannesburg"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Province</label>
                        <select
                          className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                        >
                          <option value="">Select province</option>
                          <option value="EC">Eastern Cape</option>
                          <option value="FS">Free State</option>
                          <option value="GP">Gauteng</option>
                          <option value="KZN">KwaZulu-Natal</option>
                          <option value="LP">Limpopo</option>
                          <option value="MP">Mpumalanga</option>
                          <option value="NC">Northern Cape</option>
                          <option value="NW">North West</option>
                          <option value="WC">Western Cape</option>
                        </select>
                      </div>
                      <Input
                        label="Postal code"
                        placeholder="e.g. 2000"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        error={fieldErrors.postalCode}
                        ref={registerFieldRef('postalCode')}
                      />
                    </div>
                    <Input
                      label="Preferred currency"
                      placeholder="ZAR"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      error={fieldErrors.currency}
                      ref={registerFieldRef('currency')}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mileage unit</label>
                        <select
                          className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm"
                          value={mileageUnit}
                          onChange={(e) => setMileageUnit(e.target.value)}
                        >
                          <option value="km">km</option>
                          <option value="miles">miles</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fuel unit</label>
                        <select
                          className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm"
                          value={fuelUnit}
                          onChange={(e) => setFuelUnit(e.target.value)}
                        >
                          <option value="litres">Litres</option>
                          <option value="gallons">Gallons</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                      <select
                        ref={registerFieldRef('timezone')}
                        className={`w-full rounded-md py-2 px-3 text-sm ${fieldErrors.timezone ? 'border border-red-300 focus:border-red-400' : 'border border-slate-300'}`}
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                      {fieldErrors.timezone && <p className="mt-1 text-sm text-red-600">{fieldErrors.timezone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Notification language</label>
                      <select
                        ref={registerFieldRef('locale')}
                        className={`w-full rounded-md py-2 px-3 text-sm ${fieldErrors.locale ? 'border border-red-300 focus:border-red-400' : 'border border-slate-300'}`}
                        value={locale}
                        onChange={(e) => setLocale(e.target.value)}
                      >
                        {LOCALES.map((l) => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                      {fieldErrors.locale && <p className="mt-1 text-sm text-red-600">{fieldErrors.locale}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Profile photo (optional)</label>
                      {avatarUrl && (
                        <div className="mb-3 flex items-center gap-3">
                          <img
                            src={avatarUrl}
                            alt="Profile preview"
                            className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                          />
                          <div className="text-sm text-slate-500">
                            <p>{avatarFile?.name ?? 'Current profile photo'}</p>
                            {avatarFile && (
                              <button
                                type="button"
                                className="mt-1 text-primary-600 hover:text-primary-500"
                                onClick={() => {
                                  setAvatarFile(null);
                                  setAvatarUrl(null);
                                  setAvatarUploadError(null);
                                  void loadInitialData();
                                }}
                              >
                                Clear selection
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          setAvatarUploadError(null);
                          setAvatarFile(e.target.files?.[0] ?? null);
                        }}
                        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-slate-200 file:bg-slate-50"
                      />
                      {avatarUploadError && (
                        <p className="mt-1 text-sm text-red-600">{avatarUploadError}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-heading mb-2">Add your vehicle</h2>
                    <p className="text-slate-500">You can add more vehicles later from your dashboard.</p>
                  </div>
                  <div className="space-y-4">
                    <Input
                      label="Nickname"
                      placeholder="e.g. Daily Driver"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Make</label>
                      <select
                        ref={registerFieldRef('make')}
                        className={`w-full rounded-md py-2 px-3 text-sm ${fieldErrors.make ? 'border border-red-300 focus:border-red-400' : 'border border-slate-300'}`}
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                      >
                        <option value="">Select make</option>
                        {COMMON_MAKES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      {fieldErrors.make && <p className="mt-1 text-sm text-red-600">{fieldErrors.make}</p>}
                    </div>
                    <Input
                      label="Model"
                      placeholder="e.g. Corolla"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      error={fieldErrors.model}
                      ref={registerFieldRef('model')}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Year"
                        type="number"
                        placeholder="2020"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        error={fieldErrors.year}
                        ref={registerFieldRef('year')}
                      />
                      <Input
                        label="Registration"
                        placeholder="ABC-1234"
                        value={registration}
                        onChange={(e) => setRegistration(e.target.value)}
                      />
                    </div>
                    <Input
                      label="VIN (optional)"
                      placeholder="17-character ID"
                      value={vin}
                      onChange={(e) => setVin(e.target.value)}
                    />
                    <Input
                      label="Current mileage"
                      type="number"
                      placeholder="45000"
                      value={currentMileage}
                      onChange={(e) => setCurrentMileage(e.target.value)}
                      error={fieldErrors.currentMileage}
                      ref={registerFieldRef('currentMileage')}
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fuel type</label>
                      <select
                        className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm"
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="gasoline">Gasoline</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Transmission"
                        placeholder="Auto/Manual"
                        value={transmission}
                        onChange={(e) => setTransmission(e.target.value)}
                      />
                      <Input
                        label="Engine type"
                        placeholder="e.g. 2.0L"
                        value={engineType}
                        onChange={(e) => setEngineType(e.target.value)}
                      />
                      <Input
                        label="Color"
                        placeholder="e.g. White"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle photo (optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setVehicleImageFile(e.target.files?.[0] ?? null)}
                        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-slate-200 file:bg-slate-50"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-heading mb-2">Service baseline</h2>
                    <p className="text-slate-500">When was your vehicle last serviced?</p>
                  </div>
                  <div className="space-y-4">
                    <Input
                      label="Last service date"
                      type="date"
                      value={lastServiceDate}
                      onChange={(e) => setLastServiceDate(e.target.value)}
                    />
                    <Input
                      label="Mileage at last service"
                      type="number"
                      placeholder="45000"
                      value={lastServiceMileage}
                      onChange={(e) => setLastServiceMileage(e.target.value)}
                      error={fieldErrors.lastServiceMileage}
                      ref={registerFieldRef('lastServiceMileage')}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Service interval (months)"
                        type="number"
                        placeholder="12"
                        value={serviceIntervalMonths}
                        onChange={(e) => setServiceIntervalMonths(e.target.value)}
                        error={fieldErrors.serviceIntervalMonths}
                        ref={registerFieldRef('serviceIntervalMonths')}
                      />
                      <Input
                        label="Service interval (km)"
                        type="number"
                        placeholder="15000"
                        value={serviceIntervalMileage}
                        onChange={(e) => setServiceIntervalMileage(e.target.value)}
                        error={fieldErrors.serviceIntervalMileage}
                        ref={registerFieldRef('serviceIntervalMileage')}
                      />
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500"
                      onClick={() => setExpandedServiceDetails(!expandedServiceDetails)}
                    >
                      {expandedServiceDetails ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )}
                      {expandedServiceDetails ? 'Hide' : 'Show'} optional details
                    </button>
                    {expandedServiceDetails && (
                      <div className="space-y-4 pl-4 border-l-2 border-slate-200">
                        <Input
                          label="Last oil change date"
                          type="date"
                          value={lastOilChangeDate}
                          onChange={(e) => setLastOilChangeDate(e.target.value)}
                        />
                        <Input
                          label="Last oil change mileage"
                          type="number"
                          value={lastOilChangeMileage}
                          onChange={(e) => setLastOilChangeMileage(e.target.value)}
                          error={fieldErrors.lastOilChangeMileage}
                          ref={registerFieldRef('lastOilChangeMileage')}
                        />
                        <Input
                          label="Last brake service date"
                          type="date"
                          value={lastBrakeServiceDate}
                          onChange={(e) => setLastBrakeServiceDate(e.target.value)}
                        />
                        <Input
                          label="Last battery date"
                          type="date"
                          value={lastBatteryDate}
                          onChange={(e) => setLastBatteryDate(e.target.value)}
                        />
                        <Input
                          label="Last tire rotation date"
                          type="date"
                          value={lastTireRotationDate}
                          onChange={(e) => setLastTireRotationDate(e.target.value)}
                        />
                        <Input
                          label="Known issues"
                          placeholder="Optional"
                          value={knownIssues}
                          onChange={(e) => setKnownIssues(e.target.value)}
                        />
                        <Input
                          label="Workshop name"
                          placeholder="Optional"
                          value={workshopName}
                          onChange={(e) => setWorkshopName(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-heading mb-2">Reminders</h2>
                    <p className="text-slate-500">How would you like to be notified?</p>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-primary-300 bg-slate-50">
                      <input
                        type="checkbox"
                        checked={emailReminders}
                        onChange={(e) => setEmailReminders(e.target.checked)}
                        className="mt-1 w-4 h-4 text-primary-600 rounded border-slate-300"
                      />
                      <div>
                        <p className="font-medium text-slate-900">Email reminders</p>
                        <p className="text-sm text-slate-500">Receive alerts when service is due.</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-primary-300 bg-slate-50">
                      <input
                        type="checkbox"
                        checked={inAppReminders}
                        onChange={(e) => setInAppReminders(e.target.checked)}
                        className="mt-1 w-4 h-4 text-primary-600 rounded border-slate-300"
                      />
                      <div>
                        <p className="font-medium text-slate-900">In-app reminders</p>
                        <p className="text-sm text-slate-500">See alerts on your dashboard.</p>
                      </div>
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Reminder timing (multi-select)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {LEAD_DAY_OPTIONS.map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={leadDays.includes(opt.value)}
                              onChange={() => toggleLeadDay(opt.value)}
                              className="rounded border-slate-300 text-primary-600"
                            />
                            <span className="text-sm">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Reminder basis</label>
                      <select
                        className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm"
                        value={reminderBasis}
                        onChange={(e) => setReminderBasis(e.target.value as 'time' | 'mileage' | 'both')}
                      >
                        <option value="time">Time-based</option>
                        <option value="mileage">Mileage-based</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={weeklySummary}
                        onChange={(e) => setWeeklySummary(e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-900">Weekly summary email</span>
                    </label>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-24 h-24 bg-accent-100 text-accent-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2Icon className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 font-heading mb-4">
                    You&apos;re all set!
                  </h2>
                  <p className="text-slate-500 max-w-md mx-auto mb-8">
                    Your profile and preferences have been saved. We&apos;ve set up your
                    dashboard and you can start tracking your vehicle&apos;s health.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
              {step > 1 && step < 5 ? (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  icon={<ArrowLeftIcon className="w-4 h-4" />}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step === 2 && !vehicleSkipped ? (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleSkipVehicle} disabled={loading}>
                    Skip for now
                  </Button>
                  <Button variant="primary" onClick={handleNext} loading={loading}>
                    Continue <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : step < 5 ? (
                <Button variant="primary" onClick={handleNext} loading={loading}>
                  Continue <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleFinish}
                  loading={loading}
                >
                  Go to Dashboard
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>

      <ConfirmDialog
        open={showStartOverConfirm}
        onOpenChange={setShowStartOverConfirm}
        title="Start over?"
        description="Your progress will be reset. You will need to complete the setup again."
        confirmLabel="Start over"
        variant="destructive"
        loading={loading}
        onConfirm={handleStartOverConfirm}
      />
    </div>
  );
}
