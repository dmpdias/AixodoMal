import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Twitter, 
  Mail, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Users,
  FileText,
  Zap,
  MoreVertical,
  Search
} from 'lucide-react';
import { supabase, logAudit } from '../../lib/supabase';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface SocialPost {
  id: string;
  content: string;
  platform: 'twitter' | 'linkedin';
  status: 'draft' | 'scheduled' | 'published';
  scheduled_at: string | null;
  created_at: string;
}

interface SubscriberList {
  id: string;
  name: string;
  subscriber_count: number;
}

export const DistributionView = () => {
  const [activeSubTab, setActiveSubTab] = useState<'social' | 'newsletter'>('social');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [subscriberLists, setSubscriberLists] = useState<SubscriberList[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [newPost, setNewPost] = useState({ content: '', scheduled_at: '', platform: 'twitter' as const });
  const [distribution, setDistribution] = useState({ newsletter_id: '', list_id: '' });
  const [isSending, setIsSending] = useState(false);
  const [isXConnected, setIsXConnected] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Listen for OAuth success message
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'X_AUTH_SUCCESS') {
        setIsXConnected(true);
        // In a real app, you'd save the tokens to Supabase here
        console.log('X Tokens received:', event.data.tokens);
        alert('Conta do X ligada com sucesso!');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnectX = async () => {
    try {
      const response = await fetch('/api/auth/x/url');
      const { url } = await response.json();
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        url,
        'x_auth_popup',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (err) {
      console.error('Failed to get X auth URL:', err);
      alert('Erro ao iniciar ligação com o X.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch newsletters (content with category 'newsletter' and status 'published' or 'generated')
      const { data: newslettersData } = await supabase
        .from('content')
        .select('*, content_categories!inner(slug)')
        .eq('content_categories.slug', 'newsletter')
        .order('created_at', { ascending: false });
      
      setNewsletters(newslettersData || []);

      // Mock data for social posts and subscriber lists for now
      // In a real app, these would come from Supabase tables
      setPosts([
        { 
          id: '1', 
          content: 'A IA não vai tirar o teu emprego. Vai tirar a tua paciência para reuniões inúteis. #AIxoDoMal', 
          platform: 'twitter', 
          status: 'scheduled', 
          scheduled_at: new Date(Date.now() + 86400000).toISOString(),
          created_at: new Date().toISOString()
        },
        { 
          id: '2', 
          content: 'O futuro é brilhante, mas o presente é um prompt mal escrito. Bom dia, Lisboa!', 
          platform: 'twitter', 
          status: 'published', 
          scheduled_at: null,
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]);

      setSubscriberLists([
        { id: '1', name: 'Lista Geral (Premium)', subscriber_count: 1240 },
        { id: '2', name: 'Early Adopters', subscriber_count: 450 },
        { id: '3', name: 'Waitlist Beta', subscriber_count: 89 }
      ]);

    } catch (err) {
      console.error('Error fetching distribution data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.content) return;

    const post: SocialPost = {
      id: Math.random().toString(36).substr(2, 9),
      content: newPost.content,
      platform: newPost.platform,
      status: newPost.scheduled_at ? 'scheduled' : 'draft',
      scheduled_at: newPost.scheduled_at || null,
      created_at: new Date().toISOString()
    };

    setPosts([post, ...posts]);
    setNewPost({ content: '', scheduled_at: '', platform: 'twitter' });
    alert('Post criado com sucesso!');
  };

  const handleDistributeNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distribution.newsletter_id || !distribution.list_id) return;

    setIsSending(true);
    // Simulate sending
    setTimeout(() => {
      setIsSending(false);
      alert('Newsletter enviada para a lista selecionada!');
      setDistribution({ newsletter_id: '', list_id: '' });
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Distribution Hub</h1>
          <p className="opacity-60 uppercase tracking-widest text-xs font-bold mt-2">Manage Multi-Channel Content Delivery</p>
        </div>
        <div className="flex bg-white border-2 border-ink p-1">
          <button 
            onClick={() => setActiveSubTab('social')}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'social' ? 'bg-ink text-paper' : 'hover:bg-paper'}`}
          >
            Social (X)
          </button>
          <button 
            onClick={() => setActiveSubTab('newsletter')}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'newsletter' ? 'bg-ink text-paper' : 'hover:bg-paper'}`}
          >
            Newsletter
          </button>
        </div>
      </header>

      {activeSubTab === 'social' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create Post Form */}
          <div className="lg:col-span-5">
            <div className="bg-white border-2 border-ink p-8 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
                  <Twitter className="text-accent" size={24} /> Criar Post para X
                </h3>
                {!isXConnected ? (
                  <button 
                    onClick={handleConnectX}
                    className="text-[10px] font-black uppercase tracking-widest bg-accent text-paper px-3 py-1 hover:bg-ink transition-colors"
                  >
                    Ligar Conta
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-600">
                    <CheckCircle size={14} /> Ligado
                  </div>
                )}
              </div>
              <form onSubmit={handleCreatePost} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Conteúdo do Post</label>
                  <textarea 
                    rows={5}
                    maxLength={280}
                    value={newPost.content}
                    onChange={e => setNewPost({...newPost, content: e.target.value})}
                    className="w-full p-4 border-2 border-ink font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                    placeholder="O que é que o Mal tem para dizer hoje?..."
                  />
                  <div className="flex justify-end">
                    <span className={`text-[10px] font-mono ${newPost.content.length > 250 ? 'text-accent' : 'opacity-40'}`}>
                      {newPost.content.length}/280
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Agendar para (Opcional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={18} />
                    <input 
                      type="datetime-local"
                      value={newPost.scheduled_at}
                      onChange={e => setNewPost({...newPost, scheduled_at: e.target.value})}
                      className="w-full p-4 pl-12 border-2 border-ink font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-ink text-paper py-4 font-black uppercase tracking-widest hover:bg-accent transition-all flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(15,23,42,0.2)] hover:shadow-none"
                >
                  <Send size={18} /> {newPost.scheduled_at ? 'Agendar Post' : 'Publicar Agora'}
                </button>
              </form>
            </div>
          </div>

          {/* Posts List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Posts Recentes & Agendados</h3>
              <div className="flex gap-2">
                <button className="p-2 border-2 border-ink/5 hover:border-ink transition-all"><Search size={16} /></button>
              </div>
            </div>

            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="bg-white border-2 border-ink p-6 group hover:border-accent transition-all relative overflow-hidden">
                  {post.status === 'scheduled' && (
                    <div className="absolute top-0 right-0 bg-accent text-paper px-3 py-1 text-[8px] font-black uppercase tracking-widest">
                      Agendado
                    </div>
                  )}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-paper border border-ink/10 flex items-center justify-center flex-shrink-0">
                      <Twitter size={20} className={post.status === 'published' ? 'text-ink' : 'text-accent'} />
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold text-sm leading-relaxed mb-4">{post.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest opacity-40">
                            <Clock size={12} />
                            {post.status === 'scheduled' ? format(new Date(post.scheduled_at!), 'dd MMM, HH:mm') : format(new Date(post.created_at), 'dd MMM, HH:mm')}
                          </div>
                          {post.status === 'published' && (
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-green-600">
                              <CheckCircle size={12} /> Publicado
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:text-accent transition-colors"><MoreVertical size={16} /></button>
                          <button className="p-2 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Newsletter Distribution Form */}
          <div className="lg:col-span-6">
            <div className="bg-white border-2 border-ink p-10 sticky top-24">
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 italic flex items-center gap-3">
                <Mail className="text-accent" size={32} /> Distribuir Newsletter
              </h3>
              
              <form onSubmit={handleDistributeNewsletter} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">1. Selecionar Edição</label>
                  <div className="grid grid-cols-1 gap-3">
                    {newsletters.slice(0, 4).map(nl => (
                      <button
                        key={nl.id}
                        type="button"
                        onClick={() => setDistribution({...distribution, newsletter_id: nl.id})}
                        className={`text-left p-4 border-2 transition-all flex items-center justify-between group ${
                          distribution.newsletter_id === nl.id ? 'border-accent bg-accent/5' : 'border-ink/10 hover:border-ink'
                        }`}
                      >
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">
                            {format(new Date(nl.created_at), 'dd MMMM yyyy', { locale: pt })}
                          </span>
                          <span className="font-bold text-sm">{nl.title || 'Edição Sem Título'}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          distribution.newsletter_id === nl.id ? 'border-accent bg-accent text-paper' : 'border-ink/10 group-hover:border-ink'
                        }`}>
                          {distribution.newsletter_id === nl.id && <CheckCircle size={14} />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">2. Selecionar Lista de Destinatários</label>
                  <select 
                    value={distribution.list_id}
                    onChange={e => setDistribution({...distribution, list_id: e.target.value})}
                    className="w-full p-4 border-2 border-ink font-bold focus:outline-none bg-white"
                  >
                    <option value="">Escolher lista...</option>
                    {subscriberLists.map(list => (
                      <option key={list.id} value={list.id}>
                        {list.name} ({list.subscriber_count} subscritores)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isSending || !distribution.newsletter_id || !distribution.list_id}
                    className="w-full bg-accent text-paper py-5 font-black uppercase tracking-widest hover:bg-ink transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[8px_8px_0px_0px_rgba(225,29,72,0.2)] hover:shadow-none"
                  >
                    {isSending ? (
                      <>
                        <Clock className="animate-spin" size={20} />
                        A Enviar...
                      </>
                    ) : (
                      <>
                        <Zap size={20} />
                        Disparar Newsletter
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Stats & Info */}
          <div className="lg:col-span-6 space-y-8">
            <div className="bg-ink text-paper p-8 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] opacity-40 mb-6">Audiência Total</h4>
                <div className="text-6xl font-black mb-2">1,779</div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Subscritores Ativos em todas as listas</p>
                
                <div className="grid grid-cols-2 gap-4 mt-10">
                  <div className="p-4 bg-white/5 border border-white/10">
                    <div className="text-2xl font-black text-accent">42.8%</div>
                    <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Taxa Média de Abertura</div>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10">
                    <div className="text-2xl font-black text-accent">12.4%</div>
                    <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Taxa Média de Clique</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-ink p-8">
              <h4 className="text-xs font-black uppercase tracking-[0.4em] opacity-40 mb-6">Histórico de Envios</h4>
              <div className="space-y-4">
                {[
                  { name: 'Edição #42', list: 'Lista Geral', date: 'Há 2 dias', open: '45%' },
                  { name: 'Edição #41', list: 'Lista Geral', date: 'Há 3 dias', open: '41%' },
                  { name: 'Edição #40', list: 'Lista Geral', date: 'Há 4 dias', open: '48%' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-paper border border-ink/5">
                    <div>
                      <span className="block font-bold text-sm">{item.name}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{item.list} • {item.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-black text-accent">{item.open}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Open Rate</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
