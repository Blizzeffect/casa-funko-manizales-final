// app/api/admin/products/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export async function POST(req: Request) {
  try {
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const formData = await req.formData();

    const name = String(formData.get('name') || '');
    const price = Number(formData.get('price') || 0);
    const cost = formData.get('cost')
      ? Number(formData.get('cost'))
      : null;
    const stock = Number(formData.get('stock') || 0);
    const category = String(formData.get('category') || '');
    const description = String(formData.get('description') || '');
    const template = String(formData.get('template') || 'default');

    const file = formData.get('image') as File | null;

    if (!name || !price || !stock || !file) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios.' },
        { status: 400 }
      );
    }

    // 1) Subir imagen a Supabase Storage (bucket "funkos")
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `products/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('funkos')
      .upload(filePath, fileBytes, {
        contentType: file.type || 'image/png',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error al subir imagen:', uploadError);
      return NextResponse.json(
        { error: 'No se pudo subir la imagen.' },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('funkos').getPublicUrl(filePath);

    // 2) Insertar producto en la tabla public.products
    const { data, error: insertError } = await supabase
      .from('products')
      .insert({
        name,
        price,
        cost,
        stock,
        category,
        description,
        image_url: publicUrl,
        template,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error al insertar producto:', insertError);
      return NextResponse.json(
        { error: 'No se pudo guardar el producto.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, product: data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error inesperado en POST /api/admin/products:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
