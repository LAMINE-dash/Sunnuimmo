import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'buyer' | 'tenant' | 'seller' | 'agency' | 'promoter' | 'notary' | 'bank' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_verified: boolean;
  subscription_plan: 'free' | 'starter' | 'pro' | 'enterprise';
  created_at: string;
}

export interface Property {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'apartment' | 'house' | 'villa' | 'land' | 'commercial' | 'office';
  listing_type: 'sale' | 'rent';
  price: number;
  surface: number;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  address: string;
  city: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  features: string[];
  status: 'active' | 'pending' | 'sold' | 'rented' | 'archived';
  is_premium: boolean;
  is_verified: boolean;
  views: number;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  property_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  amount: number;
  payment_method: 'orange' | 'wave' | 'card';
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  started_at: string;
  ends_at: string | null;
  created_at: string;
}
