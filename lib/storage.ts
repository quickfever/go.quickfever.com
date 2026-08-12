import { ShortLink } from './types';
import fs from 'fs';
import path from 'path';

// Memory cache fallback for local/serverless execution
const inMemoryLinks = new Map<string, ShortLink>();

const DATA_FILE = path.join(process.cwd(), 'data', 'links.json');

// Helper to check if Upstash / Vercel KV environment variables exist
function getUpstashCredentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) {
    return { url, token };
  }
  return null;
}

// Local File Utilities
function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // Ignore in read-only serverless environments
    }
  }
}

function loadLocalLinks(): ShortLink[] {
  try {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.error('Failed to load local links:', err);
  }
  return Array.from(inMemoryLinks.values());
}

function saveLocalLinks(links: ShortLink[]) {
  // Update memory
  inMemoryLinks.clear();
  links.forEach(l => inMemoryLinks.set(l.slug, l));

  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Unable to persist to disk (serverless mode):', err);
  }
}

// Default initial demo links if empty
const DEMO_LINKS: ShortLink[] = [
  {
    id: 'link-1',
    slug: 'quickfever',
    destinationUrl: 'https://quickfever.com',
    title: 'QuickFever Main Site',
    description: 'Official QuickFever Homepage',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clicks: 142,
    isActive: true,
    tags: ['official', 'main']
  },
  {
    id: 'link-2',
    slug: 'tech-news',
    destinationUrl: 'https://quickfever.com/category/tech',
    title: 'Latest Tech News & Guides',
    description: 'Trending tech updates, software reviews, and tutorials',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clicks: 89,
    isActive: true,
    tags: ['blog', 'tech']
  }
];

export async function getAllLinks(): Promise<ShortLink[]> {
  const creds = getUpstashCredentials();
  if (creds) {
    try {
      // Fetch list from Upstash KV
      const res = await fetch(`${creds.url}/get/quickfever_all_links`, {
        headers: { Authorization: `Bearer ${creds.token}` },
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Upstash fetch error:', e);
    }
  }

  // Fallback local file/memory
  let links = loadLocalLinks();
  if (links.length === 0) {
    links = DEMO_LINKS;
    saveLocalLinks(links);
  }
  return links;
}

export async function getLinkBySlug(slug: string): Promise<ShortLink | null> {
  const links = await getAllLinks();
  const found = links.find(l => l.slug.toLowerCase() === slug.toLowerCase());
  return found || null;
}

export async function saveLink(link: ShortLink): Promise<ShortLink> {
  const links = await getAllLinks();
  const existingIdx = links.findIndex(l => l.slug.toLowerCase() === link.slug.toLowerCase() || l.id === link.id);
  
  if (existingIdx >= 0) {
    links[existingIdx] = link;
  } else {
    links.unshift(link);
  }

  await saveAllLinks(links);
  return link;
}

export async function updateLink(id: string, updates: Partial<ShortLink>): Promise<ShortLink | null> {
  const links = await getAllLinks();
  const idx = links.findIndex(l => l.id === id || l.slug === id);
  if (idx === -1) return null;

  const updated: ShortLink = {
    ...links[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  links[idx] = updated;
  await saveAllLinks(links);
  return updated;
}

export async function deleteLink(idOrSlug: string): Promise<boolean> {
  const links = await getAllLinks();
  const filtered = links.filter(l => l.id !== idOrSlug && l.slug !== idOrSlug);
  if (filtered.length === links.length) return false;

  await saveAllLinks(filtered);
  return true;
}

export async function incrementClicks(slug: string): Promise<number> {
  const links = await getAllLinks();
  const idx = links.findIndex(l => l.slug.toLowerCase() === slug.toLowerCase());
  if (idx === -1) return 0;

  links[idx].clicks += 1;
  links[idx].updatedAt = new Date().toISOString();
  await saveAllLinks(links);
  return links[idx].clicks;
}

async function saveAllLinks(links: ShortLink[]) {
  const creds = getUpstashCredentials();
  if (creds) {
    try {
      await fetch(`${creds.url}/set/quickfever_all_links`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${creds.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(JSON.stringify(links))
      });
    } catch (e) {
      console.error('Upstash set error:', e);
    }
  }

  saveLocalLinks(links);
}
