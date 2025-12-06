'use client';

import { useState, useRef, useEffect } from 'react';

type Track = {
    id: string;
    title: string;
    artist: string;
    file_url: string;
    image_url?: string | null;
};

export default function RadioPlayer({ tracks }: { tracks: Track[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const audioRef = useRef<HTMLAudioElement>(null);

    const currentTrack = tracks[currentIndex];

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            if (isPlaying) {
                audioRef.current.play().catch(e => console.log('Autoplay blocked:', e));
            }
        }
    }, [currentIndex, isPlaying, volume]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const nextTrack = () => {
        setCurrentIndex((prev) => (prev + 1) % tracks.length);
        setIsPlaying(true);
    };

    const prevTrack = () => {
        setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
        setIsPlaying(true);
    };

    const handleEnded = () => {
        nextTrack();
    };

    if (!tracks || tracks.length === 0) {
        return (
            <div className="bg-dark-2 rounded-xl p-6 border border-gray-800 text-center text-gray-500">
                Radio Offline zZZ...
            </div>
        );
    }

    return (
        <div className="bg-dark-2 rounded-xl border border-magenta/30 p-6 shadow-[0_0_20px_rgba(255,0,110,0.1)] relative overflow-hidden">
            {/* Background decoration */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan via-white to-magenta ${isPlaying ? 'animate-pulse' : ''}`} />

            <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Visualizer / Album Art Placeholder */}
                <div className="w-24 h-24 bg-black rounded-lg border border-gray-700 flex items-center justify-center relative overflow-hidden group">
                    {currentTrack.image_url ? (
                        <>
                            <img
                                src={currentTrack.image_url}
                                alt={currentTrack.title}
                                className={`absolute inset-0 w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
                            />
                            {/* Overlay darkens image slightly when visuals play */}
                            {isPlaying && <div className="absolute inset-0 bg-black/30" />}
                        </>
                    ) : (
                        <div className={`absolute inset-0 bg-gradient-to-tr from-cyan/20 to-magenta/20 ${isPlaying ? 'animate-spin-slow' : ''}`} />
                    )}

                    {!currentTrack.image_url && <div className="text-4xl relative z-10 group-hover:scale-110 transition">📻</div>}

                    {/* Visualizer */}
                    {isPlaying && (
                        <div className="absolute bottom-1 left-0 right-0 flex justify-center items-end gap-[2px] h-8 px-2 z-20">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-2 bg-cyan/80 animate-music-bar shadow-[0_0_5px_cyan]" style={{ animationDelay: `${i * 0.1}s`, height: '50%' }} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Controls & Info */}
                <div className="flex-1 w-full relative z-10">
                    <div className="mb-2 text-center md:text-left">
                        <h3 className="text-white font-bold text-lg truncate">{currentTrack.title}</h3>
                        <p className="text-cyan text-sm">{currentTrack.artist}</p>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                        <button onClick={prevTrack} className="text-gray-400 hover:text-white transition text-xl">⏮️</button>
                        <button
                            onClick={togglePlay}
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-magenta to-purple-600 flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition"
                        >
                            {isPlaying ? '⏸️' : '▶️'}
                        </button>
                        <button onClick={nextTrack} className="text-gray-400 hover:text-white transition text-xl">⏭️</button>
                    </div>

                    {/* Volume Slider - Simple */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">🔈</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan [&::-webkit-slider-thumb]:rounded-full"
                        />
                        <span className="text-xs text-gray-500">🔊</span>
                    </div>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={currentTrack.file_url}
                onEnded={handleEnded}
            />

            <style jsx global>{`
                @keyframes music-bar {
                    0%, 100% { height: 20%; }
                    50% { height: 100%; }
                }
                .animate-music-bar {
                    animation: music-bar 0.8s ease-in-out infinite;
                }
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
            `}</style>
        </div>
    );
}
