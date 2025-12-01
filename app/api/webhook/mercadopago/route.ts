import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { env } from '@/lib/env';

// Verificar la firma del webhook
function verifyWebhookSignature(
  body: string,
  xSignature: string
): boolean {
  try {
    const parts = xSignature.split(',');
    const timestamp = parts[0].split('=')[1];
    const hash = parts[1].split('=')[1];

    const data = `${timestamp}.${body}`;
    const secret = env.MP_WEBHOOK_SECRET;

    const hmac = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64');

    return hmac === hash;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

// Mapear estados de MP a estados de la app
function mapMPStatus(mpStatus: string): string {
  const statusMap: Record<string, string> = {
    'approved': 'paid',
    'pending': 'pending',
    'authorized': 'pending',
    'in_process': 'processing',
    'rejected': 'failed',
    'cancelled': 'cancelled',
    'refunded': 'refunded',
    'charged_back': 'failed',
  };
  return statusMap[mpStatus] || 'pending';
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const xSignature = request.headers.get('x-signature');

    console.log('🔔 Webhook received');

    // Verificar firma SOLO si está disponible
    if (xSignature && env.MP_WEBHOOK_SECRET) {
      if (!verifyWebhookSignature(body, xSignature)) {
        console.error('❌ Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      console.log('✅ Signature verified');
    } else {
      console.warn('⚠️ Skipping signature verification (testing mode)');
    }

    const payload = JSON.parse(body);

    // Solo procesamos notificaciones de pago
    if (payload.type !== 'payment') {
      console.log('⏭️ Skipping non-payment event:', payload.type);
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const paymentId = payload.data?.id;
    const mpStatus = payload.data?.status;

    if (!paymentId) {
      console.error('❌ No payment ID in webhook');
      return new Response(
        JSON.stringify({ error: 'No payment ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    const orderStatus = mapMPStatus(mpStatus);

    console.log(`💳 Processing payment: ${paymentId} -> ${orderStatus}`);

    // Obtener la orden usando el payment_id
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, reference, payment_id')
      .eq('payment_id', paymentId)
      .single();

    if (fetchError || !order) {
      console.warn('⚠️ Order not found for payment:', paymentId);
      // No fallar si no encontramos la orden
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Actualizar el estado de la orden
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        updated_at: new Date().toISOString(),
        payment_status: mpStatus,
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('❌ Error updating order:', updateError);
      return new Response(
        JSON.stringify({ error: 'Error updating order' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Order ${order.reference} updated to ${orderStatus}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
