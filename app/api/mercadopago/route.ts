import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, reference } = body;

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items.map((item: any) => ({
          title: item.name,
          unit_price: item.price,
          quantity: item.qty,
          currency_id: 'COP',
        })),
        external_reference: reference,
        back_urls: {
          success: 'https://casafunko.shop/gracias',
          failure: 'https://casafunko.shop/gracias',
          pending: 'https://casafunko.shop/gracias',
        },
        auto_return: 'approved',
      },
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Mercado Pago error:', error);
    return NextResponse.json({ error: 'mp-error' }, { status: 500 });
  }
}
