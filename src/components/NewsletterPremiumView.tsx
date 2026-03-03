import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Logo } from './Logo';
import { Twitter, Linkedin, Instagram, Mail, Quote, ArrowRight, Zap, MessageSquare, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface StructuredNewsletter {
  edition: string;
  date: string;
  opening: string;
  number_of_day: {
    value: string;
    label: string;
    comment: string;
  };
  topic_of_day: {
    title: string;
    tldr: string;
    content: string;
    author: string;
  };
  daily_update: Array<{ title: string; content: string }>;
  four_heads: {
    concept: string;
    opinions: Array<{ author: string; emoji: string; color: string; text: string }>;
  };
  question_of_day: {
    question: string;
    options: string[];
  };
  exit_phrase: string;
}

export const NewsletterPremiumView: React.FC<{ data?: StructuredNewsletter, body?: string, metadata?: any }> = ({ data, body, metadata }) => {
  // If we have a body string, try to parse it into sections
  const parseBody = (content: string) => {
    const sections = content.split(/━━━━━━━━━━━━━━━━/);
    return {
      opening: sections[0]?.trim(),
      number_of_day: sections[1]?.trim(),
      topic_of_day: sections[2]?.trim(),
      daily_update: sections[3]?.trim(),
      four_heads: sections[4]?.trim(),
      question_of_day: sections[5]?.trim(),
      exit_phrase: sections[6]?.trim(),
    };
  };

  const parsed = body ? parseBody(body) : null;

  // Helper to extract content after a header emoji/title
  const extractContent = (section: string | undefined) => {
    if (!section) return '';
    const lines = section.split('\n');
    // Skip the first line if it's a header (contains emojis or uppercase titles)
    if (lines[0].includes('📊') || lines[0].includes('🔥') || lines[0].includes('📡') || lines[0].includes('🧠') || lines[0].includes('🗳️')) {
      return lines.slice(1).join('\n').trim();
    }
    return section;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const authors = [
    { name: 'Afonso', avatar: 'https://i.pravatar.cc/150?u=afonso', color: '#E11D48' },
    { name: 'Beatriz', avatar: 'https://i.pravatar.cc/150?u=beatriz', color: '#2563EB' },
    { name: 'Carlos', avatar: 'https://i.pravatar.cc/150?u=carlos', color: '#059669' },
    { name: 'Diana', avatar: 'https://i.pravatar.cc/150?u=diana', color: '#D97706' },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-3xl mx-auto bg-paper shadow-[24px_24px_0px_0px_rgba(15,23,42,0.05)] border-2 border-ink min-h-screen flex flex-col font-sans selection:bg-accent selection:text-white"
    >
      {/* 0. TOP EDITION NUMBER */}
      <div className="bg-ink text-paper py-1 px-4 text-center">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em]">
          {metadata?.subject ? 'Edição Especial' : `AIxo do Mal — Edição #${data?.edition || '042'}`}
        </span>
      </div>

      {/* 1. HEADER BANNER - BOLD BRAND IDENTITY */}
      <header className="relative py-16 px-8 text-center border-b-4 border-ink bg-paper overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        <motion.div variants={itemVariants} className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="relative inline-block">
              <Logo className="scale-[2] md:scale-[2.5]" />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4 mt-12">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none max-w-2xl mx-auto">
              {metadata?.subject || data?.topic_of_day?.title || "O Fim da Realidade como a Conhecemos"}
            </h1>
            <span className="font-mono text-xs font-bold uppercase tracking-widest bg-ink text-paper px-4 py-1 mt-4">
              {data?.date || format(new Date(), 'eeee, dd MMMM yyyy').toUpperCase()}
            </span>
          </div>
        </motion.div>
      </header>

      {/* 1.5 BANNER SPACE */}
      <div className="w-full h-32 bg-ink/5 border-b-2 border-ink flex items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/banner-aixo/1200/400')] bg-cover bg-center grayscale opacity-20 group-hover:opacity-40 transition-opacity" />
        <span className="relative z-10 font-mono text-[10px] uppercase tracking-[0.5em] opacity-30">Espaço Publicitário / Propaganda do Mal</span>
      </div>

      {/* 2. ABERTURA - EDITORIAL IMPACT */}
      <motion.section variants={itemVariants} className="py-24 px-10 md:px-16 bg-white border-b-2 border-ink relative">
        <Quote className="absolute top-10 left-6 text-accent/10 w-24 h-24 -z-0" />
        <div className="relative z-10 font-serif italic text-ink font-medium">
          <ReactMarkdown 
            components={{
              p: ({node, ...props}) => (
                <p 
                  className="text-3xl md:text-5xl leading-[1.15] mb-8 first-letter:text-7xl md:first-letter:text-9xl first-letter:font-black first-letter:text-accent first-letter:mr-4 first-letter:float-left first-letter:leading-none" 
                  {...props} 
                />
              )
            }}
          >
            {parsed?.opening || data?.opening || ''}
          </ReactMarkdown>
        </div>
      </motion.section>

      {/* 3. NÚMERO DO DIA - MASSIVE VISUAL IMPACT */}
      {(parsed?.number_of_day || data?.number_of_day) && (
        <motion.section variants={itemVariants} className="p-10 md:p-16 border-b-2 border-ink bg-accent text-paper relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 text-paper/10 font-black text-[200px] leading-none select-none">
            {data?.number_of_day?.value?.slice(0, 2) || "01"}
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 size={24} />
              <span className="text-xs font-black uppercase tracking-[0.4em]">O Número que nos Assombra</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-start gap-8">
              <div className="text-6xl md:text-8xl xl:text-9xl font-black font-display tracking-tighter leading-none break-all lg:break-normal">
                {data?.number_of_day?.value || "30.000"}
              </div>
              <div className="flex-grow pt-2">
                <div className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none mb-4">
                  {data?.number_of_day?.label || "Pessoas Substituídas por um Script de Python"}
                </div>
                <div className="text-xl font-medium opacity-90 italic article-body leading-relaxed">
                  <ReactMarkdown>{extractContent(parsed?.number_of_day) || data?.number_of_day?.comment || ''}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* 4. TÓPICO DO DIA - INTEGRATED & DEPTH */}
      {(parsed?.topic_of_day || data?.topic_of_day) && (
        <motion.section variants={itemVariants} className="relative border-b-2 border-ink">
          <div className="bg-ink text-paper py-6 px-10 md:px-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-accent" />
              <h2 className="text-sm font-black uppercase tracking-[0.4em]">Tópico em Destaque</h2>
            </div>
            <span className="text-[10px] font-mono opacity-50">LEITURA DE 4 MIN</span>
          </div>
          
          <div className="p-10 md:p-16 bg-paper">
            {/* TL;DR BOX - SHAPE VARIETY */}
            <div className="mb-12 relative">
              <div className="absolute inset-0 bg-ink translate-x-2 translate-y-2" />
              <div className="relative bg-white border-2 border-ink p-8">
                <div className="absolute -top-4 -left-4 bg-accent text-paper px-4 py-1 font-black uppercase text-xs rotate-[-2deg] border-2 border-ink shadow-sm">
                  TL;DR
                </div>
                <p className="font-sans text-lg font-bold leading-relaxed italic">
                  {data?.topic_of_day?.tldr || "A IA não vai tirar o teu emprego. Vai apenas tornar o teu patrão tão rico que ele se esquece que tu existes."}
                </p>
              </div>
            </div>

            {/* FEATURED IMAGE - FULLY INTEGRATED */}
            <div className="mb-12 relative group">
              <div className="absolute inset-0 bg-accent translate-x-3 translate-y-3 opacity-20 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
              <div className="relative border-2 border-ink overflow-hidden aspect-video bg-ink/5">
                <img 
                  src={`https://picsum.photos/seed/${encodeURIComponent(data?.topic_of_day?.title || 'aixo-topic')}/1200/600`} 
                  alt="Topic" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 left-0 bg-ink text-paper px-4 py-2 text-[10px] font-black uppercase tracking-widest">
                  Visualização Gerada por IA
                </div>
              </div>
            </div>
            
            <div className="prose prose-ink max-w-none newsletter-body">
              <ReactMarkdown>{extractContent(parsed?.topic_of_day) || data?.topic_of_day?.content || ''}</ReactMarkdown>
            </div>

            {data?.topic_of_day?.author && (
              <div className="mt-16 flex items-center justify-end gap-4">
                <div className="text-right">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-ink/40">Escrito por</span>
                  <span className="text-xl font-black italic">— {data.topic_of_day.author}</span>
                </div>
                <img 
                  src={`https://i.pravatar.cc/150?u=${encodeURIComponent(data.topic_of_day.author)}`} 
                  alt={data.topic_of_day.author}
                  className="w-12 h-12 rounded-full border-2 border-ink grayscale"
                />
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* 5. UPDATE DIÁRIO - RHYTHM & FLOW */}
      {(parsed?.daily_update || data?.daily_update) && (
        <motion.section variants={itemVariants} className="border-b-2 border-ink">
          <div className="bg-paper border-b-2 border-ink py-6 px-10 md:px-16 flex items-center gap-3">
            <ArrowRight size={20} className="text-accent" />
            <h2 className="text-sm font-black uppercase tracking-[0.4em]">O que se passou hoje</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y-2 md:divide-y-0 md:divide-x-2 divide-ink">
            {data?.daily_update ? (
              data.daily_update.map((update, idx) => (
                <div key={idx} className="p-10 hover:bg-accent/5 transition-colors group">
                  <span className="text-[10px] font-black text-accent mb-4 block">UPDATE 0{idx + 1}</span>
                  <h3 className="font-display font-black uppercase tracking-tight text-2xl mb-4 group-hover:translate-x-2 transition-transform">{update.title}</h3>
                  <div className="leading-relaxed opacity-80 font-serif text-lg article-body">
                    <ReactMarkdown>{update.content}</ReactMarkdown>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 col-span-2 newsletter-body">
                <div className="mb-10 border-2 border-ink shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden h-64 bg-ink/5">
                  <img 
                    src="https://picsum.photos/seed/daily-aixo/1000/500" 
                    alt="Daily Update" 
                    className="w-full h-full object-cover grayscale"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="columns-1 md:columns-2 gap-10 article-body">
                  <ReactMarkdown>{extractContent(parsed?.daily_update)}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* 6. 4 CABEÇAS, 1 CONCEITO - PERSONALITY & AVATARS */}
      {(parsed?.four_heads || data?.four_heads) && (
        <motion.section variants={itemVariants} className="bg-ink text-paper py-16 md:py-24 px-6 md:px-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative z-10">
            <div className="text-center mb-12 md:mb-20">
              <div className="inline-block bg-accent text-paper px-4 py-1 text-[10px] font-black uppercase tracking-[0.4em] mb-6 md:mb-8">
                Mesa Redonda
              </div>
              <div className="flex flex-col items-center gap-4 md:gap-6">
                <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-accent font-bold">O Conceito de Hoje</span>
                <h2 className="text-3xl md:text-7xl font-black uppercase tracking-tighter italic leading-none bg-paper text-ink px-6 py-4 md:px-10 md:py-6 border-4 border-accent shadow-[8px_8px_0px_0px_rgba(225,29,72,1)] md:shadow-[12px_12px_0px_0px_rgba(225,29,72,1)] transform -rotate-1">
                  {data?.four_heads?.concept || extractContent(parsed?.four_heads).split('\n')[0].replace('Hoje: ', '') || "Conceito do Mal"}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              {(() => {
                let opinionsToRender = data?.four_heads?.opinions;

                // If no structured data, try to parse from markdown
                if (!opinionsToRender && parsed?.four_heads) {
                  const content = extractContent(parsed.four_heads);
                  const lines = content.split('\n').filter(l => l.trim().startsWith('💬'));
                  
                  opinionsToRender = lines.map((line, idx) => {
                    const match = line.match(/💬 \*\*(.*?)\*\* — (.*)/);
                    const author = match ? match[1] : `Autor ${idx + 1}`;
                    const text = match ? match[2] : line.replace('💬 ', '');
                    const authorData = authors.find(a => a.name === author) || authors[idx % authors.length];
                    
                    return {
                      author,
                      text,
                      color: authorData.color,
                      emoji: '💬'
                    };
                  });
                }

                if (opinionsToRender && opinionsToRender.length > 0) {
                  return opinionsToRender.map((opinion, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white/5 border-2 border-white/10 p-6 md:p-10 hover:bg-white/10 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-2 h-full bg-accent" style={{ backgroundColor: opinion.color }} />
                      <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-center sm:items-start text-center sm:text-left">
                        <div className="flex-shrink-0 flex flex-col items-center gap-3 md:gap-4">
                          <div className="relative">
                            <img 
                              src={`https://i.pravatar.cc/150?u=${encodeURIComponent(opinion.author)}`} 
                              alt={opinion.author}
                              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white/20 grayscale group-hover:grayscale-0 transition-all shadow-xl"
                              style={{ borderColor: opinion.color }}
                            />
                          </div>
                          <span className="font-display font-black uppercase text-[10px] md:text-xs tracking-widest text-paper bg-white/10 px-3 py-1 rounded-full whitespace-nowrap">
                            {opinion.author}
                          </span>
                        </div>
                        <div className="flex-grow italic leading-relaxed text-lg md:text-xl opacity-90 article-body pt-0 sm:pt-2">
                          <ReactMarkdown>{"\"" + opinion.text + "\""}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ));
                }

                return (
                  <div className="col-span-2 bg-white/5 p-8 md:p-12 border-2 border-white/10 newsletter-body prose-invert article-body">
                    <ReactMarkdown>{extractContent(parsed?.four_heads)}</ReactMarkdown>
                  </div>
                );
              })()}
            </div>
          </div>
        </motion.section>
      )}

      {/* 7. PERGUNTA DO DIA - INTERACTIVE POLL */}
      {(parsed?.question_of_day || data?.question_of_day) && (
        <motion.section variants={itemVariants} className="py-28 px-10 md:px-16 text-center bg-paper text-ink relative overflow-hidden border-b-4 border-ink">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]" />
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-block bg-ink text-paper px-6 py-2 text-[11px] font-black uppercase tracking-[0.5em] mb-12">
              Sondagem do Mal
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-16 leading-tight italic uppercase">
              {data?.question_of_day?.question || extractContent(parsed?.question_of_day).split('\n')[0]}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(data?.question_of_day?.options || extractContent(parsed?.question_of_day).split('\n').slice(1)).slice(0, 2).map((opt, idx) => {
                const optionText = typeof opt === 'string' ? opt.replace(/👉 [A-C]\) /, '').trim() : opt;
                if (!optionText) return null;
                
                return (
                  <button 
                    key={idx}
                    className="group relative bg-white border-4 border-ink p-10 text-left hover:bg-accent hover:text-paper transition-all shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-4xl font-black opacity-20 group-hover:opacity-100">0{idx + 1}</span>
                      <div className="w-12 h-12 rounded-full border-2 border-ink flex items-center justify-center group-hover:border-paper">
                        <Zap size={20} />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-8 leading-none">
                      {optionText}
                    </h3>
                    <div className="flex items-center justify-between pt-6 border-t-2 border-ink/10 group-hover:border-paper/20">
                      <span className="text-[10px] font-black uppercase tracking-widest">Votar nesta opção</span>
                      <ArrowRight size={16} />
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mt-16 text-[10px] font-black uppercase tracking-[0.3em] opacity-30 italic">
              * O teu voto será ignorado pelo algoritmo, mas obrigado pela participação.
            </p>
          </div>
        </motion.section>
      )}

      {/* 8. FRASE DE SAÍDA - THE PUNCHLINE HERO */}
      <motion.section variants={itemVariants} className="py-32 px-10 md:px-16 text-center bg-paper relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-ink/10" />
        <div className="text-4xl md:text-7xl font-black italic leading-none tracking-tighter text-ink uppercase article-body">
          <ReactMarkdown>{parsed?.exit_phrase || data?.exit_phrase || 'Até amanhã, se o servidor não cair.'}</ReactMarkdown>
        </div>
        <div className="mt-12 flex justify-center gap-2">
          {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 bg-accent rounded-full" />)}
        </div>
      </motion.section>

      {/* 9. FOOTER - DEVELOPED & COMPLETE */}
      <footer className="bg-ink text-paper py-20 px-10 md:px-16 mt-auto border-t-4 border-accent">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          <div className="space-y-6">
            <Logo dark className="scale-125 origin-left" />
            <p className="text-sm opacity-50 font-serif italic leading-relaxed">
              A newsletter que te diz o que a IA está a fazer, enquanto tu finges que estás a trabalhar.
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Segue o Mal</h4>
            <div className="flex gap-4">
              {[Twitter, Linkedin, Instagram, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all group">
                  <Icon size={18} className="opacity-50 group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Legalidades Chatas</h4>
            <div className="flex flex-col gap-3 text-xs font-bold uppercase tracking-widest opacity-40">
              <a href="#" className="hover:text-accent transition-colors">Cancelar Subscrição</a>
              <a href="#" className="hover:text-accent transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-accent transition-colors">Política de Privacidade</a>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
            AIxo do Mal © 2026 — Feito com ódio e processadores quentes
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest opacity-30 italic">
            "A inteligência é artificial, o desespero é genuíno."
          </div>
        </div>
      </footer>
    </motion.div>
  );
};
