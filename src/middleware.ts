import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};

// import createMiddleware from 'next-intl/middleware';
// import { type NextRequest } from 'next/server';
// import { routing } from './i18n/routing';
// import { updateSession } from './supabase/middleware';

// const intlMiddleware = createMiddleware(routing);

// export async function middleware(request: NextRequest) {
//     // Run Supabase session update
//     const supabaseResponse = await updateSession(request);

//     // Run next-intl on the same request
//     const intlResponse = intlMiddleware(request);

//     // Merge both responses (cookies, headers, etc.)
//     supabaseResponse.headers.forEach((value, key) => {
//         intlResponse.headers.set(key, value);
//     });

//     return intlResponse;
// }

// export const config = {
//     matcher: [
//         '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
//     ],
// };
