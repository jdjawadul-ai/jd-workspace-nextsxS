'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

type SessionUser = {
  id: string;
  email?: string | null;
};

type BaseRow = {
  id: string;
  created_at: string;
};

type MemoryRow = BaseRow & { content: string };
type LeadRow = BaseRow & { name: string; company: string; status: string; notes: string | null };
type ClientRow = BaseRow & { name: string; company: string; status: string; notes: string | null };
type ResearchRow = BaseRow & { title: string; source: string | null; notes: string | null };
type NewsletterRow = BaseRow & { title: string; source: string | null; summary: string | null };
type BookRow = BaseRow & { title: string; summary: string | null };
type YoutubeRow = BaseRow & { name: string; url: string | null; stats: string | null };

type Tab = 'home' | 'daily' | 'business' | 'clients' | 'leads' | 'projects' | 'learning' | 'health' | 'vault' | 'research' | 'youtube';

const tabs: { key: Tab; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'daily', label: 'Daily' },
  { key: 'business', label: 'Business' },
  { key: 'clients', label: 'Clients' },
  { key: 'leads', label: 'Leads' },
  { key: 'projects', label: 'Projects' },
  { key: 'learning', label: 'Learning' },
  { key: 'health', label: 'Health' },
  { key: 'vault', label: 'Memory Vault' },
  { key: 'research', label: 'Research' },
  { key: 'youtube', label: 'YouTube' },
];

const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01))',
  border: '1px solid rgba(255,255,255,.10)',
  borderRadius: 22,
  boxShadow: '0 20px 55px rgba(0,0,0,.36)',
  overflow: 'hidden',
  backdropFilter: 'blur(10px)',
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,.12)',
  background: '#0f1219',
  color: '#fff',
  padding: '12px 14px',
  font: 'inherit',
  outline: 'none',
};

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 800, color: '#a6afc5', textTransform: 'uppercase', letterSpacing: '.06em' };
const chipStyle: React.CSSProperties = { borderRadius: 999, padding: '9px 12px', background: '#10131a', border: '1px solid rgba(255,255,255,.08)', color: '#fff', fontSize: 12, fontWeight: 800 };

function Head({ title, tag, accent }: { title: string; tag: string; accent: 'pink' | 'cyan' | 'yellow' | 'green' | 'blue' }) {
  const map = {
    pink: 'linear-gradient(90deg,#ff4fa0,#ff7f69)',
    cyan: 'linear-gradient(90deg,#59f1d4,#7ce8ff)',
    yellow: 'linear-gradient(90deg,#ffe77b,#ffd05c)',
    green: 'linear-gradient(90deg,#90ef80,#63efb3)',
    blue: 'linear-gradient(90deg,#8eb8ff,#648bff)',
  } as const;
  return (
    <div style={{ padding: '14px 18px', background: map[accent], color: '#111', fontWeight: 1000, textTransform: 'uppercase', letterSpacing: '-0.04em', borderBottom: '1px solid rgba(0,0,0,.12)', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
      <div>{title}</div>
      <div style={{ whiteSpace: 'nowrap', fontSize: 12, padding: '7px 10px', borderRadius: 999, background: '#23293a', border: '1px solid rgba(255,255,255,.08)', fontWeight: 800, color: '#fff' }}>{tag}</div>
    </div>
  );
}

function Section({ title, tag, accent, children }: { title: string; tag: string; accent: 'pink' | 'cyan' | 'yellow' | 'green' | 'blue'; children: React.ReactNode }) {
  return <section style={cardStyle}><Head title={title} tag={tag} accent={accent} /><div style={{ padding: 18 }}>{children}</div></section>;
}

function Row({ title, note, tag, onDelete }: { title: string; note?: string | null; tag: string; onDelete?: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start', background: '#10131a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: '12px 14px' }}>
      <div>
        <b style={{ display: 'block', marginBottom: 4 }}>{title}</b>
        {note ? <small style={{ color: '#a6afc5', lineHeight: 1.5 }}>{note}</small> : null}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {onDelete ? <button onClick={onDelete} style={{ ...chipStyle, cursor: 'pointer' }}>Delete</button> : null}
        <span style={chipStyle}>{tag}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const [memories, setMemories] = useState<MemoryRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [research, setResearch] = useState<ResearchRow[]>([]);
  const [newsletters, setNewsletters] = useState<NewsletterRow[]>([]);
  const [books, setBooks] = useState<BookRow[]>([]);
  const [youtube, setYoutube] = useState<YoutubeRow[]>([]);

  const [memoryContent, setMemoryContent] = useState('');
  const [leadForm, setLeadForm] = useState({ name: '', company: '', status: 'new', notes: '' });
  const [clientForm, setClientForm] = useState({ name: '', company: '', status: 'active', notes: '' });
  const [researchForm, setResearchForm] = useState({ title: '', source: '', notes: '' });
  const [newsletterForm, setNewsletterForm] = useState({ title: '', source: '', summary: '' });
  const [bookForm, setBookForm] = useState({ title: '', summary: '' });
  const [youtubeForm, setYoutubeForm] = useState({ name: '', url: '', stats: '' });

  const recentTasks = useMemo(() => [
    'Grow the tool website',
    'Send outreach messages',
    'Protect sleep and exercise',
  ], []);

  async function loadAll() {
    if (!sessionUser) return;
    const user_id = sessionUser.id;
    const queries = [
      supabase.from('workspace_memories').select('*').eq('user_id', user_id).order('created_at', { ascending: false }).limit(25),
      supabase.from('workspace_leads').select('*').eq('user_id', user_id).order('created_at', { ascending: false }).limit(25),
      supabase.from('workspace_clients').select('*').eq('user_id', user_id).order('created_at', { ascending: false }).limit(25),
      supabase.from('workspace_research').select('*').eq('user_id', user_id).order('created_at', { ascending: false }).limit(25),
      supabase.from('workspace_newsletters').select('*').eq('user_id', user_id).order('created_at', { ascending: false }).limit(25),
      supabase.from('workspace_books').select('*').eq('user_id', user_id).order('created_at', { ascending: false }).limit(25),
      supabase.from('workspace_youtube').select('*').eq('user_id', user_id).order('created_at', { ascending: false }).limit(25),
    ] as const;
    const [m, l, c, r, n, b, y] = await Promise.all(queries);
    if (!m.error) setMemories((m.data ?? []) as MemoryRow[]);
    if (!l.error) setLeads((l.data ?? []) as LeadRow[]);
    if (!c.error) setClients((c.data ?? []) as ClientRow[]);
    if (!r.error) setResearch((r.data ?? []) as ResearchRow[]);
    if (!n.error) setNewsletters((n.data ?? []) as NewsletterRow[]);
    if (!b.error) setBooks((b.data ?? []) as BookRow[]);
    if (!y.error) setYoutube((y.data ?? []) as YoutubeRow[]);
  }

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSessionUser(data.session?.user ? { id: data.session.user.id, email: data.session.user.email } : null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
      setLoading(false);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (sessionUser) loadAll();
  }, [sessionUser]);

  async function signIn() {
    setMessage('Sending login link...');
    const { error } = await supabase.auth.signInWithOtp({ email });
    setMessage(error ? error.message : 'Check your email for the login link.');
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSessionUser(null);
    setActiveTab('home');
  }

  async function addItem(table: string, payload: Record<string, unknown>, reset: () => void) {
    if (!sessionUser) return;
    const { error } = await supabase.from(table).insert({ ...payload, user_id: sessionUser.id });
    if (error) {
      setMessage(error.message);
      return;
    }
    reset();
    await loadAll();
    setMessage('Saved.');
  }

  async function removeItem(table: string, id: string) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      setMessage(error.message);
      return;
    }
    await loadAll();
  }

  if (loading) {
    return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#a6afc5' }}>Loading workspace...</main>;
  }

  if (!sessionUser) {
    return (
      <main style={{ maxWidth: 840, margin: '0 auto', padding: 20, minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <section style={{ width: '100%', ...cardStyle }}>
          <Head title="JD Workspace" tag="Login" accent="pink" />
          <div style={{ padding: 22, display: 'grid', gap: 14 }}>
            <p style={{ margin: 0, color: '#c8cde0', lineHeight: 1.6 }}>
              Sign in to save memories, leads, clients, books, research, newsletters, and YouTube data across devices.
            </p>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={fieldStyle} />
            <button onClick={signIn} style={{ border: 0, cursor: 'pointer', borderRadius: 14, padding: '12px 18px', fontWeight: 1000, background: 'linear-gradient(180deg, #fff39e, #ffd95b)', color: '#111' }}>Send login link</button>
            {message ? <div style={{ color: '#a6afc5' }}>{message}</div> : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: 20 }}>
      <header style={{ position: 'sticky', top: 12, zIndex: 10, background: 'linear-gradient(90deg, #ff4fa0, #ff8a5b 40%, #ffd86d)', color: '#111', borderRadius: 28, padding: 18, boxShadow: '0 20px 55px rgba(0,0,0,.36)', border: '1px solid rgba(0,0,0,.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 1000, textTransform: 'uppercase', letterSpacing: '-0.07em', lineHeight: 0.95 }}>
            JD Workspace
            <div style={{ fontSize: 12, textTransform: 'none', opacity: 0.8, marginTop: 6, fontWeight: 700 }}>
              Personal OS for business, study, health, and memory
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ borderRadius: 999, padding: '10px 14px', background: 'rgba(255,255,255,.35)', fontWeight: 800 }}>
              {sessionUser.email || 'Signed in'}
            </div>
            <button onClick={signOut} style={{ border: 0, cursor: 'pointer', borderRadius: 999, padding: '10px 14px', background: '#111', color: '#fff', fontWeight: 900 }}>Logout</button>
          </div>
        </div>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: '10px 15px', borderRadius: 999, background: activeTab === t.key ? '#111' : 'rgba(255,255,255,.18)', color: activeTab === t.key ? '#fff' : '#111', border: '1px solid rgba(17,17,17,.35)', fontWeight: 900, cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <h1 style={{ margin: '26px 0 14px', fontSize: 'clamp(42px, 5vw, 72px)', lineHeight: 0.92, letterSpacing: '-0.08em', textTransform: 'uppercase' }}>Workspace</h1>
      <p style={{ color: '#a6afc5', maxWidth: 980, lineHeight: 1.55, fontWeight: 600 }}>
        This is the real workspace foundation. You can add memories, leads, clients, research, newsletters, books, and YouTube channels from the page, and the data saves in Supabase.
      </p>
      {message ? <div style={{ margin: '12px 0 18px', color: '#ffd86d', fontWeight: 700 }}>{message}</div> : null}

      {activeTab === 'home' ? (
        <section style={{ display: 'grid', gap: 18, gridTemplateColumns: '1.18fr .82fr', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 18 }}>
            <Section title="Daily brief" tag="Top 3" accent="cyan">
              <div style={{ display: 'grid', gap: 10 }}>
                {recentTasks.map((t) => <Row key={t} title={t} note="Core daily priority" tag="Today" />)}
              </div>
            </Section>
            <Section title="Memory Vault" tag="Add memory" accent="green">
              <div style={{ display: 'grid', gap: 12 }}>
                <textarea value={memoryContent} onChange={(e) => setMemoryContent(e.target.value)} placeholder="Save a thought, reminder, decision, or idea..." style={{ ...fieldStyle, minHeight: 120, resize: 'vertical' }} />
                <button onClick={() => addItem('workspace_memories', { content: memoryContent }, () => setMemoryContent(''))} style={{ border: 0, cursor: 'pointer', borderRadius: 14, padding: '12px 18px', fontWeight: 1000, background: 'linear-gradient(180deg, #fff39e, #ffd95b)', color: '#111', width: 'fit-content' }}>Save memory</button>
                <div style={{ display: 'grid', gap: 10 }}>{memories.slice(0, 3).map((m) => <Row key={m.id} title={m.content} tag="Memory" onDelete={() => removeItem('workspace_memories', m.id)} />)}</div>
              </div>
            </Section>
            <Section title="Daily review" tag="Morning / evening" accent="yellow">
              <div style={{ display: 'grid', gap: 10 }}>
                <Row title="What matters today?" note="One business move, one communication move, one health move." tag="Review" />
                <Row title="What can wait?" note="Anything not tied to your current top priorities." tag="Filter" />
                <Row title="What counts as success?" note="At least one finished result, not just planning." tag="Win" />
              </div>
            </Section>
          </div>
          <div style={{ display: 'grid', gap: 18 }}>
            <Section title="Workspace stats" tag="Simple" accent="green">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {[
                  ['Memories', String(memories.length)],
                  ['Leads', String(leads.length)],
                  ['Clients', String(clients.length)],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: '#10131a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: 14 }}>
                    <div style={{ color: '#a6afc5', fontSize: 12, fontWeight: 700 }}>{k}</div>
                    <div style={{ fontSize: 24, fontWeight: 900, marginTop: 5 }}>{v}</div>
                  </div>
                ))}
              </div>
            </Section>
            <Section title="Summaries" tag="Newsletters / books" accent="blue">
              <div style={{ display: 'grid', gap: 10 }}>
                {newsletters.slice(0, 2).map((n) => <Row key={n.id} title={n.title} note={n.summary || n.source || ''} tag="Newsletter" onDelete={() => removeItem('workspace_newsletters', n.id)} />)}
                {books.slice(0, 1).map((b) => <Row key={b.id} title={b.title} note={b.summary || ''} tag="Book" onDelete={() => removeItem('workspace_books', b.id)} />)}
                {!newsletters.length && !books.length ? <div style={{ color: '#a6afc5' }}>Add your newsletter and book summaries in the tabs.</div> : null}
              </div>
            </Section>
            <Section title="Research & YouTube" tag="Tracking" accent="pink">
              <div style={{ display: 'grid', gap: 10 }}>
                {research.slice(0, 1).map((r) => <Row key={r.id} title={r.title} note={r.notes || r.source || ''} tag="Research" onDelete={() => removeItem('workspace_research', r.id)} />)}
                {youtube.slice(0, 1).map((y) => <Row key={y.id} title={y.name} note={y.stats || y.url || ''} tag="YouTube" onDelete={() => removeItem('workspace_youtube', y.id)} />)}
              </div>
            </Section>
          </div>
        </section>
      ) : null}

      {activeTab === 'leads' ? (
        <Section title="Leads" tag="CRM-lite" accent="cyan">
          <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: 12 }}>
              <input value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} placeholder="Lead name" style={fieldStyle} />
              <input value={leadForm.company} onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })} placeholder="Company" style={fieldStyle} />
              <input value={leadForm.status} onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })} placeholder="Status" style={fieldStyle} />
            </div>
            <textarea value={leadForm.notes} onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })} placeholder="Notes" style={{ ...fieldStyle, minHeight: 100, resize: 'vertical' }} />
            <button onClick={() => addItem('workspace_leads', leadForm, () => setLeadForm({ name: '', company: '', status: 'new', notes: '' }))} style={{ border: 0, cursor: 'pointer', borderRadius: 14, padding: '12px 18px', fontWeight: 1000, background: 'linear-gradient(180deg, #fff39e, #ffd95b)', color: '#111', width: 'fit-content' }}>Add lead</button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>{leads.map((lead) => <Row key={lead.id} title={`${lead.name} — ${lead.company}`} note={lead.notes || lead.status} tag={lead.status} onDelete={() => removeItem('workspace_leads', lead.id)} />)}</div>
        </Section>
      ) : null}

      {activeTab === 'clients' ? (
        <Section title="Clients" tag="Accounts" accent="yellow">
          <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: 12 }}>
              <input value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} placeholder="Client name" style={fieldStyle} />
              <input value={clientForm.company} onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })} placeholder="Company" style={fieldStyle} />
              <input value={clientForm.status} onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })} placeholder="Status" style={fieldStyle} />
            </div>
            <textarea value={clientForm.notes} onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })} placeholder="Client notes" style={{ ...fieldStyle, minHeight: 100, resize: 'vertical' }} />
            <button onClick={() => addItem('workspace_clients', clientForm, () => setClientForm({ name: '', company: '', status: 'active', notes: '' }))} style={{ border: 0, cursor: 'pointer', borderRadius: 14, padding: '12px 18px', fontWeight: 1000, background: 'linear-gradient(180deg, #fff39e, #ffd95b)', color: '#111', width: 'fit-content' }}>Add client</button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>{clients.map((client) => <Row key={client.id} title={`${client.name} — ${client.company}`} note={client.notes || client.status} tag={client.status} onDelete={() => removeItem('workspace_clients', client.id)} />)}</div>
        </Section>
      ) : null}

      {activeTab === 'vault' ? (
        <Section title="Memory Vault" tag="Notes" accent="green">
          <div style={{ display: 'grid', gap: 12 }}>
            <textarea value={memoryContent} onChange={(e) => setMemoryContent(e.target.value)} placeholder="Write a memory note..." style={{ ...fieldStyle, minHeight: 120, resize: 'vertical' }} />
            <button onClick={() => addItem('workspace_memories', { content: memoryContent }, () => setMemoryContent(''))} style={{ border: 0, cursor: 'pointer', borderRadius: 14, padding: '12px 18px', fontWeight: 1000, background: 'linear-gradient(180deg, #fff39e, #ffd95b)', color: '#111', width: 'fit-content' }}>Save memory</button>
            <div style={{ display: 'grid', gap: 10 }}>{memories.map((m) => <Row key={m.id} title={m.content} tag="Memory" onDelete={() => removeItem('workspace_memories', m.id)} />)}</div>
          </div>
        </Section>
      ) : null}

      {activeTab === 'research' ? (
        <Section title="Research" tag="Ideas" accent="pink">
          <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
            <input value={researchForm.title} onChange={(e) => setResearchForm({ ...researchForm, title: e.target.value })} placeholder="Research title" style={fieldStyle} />
            <input value={researchForm.source} onChange={(e) => setResearchForm({ ...researchForm, source: e.target.value })} placeholder="Source / link" style={fieldStyle} />
            <textarea value={researchForm.notes} onChange={(e) => setResearchForm({ ...researchForm, notes: e.target.value })} placeholder="Notes" style={{ ...fieldStyle, minHeight: 100, resize: 'vertical' }} />
            <button onClick={() => addItem('workspace_research', researchForm, () => setResearchForm({ title: '', source: '', notes: '' }))} style={{ border: 0, cursor: 'pointer', borderRadius: 14, padding: '12px 18px', fontWeight: 1000, background: 'linear-gradient(180deg, #fff39e, #ffd95b)', color: '#111', width: 'fit-content' }}>Add research</button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>{research.map((r) => <Row key={r.id} title={r.title} note={r.notes || r.source} tag="Research" onDelete={() => removeItem('workspace_research', r.id)} />)}</div>
        </Section>
      ) : null}

      {activeTab === 'daily' ? (
        <Section title="Daily" tag="Brief" accent="blue">
          <div style={{ display: 'grid', gap: 10 }}>
            <Row title="Top 3 tasks" note={recentTasks.join(' • ')} tag="Today" />
            <Row title="Newsletter digest" note="Add newsletter summaries in the Learning tab and review them here." tag="Digest" />
            <Row title="Book summary" note="Add daily book summaries in the Learning tab." tag="Books" />
          </div>
        </Section>
      ) : null}

      {activeTab === 'business' ? (
        <Section title="Business" tag="Assets" accent="cyan">
          <div style={{ display: 'grid', gap: 10 }}>
            <Row title="Calculator / tool website" note="Traffic asset, ranking, future monetization." tag="SEO" />
            <Row title="SEO services" note="Offer to local businesses." tag="Service" />
            <Row title="Primary media asset" note="Choose one channel and stay consistent." tag="Media" />
          </div>
        </Section>
      ) : null}

      {activeTab === 'projects' ? (
        <Section title="Projects" tag="Current" accent="yellow">
          <div style={{ display: 'grid', gap: 10 }}>
            <Row title="Tool website" note="Rank, improve, monetize." tag="1" />
            <Row title="SEO services system" note="Create offers and SOPs." tag="2" />
            <Row title="Primary media asset" note="One channel with consistency." tag="3" />
          </div>
        </Section>
      ) : null}

      {activeTab === 'learning' ? (
        <Section title="Learning" tag="Books / newsletters" accent="green">
          <div style={{ display: 'grid', gap: 18 }}>
            <div style={{ display: 'grid', gap: 12, marginBottom: 8 }}>
              <input value={newsletterForm.title} onChange={(e) => setNewsletterForm({ ...newsletterForm, title: e.target.value })} placeholder="Newsletter title" style={fieldStyle} />
              <input value={newsletterForm.source} onChange={(e) => setNewsletterForm({ ...newsletterForm, source: e.target.value })} placeholder="Source / Gmail label" style={fieldStyle} />
              <textarea value={newsletterForm.summary} onChange={(e) => setNewsletterForm({ ...newsletterForm, summary: e.target.value })} placeholder="Summary" style={{ ...fieldStyle, minHeight: 100, resize: 'vertical' }} />
              <button onClick={() => addItem('workspace_newsletters', newsletterForm, () => setNewsletterForm({ title: '', source: '', summary: '' }))} style={{ border: 0, cursor: 'pointer', borderRadius: 14, padding: '12px 18px', fontWeight: 1000, background: 'linear-gradient(180deg, #fff39e, #ffd95b)', color: '#111', width: 'fit-content' }}>Add newsletter summary</button>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>{newsletters.map((n) => <Row key={n.id} title={n.title} note={n.summary || n.source} tag="Newsletter" onDelete={() => removeItem('workspace_newsletters', n.id)} />)}</div>
            <div style={{ display: 'grid', gap: 12, marginTop: 10 }}>
              <input value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} placeholder="Book title" style={fieldStyle} />
              <textarea value={bookForm.summary} onChange={(e) => setBookForm({ ...bookForm, summary: e.target.value })} placeholder="Book summary" style={{ ...fieldStyle, minHeight: 100, resize: 'vertical' }} />
              <button onClick={() => addItem('workspace_books', bookForm, () => setBookForm({ title: '', summary: '' }))} style={{ border: 0, cursor: 'pointer', borderRadius: 14, padding: '12px 18px', fontWeight: 1000, background: 'linear-gradient(180deg, #fff39e, #ffd95b)', color: '#111', width: 'fit-content' }}>Add book summary</button>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>{books.map((b) => <Row key={b.id} title={b.title} note={b.summary || ''} tag="Book" onDelete={() => removeItem('workspace_books', b.id)} />)}</div>
          </div>
        </Section>
      ) : null}

      {activeTab === 'health' ? (
        <Section title="Health" tag="Habits" accent="yellow">
          <div style={{ display: 'grid', gap: 10 }}>
            <Row title="Sleep earlier" note="Protect energy for deep work." tag="Sleep" />
            <Row title="Exercise" note="Make movement automatic." tag="Move" />
            <Row title="Eat cleaner" note="Reduce junk and excess sugar." tag="Fuel" />
          </div>
        </Section>
      ) : null}

      {activeTab === 'youtube' ? (
        <Section title="YouTube" tag="Channels" accent="blue">
          <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
            <input value={youtubeForm.name} onChange={(e) => setYoutubeForm({ ...youtubeForm, name: e.target.value })} placeholder="Channel name" style={fieldStyle} />
            <input value={youtubeForm.url} onChange={(e) => setYoutubeForm({ ...youtubeForm, url: e.target.value })} placeholder="Channel URL" style={fieldStyle} />
            <textarea value={youtubeForm.stats} onChange={(e) => setYoutubeForm({ ...youtubeForm, stats: e.target.value })} placeholder="Stats / notes" style={{ ...fieldStyle, minHeight: 100, resize: 'vertical' }} />
            <button onClick={() => addItem('workspace_youtube', youtubeForm, () => setYoutubeForm({ name: '', url: '', stats: '' }))} style={{ border: 0, cursor: 'pointer', borderRadius: 14, padding: '12px 18px', fontWeight: 1000, background: 'linear-gradient(180deg, #fff39e, #ffd95b)', color: '#111', width: 'fit-content' }}>Add YouTube channel</button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>{youtube.map((y) => <Row key={y.id} title={y.name} note={y.stats || y.url} tag="YouTube" onDelete={() => removeItem('workspace_youtube', y.id)} />)}</div>
        </Section>
      ) : null}
    </main>
  );
}
