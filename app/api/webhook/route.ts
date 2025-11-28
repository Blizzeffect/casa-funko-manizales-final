import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifyWebhookSignature(body: string, xSignature: string): boolean {
  try {
    const parts = xSignature.split(',');
    const timestamp = parts[0].split('=')[1];
    const hash = parts[1].split('=')[1];
    const data = `${timestamp}.${body}`;
    const secret = process.env.MP_WEBHOOK_SECRET!;
    const hmac = crypto.createHmac('sha256', secret).update(data).digest('base64');
    return hmac === hash;
  } catch (error) {
    console.error('Signature error:', error);
    return false;
  }
}

function mapMPStatus(mpStatus: string): string {
  const map: Record<string, string> = {
    'approved': 'paid',
    'pending': 'pending',
    'authorized': 'pending',
    'in_process': 'processing',
    'rejected': 'failed',
    'cancelled': 'cancelled',
    'refunded': 'refunded',
    'charged_back': 'failed',
  };
  return map[mpStatus] || 'pending';
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const xSignature = request.headers.get('x-signature');

    if (xSignature && process.env.MP_WEBHOOK_SECRET) {
      if (!verifyWebhookSignature(body, xSignature)) {
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
      }
    }

    const payload = JSON.parse(body);
    if (payload.type !== 'payment') {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    const paymentId = payload.data?.id;
    const mpStatus = payload.data?.status;

    if (!paymentId) {
      return new Response(JSON.stringify({ error: 'No payment ID' }), { status: 400 });
    }

    const orderStatus = mapMPStatus(mpStatus);

    const { data: order } = await supabase
      .from('orders')
      .select('id, reference')
      .eq('payment_id', paymentId)
      .single();

    if (!order) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    await supabase
      .from('orders')
      .update({ status: orderStatus, updated_at: new Date().toISOString(), payment_status: mpStatus })
      .eq('id', order.id);

    console.log(`✅ Order ${order.reference} updated to ${orderStatus}`);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
