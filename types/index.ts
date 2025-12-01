export interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  stock: number;
  description: string;
  template?: string | null;
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
  total_amount: number;
  items: OrderItem[];
  status: string;
  payment_id?: string;
  payment_status?: string;
  preference_id?: string;
  created_at?: string;
  updated_at?: string;
}
