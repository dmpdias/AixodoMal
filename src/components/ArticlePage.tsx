import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Logo } from './Logo';
import { 
  ArrowLeft, 
  Linkedin, 
  Twitter, 
  Clock, 
  Calendar, 
  User,
  Share2,
  Bookmark,
  MessageSquare,
  Loader2,
  Zap,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { NewsletterForm } from './NewsletterForm';

// Mock data for the hardcoded news in LandingPage
const MOCK_ARTICLES: Record<string, any> = {
  '1': {
    id: '1',
    title: 'O fim dos prompts? A nova era da IA autónoma chegou a Lisboa.',
    subtitle: 'Agentes inteligentes que executam tarefas complexas sem supervisão humana prometem revolucionar o ecossistema tecnológico nacional.',
    author: 'Equipa AIxo do Mal',
    date: new Date('2026-02-01'),
    readingTime: '5 min',
    image: 'https://picsum.photos/seed/lisbon-robot/1200/600',
    body: `
A Inteligência Artificial está a mudar de forma mais rápida do que conseguimos escrever sobre ela. Se em 2024 o foco eram os **Large Language Models (LLMs)** e a arte de escrever o "prompt perfeito", 2026 marca a transição definitiva para os **Agentes Autónomos**.

Estes sistemas não se limitam a responder a perguntas. Eles planeiam, executam e corrigem as suas próprias ações. Em Lisboa, várias startups já estão a implementar agentes que gerem pipelines de vendas, escrevem código e até negoceiam contratos de energia sem qualquer intervenção humana.

### O que muda para o profissional comum?
A grande diferença é a mudança de *operador* para *gestor*. Já não precisas de saber como "falar" com a máquina para ela fazer uma tarefa simples; precisas de saber definir objetivos claros e auditar os resultados que o agente entrega.

> "O prompt morreu. O que importa agora é a orquestração de fluxos de trabalho onde a IA toma decisões em tempo real."

Para o ecossistema de Lisboa, isto representa uma oportunidade única. Com a Web Summit a consolidar a cidade como um hub tecnológico, a adoção precoce de agentes autónomos pode colocar as empresas portuguesas na vanguarda da eficiência global.

**Destaques desta semana:**

*   **Auto-GPT 5.0:** Lançamento surpresa com integração nativa em sistemas ERP.
*   **Regulação:** A UE prepara novas diretrizes para a responsabilidade civil de atos cometidos por agentes autónomos.
*   **Talento:** Procura por "AI Orchestrators" sobe 300% no LinkedIn Portugal.
    `
  },
  '2': {
    id: '2',
    title: 'A Apple finalmente acordou, mas o café está frio.',
    subtitle: 'O lançamento do Apple Intelligence 2.0 tenta recuperar o terreno perdido para a Google e OpenAI, mas será suficiente?',
    author: 'Ricardo Santos',
    date: new Date('2026-01-31'),
    readingTime: '4 min',
    image: 'https://picsum.photos/seed/apple-coffee/1200/600',
    body: `
Durante anos, a Apple manteve-se num silêncio ensurdecedor enquanto o mundo explodia com o ChatGPT. A estratégia de "esperar para fazer melhor" foi posta à prova, e os resultados do novo **Apple Intelligence 2.0** são, no mínimo, divisivos.

A integração profunda no ecossistema iOS é inegável. A Siri finalmente parece ter um cérebro funcional, capaz de compreender contexto entre aplicações. No entanto, para quem já usa ferramentas avançadas da OpenAI ou da Anthropic, a oferta da Apple parece... *básica*.

### Privacidade como bandeira
Onde a Apple ganha é na **privacidade**. O processamento local no chip M5 garante que os teus dados nunca saem do dispositivo. Para empresas com políticas de segurança rigorosas, esta pode ser a "killer feature" que faltava.

Mas o mercado não espera. Enquanto a Apple polia as animações da Siri, a Google integrou o Gemini em todo o Workspace e a Microsoft tornou o Copilot parte do sistema operativo de milhões.

**O veredito:** É um excelente upgrade para o utilizador comum, mas um bocejo para o power user de IA.
    `
  },
  '3': {
    id: '3',
    title: 'Porque é que o teu vizinho está a ganhar 5k com o Midjourney.',
    subtitle: 'A democratização da criação visual está a criar uma nova classe de micro-empreendedores em Portugal.',
    author: 'Marta Oliveira',
    date: new Date('2026-01-30'),
    readingTime: '6 min',
    image: 'https://picsum.photos/seed/ai-money/1200/600',
    body: `
Não é magia, é **Midjourney v8**. O que antes exigia uma equipa de design e semanas de trabalho, agora é feito numa tarde por alguém com bom gosto e as ferramentas certas.

O mercado de stock photography, design de interiores e até publicidade local está a ser canibalizado por freelancers que dominam a geração de imagem. Em Portugal, estamos a ver um boom de agências "AI-First" que cobram frações do preço tradicional com resultados superiores.

### O segredo não está na ferramenta
O segredo está na **curadoria**. O Midjourney gera 100 imagens, mas apenas 1 é perfeita. O valor humano mudou da *execução* para a *seleção*.

Se queres entrar neste mercado, o conselho é simples: especializa-te num nicho. Não sejas o "gajo da IA"; sê o especialista em visualização arquitetónica para o mercado imobiliário do Algarve.
    `
  }
};

export const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<any>(null);
  const [moreArticles, setMoreArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        let currentCategoryId = null;

        // Fetch main article
        if (id && MOCK_ARTICLES[id]) {
          setArticle(MOCK_ARTICLES[id]);
          // For mock articles, we might want to default to 'article' category
          const { data: catData } = await supabase.from('content_categories').select('id').eq('slug', 'article').single();
          currentCategoryId = catData?.id;
        } else if (id) {
          const { data, error } = await supabase
            .from('content')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          if (data) {
            currentCategoryId = data.category_id;
            setArticle({
              id: data.id,
              title: data.title,
              subtitle: data.subtitle || 'Uma análise profunda sobre o futuro da tecnologia e sociedade.',
              author: data.author || 'Equipa AIxo do Mal',
              date: new Date(data.created_at),
              readingTime: data.reading_time || '4 min',
              image: data.image_url || `https://picsum.photos/seed/${data.id}/1200/600`,
              body: data.body,
              category_id: data.category_id
            });
          }
        }

        // Fetch "Mais lidas" (other published articles of the same category)
        if (currentCategoryId) {
          const { data: moreData } = await supabase
            .from('content')
            .select('*')
            .eq('status', 'published')
            .eq('category_id', currentCategoryId)
            .neq('id', id || '')
            .order('created_at', { ascending: false })
            .limit(3);
          
          if (moreData) {
            setMoreArticles(moreData);
          }
        }

        window.scrollTo(0, 0);
      } catch (err) {
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-ink">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-accent" size={48} />
          <p className="font-black uppercase tracking-widest text-xs">A carregar artigo...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-ink">
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase italic mb-4">Artigo não encontrado</h2>
          <Link to="/" className="text-accent font-bold hover:underline">Voltar à página inicial</Link>
        </div>
      </div>
    );
  }

  const shareUrl = window.location.href;
  const shareText = encodeURIComponent(article.title);

  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-accent selection:text-paper">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-accent z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 bg-paper/90 backdrop-blur-md border-b-2 border-ink z-40">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center group-hover:bg-ink group-hover:text-paper transition-all">
              <ArrowLeft size={18} />
            </div>
            <span className="font-black uppercase tracking-[0.2em] text-[10px] hidden sm:block">Voltar</span>
          </Link>
          
          <Logo className="scale-110" />
          
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2.5 hover:bg-ink/5 rounded-full transition-colors"><Bookmark size={20} /></button>
            <button className="hidden sm:flex items-center gap-2 bg-ink text-paper px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-colors">
              <Share2 size={14} /> Partilhar
            </button>
            <button className="sm:hidden p-2.5 hover:bg-ink/5 rounded-full transition-colors"><Share2 size={20} /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            <header className="mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-wrap items-center gap-6 mb-10">
                  <span className="bg-accent text-paper px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                    IA Global
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-black opacity-40 uppercase tracking-widest">
                    <Calendar size={14} className="text-accent" />
                    {format(article.date, 'dd MMMM yyyy', { locale: pt })}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black opacity-40 uppercase tracking-widest">
                    <Clock size={14} className="text-accent" />
                    {article.readingTime}
                  </div>
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-10 uppercase italic">
                  {article.title}
                </h1>
                
                <div className="relative mb-12">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent" />
                  <p className="text-xl md:text-3xl font-medium leading-tight opacity-80 pl-8 font-serif italic">
                    {article.subtitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-8 py-8 border-y-2 border-ink/10">
                  <div className="flex items-center gap-4">
                    <img 
                      src={`https://i.pravatar.cc/150?u=${encodeURIComponent(article.author)}`} 
                      alt={article.author}
                      className="w-14 h-14 rounded-full border-2 border-ink grayscale"
                    />
                    <div>
                      <span className="block font-black uppercase tracking-[0.2em] text-[9px] text-ink/40">Escrito por</span>
                      <span className="font-black italic text-xl">— {article.author}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 border-2 border-ink flex items-center justify-center hover:bg-accent hover:text-paper hover:border-accent transition-all"
                    >
                      <Twitter size={20} />
                    </a>
                    <a 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 border-2 border-ink flex items-center justify-center hover:bg-accent hover:text-paper hover:border-accent transition-all"
                    >
                      <Linkedin size={20} />
                    </a>
                  </div>
                </div>
              </motion.div>
            </header>

            {/* Featured Image */}
            <motion.div 
              className="mb-20"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-accent translate-x-4 translate-y-4 opacity-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform" />
                <div className="relative aspect-[16/9] overflow-hidden border-2 border-ink bg-ink/5">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </motion.div>

            {/* Content Body */}
            <div className="article-body max-w-none">
              <ReactMarkdown>{article.body}</ReactMarkdown>
            </div>
            
            <div className="mt-24 pt-12 border-t-4 border-ink">
              <div className="flex items-center gap-3 mb-8">
                <Zap size={20} className="text-accent" />
                <h4 className="text-xs font-black uppercase tracking-[0.4em]">Tópicos Relacionados</h4>
              </div>
              <div className="flex flex-wrap gap-3">
                {['InteligenciaArtificial', 'LisboaTech', 'FuturoDoTrabalho', 'AgentesAutonomos'].map(tag => (
                  <span key={tag} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 border-2 border-ink hover:bg-ink hover:text-paper transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 space-y-16">
            {/* Newsletter Widget */}
            <div className="bg-ink text-paper p-10 relative overflow-hidden group sticky top-28">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-accent/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10">
                <div className="w-10 h-10 bg-accent flex items-center justify-center mb-8">
                  <MessageSquare size={20} />
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tighter italic leading-none mb-6">
                  Não fiques para trás.
                </h4>
                <p className="font-serif italic text-lg opacity-70 mb-10 leading-relaxed">
                  Recebe a dose diária de caos tecnológico diretamente no teu email.
                </p>
                <NewsletterForm source="article_sidebar" variant="sidebar" />
              </div>
            </div>

            {/* More Articles Widget */}
            <div className="space-y-10">
              <div className="flex items-center gap-3">
                <div className="h-px flex-grow bg-ink/10" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 whitespace-nowrap">Mais lidas</h4>
                <div className="h-px flex-grow bg-ink/10" />
              </div>
              
              <div className="space-y-10">
                {(moreArticles.length > 0 ? moreArticles : Object.values(MOCK_ARTICLES).filter(a => a.id !== article.id)).map(a => (
                  <Link key={a.id} to={`/article/${a.id}`} className="group block">
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 h-20 flex-shrink-0 border-2 border-ink overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                        <img 
                          src={a.image || `https://picsum.photos/seed/${a.id}/200/200`} 
                          alt={a.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-accent mb-1">
                          {a.readingTime || a.reading_time || '4 min'}
                        </span>
                        <h5 className="font-black uppercase tracking-tight text-sm leading-tight group-hover:text-accent transition-colors">
                          {a.title}
                        </h5>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-30">
                      Ler Artigo <ChevronRight size={10} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-ink text-paper py-24 px-6 mt-24 border-t-8 border-accent">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-20">
            <Logo className="scale-150 origin-left" dark />
            <div className="flex gap-4">
              {[Twitter, Linkedin, Share2].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all group">
                  <Icon size={20} className="opacity-50 group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
              © 2026 AIxo do Mal — IA com Classe e Desprezo Humano
            </p>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-30 italic">
              "A inteligência é artificial, o sarcasmo é genuíno."
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
