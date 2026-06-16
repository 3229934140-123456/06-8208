import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Mail,
  ArrowLeft,
  Search,
  Compass,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-teal-50/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary-200/60 to-primary-400/20 blur-3xl animate-float" />
        <div
          className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-mint-200/50 to-mint-400/20 blur-3xl animate-float"
          style={{ animationDelay: '-3s' }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-warning-low/25 to-yellow-200/10 blur-3xl animate-float"
          style={{ animationDelay: '-1.5s' }}
        />

        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0F4C81" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <div className="absolute top-20 left-[12%] w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-2xl rotate-12 animate-float opacity-60" />
        <div className="absolute top-[18%] right-[15%] w-8 h-8 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 shadow-xl animate-float opacity-70" style={{ animationDelay: '-2s' }} />
        <div className="absolute bottom-[25%] left-[18%] w-16 h-16 rounded-3xl bg-gradient-to-br from-warning-low to-orange-400 shadow-2xl -rotate-6 animate-float opacity-50" style={{ animationDelay: '-4s' }} />
        <div className="absolute bottom-[15%] right-[12%] w-10 h-10 rotate-45 bg-gradient-to-br from-primary-300 to-primary-500 shadow-xl animate-float opacity-55" style={{ animationDelay: '-1s' }} />
        <div className="absolute top-[40%] left-[8%] w-6 h-6 rounded-full bg-gradient-to-br from-mint-300 to-mint-500 shadow-lg animate-float opacity-65" style={{ animationDelay: '-2.5s' }} />
        <div className="absolute top-[55%] right-[8%] w-9 h-9 rounded-xl bg-gradient-to-br from-purple-300 to-purple-500 shadow-xl rotate-45 animate-float opacity-50" style={{ animationDelay: '-3.5s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div
          className={cn(
            'max-w-2xl w-full text-center transition-all duration-700 transform',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div
            className={cn(
              'relative inline-flex items-center justify-center mb-10 transition-all duration-500 delay-200',
              mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 rounded-[3rem] blur-2xl opacity-25 scale-125" />
            <div className="relative px-6 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-card">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary-600">
                <Sparkles className="h-4 w-4 text-warning-low" />
                <span>心灵健康监测平台</span>
              </div>
            </div>
          </div>

          <div
            className={cn(
              'relative mb-8 transition-all duration-700 delay-300',
              mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            )}
          >
            <div className="relative inline-block">
              <h1 className="font-serif font-black text-[clamp(5rem,18vw,12rem)] leading-none tracking-tight select-none">
                <span className="inline-block bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 bg-clip-text text-transparent drop-shadow-[0_12px_32px_rgba(15,76,129,0.25)] animate-float">
                  4
                </span>
                <span className="relative inline-block mx-2 align-middle animate-float" style={{ animationDelay: '-2s' }}>
                  <div className="relative w-[clamp(4rem,12vw,7rem)] h-[clamp(4rem,12vw,7rem)]">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-mint-200 via-mint-300 to-mint-500 shadow-2xl shadow-mint-300/40" />
                    <Search className="absolute inset-0 m-auto h-[45%] w-[45%] text-white drop-shadow-md" strokeWidth={2.5} />
                    <Compass className="absolute -top-2 -right-2 h-7 w-7 text-warning-low animate-spin-slow drop-shadow-md" style={{ animationDuration: '8s' }} />
                  </div>
                </span>
                <span className="inline-block bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 bg-clip-text text-transparent drop-shadow-[0_12px_32px_rgba(15,76,129,0.25)] animate-float" style={{ animationDelay: '-1s' }}>
                  4
                </span>
              </h1>
            </div>
          </div>

          <div
            className={cn(
              'mb-4 transition-all duration-500 delay-500',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <h2 className="font-serif font-bold text-3xl lg:text-4xl text-ink-800 mb-2 flex items-center justify-center gap-2">
              <span className="inline-block animate-bounce" style={{ animationDuration: '3s' }}>
                🧭
              </span>
              页面走丢了
            </h2>
          </div>

          <div
            className={cn(
              'mb-12 transition-all duration-500 delay-600',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <p className="text-ink-500 text-lg leading-relaxed max-w-md mx-auto">
              您访问的页面不存在或已被移除，
              <br className="hidden sm:block" />
              别担心，让我们帮您找到回家的路。
            </p>
          </div>

          <div
            className={cn(
              'flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-lg mx-auto transition-all duration-500 delay-700',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-primary text-white rounded-2xl font-semibold shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Home className="h-5 w-5 relative transition-transform duration-300 group-hover:scale-110" />
              <span className="relative">返回首页</span>
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white/80 backdrop-blur border border-ink-200 text-ink-700 rounded-2xl font-semibold hover:bg-white hover:border-primary-300 hover:text-primary-600 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Mail className="h-5 w-5" />
              <span>联系管理员</span>
            </button>

            <button
              onClick={goBack}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-ink-50/80 backdrop-blur border border-ink-200/70 text-ink-600 rounded-2xl font-semibold hover:bg-white hover:border-ink-300 hover:text-ink-800 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-sm hover:shadow-md sm:w-auto w-full"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>返回上一页</span>
            </button>
          </div>

          <div
            className={cn(
              'mt-14 pt-8 border-t border-ink-200/60 transition-all duration-500 delay-800',
              mounted ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="flex items-center justify-center gap-3 text-xs text-ink-400">
              <span className="inline-flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-mint-500 animate-pulse" />
                系统运行正常
              </span>
              <span>·</span>
              <span>错误代码：PAGE_NOT_FOUND_404</span>
              <span>·</span>
              <span className="font-mono">{new Date().toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
