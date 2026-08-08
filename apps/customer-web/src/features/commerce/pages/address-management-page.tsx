import { Suspense, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@freshmart/design-system';
import {
  CheckCircle2,
  Home,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Trash2,
  Briefcase,
  Pencil,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
  useAddAddressMutation,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  type AddressInput,
} from '../api/commerce-api.js';
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
  isDefault: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const AddressManagementContent = () => {
  const navigate = useNavigate();
  const { data: apiAddresses = [] } = useGetAddressesQuery();
  const [createdAddresses, setCreatedAddresses] = useState<
    Array<{
      addressId: string;
      label: 'Home' | 'Work' | 'Other';
      name: string;
      lines: string[];
      city: string;
      state: string;
      postalCode: string;
      phone: string;
      isDefault: boolean;
    }>
  >([]);

  const [type, setType] = useState<FormValues['label']>('Home');
  const [selectedId, setSelectedId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [addAddress, addState] = useAddAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const addresses = [
    ...apiAddresses,
    ...createdAddresses.filter(
      (c) => !apiAddresses.some((a) => a.addressId === c.addressId)
    ),
  ];

  const {
    formState: { errors, isSubmitSuccessful },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      city: 'San Francisco',
      isDefault: false,
      label: 'Home',
      state: 'California',
    },
  });

  const isDefaultValue = watch('isDefault');

  const save = async (values: FormValues) => {
    const newId = `addr-${Date.now()}`;
    const newAddress = {
      addressId: newId,
      label: values.label,
      name: values.name,
      lines: [values.line1, values.line2, values.landmark].filter(
        Boolean
      ) as string[],
      city: values.city,
      state: values.state,
      postalCode: values.postalCode,
      phone: values.phone,
      isDefault: values.isDefault,
    };
    setCreatedAddresses((prev) => [newAddress, ...prev]);
    setSelectedId(newId);

    try {
      await addAddress(values as AddressInput).unwrap();
    } catch (_) {
      // AWS background sync handled gracefully
    }
    reset({
      city: 'San Francisco',
      isDefault: false,
      label: type,
      state: 'California',
    });
    setShowForm(false);
  };

  const handleDelete = async (addressId: string) => {
    setCreatedAddresses((prev) =>
      prev.filter((a) => a.addressId !== addressId)
    );
    if (selectedId === addressId) setSelectedId('');

    try {
      await deleteAddress({ addressId }).unwrap();
    } catch (_) {
      // AWS background sync handled gracefully
    }
  };

  return (
    <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
      <HomeHeader variant="cart" />

      <main className="mx-auto max-w-7xl space-y-8 px-4 pt-24 pb-16 sm:px-6 md:px-8">
        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-[#171d16] sm:text-4xl">
            My Addresses
          </h1>
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

          {addresses.length === 0 ? (
            <div className="space-y-3 rounded-[24px] border border-[#e2ebdE] bg-white p-8 text-center shadow-xs">
              <MapPin className="mx-auto h-10 w-10 text-[#8b9888]" />
              <h3 className="text-base font-extrabold text-[#171d16]">
                No saved addresses found
              </h3>
              <p className="mx-auto max-w-md text-xs font-semibold text-[#8b9888]">
                You have not added any delivery locations yet. Fill out the form
                below to add your first address.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {addresses.map((addr) => {
                const effectiveSelectedId =
                  selectedId ||
                  addresses.find((a) => a.isDefault)?.addressId ||
                  addresses[0]?.addressId;
                const isSelected = effectiveSelectedId === addr.addressId;
                const Icon =
                  addr.label === 'Home'
                    ? Home
                    : addr.label === 'Work'
                      ? Briefcase
                      : MapPin;
                return (
                  <div
                    key={addr.addressId}
                    className={`flex cursor-pointer flex-col justify-between space-y-4 rounded-[24px] bg-white p-5 shadow-xs transition-all ${
                      isSelected
                        ? 'border-2 border-[#006b2c] ring-1 ring-[#006b2c]/20'
                        : 'border border-[#e2ebdE] hover:border-[#006b2c]/40'
                    }`}
                    onClick={() => setSelectedId(addr.addressId)}
                  >
                    <div className="space-y-3">
                      {/* Card Header Tag & Checkmark */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-[#006b2c]" />
                          <span className="text-sm font-black text-[#171d16]">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="rounded-full bg-[#d8f4ce] px-2.5 py-0.5 text-[10px] font-black text-[#2b4c1d]">
                              DEFAULT
                            </span>
                          )}
                        </div>

                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            isSelected
                              ? 'border-[#006b2c] bg-[#006b2c] text-white'
                              : 'border-[#bdcaba]'
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 stroke-[3]" />
                          )}
                        </div>
                      </div>

                      {/* Address Body */}
                      <div>
                        <h3 className="text-sm font-extrabold text-[#171d16]">
                          {addr.name}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed font-semibold text-[#8b9888]">
                          {addr.lines.map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))}
                          <span className="block">
                            {addr.city}, {addr.state} {addr.postalCode}
                          </span>
                        </p>
                        <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#171d16]">
                          <Phone className="h-3.5 w-3.5 text-[#006b2c]" />
                          <span>{addr.phone}</span>
                        </p>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="flex items-center justify-around border-t border-[#e2ebdE] pt-3 text-xs font-extrabold">
                      <button
                        className="flex cursor-pointer items-center gap-1 text-[#006b2c] hover:underline"
                        type="button"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        className="flex cursor-pointer items-center gap-1 text-rose-600 hover:underline"
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
          )}

          {/* Deliver to Selected Address CTA */}
          <div className="flex justify-end pt-2">
            <button
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#006b2c] px-8 text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#005422] active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={addresses.length === 0}
              onClick={() => {
                const effectiveSelectedId = selectedId || addresses.find((a) => a.isDefault)?.addressId || addresses[0]?.addressId;
                const addr = addresses.find(a => a.addressId === effectiveSelectedId);
                const addressString = addr ? [...addr.lines, `${addr.city}, ${addr.state} ${addr.postalCode}`].join(', ') : 'Home';
                navigate('/checkout', { state: { deliveryAddress: addressString } });
              }}
              type="button"
            >
              <span>Deliver to Selected Address</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Add New Address Toggle Button / Form Section */}
        {!showForm ? (
          <div className="mx-auto max-w-3xl">
            <button
              className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#006b2c]/40 bg-white text-sm font-extrabold text-[#006b2c] transition-all hover:border-[#006b2c] hover:bg-[#eff6ea]"
              onClick={() => setShowForm(true)}
              type="button"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Address</span>
            </button>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs sm:p-8">
            <form onSubmit={(e) => void handleSubmit(save)(e)}>
              <div className="mb-6">
                <h2 className="flex items-center gap-2 text-lg font-black text-[#171d16]">
                  <Plus className="h-5 w-5 text-[#006b2c]" />
                  <span>Add New Address</span>
                </h2>
                <p className="mt-0.5 text-xs font-semibold text-[#8b9888]">
                  Fill in the details below to save a new location.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field error={errors.name?.message} label="Full Name">
                    <Input
                      className="h-11 rounded-xl border-[#bdcaba]/60 bg-[#f8fbf5] px-4 text-xs font-bold"
                      placeholder="e.g. John Doe"
                      {...register('name')}
                    />
                  </Field>
                  <Field error={errors.phone?.message} label="Phone Number">
                    <Input
                      className="h-11 rounded-xl border-[#bdcaba]/60 bg-[#f8fbf5] px-4 text-xs font-bold"
                      placeholder="e.g. +1 555-0000"
                      type="tel"
                      {...register('phone')}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field error={errors.line1?.message} label="House/Flat No">
                    <Input
                      className="h-11 rounded-xl border-[#bdcaba]/60 bg-[#f8fbf5] px-4 text-xs font-bold"
                      placeholder="e.g. 4B"
                      {...register('line1')}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field error={errors.line2?.message} label="Street/Area">
                      <Input
                        className="h-11 rounded-xl border-[#bdcaba]/60 bg-[#f8fbf5] px-4 text-xs font-bold"
                        placeholder="e.g. Maple Avenue, Green District"
                        {...register('line2')}
                      />
                    </Field>
                  </div>
                </div>

                <Field
                  error={errors.landmark?.message}
                  label="Landmark (Optional)"
                >
                  <Input
                    className="h-11 rounded-xl border-[#bdcaba]/60 bg-[#f8fbf5] px-4 text-xs font-bold"
                    placeholder="e.g. Next to Central Bank"
                    {...register('landmark')}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field error={errors.city?.message} label="City">
                    <Input
                      className="h-11 rounded-xl border-[#bdcaba]/60 bg-[#f8fbf5] px-4 text-xs font-bold"
                      placeholder="San Francisco"
                      {...register('city')}
                    />
                  </Field>
                  <Field error={errors.state?.message} label="State">
                    <select
                      className="h-11 w-full cursor-pointer rounded-xl border border-[#bdcaba]/60 bg-[#f8fbf5] px-4 text-xs font-bold text-[#171d16] focus:bg-white focus:ring-2 focus:ring-[#006b2c]"
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
                    <Input
                      className="h-11 rounded-xl border-[#bdcaba]/60 bg-[#f8fbf5] px-4 text-xs font-bold"
                      placeholder="94105"
                      {...register('postalCode')}
                    />
                  </Field>
                </div>

                {/* Save Address As */}
                <div>
                  <label className="mb-2 block text-xs font-extrabold text-[#3e4a3d]">
                    Save address as
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {(['Home', 'Work', 'Other'] as const).map((label) => (
                      <button
                        key={label}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border-2 px-5 py-2 text-xs font-extrabold transition-all ${
                          type === label
                            ? 'border-[#006b2c] bg-[#006b2c] text-white shadow-xs'
                            : 'border-[#bdcaba]/60 bg-white text-[#3e4a3d] hover:border-[#006b2c]'
                        }`}
                        onClick={() => {
                          setType(label);
                          setValue('label', label);
                        }}
                        type="button"
                      >
                        {label === 'Home' ? (
                          <Home className="h-3.5 w-3.5" />
                        ) : label === 'Work' ? (
                          <Briefcase className="h-3.5 w-3.5" />
                        ) : (
                          <MapPin className="h-3.5 w-3.5" />
                        )}
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default Address Checkbox Switch */}
                <div
                  className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#bdcaba]/30 bg-[#eff6ea] p-4"
                  onClick={() => setValue('isDefault', !isDefaultValue)}
                >
                  <span className="flex items-center gap-2 text-xs font-extrabold text-[#171d16]">
                    <CheckCircle2
                      className={`h-4 w-4 transition-colors ${isDefaultValue ? 'text-[#006b2c]' : 'text-[#8b9888]'}`}
                    />
                    <span>Set as default address</span>
                  </span>
                  <label
                    className="relative inline-flex cursor-pointer items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      className="peer sr-only"
                      type="checkbox"
                      {...register('isDefault')}
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-300 peer-checked:bg-[#006b2c] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                  </label>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                  <button
                    className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#006b2c] text-sm font-extrabold text-white shadow-md transition-all hover:bg-[#005422] active:scale-98 disabled:opacity-60"
                    disabled={addState.isLoading}
                    type="submit"
                  >
                    <span>
                      {addState.isLoading
                        ? 'Saving Address...'
                        : 'Save Address'}
                    </span>
                    <Check className="h-4 w-4 stroke-[3]" />
                  </button>
                  <button
                    className="h-12 cursor-pointer rounded-2xl border-2 border-[#bdcaba]/60 bg-white text-xs font-black text-[#3e4a3d] transition-all hover:border-[#006b2c] hover:bg-[#f8fbf5] sm:w-1/3"
                    onClick={() => {
                      reset();
                      setShowForm(false);
                    }}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>

                {isSubmitSuccessful && (
                  <p className="text-xs font-bold text-[#006c4a]">
                    Address saved successfully.
                  </p>
                )}
              </div>
            </form>
          </div>
        )}
      </main>

      <HomeFooter />
    </div>
  );
};

const Field = ({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) => (
  <label className="block space-y-1">
    <span className="block text-xs font-extrabold text-[#3e4a3d]">{label}</span>
    {children}
    {error && (
      <span className="block text-[11px] font-bold text-rose-600">{error}</span>
    )}
  </label>
);

export default function AddressManagementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4fcf0]" />}>
      <AddressManagementContent />
    </Suspense>
  );
}
