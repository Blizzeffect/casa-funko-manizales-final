// app/admin/products/new/page.tsx

'use client';

import { useState, FormEvent } from 'react';

const TEMPLATE_BACKGROUND_URLS: Record<string, string> = {
  default:
    'https://kcesbopmsmbbxczkooay.supabase.co/storage/v1/object/public/funkos/templates/default.png',
};

export default function NewProductPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(1);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isPreorder, setIsPreorder] = useState(false);

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
      setMessage(
        'Faltan campos obligatorios (nombre, precio, stock o imagen).'
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', String(price));
      if (cost !== '') formData.append('cost', String(cost));
      formData.append('stock', String(stock));
      formData.append('category', category);
      formData.append('description', description);
      formData.append('is_preorder', String(isPreorder));
      formData.append('template', 'default');
      formData.append('image', imageFile);

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMessage(
          data?.error || 'Error al guardar el producto en el servidor.'
        );
        return;
      }

      const data = await res.json();
      console.log('Producto creado:', data);

      setMessage('Producto creado correctamente.');

      // Limpiar formulario
      setName('');
      setPrice('');
      setCost('');
      setStock(1);
      setCategory('');
      setDescription('');
      setIsPreorder(false);
      setImageFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error(error);
      setMessage('Error al guardar el producto.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem',
    backgroundColor: '#020617',
    color: '#e5e7eb',
    border: '1px solid #1f2937',
    borderRadius: 6,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: 4,
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Nuevo Funko</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: '1.5fr 1fr',
        }}
      >
        {/* Columna izquierda: campos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Imagen */}
          <div>
            <label style={labelStyle}>Imagen del Funko (PNG/JPG)</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              style={{
                ...inputStyle,
                cursor: 'pointer',
              }}
            />
          </div>

          {/* Datos básicos */}
          <div>
            <label style={labelStyle}>Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Luffy Gear 5"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Precio (venta)</label>
              <input
                type="number"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value ? Number(e.target.value) : '')
                }
                placeholder="Ej: 120000"
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Costo (opcional)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) =>
                  setCost(e.target.value ? Number(e.target.value) : '')
                }
                placeholder="Ej: 80000"
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value ? Number(e.target.value) : '')
                }
                placeholder="Ej: 5"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Pre-order Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="isPreorder"
              checked={isPreorder}
              onChange={(e) => setIsPreorder(e.target.checked)}
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
            <label htmlFor="isPreorder" style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Es Pre-orden (Permitir venta sin stock)
            </label>
          </div>

          {/* Clasificación */}
          <div>
            <label style={labelStyle}>Categoría</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ej: Funko Pop, Keychain..."
              style={inputStyle}
            />
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles del Funko (condición, edición, etc.)"
              rows={4}
              style={{
                ...inputStyle,
                resize: 'vertical',
              }}
            />
          </div>

          {/* Plantilla (por ahora fija) */}
          <div>
            <label style={labelStyle}>Plantilla</label>
            <input
              type="text"
              value="default"
              disabled
              style={{
                ...inputStyle,
                color: '#9ca3af',
                borderStyle: 'dashed',
                borderColor: '#4b5563',
              }}
            />
            <small
              style={{
                color: '#9ca3af',
                fontSize: '0.75rem',
              }}
            >
              Por ahora solo usamos la plantilla “default”. Más adelante
              agregamos más opciones.
            </small>
          </div>

          {/* Mensaje y botón */}
          {message && (
            <div
              style={{
                marginTop: '0.5rem',
                fontSize: '0.85rem',
                color: message.includes('correctamente')
                  ? '#22c55e'
                  : '#f97316',
              }}
            >
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
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            Vista previa
          </h2>

          <div
            style={{
              width: '100%',
              aspectRatio: '3 / 4',
              borderRadius: 12,
              backgroundImage: `url(${TEMPLATE_BACKGROUND_URLS['default']})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
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
              <span style={{ color: '#e5e7eb', zIndex: 1 }}>
                Sube una imagen para verla aquí
              </span>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 'bold' }}>
              {name || 'Nombre del Funko'}
            </div>
            <div style={{ color: '#4b5563' }}>
              {price
                ? `Precio: $${price.toLocaleString('es-CO')}`
                : 'Precio aún sin definir'}
            </div>
            {stock !== '' && (
              <div style={{ color: '#4b5563' }}>Stock: {stock}</div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
