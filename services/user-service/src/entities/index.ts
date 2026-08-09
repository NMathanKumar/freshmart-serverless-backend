export interface Address {
  addressId: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export interface UserProfile {
  userId: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  wishlistCount: number;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}