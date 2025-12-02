export const siteConfig = {
    name: 'Casa Funko Manizales',
    description: 'Tu tienda de Funko Pops favorita en Manizales. Encuentra las mejores figuras coleccionables, ediciones limitadas y más.',
    url: 'https://casa-funko-manizales.vercel.app', // Replace with actual URL
    ogImage: 'https://casa-funko-manizales.vercel.app/og.jpg', // Replace with actual OG image URL
    links: {
        twitter: 'https://twitter.com/casafunko',
        instagram: 'https://instagram.com/casafunko',
    },
    contact: {
        email: 'contacto@casafunko.com',
        phone: '+57 300 123 4567',
        address: 'Manizales, Caldas, Colombia',
    },
    currency: {
        code: 'COP',
        symbol: '$',
        locale: 'es-CO',
    },
};

export type SiteConfig = typeof siteConfig;
