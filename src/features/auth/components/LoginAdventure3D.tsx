'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/shared/security/auth.store';
import { toast } from '@/shared/ui/Toast';

interface LoginAdventure3DProps {
  onCreateAccount: () => void;
}

const STARS = [
  'left-[8%] top-[18%] h-1 w-1',
  'left-[22%] top-[34%] h-2 w-2',
  'left-[38%] top-[14%] h-1 w-1',
  'left-[51%] top-[28%] h-1.5 w-1.5',
  'left-[68%] top-[12%] h-1 w-1',
  'left-[78%] top-[38%] h-2 w-2',
  'left-[89%] top-[22%] h-1 w-1',
  'left-[17%] top-[67%] h-1 w-1',
  'left-[47%] top-[72%] h-1.5 w-1.5',
  'left-[83%] top-[76%] h-1 w-1',
];

export function LoginAdventure3D({ onCreateAccount }: LoginAdventure3DProps) {
  const { loginWithCredentials } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!identifier.trim() || !password) return;

    setIsSubmitting(true);
    try {
      await loginWithCredentials(identifier.trim(), password);
      toast('Sesión iniciada', 'Tu aventura en Aemora continúa.', 'success');
    } catch (error) {
      setIsSubmitting(false);
      toast(
        'No se pudo iniciar sesión',
        error instanceof Error ? error.message : 'Revisa tus credenciales.',
        'error',
      );
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#070817] text-white lg:grid lg:grid-cols-[1.12fr_0.88fr]">
      <section className="relative isolate flex min-h-[620px] flex-col overflow-hidden px-6 py-7 sm:px-10 lg:min-h-screen lg:px-16 lg:py-10">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_20%,rgba(47,211,255,0.22),transparent_30%),radial-gradient(circle_at_75%_40%,rgba(145,53,255,0.26),transparent_38%),linear-gradient(145deg,#07132e_0%,#171048_50%,#09071d_100%)]" />
        <div className="absolute -left-32 top-1/3 -z-10 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -right-28 bottom-0 -z-10 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/10 blur-3xl" />

        {STARS.map((position, index) => (
          <span
            key={position}
            className={`absolute ${position} animate-pulse rounded-full bg-white shadow-[0_0_14px_4px_rgba(125,220,255,0.8)]`}
            style={{ animationDelay: `${index * 180}ms` }}
            aria-hidden="true"
          />
        ))}

        <div className="flex items-center gap-3 text-lg font-black tracking-[0.22em]">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-200/30 bg-cyan-200/10 text-cyan-100 shadow-[0_0_30px_rgba(45,212,191,0.25)]">
            A
          </span>
          AEMORA
        </div>

        <div className="relative flex flex-1 flex-col justify-center py-16 lg:py-8">
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/20 blur-3xl sm:h-80 sm:w-80" />
          <div className="relative mx-auto h-64 w-64 animate-[bounce_7s_ease-in-out_infinite] sm:h-80 sm:w-80">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,#b9f7ff_0%,#55d7f5_18%,#2564b4_55%,#16124f_100%)] shadow-[inset_-32px_-24px_50px_rgba(5,7,40,0.8),0_0_80px_rgba(54,205,255,0.45)]" />
            <div className="absolute -inset-7 rounded-full border border-cyan-200/25 [transform:rotateX(67deg)_rotateZ(-18deg)]" />
            <div className="absolute -inset-12 rounded-full border border-fuchsia-300/20 [transform:rotateX(67deg)_rotateZ(20deg)]" />
            <div className="absolute left-[18%] top-[28%] h-8 w-20 rounded-full bg-white/25 blur-md [transform:rotate(-20deg)]" />
            <div className="absolute right-[22%] top-[45%] h-5 w-14 rounded-full bg-indigo-950/50 blur-sm [transform:rotate(18deg)]" />
            <Sparkles className="absolute -right-8 top-2 h-9 w-9 animate-pulse text-cyan-100" />
          </div>

          <div className="mt-14 max-w-xl lg:mt-16">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-cyan-200/80">A new world awaits</p>
            <h1 className="max-w-lg text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl">
              SIGN IN TO YOUR{' '}
              <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-fuchsia-300 bg-clip-text text-transparent">
                ADVENTURE!
              </span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-slate-300/75 sm:text-base">
              Entra en tu espacio seguro y conecta con la comunidad de Aemora.
            </p>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-[560px] items-center justify-center bg-slate-950/90 px-5 py-12 sm:px-10 lg:min-h-screen lg:border-l lg:border-indigo-400/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_42%)]" />
        <div className="relative w-full max-w-md rounded-[2rem] border border-indigo-400/25 bg-slate-950/80 p-7 shadow-[0_24px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-10">
          <div className="mb-9">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Welcome back</p>
            <h2 className="text-4xl font-black tracking-tight">SIGN IN</h2>
            <p className="mt-3 text-sm text-slate-400">Sign in with your Aemora account</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="sr-only">Correo o usuario</span>
              <span className="flex items-center gap-3 rounded-2xl border border-indigo-300/20 bg-indigo-950/30 px-4 transition-colors focus-within:border-cyan-300/70 focus-within:ring-2 focus-within:ring-cyan-300/10">
                <Mail className="h-5 w-5 shrink-0 text-cyan-300" />
                <input
                  required
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="Yourname@gmail.com"
                  className="w-full bg-transparent py-4 text-sm text-white outline-none placeholder:text-slate-500"
                />
              </span>
            </label>

            <label className="block">
              <span className="sr-only">Contraseña</span>
              <span className="flex items-center gap-3 rounded-2xl border border-indigo-300/20 bg-indigo-950/30 px-4 transition-colors focus-within:border-cyan-300/70 focus-within:ring-2 focus-within:ring-cyan-300/10">
                <LockKeyhole className="h-5 w-5 shrink-0 text-cyan-300" />
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  className="w-full bg-transparent py-4 text-sm text-white outline-none placeholder:text-slate-500"
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 px-5 py-4 font-bold text-slate-950 shadow-[0_12px_35px_rgba(34,211,238,0.25)] transition duration-200 hover:scale-[1.02] hover:shadow-[0_16px_45px_rgba(99,102,241,0.4)] active:scale-95 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="my-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <span className="h-px flex-1 bg-indigo-300/15" />
            Or continue with
            <span className="h-px flex-1 bg-indigo-300/15" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => toast('Google', 'La autenticación social se conectará próximamente.', 'info')} className="rounded-xl border border-indigo-300/20 bg-indigo-950/30 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:scale-[1.02] hover:border-cyan-300/50 hover:bg-indigo-900/40 active:scale-95">
              <span className="mr-2 text-base font-black text-red-300">G</span> Google
            </button>
            <button type="button" onClick={() => toast('Facebook', 'La autenticación social se conectará próximamente.', 'info')} className="rounded-xl border border-indigo-300/20 bg-indigo-950/30 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:scale-[1.02] hover:border-cyan-300/50 hover:bg-indigo-900/40 active:scale-95">
              <span className="mr-2 text-base font-black text-blue-300">f</span> Facebook
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-400">
            ¿Aún no tienes cuenta?{' '}
            <button type="button" onClick={onCreateAccount} className="font-bold text-cyan-300 underline decoration-cyan-300/40 underline-offset-4 transition hover:text-white">
              Crear cuenta
            </button>
          </p>
          <p className="mt-7 text-center text-[11px] leading-5 text-slate-500">
            Al continuar aceptas nuestros <button type="button" className="text-slate-300 underline">Términos y Condiciones</button>.
          </p>
        </div>
      </section>
    </main>
  );
}
