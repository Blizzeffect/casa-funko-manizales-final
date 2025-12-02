'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';

interface WishlistButtonProps {
    product: Product;
    className?: string;
}

export default function WishlistButton({ product, className = '' }: WishlistButtonProps) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        // Check initial state
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const exists = wishlist.some((p: Product) => p.id === product.id);
        setIsWishlisted(exists);
    }, [product.id]);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering parent click events (like card navigation)
        setAnimating(true);

        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const exists = wishlist.some((p: Product) => p.id === product.id);

        let newWishlist;
        if (exists) {
            newWishlist = wishlist.filter((p: Product) => p.id !== product.id);
            setIsWishlisted(false);
        } else {
            newWishlist = [...wishlist, product];
            setIsWishlisted(true);
        }

        localStorage.setItem('wishlist', JSON.stringify(newWishlist));

        // Dispatch custom event for other components to listen (like the header counter)
        window.dispatchEvent(new Event('wishlist-updated'));

        setTimeout(() => setAnimating(false), 300);
    };

    return (
        <button
            onClick={toggleWishlist}
            className={`relative z-20 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all group ${className}`}
            title={isWishlisted ? "Eliminar de favoritos" : "Agregar a favoritos"}
        >
            <span
                className={`block text-xl transition-transform duration-300 ${animating ? 'scale-125' : 'scale-100'
                    } ${isWishlisted ? 'text-magenta' : 'text-gray-400 group-hover:text-white'}`}
            >
                {isWishlisted ? '❤️' : '🤍'}
            </span>
        </button>
    );
}
