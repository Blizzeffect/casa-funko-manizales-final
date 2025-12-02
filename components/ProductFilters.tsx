'use client';

import { useState, useEffect } from 'react';

interface ProductFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    categories: string[];
}

export interface FilterState {
    minPrice: number | '';
    maxPrice: number | '';
    category: string;
    rarity: string;
    search: string;
}

export default function ProductFilters({ onFilterChange, categories }: ProductFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        minPrice: '',
        maxPrice: '',
        category: '',
        rarity: '',
        search: '',
    });

    const handleChange = (key: keyof FilterState, value: string | number) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="bg-dark-2 p-6 rounded-xl border border-gray-800 space-y-6 sticky top-24">
            <h3 className="text-xl font-heading font-bold text-white mb-4">Filtros</h3>

            {/* Search */}
            <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Buscar</label>
                <input
                    type="text"
                    placeholder="Nombre del Funko..."
                    value={filters.search}
                    onChange={(e) => handleChange('search', e.target.value)}
                    className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-cyan outline-none transition"
                />
            </div>

            {/* Price Range */}
            <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Precio</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) : '')}
                        className="w-1/2 bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-magenta outline-none transition"
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : '')}
                        className="w-1/2 bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-magenta outline-none transition"
                    />
                </div>
            </div>

            {/* Category */}
            <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Categoría</label>
                <select
                    value={filters.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-cyan outline-none transition"
                >
                    <option value="">Todas</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* Rarity */}
            <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Rareza / Edición</label>
                <select
                    value={filters.rarity}
                    onChange={(e) => handleChange('rarity', e.target.value)}
                    className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-cyan outline-none transition"
                >
                    <option value="">Cualquiera</option>
                    <option value="Chase">Chase (Limited)</option>
                    <option value="Flocked">Flocked (Peluche)</option>
                    <option value="Glow">Glow in the Dark</option>
                    <option value="Exclusive">Exclusive</option>
                    <option value="Diamond">Diamond Collection</option>
                </select>
            </div>

            {/* Reset Button */}
            <button
                onClick={() => {
                    const reset = { minPrice: '', maxPrice: '', category: '', rarity: '', search: '' };
                    setFilters(reset);
                    onFilterChange(reset);
                }}
                className="w-full py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition"
            >
                Limpiar Filtros
            </button>
        </div>
    );
}
