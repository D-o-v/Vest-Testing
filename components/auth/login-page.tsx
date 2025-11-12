import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserType } from '@/lib/redux/types';
import { MailIcon, KeyIcon, UserIcon, Eye, EyeOff, Shield, Zap } from 'lucide-react';
import { useEffect } from 'react';

export function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    userType: '' as UserType
  });
  const [showPassword, setShowPassword] = useState(false)

  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(credentials);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserTypeChange = (value: UserType) => {
    setCredentials(prev => ({
      ...prev,
      userType: value
    }));
  };

  // user feedback: focus email on mount for quick keyboard login
  useEffect(() => {
    const el = document.querySelector('input[name="email"]') as HTMLInputElement | null
    if (el) el.focus()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="relative w-full max-w-md">
        <Card className="w-full min-h-[60vh] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md">
          <CardHeader className="space-y-3 pt-8 pb-6">
            <div className="relative mx-auto mb-3">
              <div className="h-14 w-14 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 flex items-center justify-center">
                <Shield className="h-7 w-7" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold text-center text-slate-900 dark:text-slate-100">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-slate-400 text-sm">
              Sign in to access your SIRE-K dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6 px-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="animate-in slide-in-from-top-2 text-sm py-3 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
                  {error}
                </Alert>
              )}

              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-700 transition-colors">
                    <MailIcon className="h-5 w-5" />
                  </div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={credentials.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className="pl-12 h-12 text-base bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl transition-all duration-150 focus:ring-2 focus:ring-gray-200 focus:border-slate-300 dark:focus:border-slate-600 hover:border-slate-300 dark:hover:border-slate-600"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-700 transition-colors">
                    <KeyIcon className="h-5 w-5" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className="pl-12 pr-12 h-12 text-base bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl transition-all duration-150 focus:ring-2 focus:ring-gray-200 focus:border-slate-300 dark:focus:border-slate-600 hover:border-slate-300 dark:hover:border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <Select
                  value={credentials.userType}
                  onValueChange={handleUserTypeChange}
                  disabled={loading}
                  required
                >
                  <SelectTrigger className="w-full h-12 text-base bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl transition-all duration-150 focus:ring-2 focus:ring-gray-200 focus:border-slate-300 dark:focus:border-slate-600 hover:border-slate-300 dark:hover:border-slate-600">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <SelectItem value="admin" className="rounded-lg">
                      <div className="flex items-center py-1">
                        <Shield className="h-4 w-4 mr-3 text-slate-500" />
                        <span className="font-medium">Administrator</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="engineer" className="rounded-lg">
                      <div className="flex items-center py-1">
                        <Zap className="h-4 w-4 mr-3 text-slate-500" />
                        <span className="font-medium">Engineer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="user" className="rounded-lg">
                      <div className="flex items-center py-1">
                        <UserIcon className="h-4 w-4 mr-3 text-slate-500" />
                        <span className="font-medium">Regular User</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-slate-800 dark:bg-slate-700 text-white border-0 rounded-xl shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Spinner className="mr-3 h-5 w-5" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Shield className="mr-2 h-5 w-5" />
                      <span>Sign In</span>
                    </div>
                  )}
                </Button>
                
                <div className="flex items-center justify-between pt-2 text-sm">
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:underline font-medium transition-colors">
                    Forgot password?
                  </a>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Powered by <span className="font-semibold">VeSS</span>
                  </span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}