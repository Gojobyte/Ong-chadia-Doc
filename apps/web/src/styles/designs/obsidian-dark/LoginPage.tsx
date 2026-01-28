import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Shield, Zap, Globe, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = await login(email, password)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Identifiants invalides')
    }
  }

  const features = [
    { icon: Shield, text: 'Accès sécurisé', desc: 'Vos données protégées', color: 'cyan' },
    { icon: Zap, text: 'Rapide & Efficace', desc: 'Interface optimisée', color: 'purple' },
    { icon: Globe, text: 'Mode hors-ligne', desc: 'Travaillez partout', color: 'green' },
  ]

  const getGlowColor = (color: string) => {
    switch (color) {
      case 'cyan': return 'from-cyan-400 to-cyan-500 shadow-cyan-500/30';
      case 'purple': return 'from-violet-400 to-purple-500 shadow-violet-500/30';
      case 'green': return 'from-emerald-400 to-green-500 shadow-emerald-500/30';
      default: return 'from-cyan-400 to-cyan-500 shadow-cyan-500/30';
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#0a0a0f]">
      {/* Left Panel - Brand & Welcome */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Deep dark background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f]" />

        {/* Neon glow orbs */}
        <div className="absolute top-20 right-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-violet-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300d4ff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 glow-cyan">
              <img
                src="/logo.png"
                alt="ONG Chadia"
                className="w-7 h-7 object-cover"
              />
              <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-xl" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ONG Chadia</span>
          </motion.div>

          {/* Main content */}
          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 mb-4"
            >
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Plateforme GED</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold mb-6 leading-tight"
            >
              La gestion documentaire{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                nouvelle génération
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 text-lg leading-relaxed mb-10"
            >
              Organisez, partagez et sécurisez tous vos documents humanitaires
              dans une plateforme unifiée conçue pour maximiser votre impact.
            </motion.p>

            {/* Feature cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid gap-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.04] hover:border-cyan-500/20 transition-all duration-300 group"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getGlowColor(feature.color)} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{feature.text}</p>
                    <p className="text-sm text-slate-500">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-slate-600"
          >
            © 2024 ONG Chadia - Organisation Humanitaire
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form (Dark themed) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#0d0d15] relative overflow-hidden">
        {/* Subtle glow decorations */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8 relative z-10"
        >
          {/* Mobile logo */}
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <img
                  src="/logo.png"
                  alt="ONG Chadia"
                  className="w-9 h-9 object-cover"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">Bon retour</h2>
            <p className="mt-2 text-slate-400">
              Entrez vos identifiants pour accéder à votre espace.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-400 text-lg">!</span>
                </div>
                {error}
              </motion.div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  placeholder="nom@ongchadia.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-obsidian w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-obsidian w-full pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0 focus:ring-offset-transparent"
                />
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  Se souvenir de moi
                </span>
              </label>
              <a
                href="#"
                className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Mot de passe oublié?
              </a>
            </div>

            <Button
              type="submit"
              className="btn-neon w-full py-3"
              size="lg"
              isLoading={isLoading}
              rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
            >
              Se connecter
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0d0d15] text-slate-500">ou</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500">
            Pas encore de compte?{' '}
            <a
              href="#"
              className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Contactez votre administrateur
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
