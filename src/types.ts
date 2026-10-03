export type Page =
  | 'home'
  | 'explore'
  | 'manufacturers'
  | 'product'
  | 'manufacturer-profile'
  | 'chat'
  | 'dashboard'
  | 'cart'
  | 'account'
  | 'checkout'
  | 'admin'
  | 'compare'
  | 'maker-dash';

export interface Product {
  id: string;
  name: string;
  brand: string;
  manufacturer: string;
  manufacturerId: string;
  price: number;
  rating: number;
  reviews: number;
  material: string;
  motif: string;
  color: string;
  location: string;
  image: string;
  badge?: string;
  collection?: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  ownerName: string;
  location: string;
  years: number;
  rating: number;
  reviews: number;
  products: number;
  followers: number;
  responseTime: string;
  priceRange: string;
  verified: boolean;
  speciality: string;
  avatar: string;
  cover: string;
  about: string;
}
