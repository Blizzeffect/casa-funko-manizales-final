import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    const secret = process.env.MP_WEBHOOK_SECRET!;

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const xSignature = request.headers.get('x-signature');

    console.log('🔔 Webhook received:', {
      signature: xSignature?.substring(0, 20) + '...',
      bodyLength: body.length,
    });

    // ⚠️ IMPORTANTE: Verificar firma SOLO si la clave está disponible
    if (xSignature && process.env.MP_WEBHOOK_SECRET) {
      if (!verifyWebhookSignature(body, xSignature)) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
      console.log('✅ Signature verified');
    } else {
      console.warn('⚠️ Skipping signature verification (testing mode)');
    }

    const payload = JSON.parse(body);

    // Solo procesamos notificaciones de pago
    if (payload.type !== 'payment') {
      console.log('⏭️  Skipping non-payment event:', payload.type);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const paymentId = payload.data?.id;
    const mpStatus = payload.data?.status;

    if (!paymentId) {
      console.error('❌ No payment ID in webhook');
      return NextResponse.json(
        { error: 'No payment ID' },
        { status: 400 }
      );
    }

    const orderStatus = mapMPStatus(mpStatus);

    console.log(`💳 Processing payment: ${paymentId} -> ${orderStatus}`);

    // Obtener la orden usando el payment_id
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, reference, payment_id')
      .eq('payment_id', paymentId)
      .single();

    if (fetchError) {
      console.warn('⚠️ Order not found for payment:', paymentId, fetchError);
      // No fallar si no encontramos la orden (puede ser válido en algunos casos)
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!order) {
      console.warn('⚠️ Order data is null for payment:', paymentId);
      return NextResponse.json({ success: true }, { status: 200 });
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
      return NextResponse.json(
        { error: 'Error updating order' },
        { status: 500 }
      );
    }

    console.log(`✅ Order ${order.reference} updated to ${orderStatus}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
