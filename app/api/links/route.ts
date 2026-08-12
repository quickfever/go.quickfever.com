import { NextResponse } from 'next/server';
import { getAllLinks, saveLink, getLinkBySlug } from '@/lib/storage';
import { ShortLink } from '@/lib/types';
import { nanoid } from 'nanoid';

// Helper to verify admin key if ADMIN_SECRET_KEY env variable is configured
function isAuthorized(request: Request): boolean {
  const secretKey = process.env.ADMIN_SECRET_KEY;
  if (!secretKey) return true; // If no secret key set, public mode enabled

  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const customHeader = request.headers.get('x-admin-key') || '';

  return token === secretKey || customHeader === secretKey;
}

export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    let links = await getAllLinks();
    
    if (query) {
      links = links.filter(l => 
        l.slug.toLowerCase().includes(query) ||
        l.destinationUrl.toLowerCase().includes(query) ||
        (l.title && l.title.toLowerCase().includes(query)) ||
        (l.tags && l.tags.some(t => t.toLowerCase().includes(query)))
      );
    }

    return NextResponse.json({ success: true, links });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json();
    const { destinationUrl, slug: customSlug, title, description, expiresAt, password, tags } = body;

    if (!destinationUrl) {
      return NextResponse.json({ success: false, error: 'Destination URL is required' }, { status: 400 });
    }

    let formattedUrl = destinationUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      new URL(formattedUrl);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid destination URL format' }, { status: 400 });
    }

    let finalSlug = customSlug ? customSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') : '';
    if (!finalSlug) {
      finalSlug = nanoid(6).toLowerCase();
    }

    const existing = await getLinkBySlug(finalSlug);
    if (existing) {
      return NextResponse.json({ success: false, error: `Slug "${finalSlug}" is already taken.` }, { status: 409 });
    }

    const newLink: ShortLink = {
      id: `link-${Date.now()}-${nanoid(4)}`,
      slug: finalSlug,
      destinationUrl: formattedUrl,
      title: title?.trim() || finalSlug,
      description: description?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clicks: 0,
      isActive: true,
      expiresAt: expiresAt || null,
      password: password || null,
      tags: Array.isArray(tags) ? tags : []
    };

    await saveLink(newLink);

    return NextResponse.json({ success: true, link: newLink }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
