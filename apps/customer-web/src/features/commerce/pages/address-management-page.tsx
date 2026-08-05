import { Suspense, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@freshmart/design-system';
import { CheckCircle2, Home, MapPin, Navigation, Phone, Plus, Trash2, Briefcase, Pencil, Check, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAddAddressMutation, useDeleteAddressMutation, useGetAddressesQuery, type AddressInput } from '../api/commerce-api.js';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';

const schema = z.object({
  label: z.enum(['Home', 'Work', 'Other']),
  name: z.string().min(2, 'Enter a full name'),
  phone: z.string().min(8, 'Enter a valid phone number'),
  line1: z.string().min(2, 'House or flat number is required'),
  line2: z.string().min(2, 'Street or area is required'),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(4, 'PIN code is required'),
  isDefault: z.boolean()
});

type FormValues = z.infer<typeof schema>;

const SAMPLE_ADDRESSES = [
  {
    addressId: 'addr-1',
    label: 'Home',
    name: 'Jane Doe',
    lines: ['Apt 4B, Emerald Heights', '7th Cross, Green Park Extension', 'Near Central Metro Station'],
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    phone: '+1 555-0123',
    isDefault: true
  },
  {
    addressId: 'addr-2',
    label: 'Work',
    name: 'Jane Doe',
    lines: ['Level 12, Tech Tower Alpha', '45 Silicon Way, North Tech District', 'Main Entrance Lobby'],
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    phone: '+1 555-9876',
    isDefault: false
  },
  {
    addressId: 'addr-3',
    label: 'Other',
    name: "Robert Doe (Parent's Home)",
    lines: ['House 12-A, Rose Villas', 'Maple Avenue, South Bay Area', 'Near Sunset High School'],
    city: 'Oakland',
    state: 'CA',
    postalCode: '94601',
    phone: '+1 555-4422',
    isDefault: false
  }
];

const AddressManagementContent = () => {
  const navigate = useNavigate();
  const { data: apiAddresses = [] } = useGetAddressesQuery();
  
  const [localAddresses, setLocalAddresses] = useState<typeof SAMPLE_ADDRESSES>([]);
  const [type, setType] = useState<FormValues['label']>('Home');
  const [selectedId, setSelectedId] = useState('addr-1');
  const [addAddress, addState] = useAddAddressMutation();
  const [deleteAddress, deleteState] = useDeleteAddressMutation();

  const addresses = apiAddresses.length > 0
    ? [...apiAddresses, ...localAddresses.filter((l) => !apiAddresses.some((a) => a.addressId === l.addressId))]
    : (localAddresses.length > 0 ? localAddresses : SAMPLE_ADDRESSES);

  const { formState: { errors, isSubmitSuccessful }, handleSubmit, register, reset, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { city: 'San Francisco', isDefault: false, label: 'Home', state: 'California' }
  });

  const isDefaultValue = watch('isDefault');

  const save = async (values: FormValues) => {
    try {
      const res = await addAddress(values as AddressInput).unwrap();
      const newId = String((res as Record<string, unknown>).addressId || (res as Record<string, unknown>).id || `addr-${Date.now()}`);
      const newEntry = {
        addressId: newId,
        label: values.label,
        name: values.name,
        lines: [values.line1, values.line2, values.landmark].filter(Boolean) as string[],
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        phone: values.phone,
        isDefault: values.isDefault
      };
      setLocalAddresses((prev) => [newEntry, ...prev]);
    } catch (_) {
      const fallbackEntry = {
        addressId: `addr-${Date.now()}`,
        label: values.label,
        name: values.name,
        lines: [values.line1, values.line2, values.landmark].filter(Boolean) as string[],
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        phone: values.phone,
        isDefault: values.isDefault
      };
      setLocalAddresses((prev) => [fallbackEntry, ...prev]);
    }
    reset({ city: 'San Francisco', isDefault: false, label: type, state: 'California' });
  };

  const handleDelete = async (addressId: string) => {
    try {
      await deleteAddress({ addressId }).unwrap().catch(() => undefined);
    } catch (_) {
      // Fallthrough
    }
    setLocalAddresses((prev) => prev.filter((a) => a.addressId !== addressId));
  };

  return (
    <div className="min-h-screen bg-[#f4fcf0] text-[#171d16] font-sans">
      <HomeHeader variant="cart" />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pb-16 pt-24 space-y-8">

        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171d16]">My Addresses</h1>
          <p className="text-sm font-semibold text-[#8b9888]">
            Manage your delivery locations for faster checkout.
          </p>
        </div>

        {/* Saved Addresses Section */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-[#171d16]">
            <MapPin className="h-5 w-5 text-[#006b2c]" />
            <span>Saved Addresses</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {addresses.map((addr) => {
              const isSelected = selectedId === addr.addressId || addr.isDefault;
              const Icon = addr.label === 'Home' ? Home : addr.label === 'Work' ? Briefcase : MapPin;
              return (
                <div
                  key={addr.addressId}
                  className={`rounded-[24px] bg-white p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                    isSelected ? 'border-2 border-[#006b2c]' : 'border border-[#e2ebdE]'
                  }`}
                  onClick={() => setSelectedId(addr.addressId)}
                >
                  <div className="space-y-3">
                    {/* Card Header Tag & Checkmark */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-[#006b2c]" />
                        <span className="text-sm font-black text-[#171d16]">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="rounded-full bg-[#d8f4ce] px-2.5 py-0.5 text-[10px] font-black text-[#2b4c1d]">
                            DEFAULT
                          </span>
                        )}
                      </div>

                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#006b2c] bg-[#006b2c] text-white' : 'border-[#bdcaba]'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Address Body */}
                    <div>
                      <h3 className="text-sm font-extrabold text-[#171d16]">{addr.name}</h3>
                      <p className="text-xs font-semibold text-[#8b9888] leading-relaxed mt-1">
                        {addr.lines.map((line) => (
                          <span key={line} className="block">{line}</span>
                        ))}
                        <span className="block">{addr.city}, {addr.state} {addr.postalCode}</span>
                      </p>
                      <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#171d16]">
                        <Phone className="h-3.5 w-3.5 text-[#006b2c]" />
                        <span>{addr.phone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-around border-t border-[#e2ebdE] pt-3 text-xs font-extrabold">
                    <button className="flex items-center gap-1 text-[#006b2c] hover:underline" type="button">
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      className="flex items-center gap-1 text-rose-600 hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDelete(addr.addressId);
                      }}
                      type="button"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deliver to Selected Address CTA */}
          <div className="flex justify-end pt-2">
            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#006b2c] px-8 text-xs font-extrabold text-white shadow-md hover:bg-[#005422] transition-all active:scale-98 cursor-pointer"
              onClick={() => navigate('/checkout')}
              type="button"
            >
              <span>Deliver to Selected Address</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Add New Address Form Section */}
        <div className="mx-auto max-w-3xl rounded-[28px] border border-[#e2ebdE] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <form onSubmit={(e) => void handleSubmit(save)(e)}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black text-[#171d16]">
                  <Plus className="h-5 w-5 text-[#006b2c]" />
                  <span>Add New Address</span>
                </h2>
                <p className="text-xs font-semibold text-[#8b9888] mt-0.5">
                  Fill in the details below to save a new location.
                </p>
              </div>

              <button
                className="inline-flex items-center gap-1.5 rounded-full bg-[#eff6ea] px-4 py-2 text-xs font-extrabold text-[#006c4a] hover:bg-[#d8f4ce] transition-all shadow-xs shrink-0"
                type="button"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Use Current Location</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field error={errors.name?.message} label="Full Name">
                  <Input className="h-11 rounded-xl bg-[#f8fbf5] border-[#bdcaba]/60 px-4 text-xs font-bold" placeholder="e.g. John Doe" {...register('name')} />
                </Field>
                <Field error={errors.phone?.message} label="Phone Number">
                  <Input className="h-11 rounded-xl bg-[#f8fbf5] border-[#bdcaba]/60 px-4 text-xs font-bold" placeholder="e.g. +1 555-0000" type="tel" {...register('phone')} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field error={errors.line1?.message} label="House/Flat No">
                  <Input className="h-11 rounded-xl bg-[#f8fbf5] border-[#bdcaba]/60 px-4 text-xs font-bold" placeholder="e.g. 4B" {...register('line1')} />
                </Field>
                <div className="sm:col-span-2">
                  <Field error={errors.line2?.message} label="Street/Area">
                    <Input className="h-11 rounded-xl bg-[#f8fbf5] border-[#bdcaba]/60 px-4 text-xs font-bold" placeholder="e.g. Maple Avenue, Green District" {...register('line2')} />
                  </Field>
                </div>
              </div>

              <Field error={errors.landmark?.message} label="Landmark (Optional)">
                <Input className="h-11 rounded-xl bg-[#f8fbf5] border-[#bdcaba]/60 px-4 text-xs font-bold" placeholder="e.g. Next to Central Bank" {...register('landmark')} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field error={errors.city?.message} label="City">
                  <Input className="h-11 rounded-xl bg-[#f8fbf5] border-[#bdcaba]/60 px-4 text-xs font-bold" placeholder="San Francisco" {...register('city')} />
                </Field>
                <Field error={errors.state?.message} label="State">
                  <select
                    className="h-11 rounded-xl bg-[#f8fbf5] border border-[#bdcaba]/60 px-4 text-xs font-bold text-[#171d16] w-full focus:ring-2 focus:ring-[#006b2c] focus:bg-white cursor-pointer"
                    {...register('state')}
                  >
                    <option value="California">California</option>
                    <option value="New York">New York</option>
                    <option value="Texas">Texas</option>
                    <option value="Florida">Florida</option>
                    <option value="Illinois">Illinois</option>
                    <option value="Washington">Washington</option>
                  </select>
                </Field>
                <Field error={errors.postalCode?.message} label="PIN Code">
                  <Input className="h-11 rounded-xl bg-[#f8fbf5] border-[#bdcaba]/60 px-4 text-xs font-bold" placeholder="94105" {...register('postalCode')} />
                </Field>
              </div>

              {/* Save Address As */}
              <div>
                <label className="block text-xs font-extrabold text-[#3e4a3d] mb-2">Save address as</label>
                <div className="flex flex-wrap gap-3">
                  {(['Home', 'Work', 'Other'] as const).map((label) => (
                    <button
                      key={label}
                      className={`flex items-center gap-2 rounded-full border-2 px-5 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                        type === label
                          ? 'border-[#006b2c] bg-[#006b2c] text-white shadow-xs'
                          : 'border-[#bdcaba]/60 bg-white text-[#3e4a3d] hover:border-[#006b2c]'
                      }`}
                      onClick={() => { setType(label); setValue('label', label); }}
                      type="button"
                    >
                      {label === 'Home' ? <Home className="h-3.5 w-3.5" /> : label === 'Work' ? <Briefcase className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Address Checkbox Switch */}
              <div className="flex items-center justify-between rounded-2xl bg-[#eff6ea] p-4 border border-[#bdcaba]/30 cursor-pointer" onClick={() => setValue('isDefault', !isDefaultValue)}>
                <span className="flex items-center gap-2 text-xs font-extrabold text-[#171d16]">
                  <CheckCircle2 className={`h-4 w-4 transition-colors ${isDefaultValue ? 'text-[#006b2c]' : 'text-[#8b9888]'}`} />
                  <span>Set as default address</span>
                </span>
                <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <input className="sr-only peer" type="checkbox" {...register('isDefault')} />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006b2c]" />
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <button
                  className="flex-1 h-12 rounded-2xl bg-[#006b2c] text-sm font-extrabold text-white hover:bg-[#005422] transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  disabled={addState.isLoading}
                  type="submit"
                >
                  <span>{addState.isLoading ? 'Saving Address...' : 'Save Address'}</span>
                  <Check className="h-4 w-4 stroke-[3]" />
                </button>
                <button
                  className="sm:w-1/3 h-12 rounded-2xl border-2 border-[#bdcaba]/60 bg-white text-xs font-black text-[#3e4a3d] hover:bg-[#f8fbf5] hover:border-[#006b2c] transition-all cursor-pointer"
                  onClick={() => reset()}
                  type="button"
                >
                  Cancel
                </button>
              </div>

              {addState.isError && <p className="text-xs font-bold text-rose-600">Unable to save address. Please retry.</p>}
              {isSubmitSuccessful && !addState.isError && <p className="text-xs font-bold text-[#006c4a]">Address saved successfully.</p>}
            </div>
          </form>
        </div>

      </main>

      <HomeFooter />
    </div>
  );
};

const Field = ({ children, error, label }: { children: React.ReactNode; error?: string; label: string }) => (
  <label className="block space-y-1">
    <span className="block text-xs font-extrabold text-[#3e4a3d]">{label}</span>
    {children}
    {error && <span className="block text-[11px] font-bold text-rose-600">{error}</span>}
  </label>
);

export default function AddressManagementPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f4fcf0]" />}><AddressManagementContent /></Suspense>;
}
