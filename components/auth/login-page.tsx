import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserType } from '@/lib/redux/types';
import { MailIcon, KeyIcon, UserIcon, Eye, EyeOff, Shield, Zap } from 'lucide-react';

export function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    userType: '' as UserType
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const { login, loading, error } = useAuth();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await login(credentials);
  }, [login, credentials]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleUserTypeChange = useCallback((value: UserType) => {
    setCredentials(prev => ({ ...prev, userType: value }));
  }, []);

  const emailRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-linear-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Left side - Premium brand section */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-slate-100 via-blue-50 to-slate-50 relative overflow-hidden items-center justify-center p-12">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 400 600" preserveAspectRatio="none">
            <defs>
              <pattern id="premium-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="400" height="600" fill="url(#premium-grid)" />
          </svg>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-20 w-56 h-56 bg-purple-400/5 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-lg">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-2xl bg-linear-to-br from-purple-500 to-purple-700 mb-8 shadow-xl border border-purple-400/30">
            <Shield className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold mb-3 leading-tight tracking-tight text-gray-900">VeSS Network</h1>
          <p className="text-lg text-gray-600 mb-12 font-light">Enterprise Performance & Testing Platform</p>
          
          <div className="space-y-5 text-left">
            <div className="flex items-start gap-4 group">
              <div className="shrink-0 h-12 w-12 rounded-lg bg-purple-500/15 flex items-center justify-center group-hover:bg-purple-500/25 transition-colors">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Real-time Analytics</p>
                <p className="text-sm text-gray-600 mt-1">Monitor network performance across services</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 group">
              <div className="shrink-0 h-12 w-12 rounded-lg bg-purple-500/15 flex items-center justify-center group-hover:bg-purple-500/25 transition-colors">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Enterprise Security</p>
                <p className="text-sm text-gray-600 mt-1">Bank-grade encryption and access controls</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 group">
              <div className="shrink-0 h-12 w-12 rounded-lg bg-purple-500/15 flex items-center justify-center group-hover:bg-purple-500/25 transition-colors">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Role-Based Access</p>
                <p className="text-sm text-gray-600 mt-1">Granular permissions for teams and roles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Mobile header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-linear-to-br from-purple-500 to-purple-700 mb-4 shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">VeSS</h2>
            <p className="text-gray-600 text-sm font-light">Enterprise Platform</p>
          </div>

          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome</h3>
              <p className="text-sm text-gray-500 mb-6 font-light">Sign in to your account</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="animate-in slide-in-from-top-2 text-xs py-3 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                  </Alert>
                )}

                <div className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <MailIcon className="h-4 w-4" />
                      </div>
                      <Input
                        type="email"
                        name="email"
                        placeholder="name@company.com"
                        value={credentials.email}
                        onChange={handleChange}
                        ref={emailRef}
                        disabled={loading}
                        required
                        className="pl-10 h-10 text-sm bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white focus:shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <KeyIcon className="h-4 w-4" />
                      </div>
                      <Input
                        type={isPasswordVisible ? 'text' : 'password'}
                        name="password"
                        placeholder="••••••••"
                        value={credentials.password}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        className="pl-10 pr-10 h-10 text-sm bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white focus:shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible(prev => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                      >
                        {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Role Select */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</label>
                    <Select
                      value={credentials.userType}
                      onValueChange={handleUserTypeChange}
                      disabled={loading}
                      required
                    >
                      <SelectTrigger className="w-full h-10 text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200">
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-purple-600" />
                            Administrator
                          </div>
                        </SelectItem>
                        <SelectItem value="engineer">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-purple-600" />
                            Engineer
                          </div>
                        </SelectItem>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-purple-600" />
                            User
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sign In Button */}
                  <Button
                    type="submit"
                    className="w-full bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold h-10 text-sm rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 mt-3"
                    disabled={loading}
                    size="sm"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Spinner className="h-4 w-4" />
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-center pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500 font-light">
                      Powered by <span className="font-semibold text-purple-600">VeSS</span>
                    </span>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Bottom accent line */}
          <div className="mt-6 h-1 bg-linear-to-r from-purple-500/0 via-purple-500 to-purple-500/0 rounded-full"></div>

          {/* Background decorative elements - under the card */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Gradient orbs */}
            <div className="absolute -bottom-24 -right-32 w-80 h-80 bg-purple-200/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/5 rounded-full blur-3xl"></div>
            
            {/* Animated grid pattern - subtle */}
            <div className="absolute inset-0 opacity-3">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="login-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="url(#grad)" strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                <rect width="100" height="100" fill="url(#login-grid)"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}