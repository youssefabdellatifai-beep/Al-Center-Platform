import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth is handled client-side in src/app/admin/page.tsx via supabase.auth.getUser().
// Supabase v2 stores sessions in localStorage, not cookies, so server-side cookie
// checks always fail and would block all access. Pass all requests through.
export async function proxy(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
