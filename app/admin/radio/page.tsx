import { createClient } from '@/utils/supabase/server';
import { deleteTrack, uploadTrack } from '@/lib/actions/radio';

export const metadata = {
    title: 'Gestor de Radio Aesthetic',
};

export default async function AdminRadioPage() {
    const supabase = await createClient();
    const { data: tracks } = await supabase
        .from('radio_tracks')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-4xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">
                Estación de Radio Vaporwave 📻
            </h1>

            {/* Upload Section */}
            <div className="bg-dark-2 rounded-2xl border border-cyan/30 p-8 shadow-[0_0_30px_rgba(0,245,255,0.1)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-magenta/5 pointer-events-none" />

                <h2 className="text-2xl font-bold text-white mb-6 relative z-10 flex items-center gap-2">
                    <span>💾</span> Subir Nueva Pista
                </h2>

                <form action={async (formData) => {
                    'use server';
                    await uploadTrack(formData);
                }} className="space-y-6 relative z-10">
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

                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-cyan/50 hover:bg-cyan/5 transition cursor-pointer relative group/file">
                        <input
                            type="file"
                            name="file"
                            accept="audio/*"
                            required
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        <div className="text-4xl mb-3 group-hover/file:scale-110 transition-transform">🎵</div>
                        <p className="text-gray-300 font-medium">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                        <p className="text-gray-500 text-sm mt-2">Formatos: MP3, WAV, AAC (Max 10MB)</p>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-cyan to-magenta text-white font-bold rounded-xl text-lg hover:brightness-110 hover:scale-[1.01] transition shadow-lg"
                    >
                        Subir a la Onda 🌊
                    </button>
                </form>
            </div>

            {/* Tracks List */}
            <div className="bg-dark-2 rounded-2xl border border-gray-800 p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>playlist.exe</span>
                </h2>

                <div className="space-y-2">
                    {tracks?.map((track) => (
                        <div key={track.id} className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-800 hover:border-magenta/30 transition group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-gray-500 group-hover:text-cyan transition">
                                    ▶️
                                </div>
                                <div>
                                    <div className="text-white font-bold">{track.title}</div>
                                    <div className="text-sm text-gray-500">{track.artist}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
                                <form action={async () => {
                                    'use server';
                                    await deleteTrack(track.id, track.file_url);
                                }}>
                                    <button className="text-gray-500 hover:text-red-400 transition p-2 hover:bg-red-500/10 rounded-full" title="Eliminar">
                                        🗑️
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                    {(!tracks || tracks.length === 0) && (
                        <div className="text-center py-12 text-gray-500">
                            No hay pistas en la playlist. ¡Sube algo funky! 🕺
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
