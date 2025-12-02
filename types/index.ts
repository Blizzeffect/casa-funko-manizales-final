export interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  stock: number;
  description: string;
  category?: string;
  template?: string | null;
  is_preorder?: boolean;
  release_date?: string | null;
}

export interface CartItem extends Product {
  cartId: string; // Changed from number to string for UUID
  qty?: number;
}

export interface OrderItem {
  product_id: number;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: number;
  reference: string;
  mp_preference_id?: string;
  items: CartItem[]; // Or a specific OrderItem type if structure differs
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  courier?: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  reading_time: string;
  published_at: string;
  created_at: string;
}
