import { createClient } from '@/utils/supabase/server';
import ChatForm from '@/components/ChatForm';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import RadioPlayer from '@/components/RadioPlayer';

export const metadata = {
    title: 'Comunidad CasaPop',
    description: 'Únete a la conversación con otros coleccionistas.',
};

export default async function CommunityPage() {
    const supabase = await createClient();

    // Fetch approved messages
    const { data: messages } = await supabase
        .from('community_messages')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

    // Fetch radio tracks
    const { data: tracks } = await supabase
        .from('radio_tracks')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-dark pt-24 pb-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-magenta to-cyan mb-4">
                        Comunidad CasaPop
                    </h1>
                    <p className="text-gray-400 text-lg">Conecta con otros coleccionistas y comparte tu pasión.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar: Form & Radio */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Radio Widget */}
                        <div className="sticky top-24 space-y-8">
                            <RadioPlayer tracks={tracks || []} />

                            {/* Chat Form */}
                            <ChatForm />
                        </div>
                    </div>

                    {/* Messages Feed */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-6">Últimos Mensajes</h2>

                        <div className="space-y-4">
                            {messages?.map((msg) => (
                                <div key={msg.id} className="bg-dark-2 rounded-xl p-6 border border-gray-800 animate-fade-in shadow-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-cyan text-lg">{msg.nickname}</span>
                                        <span className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: es })}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                </div>
                            ))}

                            {(!messages || messages.length === 0) && (
                                <div className="bg-dark-2 rounded-xl p-12 text-center border border-gray-800 border-dashed">
                                    <p className="text-gray-500">Aún no hay mensajes. ¡Sé el primero en escribir!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
