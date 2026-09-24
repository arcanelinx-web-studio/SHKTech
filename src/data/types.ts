import type { ImageMetadata } from 'astro';
export interface Source {
  document: 'catalogue' | 'business-card' | 'concept';
  pages?: number[];
}
export interface ProductCategory {
  id: string;
  title: string;
  label: string;
  description: string;
  image?: ImageMetadata;
  features: string[];
  applications: string[];
  specifications?: Record<string, string>;
  compatibility?: string;
  downloads?: { title: string; href: string }[];
  source: Source;
}
export interface Product extends ProductCategory {
  categoryId: string;
  model?: string;
}
export interface Service {
  id: string;
  title: string;
  description: string;
  problem: string;
  provides: string[];
  process: string[];
  applications: string[];
  source: Source;
}
export interface Brand {
  name: string;
  source: Source;
}
export interface Problem {
  id: string;
  title: string;
  description: string;
  products: string[];
  services: string[];
}
export interface Industry {
  name: string;
  applications: string;
  source: Source;
}
export interface MachineZone {
  id: string;
  title: string;
  description: string;
  products: string[];
  services: string[];
  x: number;
  y: number;
}
export interface EnquiryItem {
  id: string;
  title: string;
  kind: 'product' | 'category' | 'service';
  note?: string;
}
