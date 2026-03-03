import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NewsletterPremiumView } from './NewsletterPremiumView';
import { Logo } from './Logo';
import { 
  ArrowRight, 
  Mail, 
  Zap, 
  Globe, 
  Cpu, 
  TrendingUp, 
  Menu, 
  X, 
  Newspaper, 
  Linkedin, 
  Twitter, 
  Instagram,
  Settings,
  Clock as ClockIcon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { NewsletterForm } from './NewsletterForm';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b-2 border-ink sticky top-0 bg-paper text-ink z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="text-xl" />
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors">Sobre</a>
            <a href="#sample" className="text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors">O que esperar</a>
            <Link to="/backoffice" className="text-ink/20 hover:text-accent transition-colors">
              <Settings size={18} />
            </Link>
            <a href="#subscribe" className="bg-ink text-paper px-6 py-2 text-sm font-bold uppercase tracking-widest hover:bg-accent transition-colors">Subscrever</a>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-paper border-b-2 border-ink p-4 space-y-4"
        >
          <a href="#about" className="block text-sm font-bold uppercase tracking-widest py-2" onClick={() => setIsOpen(false)}>Sobre</a>
          <a href="#sample" className="block text-sm font-bold uppercase tracking-widest py-2" onClick={() => setIsOpen(false)}>O que esperar</a>
          <Link to="/backoffice" className="block text-sm font-bold uppercase tracking-widest py-2" onClick={() => setIsOpen(false)}>Backoffice</Link>
          <a href="#subscribe" className="block bg-ink text-paper px-6 py-3 text-sm font-bold uppercase tracking-widest text-center" onClick={() => setIsOpen(false)}>Subscrever</a>
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // 1. Fetch 'article' category ID
        const { data: catData } = await supabase
          .from('content_categories')
          .select('id')
          .eq('slug', 'article')
          .single();

        // 2. Fetch published articles
        const query = supabase
          .from('content')
          .select('*')
          .eq('status', 'published');
        
        if (catData) {
          query.eq('category_id', catData.id);
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        if (data && data.length > 0) {
          setNews(data);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="relative overflow-hidden border-b-2 border-ink">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 md:p-12 lg:p-16 flex flex-col justify-center border-r-0 lg:border-r-2 border-ink">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block border-2 border-ink px-3 py-1 mb-6">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Edição Diária • IA Global</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8 uppercase italic">
              A IA explicada com <span className="text-accent">classe</span> e sem tretas.
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl font-medium leading-relaxed mb-10 max-w-xl">
              A newsletter diária que traduz o caos da Inteligência Artificial para português de Portugal. Seca, mordaz e essencial.
            </p>
            
            <div className="max-w-md">
              <NewsletterForm source="hero" />
            </div>

            <p className="mt-4 text-xs font-bold opacity-50 uppercase tracking-widest">
              Lido por +5,000 profissionais em 3 minutos.
            </p>
          </motion.div>
        </div>
        
        <div className="lg:col-span-5 bg-ink text-paper p-6 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <Cpu size={320} strokeWidth={0.5} className="md:w-[400px] md:h-[400px]" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
              <div className="h-px flex-grow bg-paper/30"></div>
              <span className="font-mono text-xs uppercase tracking-widest text-paper/60">Últimas Notícias</span>
            </div>
            
            <motion.div 
              className="space-y-6 md:space-y-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                visible: { transition: { staggerChildren: 0.2 } }
              }}
            >
              {loading ? (
                <div className="flex items-center gap-4 animate-pulse">
                  <div className="w-24 h-24 bg-paper/10"></div>
                  <div className="flex-grow space-y-2">
                    <div className="h-4 bg-paper/10 w-1/4"></div>
                    <div className="h-8 bg-paper/10 w-full"></div>
                  </div>
                </div>
              ) : news.length > 0 ? (
                news.map((item) => (
                  <Link key={item.id} to={`/article/${item.id}`} className="block">
                    <motion.div 
                      className="group cursor-pointer flex gap-4 items-center"
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                      }}
                    >
                      <div className="flex-shrink-0 w-16 h-16 md:w-24 md:h-24 border-2 border-paper/10 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 bg-paper/5">
                        <img 
                          src={item.image_url || `https://picsum.photos/seed/${item.id}/300/300`} 
                          alt={item.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-grow">
                        <span className="font-mono text-accent text-xs md:text-sm mb-1 block">
                          {format(new Date(item.created_at), 'dd / MM / yyyy')}
                        </span>
                        <h3 className="text-lg md:text-2xl font-serif italic leading-tight group-hover:underline group-hover:text-white group-hover:decoration-accent group-hover:decoration-2 transition-all duration-300">
                          {item.title}
                        </h3>
                        {item.subtitle && (
                          <p className="text-xs opacity-40 line-clamp-1 mt-1 font-serif">{item.subtitle}</p>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-paper/10 opacity-40">
                  <Newspaper className="mx-auto mb-4" size={32} />
                  <p className="text-xs font-bold uppercase tracking-widest">Sem notícias publicadas</p>
                </div>
              )}
            </motion.div>
          </div>

          <div className="mt-12 relative z-10">
            <div className="border-2 border-paper/20 p-6 backdrop-blur-sm">
              <p className="font-serif italic text-lg leading-relaxed">
                "A única newsletter que não me faz sentir que estou a ler um manual de instruções escrito por um robô deprimido."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent"></div>
                <span className="text-sm font-bold uppercase tracking-widest">— João P., CTO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Marquee = () => {
  return (
    <div className="bg-accent text-paper py-3 border-b-2 border-ink marquee-container">
      <div className="marquee-content">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="inline-flex items-center mx-8 text-sm font-black uppercase tracking-[0.3em]">
            <Zap size={16} className="mr-2" /> Inteligência Artificial • Sem Tretas • Diário • 08:00 AM
          </span>
        ))}
      </div>
    </div>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Globe className="text-accent" />,
      title: "Visão Global",
      description: "O que acontece em Silicon Valley, traduzido para a realidade de quem vive entre o Chiado e Matosinhos."
    },
    {
      icon: <TrendingUp className="text-accent" />,
      title: "Impacto Real",
      description: "Esquece o hype. Focamo-nos no que realmente muda o teu trabalho e a tua conta bancária hoje."
    },
    {
      icon: <Newspaper className="text-accent" />,
      title: "Curadoria de Elite",
      description: "Lemos 500 artigos para que tu só precises de ler um. Em 3 minutos estás pronto para o dia."
    }
  ];

  return (
    <section id="about" className="border-b-2 border-ink">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3">
        {features.map((f, i) => (
          <div key={i} className={cn(
            "p-12 border-ink",
            i !== features.length - 1 ? "border-b-2 md:border-b-0 md:border-r-2" : ""
          )}>
            <div className="mb-6">{f.icon}</div>
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">{f.title}</h3>
            <p className="text-lg leading-relaxed opacity-80">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const NewsletterSample = () => {
  const [latest, setLatest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        // 1. Fetch 'newsletter' category ID
        const { data: catData } = await supabase
          .from('content_categories')
          .select('id')
          .eq('slug', 'newsletter')
          .single();

        // 2. Fetch latest published newsletter
        const query = supabase
          .from('content')
          .select('*')
          .eq('status', 'published');
        
        if (catData) {
          query.eq('category_id', catData.id);
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data) setLatest(data);
      } catch (err) {
        console.error('Error fetching latest news for sample:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  const scrollToSubscribe = () => {
    document.getElementById('subscribe')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Default content if nothing is approved yet
  const displayTitle = latest?.title;
  const displayDate = latest ? format(new Date(latest.created_at), 'dd MMM yyyy').toUpperCase() : "";
  const displayBody = latest?.body;

  if (loading) {
    return (
      <section id="sample" className="bg-white border-b-2 border-ink py-12 md:py-20 px-4">
        <div className="max-w-3xl mx-auto border-2 border-ink p-6 md:p-12 print-shadow bg-paper animate-pulse h-[400px]">
          <div className="h-8 bg-ink/5 w-1/3 mb-8"></div>
          <div className="h-20 bg-ink/5 w-full mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-ink/5 w-full"></div>
            <div className="h-4 bg-ink/5 w-5/6"></div>
            <div className="h-4 bg-ink/5 w-4/6"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!latest) {
    return (
      <section id="sample" className="bg-white border-b-2 border-ink py-12 md:py-20 px-4">
        <div className="max-w-3xl mx-auto border-2 border-ink p-12 text-center opacity-20">
          <Mail size={48} className="mx-auto mb-4" />
          <p className="font-black uppercase tracking-widest">Nenhuma newsletter publicada</p>
        </div>
      </section>
    );
  }

  return (
    <section id="sample" className="bg-white border-b-2 border-ink py-12 md:py-20 px-4">
      <div className="max-w-3xl mx-auto border-2 border-ink p-6 md:p-12 print-shadow bg-paper relative overflow-hidden">
        <div className="absolute top-0 left-0 bg-accent text-paper px-3 py-1 font-black uppercase tracking-widest text-[10px] md:text-sm z-10">
          Última Edição
        </div>
        
        <header className="border-b-2 border-ink pb-8 mb-8 mt-4 md:mt-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none mb-2">
                <span className="text-accent">AI</span>xo do Mal
              </h2>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-accent">Newsletter de AI, Realidade e Desespero Português</p>
            </div>
            <span className="font-mono text-xs md:text-sm bg-ink text-paper px-3 py-1">{displayDate}</span>
          </div>
          <div className="h-1 w-full bg-ink/5 mb-6"></div>
          <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight italic leading-tight">
            "{displayTitle}"
          </h3>
        </header>

        <div className="relative">
          {latest.metadata?.structured_newsletter || latest.metadata?.subject ? (
            <div className="max-h-[600px] overflow-hidden relative">
              <NewsletterPremiumView 
                data={latest.metadata?.structured_newsletter} 
                body={latest.body}
                metadata={latest.metadata}
              />
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-paper via-paper/90 to-transparent z-10 flex items-end justify-center pb-6">
                <div className="text-center px-4">
                  <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest mb-4 opacity-60">Subscreve para ler o resto desta edição</p>
                  <button 
                    onClick={scrollToSubscribe}
                    className="w-full sm:w-auto bg-accent text-paper px-8 py-4 font-black uppercase tracking-widest text-xs md:text-sm hover:bg-ink transition-all print-shadow active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    Ler Edição Completa
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {latest.image_url && (
                <div className="mb-8 -mx-6 md:-mx-12">
                  <img 
                    src={latest.image_url} 
                    alt="Banner" 
                    className="w-full h-48 md:h-64 object-cover border-y-2 border-ink"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div className="space-y-8 md:space-y-10 font-serif text-base md:text-lg leading-relaxed max-h-[400px] md:max-h-[500px] overflow-hidden newsletter-preview newsletter-body max-w-none">
                <ReactMarkdown>{displayBody}</ReactMarkdown>
                {latest.metadata?.footer_punchline && (
                  <div className="mt-8 pt-6 border-t-2 border-ink/10 italic opacity-60 text-center text-sm">
                    {latest.metadata.footer_punchline}
                  </div>
                )}
              </div>

              {/* Fade Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-paper via-paper/90 to-transparent z-10 flex items-end justify-center pb-6">
                <div className="text-center px-4">
                  <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest mb-4 opacity-60">Subscreve para ler o resto desta edição</p>
                  <button 
                    onClick={scrollToSubscribe}
                    className="w-full sm:w-auto bg-accent text-paper px-8 py-4 font-black uppercase tracking-widest text-xs md:text-sm hover:bg-ink transition-all print-shadow active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    Ler Edição Completa
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-ink text-paper py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 md:mb-20">
          <div>
            <Logo className="text-3xl md:text-4xl mb-6 italic tracking-tighter" dark />
            <p className="text-lg md:text-xl opacity-60 max-w-md leading-relaxed mb-8">
              A newsletter que não lês por obrigação, mas porque tens medo de ficar para trás. Diariamente, no teu inbox, às 08:00.
            </p>
            <div className="flex gap-4">
              <a href="https://linkedin.com/company/aixodomal" target="_blank" rel="noopener noreferrer" className="p-2 border border-paper/20 hover:bg-accent hover:border-accent transition-all">
                <Linkedin size={20} />
              </a>
              <a href="https://twitter.com/aixodomal" target="_blank" rel="noopener noreferrer" className="p-2 border border-paper/20 hover:bg-accent hover:border-accent transition-all">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com/aixodomal" target="_blank" rel="noopener noreferrer" className="p-2 border border-paper/20 hover:bg-accent hover:border-accent transition-all">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-accent">Junta-te à elite</h3>
            <NewsletterForm source="footer" variant="footer" />
          </div>
        </div>
        
        <div className="border-t border-paper/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-40">
          <span>© 2026 AIxo do Mal. Todos os direitos reservados.</span>
          <div className="flex gap-8">
            <a href="#" className="hover:text-accent">Privacidade</a>
            <a href="#" className="hover:text-accent">Termos</a>
            <a href="#" className="hover:text-accent">Publicidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-accent selection:text-paper font-sans">
      <Navbar />
      <main className="bg-paper">
        <Hero />
        <Marquee />
        <Features />
        <NewsletterSample />
        
        <section id="subscribe" className="py-16 md:py-24 bg-accent text-paper text-center border-b-2 border-ink">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter italic mb-8">
              Não sejas o último a saber.
            </h2>
            <p className="text-lg md:text-2xl font-medium mb-12 opacity-90 max-w-2xl mx-auto">
              Subscreve agora e recebe a edição de amanhã. É grátis, é em português e é melhor que o teu café da manhã.
            </p>
            <div className="max-w-md mx-auto">
              <NewsletterForm source="landing_footer" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
