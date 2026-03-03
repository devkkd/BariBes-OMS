'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';
import Image from 'next/image';
import gsap from 'gsap';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Refs for GSAP animations
  const logoRef = useRef(null);
  const formRef = useRef(null);
  const floatingElementsRef = useRef([]);

  useEffect(() => {
    // Smooth logo entrance animation
    gsap.from(logoRef.current, {
      duration: 1,
      scale: 0.5,
      opacity: 0,
      ease: 'back.out(1.7)',
      delay: 0.2,
    });

    // Form smooth fade-in
    gsap.from(formRef.current, {
      duration: 0.8,
      y: 30,
      opacity: 0,
      ease: 'power2.out',
      delay: 0.5,
    });

    // Smooth floating animation for decorative elements
    floatingElementsRef.current.forEach((el, index) => {
      if (el) {
        gsap.to(el, {
          y: '+=20',
          duration: 3 + index * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.3,
        });
      }
    });

    // Input fields smooth stagger
    gsap.from('.input-field', {
      duration: 0.6,
      y: 20,
      opacity: 0,
      stagger: 0.15,
      ease: 'power2.out',
      delay: 0.8,
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Success animation
        gsap.to(formRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => router.push('/dashboard'),
        });
      } else {
        setError(data.error || 'Login failed');
        // Smooth shake animation
        gsap.to(formRef.current, {
          x: [-8, 8, -8, 8, 0],
          duration: 0.4,
          ease: 'power2.inOut',
        });
      }
    } catch (err) {
      setError('Something went wrong');
      gsap.to(formRef.current, {
        x: [-8, 8, -8, 8, 0],
        duration: 0.4,
        ease: 'power2.inOut',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Full Screen Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/login-image.png"
          alt="Background"
          fill
          className="object-cover opacity-15"
          priority
        />
        {/* Maroon & Brown Gradient Overlay - Ethnic Theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4a1a1a] via-[#6b2d2d] to-[#8b4513]"></div>
        
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}></div>
        </div>

        {/* Smooth Floating Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            ref={(el) => (floatingElementsRef.current[0] = el)}
            className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-amber-600/20 to-orange-700/20 rounded-full blur-3xl"
          ></div>
          <div
            ref={(el) => (floatingElementsRef.current[1] = el)}
            className="absolute top-1/3 right-32 w-56 h-56 bg-gradient-to-br from-rose-800/20 to-red-900/20 rounded-full blur-3xl"
          ></div>
          <div
            ref={(el) => (floatingElementsRef.current[2] = el)}
            className="absolute bottom-32 left-1/4 w-48 h-48 bg-gradient-to-br from-yellow-700/20 to-amber-800/20 rounded-full blur-3xl"
          ></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Logo with Smooth Animation */}
          <div ref={logoRef} className="text-center mb-10">
            <div className="inline-block relative">
              {/* Golden Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/40 to-yellow-600/40 rounded-full blur-2xl"></div>
              <img 
                src='/login.png' 
                alt="Company Logo"
                className='relative w-72 h-auto mx-auto'
                style={{
                  filter: 'drop-shadow(0 10px 30px rgba(217, 119, 6, 0.4))',
                }}
              />
            </div>
            <div className="mt-6 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <Sparkles className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-amber-200/70 text-sm mt-2">Order Management System</p>
          </div>

          {/* Login Form with Glassmorphism */}
          <div
            ref={formRef}
            className="relative backdrop-blur-xl bg-gradient-to-br from-amber-950/40 to-orange-950/40 rounded-2xl p-8 shadow-2xl border border-amber-700/30"
          >
            {/* Subtle Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-600/10 via-orange-600/10 to-red-700/10 blur-xl -z-10"></div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="input-field">
                <label className="block text-sm font-semibold text-amber-100 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-amber-400/70 group-focus-within:text-amber-300 transition-colors duration-200" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 bg-black/20 backdrop-blur-sm border border-amber-700/40 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none transition-all duration-200 text-white placeholder-amber-200/40 hover:bg-black/30"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="input-field">
                <label className="block text-sm font-semibold text-amber-100 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-orange-400/70 group-focus-within:text-orange-300 transition-colors duration-200" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3 bg-black/20 backdrop-blur-sm border border-amber-700/40 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all duration-200 text-white placeholder-amber-200/40 hover:bg-black/30"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-amber-200/60 hover:text-amber-100 transition-colors duration-200" />
                    ) : (
                      <Eye className="h-5 w-5 text-amber-200/60 hover:text-amber-100 transition-colors duration-200" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/30 backdrop-blur-sm border border-red-700/50 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 hover:from-amber-500 hover:via-orange-500 hover:to-red-600 text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-orange-900/50 hover:shadow-orange-800/60 relative overflow-hidden group"
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="relative">Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 relative" />
                    <span className="relative">Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Decorative Corner Elements */}
            <div className="absolute -top-1 -right-1 w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-1 -left-1 w-16 h-16 bg-gradient-to-br from-red-700/20 to-orange-700/20 rounded-full blur-xl"></div>
          </div>

          {/* Footer Text */}
          <p className="text-center mt-6 text-amber-200/50 text-sm">
            Secured & Trusted Platform
          </p>
        </div>
      </div>
    </div>
  );
}
