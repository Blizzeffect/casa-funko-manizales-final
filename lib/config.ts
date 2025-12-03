export const siteConfig = {
    name: 'CasaPop',
    description: 'Tu tienda de Funko Pops favorita. Encuentra las mejores figuras coleccionables, ediciones limitadas y más.',
    url: 'https://casapop.co',
    ogImage: 'https://casapop.co/og.jpg',
    links: {
        twitter: 'https://twitter.com/casapop',
        instagram: 'https://instagram.com/casapop',
    },
    contact: {
        email: 'contacto@casapop.co',
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
