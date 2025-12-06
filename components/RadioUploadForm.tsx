'use client';

import { saveTrack } from '@/lib/actions/radio';
import { createClient } from '@/utils/supabase/client';
import { useState, useRef } from 'react';

export default function RadioUploadForm() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(''); // e.g., "Subiendo audio...", "Guardando..."
    const formRef = useRef<HTMLFormElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const fileInput = formRef.current?.querySelector('input[name="file"]') as HTMLInputElement;
            if (fileInput) {
                fileInput.files = e.dataTransfer.files;
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isUploading) return;

        setIsUploading(true);
        setUploadStatus('Iniciando carga... 🚀');

        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const artist = formData.get('artist') as string;
        const file = formData.get('file') as File;
        const image = formData.get('image') as File;

        if (!file || file.size === 0) {
            alert('Por favor selecciona un archivo de audio');
            setIsUploading(false);
            return;
        }

        const supabase = createClient();

        try {
            // 1. Upload Audio
            setUploadStatus('Subiendo audio (esto puede tardar)... 🎵');
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `tracks/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('radio_music')
                .upload(filePath, file);

            if (uploadError) throw new Error('Error subiendo audio: ' + uploadError.message);

            const { data: publicUrlData } = supabase.storage
                .from('radio_music')
                .getPublicUrl(filePath);
            const fileUrl = publicUrlData.publicUrl;

            // 2. Upload Image (Optional)
            let imageUrl = null;
            if (image && image.size > 0) {
                setUploadStatus('Subiendo portada... 🖼️');
                const imgExt = image.name.split('.').pop();
                const imgName = `art_${Date.now()}_${Math.random().toString(36).substring(7)}.${imgExt}`;
                const imgPath = `art/${imgName}`;

                const { error: imgUploadError } = await supabase.storage
                    .from('radio_music')
                    .upload(imgPath, image);

                if (imgUploadError) throw new Error('Error subiendo imagen: ' + imgUploadError.message);

                const { data: imgUrlData } = supabase.storage
                    .from('radio_music')
                    .getPublicUrl(imgPath);
                imageUrl = imgUrlData.publicUrl;
            }

            // 3. Save Record
            setUploadStatus('Guardando en base de datos... 💾');
            const result = await saveTrack(title, artist, fileUrl, imageUrl);

            if (result.error) throw new Error(result.error);

            alert('¡Pista subida con éxito! 🎵');
            formRef.current?.reset();

        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Error desconocido');
        } finally {
            setIsUploading(false);
            setUploadStatus('');
        }
    };

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-6 relative z-10"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Título de la Canción</label>
                    <input
                        type="text"
                        name="title"
                        required
                        placeholder="Ej: Midnight City"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan focus:shadow-[0_0_15px_rgba(0,245,255,0.3)] transition outline-none"
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Artista (Opcional)</label>
                    <input
                        type="text"
                        name="artist"
                        placeholder="Ej: M83"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-magenta focus:shadow-[0_0_15px_rgba(255,0,110,0.3)] transition outline-none"
                    />
                </div>
            </div>

            {/* Audio File Input */}
            <div>
                <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Archivo de Audio (MP3/WAV)</label>
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer relative group/file ${dragActive ? 'border-cyan bg-cyan/10' : 'border-gray-700 hover:border-cyan/50 hover:bg-cyan/5'}`}
                >
                    <input
                        type="file"
                        name="file"
                        accept="audio/*"
                        required
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div className="text-4xl mb-3 group-hover/file:scale-110 transition-transform">🎵</div>
                    <p className="text-gray-300 font-medium">Arrastra tu audio aquí o haz clic</p>
                    <p className="text-gray-500 text-sm mt-2">Max 10MB</p>
                </div>
            </div>

            {/* Image File Input */}
            <div>
                <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Imagen de Portada (Opcional)</label>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center hover:border-magenta/50 hover:bg-magenta/5 transition cursor-pointer relative group/img">
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl group-hover/img:scale-110 transition-transform">🖼️</span>
                        <span className="text-gray-300 font-medium">Subir carátula del álbum</span>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isUploading}
                className="w-full py-4 bg-gradient-to-r from-cyan to-magenta text-white font-bold rounded-xl text-lg hover:brightness-110 hover:scale-[1.01] transition shadow-lg disabled:opacity-50 disabled:cursor-wait"
            >
                {isUploading ? uploadStatus : 'Subir a la Onda 🌊'}
            </button>
        </form>
    );
}
