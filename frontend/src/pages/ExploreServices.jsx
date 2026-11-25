import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Sparkles,
  Star,
  Clock,
  Layers,
  ArrowUpDown,
  RotateCcw,
  Tag
} from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import FreelancerCard from '../components/FreelancerCard';
import AIRecommenderModal from '../components/AIRecommenderModal';

export default function ExploreServices({ onNavigate, initialFilters = {} }) {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State with robust URL and sessionStorage persistence across refresh
  const getInitialSearch = () => {
    return initialFilters.search ||
      new URLSearchParams(window.location.search).get('search') ||
      sessionStorage.getItem('campusgig_last_search') || '';
  };

  const getInitialCategory = () => {
    return initialFilters.category ||
      new URLSearchParams(window.location.search).get('category') ||
      new URLSearchParams(window.location.search).get('category_id') || '';
  };

  const [search, setSearch] = useState(getInitialSearch);
  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minRating, setMinRating] = useState('');
  const [maxDays, setMaxDays] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // AI Tab State
  const [activeTab, setActiveTab] = useState('services'); // 'services' or 'ai-matcher'
  const [aiPrompt, setAiPrompt] = useState(getInitialSearch);
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Synchronize when parent navigation passes new search/category filters
  useEffect(() => {
    if (initialFilters.search !== undefined && initialFilters.search !== search) {
      setSearch(initialFilters.search || '');
      setAiPrompt(initialFilters.search || '');
    }
    if (initialFilters.category !== undefined && initialFilters.category !== selectedCategory) {
      setSelectedCategory(initialFilters.category || '');
    }
  }, [initialFilters.search, initialFilters.category]);

  // Persist search & category to URL and sessionStorage on every change
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('page', 'explore');

      if (search) {
        searchParams.set('search', search);
        sessionStorage.setItem('campusgig_last_search', search);
      } else {
        searchParams.delete('search');
        sessionStorage.removeItem('campusgig_last_search');
      }

      if (selectedCategory) {
        searchParams.set('category', selectedCategory);
      } else {
        searchParams.delete('category');
      }

      if (sortBy && sortBy !== 'newest') {
        searchParams.set('sort', sortBy);
      } else {
        searchParams.delete('sort');
      }

      const newUrl = '?' + searchParams.toString();
      window.history.replaceState(null, '', newUrl);
    } catch (e) {
      // ignore
    }
  }, [search, selectedCategory, sortBy]);

  useEffect(() => {
    fetchServices();
  }, [search, selectedCategory, maxPrice, minRating, maxDays, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/services/categories');
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (maxPrice) params.append('max_price', maxPrice);
      if (minRating) params.append('min_rating', minRating);
      if (maxDays) params.append('max_days', maxDays);
      if (sortBy) params.append('sort', sortBy);

      const res = await fetch(`/api/services?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAIMatch = async (e) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      if (data.success) {
        setAiResults(data.recommendations);
      }
    } catch (err) {
      console.error('AI match error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMaxPrice(10000);
    setMinRating('');
    setMaxDays('');
    setSortBy('newest');
    sessionStorage.removeItem('campusgig_last_search');
    try {
      window.history.replaceState(null, '', '?page=explore');
    } catch (e) {}
  };

  return (
    <div className="page-content">
      <div className="container">
        
        {/* Page Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>Explore Campus Gigs & Talent</h1>
          <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)' }}>
            Search student services or use AI matching to find the perfect collaborator for your project
          </p>
        </div>

        {/* Top Tabs: Services vs AI Match */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.75rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.75rem'
        }}>
          <button
            onClick={() => setActiveTab('services')}
            className={`btn btn-sm ${activeTab === 'services' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
          >
            <Layers size={15} />
            <span>Browse All Services ({services.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ai-matcher');
              if (search && !aiPrompt) setAiPrompt(search);
            }}
            className={`btn btn-sm ${activeTab === 'ai-matcher' ? 'btn-ai' : 'btn-secondary'}`}
            style={{ gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
          >
            <Sparkles size={15} />
            <span>AI Semantic Matcher</span>
          </button>
        </div>

        {/* TAB 1: ALL SERVICES VIEW WITH SIDEBAR FILTERS */}
        {activeTab === 'services' && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
            
            {/* Left Sidebar Filter Controls */}
            <div className="card" style={{ position: 'sticky', top: 90 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Filter size={16} color="var(--primary)" />
                  <span>Filters</span>
                </div>
                <button
                  onClick={resetFilters}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', border: 'none', background: 'transparent' }}
                  title="Reset all filters"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Keyword Search */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Keywords</label>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search skills, title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '2rem', height: 36, fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="select" style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Max Price Slider */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span>Max Budget:</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', margin: '0.5rem 0' }}
                />
              </div>

              {/* Minimum Rating */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="select" style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                >
                  <option value="">Any Rating</option>
                  <option value="4.8">4.8 & above (Top Rated)</option>
                  <option value="4.5">4.5 & above</option>
                  <option value="4.0">4.0 & above</option>
                </select>
              </div>

              {/* Delivery Days */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Delivery Time</label>
                <select
                  value={maxDays}
                  onChange={(e) => setMaxDays(e.target.value)}
                  className="select" style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                >
                  <option value="">Any Delivery Time</option>
                  <option value="1">Express (24 Hours)</option>
                  <option value="3">Up to 3 Days</option>
                  <option value="7">Up to 1 Week</option>
                </select>
              </div>

            </div>

            {/* Right Main Grid */}
            <div>
              
              {/* Controls bar: Results Count & Sort Dropdown */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Showing <strong style={{ color: 'var(--text-main)' }}>{services.length}</strong> student service gigs
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowUpDown size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="select"
                    style={{ width: 'auto', padding: '0.35rem 0.75rem', height: 34, fontSize: '0.825rem' }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Services Grid */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                  Loading campus gigs...
                </div>
              ) : services.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
                  <Tag size={42} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No services match your filters</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto 1.25rem' }}>
                    Try expanding your budget range, resetting category filters, or using our AI Matcher.
                  </p>
                  <button onClick={resetFilters} className="btn btn-secondary btn-sm">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid-3">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onClick={() => onNavigate('service-detail', { serviceId: service.id })}
                      onProfileClick={(userId) => onNavigate('profile', { userId })}
                    />
                  ))}
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 2: AI SEMANTIC MATCHER VIEW */}
        {activeTab === 'ai-matcher' && (
          <div style={{ maxWidth: 850, margin: '0 auto' }}>
            
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
              borderColor: 'rgba(168, 85, 247, 0.3)',
              marginBottom: '2rem',
              padding: '1.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <Sparkles size={24} color="var(--secondary)" />
                <h3 style={{ fontSize: '1.3rem' }}>AI Campus Freelancer Matcher</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Describe your project, assignment, or campus event in plain language. Our AI engine analyzes required skills, past student deliverables, turnaround times, and verified credentials to rank the best candidates.
              </p>

              <form onSubmit={handleAIMatch} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="e.g. Need a React developer to build an event symposium portal with forms..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="input"
                  style={{ height: 48, fontSize: '0.95rem' }}
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="btn btn-ai"
                  style={{ minWidth: 140, height: 48 }}
                >
                  <Sparkles size={16} />
                  <span>{aiLoading ? 'Matching...' : 'Find Matches'}</span>
                </button>
              </form>
            </div>

            {/* AI Results */}
            {aiResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.15rem' }}>Top Ranked Student Matches ({aiResults.length})</h3>
                  <span className="badge badge-ai">Ranked by AI Compatibility</span>
                </div>

                {aiResults.map((rec) => (
                  <FreelancerCard
                    key={rec.user.id}
                    freelancer={rec}
                    aiScore={rec.aiScore}
                    relevanceReason={rec.relevanceReason}
                    matchedSkills={rec.matchedSkills}
                    onClick={() => onNavigate('profile', { userId: rec.user.id })}
                    onHireClick={() => onNavigate('profile', { userId: rec.user.id })}
                  />
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
