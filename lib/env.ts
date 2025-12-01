const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'MP_ACCESS_TOKEN',
    'MP_WEBHOOK_SECRET',
    'NEXT_PUBLIC_APP_URL',
] as const;

export const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN!,
    MP_WEBHOOK_SECRET: process.env.MP_WEBHOOK_SECRET!,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
    NEXT_PUBLIC_SUPABASE_STORAGE_URL: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL || 'https://kcesbopmsmbbxczkooay.supabase.co/storage/v1/object/public/funkos/templates/default.png',
};

// Simple validation check
if (typeof window === 'undefined') { // Only validate on server side to avoid leaking secrets or breaking build if not needed on client immediately
    const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
    if (missingVars.length > 0) {
        // Only warn for SUPABASE_SERVICE_ROLE_KEY if it's missing, as we handle it gracefully now
        const criticalMissing = missingVars.filter(k => k !== 'SUPABASE_SERVICE_ROLE_KEY');
        if (criticalMissing.length > 0) {
            console.warn(
                `[WARNING] Missing environment variables: ${criticalMissing.join(', ')}. App may crash.`
            );
        }
    }
}
