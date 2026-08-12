import { NextResponse } from 'next/server';
import { updateLink, deleteLink, getAllLinks } from '@/lib/storage';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { destinationUrl, title, description, isActive, expiresAt, password, tags } = body;

    let formattedUrl = destinationUrl;
    if (formattedUrl) {
      formattedUrl = formattedUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      try {
        new URL(formattedUrl);
      } catch {
        return NextResponse.json({ success: false, error: 'Invalid destination URL format' }, { status: 400 });
      }
    }

    const updated = await updateLink(id, {
      ...(formattedUrl && { destinationUrl: formattedUrl }),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
      ...(expiresAt !== undefined && { expiresAt }),
      ...(password !== undefined && { password }),
      ...(tags !== undefined && { tags })
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, link: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteLink(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Link not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Link deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const links = await getAllLinks();
    const existing = links.find(l => l.id === id || l.slug === id);
    
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Link not found' }, { status: 404 });
    }

    const updated = await updateLink(id, { isActive: !existing.isActive });
    return NextResponse.json({ success: true, link: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
