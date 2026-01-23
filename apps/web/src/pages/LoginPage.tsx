import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Panel - Brand & Welcome */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-900">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-900 to-slate-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center mix-blend-overlay opacity-20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
              <span className="font-bold text-xl">OC</span>
            </div>
            <span className="text-xl font-bold tracking-tight">ONG Chadia</span>
          </div>

          <div className="max-w-lg mb-12">
            <motion.h1
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="text-4xl font-bold mb-6 leading-tight"
            >
              Empowering humanitarian work through organized documentation.
            </motion.h1>
            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.4,
              }}
              className="text-primary-100 text-lg leading-relaxed"
            >
              Securely manage field reports, beneficiary data, and project
              documentation in one centralized platform designed for impact.
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.6,
              }}
              className="mt-8 flex gap-4"
            >
              <div className="flex items-center gap-2 text-sm text-primary-200">
                <CheckCircle2 className="w-5 h-5 text-accent-500" />
                <span>Secure Access</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-200">
                <CheckCircle2 className="w-5 h-5 text-accent-500" />
                <span>Offline Capable</span>
              </div>
            </motion.div>
          </div>

          <div className="text-sm text-primary-300">
            © 2024 ONG Chadia Humanitarian Organization
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <motion.div
          initial={{
            opacity: 0,
            x: 20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-12 h-12 bg-primary-800 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                OC
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-slate-600">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="name@ongchadia.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm font-medium text-primary-700 hover:text-primary-800"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
            >
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <a
              href="#"
              className="font-medium text-primary-700 hover:text-primary-800"
            >
              Contact your administrator
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
