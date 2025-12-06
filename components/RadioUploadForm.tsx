'use client';

import { uploadTrack } from '@/lib/actions/radio';
import { useState, useRef } from 'react';

export default function RadioUploadForm() {
    const [isUploading, setIsUploading] = useState(false);
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
            // Basic handling: we can't easily set file input value programmatically for security
            // But we can use this for visual feedback or advanced uploads. 
            // For simplicity in this server action setup, let's rely on the click-to-select 
            // or standard file input behavior, but just highlight that it works.
            // Actually, to make drag/drop work with native form submission, we'd need to manually 
            // attach the file to the input ref.
            const fileInput = formRef.current?.querySelector('input[name="file"]') as HTMLInputElement;
            if (fileInput) {
                fileInput.files = e.dataTransfer.files;
            }
        }
    };

    return (
        <form
            ref={formRef}
            action={async (formData) => {
                setIsUploading(true);
                const result = await uploadTrack(formData);
                setIsUploading(false);
                if (result?.success) {
                    alert('¡Pista subida con éxito! 🎵');
                    formRef.current?.reset();
                } else if (result?.error) {
                    alert(result.error);
                }
            }}
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
                {isUploading ? 'Subiendo a la nube... ☁️' : 'Subir a la Onda 🌊'}
            </button>
        </form>
    );
}
