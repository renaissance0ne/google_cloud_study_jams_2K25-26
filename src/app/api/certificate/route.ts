import { NextRequest, NextResponse } from 'next/server';
import { getCertLinkByEmail } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'email query param required' }, { status: 400 });
  }

  const { certLink } = await getCertLinkByEmail(decodeURIComponent(email));
  return NextResponse.json({ certLink });
}
