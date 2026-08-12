import { NextResponse } from 'next/server';
import { getAllLinks, saveLink, getLinkBySlug } from '@/lib/storage';
import { ShortLink } from '@/lib/types';
import { nanoid } from 'nanoid';

export async function GET(request: Request) {
  try {
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
    const body = await request.json();
    const { destinationUrl, slug: customSlug, title, description, expiresAt, password, tags } = body;

    if (!destinationUrl) {
      return NextResponse.json({ success: false, error: 'Destination URL is required' }, { status: 400 });
    }

    // Format & validate URL
    let formattedUrl = destinationUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      new URL(formattedUrl);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid destination URL format' }, { status: 400 });
    }

    // Generate or format slug
    let finalSlug = customSlug ? customSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') : '';
    if (!finalSlug) {
      finalSlug = nanoid(6).toLowerCase();
    }

    // Check if slug already exists
    const existing = await getLinkBySlug(finalSlug);
    if (existing) {
      return NextResponse.json({ success: false, error: `Slug "${finalSlug}" is already taken. Please choose another.` }, { status: 409 });
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
