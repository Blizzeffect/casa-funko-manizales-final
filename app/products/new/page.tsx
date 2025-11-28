// app/admin/products/new/page.tsx

'use client';

import { useState, FormEvent } from 'react';

export default function NewProductPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(1);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!name || !price || !stock || !imageFile) {
      setMessage('Faltan campos obligatorios (nombre, precio, stock o imagen).');
      return;
    }

    try {
      setIsSubmitting(true);

      // AQUÍ MÁS ADELANTE:
      // 1) Subiremos imageFile a Supabase Storage (bucket "funkos")
      // 2) Obtendremos la URL pública
      // 3) Llamaremos a una API o server action para insertar en public.products

      console.log('Simulando envío de producto:', {
        name,
        price,
        cost,
        stock,
        category,
        description,
        template: 'default',
        imageFile,
      });

      setMessage('Producto registrado (simulado). Luego conectamos con Supabase.');
    } catch (error) {
      console.error(error);
      setMessage('Error al guardar el producto.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Nuevo Funko</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1.5fr 1fr' }}>
        {/* Columna izquierda: campos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Imagen */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
              Imagen del Funko (PNG/JPG)
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
            />
          </div>

          {/* Datos básicos */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Luffy Gear 5"
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
                Precio (venta)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej: 120000"
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
                Costo (opcional)
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej: 80000"
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
                Stock
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej: 5"
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
          </div>

          {/* Clasificación */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
              Categoría
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ej: Funko Pop, Keychain..."
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          {/* Descripción */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles del Funko (condición, edición, etc.)"
              rows={4}
              style={{ width: '100%', padding: '0.5rem', resize: 'vertical' }}
            />
          </div>

          {/* Plantilla (por ahora fija) */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
              Plantilla
            </label>
            <input
              type="text"
              value="default"
              disabled
              style={{ width: '100%', padding: '0.5rem', backgroundColor: '#f3f3f3' }}
            />
            <small style={{ color: '#666' }}>
              Por ahora solo usamos la plantilla “default”. Más adelante agregamos más opciones.
            </small>
          </div>

          {/* Mensaje y botón */}
          {message && (
            <div style={{ marginTop: '0.5rem', color: '#444' }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#111827',
              color: 'white',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar producto'}
          </button>
        </div>

        {/* Columna derecha: preview */}
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '1rem',
            background: '#f9fafb',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Vista previa</h2>
          <div
            style={{
              width: '100%',
              aspectRatio: '3 / 4',
              borderRadius: 12,
              background: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Futuro: aquí entra la plantilla en el fondo según template */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #4c1d95, #111827)',
                opacity: 0.5,
              }}
            />

            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview Funko"
                style={{
                  maxWidth: '70%',
                  maxHeight: '80%',
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 1,
                }}
              />
            ) : (
              <span style={{ color: '#6b7280', zIndex: 1 }}>
                Sube una imagen para verla aquí
              </span>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 'bold' }}>{name || 'Nombre del Funko'}</div>
            <div style={{ color: '#4b5563' }}>
              {price ? `Precio: $${price.toLocaleString('es-CO')}` : 'Precio aún sin definir'}
            </div>
            {stock !== '' && (
              <div style={{ color: '#4b5563' }}>
                Stock: {stock}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
