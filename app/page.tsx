'use client';

import React, { useState, useEffect } from 'react';
import { 
  Link as LinkIcon, 
  ExternalLink, 
  Copy, 
  Check, 
  Plus, 
  Search, 
  QrCode, 
  Edit3, 
  Trash2, 
  Power, 
  Lock, 
  Calendar, 
  BarChart3, 
  Globe, 
  Sparkles, 
  RefreshCw, 
  Download, 
  Upload, 
  ShieldCheck, 
  X,
  Tag,
  ArrowUpRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ShortLink } from '@/lib/types';

export default function Dashboard() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'protected'>('all');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null);
  const [qrLink, setQrLink] = useState<ShortLink | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    destinationUrl: '',
    slug: '',
    title: '',
    description: '',
    expiresAt: '',
    password: '',
    tags: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom base domain setting
  const [baseDomain, setBaseDomain] = useState('go.quickfever.com');

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/links');
      const data = await res.json();
      if (data.success) {
        setLinks(data.links);
      }
    } catch (err) {
      console.error('Failed to fetch links:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.destinationUrl) {
      setFormError('Please enter a destination URL');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to create short link');
        return;
      }

      setLinks(prev => [data.link, ...prev]);
      setIsCreateOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;
    setFormError('');

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/links/${editingLink.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationUrl: formData.destinationUrl,
          title: formData.title,
          description: formData.description,
          expiresAt: formData.expiresAt || null,
          password: formData.password || null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to update short link');
        return;
      }

      setLinks(prev => prev.map(l => l.id === data.link.id ? data.link : l));
      setEditingLink(null);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/links/${id}`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setLinks(prev => prev.map(l => l.id === id ? data.link : l));
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDelete = async (id: string, slug: string) => {
    if (!confirm(`Are you sure you want to delete short link "go.quickfever.com/${slug}"?`)) return;
    try {
      const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLinks(prev => prev.filter(l => l.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete link:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      destinationUrl: '',
      slug: '',
      title: '',
      description: '',
      expiresAt: '',
      password: '',
      tags: ''
    });
    setFormError('');
  };

  const openEditModal = (link: ShortLink) => {
    setEditingLink(link);
    setFormData({
      destinationUrl: link.destinationUrl,
      slug: link.slug,
      title: link.title || '',
      description: link.description || '',
      expiresAt: link.expiresAt ? link.expiresAt.split('T')[0] : '',
      password: link.password || '',
      tags: link.tags ? link.tags.join(', ') : ''
    });
  };

  const copyToClipboard = (slug: string, id: string) => {
    const fullUrl = `https://${baseDomain}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter links
  const filteredLinks = links.filter(link => {
    const matchesSearch = 
      link.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.destinationUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (link.title && link.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'active') return link.isActive;
    if (filterStatus === 'inactive') return !link.isActive;
    if (filterStatus === 'protected') return Boolean(link.password);

    return true;
  });

  // Calculate statistics
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const activeCount = links.filter(l => l.isActive).length;
  const topLink = links.length > 0 ? [...links].sort((a, b) => b.clicks - a.clicks)[0] : null;

  return (
    <div className="min-h-screen pb-16">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <LinkIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>QuickFever</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  {baseDomain}
                </span>
              </h1>
              <p className="text-xs text-gray-400">Custom Branded URL Shortener & Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetForm();
                setIsCreateOpen(true);
              }}
              className="btn-gradient px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create Short Link</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Short Links</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{links.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <LinkIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Active Links</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{activeCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Clicks Tracked</p>
              <h3 className="text-3xl font-extrabold text-cyan-400 mt-1">{totalClicks.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Top Performing</p>
              <h3 className="text-lg font-bold text-white truncate max-w-[150px] mt-1">
                {topLink ? topLink.slug : 'N/A'}
              </h3>
              <p className="text-xs text-gray-400 font-mono">{topLink ? `${topLink.clicks} clicks` : '0 clicks'}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Actions */}
        <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by slug, title, or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              {(['all', 'active', 'inactive', 'protected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    filterStatus === status 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              onClick={fetchLinks}
              title="Refresh Links"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Links List */}
        <div className="space-y-4">
          {loading ? (
            <div className="glass-card p-12 text-center text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400 mb-3" />
              <p>Loading your short links...</p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
                <LinkIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">No short links found</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                {searchQuery ? 'No short URL matches your search query.' : 'Get started by creating your first branded short link for go.quickfever.com!'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => {
                    resetForm();
                    setIsCreateOpen(true);
                  }}
                  className="btn-gradient px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Link</span>
                </button>
              )}
            </div>
          ) : (
            filteredLinks.map((link) => (
              <div
                key={link.id}
                className={`glass-card p-5 transition-all duration-200 hover:border-indigo-500/40 ${
                  !link.isActive ? 'opacity-60 bg-slate-950/40' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Link Info */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <a
                        href={`/${link.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-lg font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1.5 font-mono group"
                      >
                        <span>{baseDomain}/{link.slug}</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>

                      {/* Status badge */}
                      <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium border ${
                        link.isActive 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {link.isActive ? 'Active' : 'Disabled'}
                      </span>

                      {/* Password protected badge */}
                      {link.password && (
                        <span className="px-2.5 py-0.5 text-xs rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Protected</span>
                        </span>
                      )}

                      {/* Expiration badge */}
                      {link.expiresAt && (
                        <span className="px-2.5 py-0.5 text-xs rounded-full font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Expires {new Date(link.expiresAt).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>

                    {link.title && (
                      <p className="text-white font-medium text-sm truncate">{link.title}</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-400 truncate">
                      <Globe className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                      <span className="truncate max-w-lg text-gray-300">{link.destinationUrl}</span>
                    </div>

                    {link.tags && link.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {link.tags.map(tag => (
                          <span key={tag} className="text-[11px] px-2 py-0.5 bg-white/5 rounded-md text-gray-400 border border-white/5 flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5 text-gray-500" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Actions & Clicks Stats */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 border-white/10 pt-3 lg:pt-0">
                    <div className="text-left lg:text-right pr-4 lg:border-r border-white/10">
                      <div className="text-xl font-extrabold text-cyan-400 font-mono flex items-center gap-1 lg:justify-end">
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        <span>{link.clicks}</span>
                      </div>
                      <p className="text-[11px] text-gray-500">total clicks</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(link.slug, link.id)}
                        className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-all flex items-center gap-1.5 text-xs font-medium"
                        title="Copy Short URL"
                      >
                        {copiedId === link.id ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setQrLink(link)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
                        title="View QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openEditModal(link)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
                        title="Edit Target URL"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(link.id)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          link.isActive 
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20' 
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                        }`}
                        title={link.isActive ? 'Disable Link' : 'Enable Link'}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(link.id, link.slug)}
                        className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                        title="Delete Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full p-6 space-y-5 border border-white/15 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Create New Short Link</span>
              </h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Destination URL *
                </label>
                <input
                  type="text"
                  placeholder="https://quickfever.com/my-long-article-slug"
                  value={formData.destinationUrl}
                  onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Custom Branded Slug (Optional)
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-white/5 border border-r-0 border-white/12 rounded-l-xl text-xs text-gray-400 font-mono">
                    {baseDomain}/
                  </span>
                  <input
                    type="text"
                    placeholder="my-link"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full glass-input px-4 py-2.5 rounded-r-xl text-sm font-mono"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Leave blank to generate a random 6-character short code.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Best Tech Apps"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full glass-input px-4 py-2 rounded-xl text-sm text-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Password Protection (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Set passcode"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="blog, tech, 2026"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3 justify-end border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Save Short Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full p-6 space-y-5 border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                <span>Edit Short Link ({editingLink.slug})</span>
              </h2>
              <button
                onClick={() => setEditingLink(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Destination Target URL *
                </label>
                <input
                  type="text"
                  value={formData.destinationUrl}
                  onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full glass-input px-4 py-2 rounded-xl text-sm text-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Password Protection
                  </label>
                  <input
                    type="password"
                    placeholder="Leave empty for public"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3 justify-end border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Update Destination</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      {qrLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card max-w-sm w-full p-6 text-center space-y-5 border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-400" />
                <span>QR Code Generator</span>
              </h3>
              <button
                onClick={() => setQrLink(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block border-4 border-indigo-500/20 shadow-xl mx-auto">
              <QRCodeSVG
                value={`https://${baseDomain}/${qrLink.slug}`}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div>
              <p className="text-indigo-300 font-mono font-bold text-sm">{baseDomain}/{qrLink.slug}</p>
              <p className="text-gray-400 text-xs truncate max-w-xs mx-auto mt-1">{qrLink.destinationUrl}</p>
            </div>

            <button
              onClick={() => copyToClipboard(qrLink.slug, qrLink.id)}
              className="w-full btn-gradient py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Short Link</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
