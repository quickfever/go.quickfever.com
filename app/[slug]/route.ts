import { NextResponse } from 'next/server';
import { getLinkBySlug, incrementClicks } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Ignore static system paths
    if (['favicon.ico', 'api', '_next', 'admin', 'assets'].includes(slug.toLowerCase())) {
      return NextResponse.next();
    }

    const link = await getLinkBySlug(slug);

    if (!link) {
      const url = new URL('/not-found', request.url);
      url.searchParams.set('slug', slug);
      return NextResponse.redirect(url, 307);
    }

    if (!link.isActive) {
      const url = new URL('/not-found', request.url);
      url.searchParams.set('slug', slug);
      url.searchParams.set('reason', 'disabled');
      return NextResponse.redirect(url, 307);
    }

    // Check expiration
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      const url = new URL('/not-found', request.url);
      url.searchParams.set('slug', slug);
      url.searchParams.set('reason', 'expired');
      return NextResponse.redirect(url, 307);
    }

    // Check password protection
    if (link.password) {
      const { searchParams } = new URL(request.url);
      const passParam = searchParams.get('pwd');
      
      if (passParam !== link.password) {
        // Redirect to password challenge page
        const pwdUrl = new URL(`/${slug}/password`, request.url);
        return NextResponse.redirect(pwdUrl, 307);
      }
    }

    // Record click count asynchronously
    try {
      await incrementClicks(slug);
    } catch (e) {
      console.error('Click counter error:', e);
    }

    // Perform 307 redirect to target destination
    return NextResponse.redirect(link.destinationUrl, 307);
  } catch (error) {
    console.error('Redirection error:', error);
    return NextResponse.json({ error: 'Redirection failed' }, { status: 500 });
  }
}
