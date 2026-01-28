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
    { icon: Shield, text: 'Accès sécurisé', desc: 'Vos données protégées', color: 'fuchsia' },
    { icon: Zap, text: 'Rapide & Efficace', desc: 'Interface optimisée', color: 'teal' },
    { icon: Globe, text: 'Mode hors-ligne', desc: 'Travaillez partout', color: 'purple' },
  ]

  const getIconStyle = (color: string) => {
    switch (color) {
      case 'fuchsia': return 'from-pink-500 to-rose-500 shadow-pink-500/30';
      case 'teal': return 'from-teal-400 to-cyan-500 shadow-teal-500/30';
      case 'purple': return 'from-violet-500 to-purple-600 shadow-violet-500/30';
      default: return 'from-pink-500 to-rose-500 shadow-pink-500/30';
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Brand & Welcome (Deep Purple Gradient) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Deep purple gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2d1b4e] via-[#1e1338] to-[#150d28]" />

        {/* Aurora gradient overlays */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-pink-500/20 via-fuchsia-500/15 to-transparent rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-500/15 via-cyan-500/10 to-transparent rounded-full blur-[60px]" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[50px]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <img
                src="/logo.png"
                alt="ONG Chadia"
                className="w-7 h-7 object-cover"
              />
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
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span className="text-sm font-medium text-pink-300 uppercase tracking-wider">Plateforme GED</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold mb-6 leading-tight"
            >
              La gestion documentaire{' '}
              <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                nouvelle génération
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-violet-200/80 text-lg leading-relaxed mb-10"
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
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.08] transition-all duration-300 group"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getIconStyle(feature.color)} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{feature.text}</p>
                    <p className="text-sm text-violet-300/60">{feature.desc}</p>
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
            className="text-sm text-violet-400/50"
          >
            © 2024 ONG Chadia - Organisation Humanitaire
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form (Light Aurora) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-slate-50 via-white to-pink-50/30 relative overflow-hidden">
        {/* Aurora orbs */}
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8 relative z-10"
        >
          {/* Mobile logo */}
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
                <img
                  src="/logo.png"
                  alt="ONG Chadia"
                  className="w-9 h-9 object-cover"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Bon retour</h2>
            <p className="mt-2 text-gray-500">
              Entrez vos identifiants pour accéder à votre espace.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-500 text-lg">!</span>
                </div>
                {error}
              </motion.div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  placeholder="nom@ongchadia.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-aurora"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-aurora pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors"
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
                  className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Se souvenir de moi
                </span>
              </label>
              <a
                href="#"
                className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
              >
                Mot de passe oublié?
              </a>
            </div>

            <Button
              type="submit"
              className="btn-aurora w-full py-3"
              size="lg"
              isLoading={isLoading}
              rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
            >
              Se connecter
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Pas encore de compte?{' '}
            <a
              href="#"
              className="font-medium text-pink-600 hover:text-pink-700 transition-colors"
            >
              Contactez votre administrateur
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
