import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NewsletterFormProps {
  source?: string;
  variant?: 'landing' | 'sidebar' | 'footer';
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({ source = 'unknown', variant = 'landing' }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Simple Captcha
  const [captcha, setCaptcha] = useState({ a: 0, b: 0, result: 0 });
  const [captchaInput, setCaptchaInput] = useState('');
  const [showCaptcha, setShowCaptcha] = useState(false);

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ a, b, result: a + b });
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showCaptcha) {
      setShowCaptcha(true);
      return;
    }

    if (parseInt(captchaInput) !== captcha.result) {
      setErrorMessage('Captcha incorreto. Tenta novamente.');
      generateCaptcha();
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email, source, status: 'active' }]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          setStatus('success'); // Assume they are already subscribed
        } else {
          throw error;
        }
      } else {
        setStatus('success');
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      setStatus('error');
      setErrorMessage('Ocorreu um erro. Tenta mais tarde.');
    }
  };

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border-2 border-green-600 p-6 text-center"
      >
        <CheckCircle className="mx-auto text-green-600 mb-4" size={40} />
        <h4 className="text-xl font-black uppercase tracking-tighter text-green-900 mb-2 italic">
          Bem-vindo ao Caos!
        </h4>
        <p className="font-serif italic text-green-800">
          A tua subscrição foi confirmada. Prepara-te para a dose diária de desprezo tecnológico.
        </p>
      </motion.div>
    );
  }

  const isLanding = variant === 'landing';
  const isSidebar = variant === 'sidebar';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <input 
          type="email" 
          required
          placeholder="O teu melhor email..." 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          className={`w-full p-4 border-2 border-ink font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${
            isLanding ? 'text-lg' : 'text-sm'
          } ${status === 'error' ? 'border-red-500' : 'border-ink'}`}
        />
      </div>

      <AnimatePresence>
        {showCaptcha && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-paper border-2 border-ink border-t-0 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-accent" /> Prova que não és um bot
                </label>
                <span className="font-mono text-xs font-bold">{captcha.a} + {captcha.b} = ?</span>
              </div>
              <input 
                type="number" 
                required
                placeholder="Resultado..." 
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="w-full p-2 border border-ink/20 focus:outline-none font-bold text-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-widest">
          <AlertCircle size={14} /> {errorMessage}
        </div>
      )}

      <button 
        type="submit"
        disabled={status === 'loading'}
        className={`w-full bg-accent text-paper font-black uppercase tracking-widest hover:bg-ink transition-all flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(15,23,42,0.2)] hover:shadow-none ${
          isLanding ? 'py-5 text-sm' : 'py-4 text-xs'
        }`}
      >
        {status === 'loading' ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          showCaptcha ? 'Confirmar Subscrição' : 'Subscrever Agora'
        )}
      </button>
      
      <p className="text-[9px] font-bold uppercase tracking-widest opacity-30 text-center">
        Prometemos não vender os teus dados (a menos que a oferta seja irrecusável).
      </p>
    </form>
  );
};
