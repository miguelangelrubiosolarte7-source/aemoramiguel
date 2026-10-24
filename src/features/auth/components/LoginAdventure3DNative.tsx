'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FacebookAuthProvider, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { useAuthStore } from '@/shared/security/auth.store';
import { toast } from '@/shared/ui/Toast';
import { facebookProvider, getFirebaseAuth, googleProvider } from '@/config/firebase';
import styles from './LoginAdventure3DNative.module.css';

interface LoginAdventure3DNativeProps { onCreateAccount: () => void; }

const STARS = [
  { left: '8%', top: '18%' }, { left: '22%', top: '34%' }, { left: '38%', top: '14%' },
  { left: '51%', top: '28%' }, { left: '68%', top: '12%' }, { left: '78%', top: '38%' },
  { left: '89%', top: '22%' }, { left: '17%', top: '67%' }, { left: '47%', top: '72%' },
  { left: '83%', top: '76%' },
];

function PlanetScene() {
  const group = useRef<THREE.Group>(null);
  const stars = useMemo(() => {
    const points = new Float32Array(180 * 3);
    for (let index = 0; index < points.length; index += 3) {
      const radius = 2.4 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      points[index] = radius * Math.sin(phi) * Math.cos(theta);
      points[index + 1] = radius * Math.cos(phi);
      points[index + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return points;
  }, []);

  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.getElapsedTime() * 0.18 + pointer.x * 0.22;
    group.current.rotation.x = pointer.y * 0.12;
    group.current.position.y = Math.sin(clock.getElapsedTime() * 0.7) * 0.08;
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={stars.length / 3} array={stars} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#b9f7ff" size={0.035} transparent opacity={0.9} sizeAttenuation />
      </points>
      <mesh>
        <sphereGeometry args={[1.28, 64, 64]} />
        <meshStandardMaterial color="#2364b4" emissive="#172d80" emissiveIntensity={0.55} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh scale={1.04}>
        <sphereGeometry args={[1.28, 48, 48]} />
        <meshBasicMaterial color="#50e6ff" transparent opacity={0.1} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[0.9, 0.25, -0.35]}>
        <torusGeometry args={[1.55, 0.018, 12, 96]} />
        <meshBasicMaterial color="#86efff" transparent opacity={0.65} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0.8, 0.55, 0.7]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color="#c4f7ff" emissive="#8b5cf6" emissiveIntensity={1.5} />
      </mesh>
      <pointLight color="#67e8f9" intensity={2.5} distance={5} position={[2, 2, 3]} />
      <pointLight color="#a855f7" intensity={2} distance={5} position={[-2, -1, -2]} />
    </group>
  );
}

export function LoginAdventure3DNative({ onCreateAccount }: LoginAdventure3DNativeProps) {
  const { loginWithCredentials, loginWithFirebaseToken } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!identifier.trim() || !password) return;
    setIsSubmitting(true);
    try {
      await loginWithCredentials(identifier.trim(), password);
      toast('Sesión iniciada', 'Tu aventura en Aemora continúa.', 'success');
    } catch (error) {
      setIsSubmitting(false);
      toast('No se pudo iniciar sesión', error instanceof Error ? error.message : 'Revisa tus credenciales.', 'error');
    }
  };

  const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider, providerName: 'google' | 'facebook') => {
    setSocialLoading(providerName);
    try {
      const result = await signInWithPopup(getFirebaseAuth(), provider);
      const idToken = await result.user.getIdToken();
      await loginWithFirebaseToken(idToken);
      toast('Sesión iniciada', `Bienvenido(a) a Aemora con ${providerName === 'google' ? 'Google' : 'Facebook'}.`, 'success');
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
      const message = code === 'auth/popup-closed-by-user'
        ? 'El popup se cerró antes de completar el acceso.'
        : error instanceof Error ? error.message : 'No se pudo completar el acceso social.';
      toast('Acceso social no completado', message, 'error');
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <main className={styles.shell}>
      <section className={styles.spacePanel}>
        {STARS.map((star, index) => <span key={index} className={styles.star} style={star} aria-hidden="true" />)}
        <div className={styles.brand}><span className={styles.brandMark}>A</span>AEMORA</div>
        <div className={styles.scene}>
          <div className={styles.sceneGlow} />
          <div className={styles.canvasWrap} aria-label="Planeta 3D interactivo">
            <Canvas camera={{ position: [0, 0, 4.2], fov: 42 }} dpr={[1, 2]}>
              <ambientLight intensity={0.35} />
              <PlanetScene />
            </Canvas>
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>A new world awaits</p>
            <h1 className={styles.heroTitle}>SIGN IN TO YOUR <span className={styles.heroAccent}>ADVENTURE!</span></h1>
            <p className={styles.heroDescription}>Entra en tu espacio seguro y conecta con la comunidad de Aemora.</p>
          </div>
        </div>
      </section>
      <section className={styles.formPanel}>
        <div className={styles.card}>
          <p className={styles.formEyebrow}>Welcome back</p>
          <h2 className={styles.formTitle}>SIGN IN</h2>
          <p className={styles.formSubtitle}>Sign in with your Aemora account</p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}><Mail className={styles.fieldIcon} /><span className={styles.visuallyHidden}>Correo o usuario</span><input className={styles.input} required type="text" autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Yourname@gmail.com" /></label>
            <label className={styles.field}><LockKeyhole className={styles.fieldIcon} /><span className={styles.visuallyHidden}>Contraseña</span><input className={styles.input} required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" /></label>
            <button className={styles.submit} type="submit" disabled={isSubmitting}>{isSubmitting ? 'Entrando...' : 'Iniciar sesión'}<ArrowRight className={styles.arrow} /></button>
          </form>
          <div className={styles.divider}>Or continue with</div>
          <div className={styles.socials}>
            <button className={styles.social} type="button" disabled={Boolean(socialLoading) || isSubmitting} onClick={() => handleSocialLogin(googleProvider, 'google')}><span className={styles.google}>G</span> {socialLoading === 'google' ? 'Conectando...' : 'Google'}</button>
            <button className={styles.social} type="button" disabled={Boolean(socialLoading) || isSubmitting} onClick={() => handleSocialLogin(facebookProvider, 'facebook')}><span className={styles.facebook}>f</span> {socialLoading === 'facebook' ? 'Conectando...' : 'Facebook'}</button>
          </div>
          <p className={styles.createAccount}>¿Aún no tienes cuenta? <button className={styles.linkButton} type="button" onClick={onCreateAccount}>Crear cuenta</button></p>
          <p className={styles.terms}>Al continuar aceptas nuestros <button className={styles.termsButton} type="button">Términos y Condiciones</button>.</p>
        </div>
      </section>
    </main>
  );
}
