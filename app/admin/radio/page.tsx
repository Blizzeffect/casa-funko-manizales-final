import { createClient } from '@/utils/supabase/server';
import { deleteTrack } from '@/lib/actions/radio';
import RadioUploadForm from '@/components/RadioUploadForm';

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

                <RadioUploadForm />
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
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-gray-500 group-hover:text-cyan transition overflow-hidden">
                                    {track.image_url ? (
                                        <img src={track.image_url} alt={track.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>▶️</span>
                                    )}
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
