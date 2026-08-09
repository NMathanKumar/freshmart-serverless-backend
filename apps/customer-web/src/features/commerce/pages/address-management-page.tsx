import { Suspense, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@freshmart/design-system';
import { CheckCircle2, Home, LoaderCircle, MapPin, Navigation, Phone, Plus, Trash2, Briefcase, Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAddAddressMutation, useGetAddressesQuery, type AddressInput } from '../api/commerce-api.js';
import { CommerceShell } from '../components/commerce-layout.js';
import { CommerceState, ListSkeleton } from '../components/commerce-state.js';
import type { AddressView } from '../model/commerce-content.js';

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

const AddressManagementContent = () => {
  const { data = [], isError, isLoading, refetch } = useGetAddressesQuery();
  const [type, setType] = useState<FormValues['label']>('Home');
  const [localAddresses, setLocalAddresses] = useState<AddressView[] | null>(null);
  const [addAddress, addState] = useAddAddressMutation();
  const { formState: { errors, isSubmitSuccessful }, handleSubmit, register, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { city: 'San Francisco', isDefault: false, label: 'Home', state: 'California' }
  });

  const displayAddresses = localAddresses ?? data;

  const save = async (values: FormValues) => {
    await addAddress(values as AddressInput).unwrap();
    setLocalAddresses(null);
    reset({ city: 'San Francisco', isDefault: false, label: type, state: 'California' });
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('line1', `GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          setValue('landmark', 'Current Location');
        },
        (err) => {
          console.warn('Geolocation failed:', err.message);
        }
      );
    }
  };

  const handleEdit = (address: AddressView) => {
    setType(address.label);
    setValue('label', address.label);
    setValue('name', address.name);
    setValue('phone', address.phone);
    setValue('line1', address.lines[0] ?? '');
    setValue('line2', address.lines[1] ?? '');
    setValue('landmark', address.lines[2] ?? '');
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('postalCode', address.postalCode);
    setValue('isDefault', Boolean(address.isDefault));
  };

  const handleDelete = (addressId: string) => {
    setLocalAddresses(displayAddresses.filter((a) => a.addressId !== addressId));
  };

  return (
    <CommerceShell active="account" title="Addresses">
      <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-28 md:px-10">
        <div className="mb-8"><h1 className="mb-2 text-3xl font-bold md:text-4xl">My Addresses</h1><p className="text-[#3e4a3d]">Manage your delivery locations for faster checkout.</p></div>
        <section className="mb-16">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold"><MapPin className="h-5 w-5 text-[#006b2c]" />Saved Addresses</h2>
          {isLoading && <ListSkeleton />}
          {isError && <CommerceState description="We could not load your addresses. Please retry." onAction={() => void refetch()} title="Addresses unavailable" />}
          {!isLoading && !isError && displayAddresses.length === 0 && <CommerceState description="Add your first delivery address to speed up checkout." icon="empty" title="No saved addresses" />}
          {!isLoading && !isError && displayAddresses.length > 0 && <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{displayAddresses.map((address) => <AddressCard address={address} key={address.addressId} onDelete={handleDelete} onEdit={handleEdit} />)}</div>}
        </section>
        <section className="mx-auto max-w-3xl">
          <form className="commerce-card rounded-2xl p-6 md:p-8" onSubmit={(event) => void handleSubmit(save)(event)}>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div><h2 className="flex items-center gap-2 text-xl font-semibold"><Plus className="h-5 w-5 text-[#006b2c]" />Add New Address</h2><p className="mt-1 text-sm text-[#3e4a3d]">Fill in the details below to save a new location.</p></div>
              <Button className="gap-2 rounded-xl bg-[#d8f4ce] text-[#006b2c] shadow-none hover:bg-[#c4efad]" onClick={handleUseCurrentLocation} type="button"><Navigation className="h-4 w-4" />Use Current Location</Button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2"><Field error={errors.name?.message} label="Full Name"><Input className="h-14 rounded-xl bg-[#f4fcf0]" placeholder="e.g. John Doe" {...register('name')} /></Field><Field error={errors.phone?.message} label="Phone Number"><Input className="h-14 rounded-xl bg-[#f4fcf0]" placeholder="e.g. +1 555-0000" type="tel" {...register('phone')} /></Field></div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3"><Field error={errors.line1?.message} label="House/Flat No"><Input className="h-14 rounded-xl bg-[#f4fcf0]" placeholder="e.g. 4B" {...register('line1')} /></Field><Field error={errors.line2?.message} label="Street/Area"><Input className="h-14 rounded-xl bg-[#f4fcf0] md:col-span-2" placeholder="e.g. Maple Avenue, Green District" {...register('line2')} /></Field></div>
            <div className="mt-6"><Field error={errors.landmark?.message} label="Landmark (Optional)"><Input className="h-14 rounded-xl bg-[#f4fcf0]" placeholder="e.g. Next to Central Bank" {...register('landmark')} /></Field></div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3"><Field error={errors.city?.message} label="City"><Input className="h-14 rounded-xl bg-[#f4fcf0]" {...register('city')} /></Field><Field error={errors.state?.message} label="State"><Input className="h-14 rounded-xl bg-[#f4fcf0]" {...register('state')} /></Field><Field error={errors.postalCode?.message} label="PIN Code"><Input className="h-14 rounded-xl bg-[#f4fcf0]" {...register('postalCode')} /></Field></div>
            <div className="mt-6"><label className="mb-4 block text-sm font-semibold text-[#3e4a3d]">Save address as</label><div className="flex flex-wrap gap-3">{(['Home', 'Work', 'Other'] as const).map((label) => <button className={`commerce-focus flex items-center gap-2 rounded-full border-2 px-6 py-3 font-semibold ${type === label ? 'border-[#006b2c] bg-[#006b2c] text-white' : 'border-[#bdcaba] text-[#3e4a3d] hover:border-[#006b2c]'}`} key={label} onClick={() => { setType(label); setValue('label', label); }} type="button">{label === 'Home' ? <Home className="h-4 w-4" /> : label === 'Work' ? <Briefcase className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}{label}</button>)}</div></div>
            <label className="mt-6 flex items-center justify-between rounded-xl bg-[#f4fcf0] px-5 py-4"><span className="flex items-center gap-3 font-semibold"><CheckCircle2 className="h-5 w-5 text-[#006b2c]" />Set as default address</span><input className="h-5 w-5 accent-[#006b2c]" type="checkbox" {...register('isDefault')} /></label>
            <div className="mt-8 flex flex-col gap-4 md:flex-row"><Button className="flex-1 rounded-xl py-4 text-lg" disabled={addState.isLoading} type="submit">{addState.isLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : null}Save Address</Button><Button className="rounded-xl border border-[#bdcaba] bg-transparent py-4 text-[#3e4a3d] shadow-none hover:bg-[#eff6ea] md:w-1/3" type="button" variant="secondary" onClick={() => reset()}>Cancel</Button></div>
            {addState.isError && <p className="mt-4 text-sm font-semibold text-[#93000a]" role="alert">Unable to save this address. Please retry.</p>}
            {isSubmitSuccessful && !addState.isError && <p className="mt-4 text-sm font-semibold text-[#006b2c]" role="status">Address saved successfully.</p>}
          </form>
        </section>
      </main>
    </CommerceShell>
  );
};

const AddressCard = ({ address, onDelete, onEdit }: { address: AddressView; onDelete: (id: string) => void; onEdit: (address: AddressView) => void }) => {
  const Icon = address.label === 'Home' ? Home : address.label === 'Work' ? Briefcase : MapPin;
  return <article className={`commerce-card p-6 ${address.isDefault ? 'border-2 border-[#006b2c]' : ''}`}><div className="mb-4 flex items-start justify-between"><div className="flex items-center gap-2"><Icon className="h-5 w-5 text-[#006b2c]" /><span className="font-semibold">{address.label}</span>{address.isDefault && <span className="rounded-full bg-[#d8f4ce] px-3 py-1 text-[10px] font-bold text-[#006b2c]">DEFAULT</span>}</div><input aria-label={`Select ${address.label} address`} className="h-5 w-5 accent-[#006b2c]" defaultChecked={address.isDefault} name="delivery_select" type="radio" /></div><div className="mb-6"><h3 className="mb-1 text-xl font-semibold">{address.name}</h3><p className="leading-7 text-[#3e4a3d]">{address.lines.map((line) => <span key={line}>{line}<br /></span>)}{address.city}, {address.state} {address.postalCode}</p><p className="mt-4 flex items-center gap-2 font-semibold"><Phone className="h-4 w-4" />{address.phone}</p></div><div className="flex gap-4 border-t border-[#bdcaba]/50 pt-4"><button className="commerce-focus flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-semibold text-[#006b2c] hover:bg-[#eff6ea]" onClick={() => onEdit(address)} type="button"><Pencil className="h-4 w-4" />Edit</button><button className="commerce-focus flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-semibold text-[#93000a] hover:bg-[#fff0f1]" onClick={() => onDelete(address.addressId)} type="button"><Trash2 className="h-4 w-4" />Delete</button></div></article>;
};

const Field = ({ children, error, label }: { children: React.ReactNode; error?: string; label: string }) => <label className="block space-y-2"><span className="ml-1 block text-sm font-semibold text-[#3e4a3d]">{label}</span>{children}{error && <span className="block text-xs font-semibold text-[#93000a]">{error}</span>}</label>;

export default function AddressManagementPage() {
  return <Suspense fallback={<ListSkeleton />}><AddressManagementContent /></Suspense>;
}
