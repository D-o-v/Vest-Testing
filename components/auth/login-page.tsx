import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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

  // Keep handlers stable across renders to improve readability and testability
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
    // prefer ref focus for readability and testability
    emailRef.current?.focus()
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-4" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}>
      <div className="w-full max-w-md">
        <Card className="w-full bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader className="space-y-1 pt-6">
            <div className="h-12 w-12 rounded-lg bg-blue-500/20 text-blue-600 flex items-center justify-center mx-auto mb-2">
              <Shield className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to access your VESS dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="animate-in slide-in-from-top-2 text-sm py-2">
                  {error}
                </Alert>
              )}

              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                    <MailIcon className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={credentials.email}
                    onChange={handleChange}
                    ref={emailRef}
                    disabled={loading}
                    required
                    className="pl-10 h-10 transition-all duration-200 focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                    <KeyIcon className="h-4 w-4" />
                  </div>
                  <Input
                    type={isPasswordVisible ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className="pl-10 pr-10 h-10 transition-all duration-200 focus:ring-2 focus:ring-ring/20"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground"
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                  >
                    {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <Select
                  value={credentials.userType}
                  onValueChange={handleUserTypeChange}
                  disabled={loading}
                  required
                >
                  <SelectTrigger className="w-full transition-all duration-200 focus:ring-2 focus:ring-ring/20">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-primary" />
                        Administrator
                      </div>
                    </SelectItem>
                    <SelectItem value="engineer">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-primary" />
                        Engineer
                      </div>
                    </SelectItem>
                    <SelectItem value="user">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-primary" />
                        Regular User
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Spinner className="mr-2 h-4 w-4" />
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                
                <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
                  <span>
                    Powered by <span className="font-semibold text-blue-600">VeSS</span>
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