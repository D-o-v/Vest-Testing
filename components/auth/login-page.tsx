import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserType } from '@/lib/redux/types';
import { MailIcon, KeyIcon, UserIcon } from 'lucide-react';

export function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    userType: '' as UserType
  });

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

  return (
    <div className="h-screen flex items-center justify-center bg-linear-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full backdrop-blur-sm border-muted/20 shadow-lg">
          <CardHeader className="space-y-1 pt-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
              <UserIcon className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">Please sign in to continue to SIRE-K</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleSubmit} className="space-y-3">
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
                    disabled={loading}
                    required
                    className="pl-10 h-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                    <KeyIcon className="h-4 w-4" />
                  </div>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <Select
                  value={credentials.userType}
                  onValueChange={handleUserTypeChange}
                  disabled={loading}
                  required
                >
                  <SelectTrigger className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-primary" />
                        Administrator
                      </div>
                    </SelectItem>
                    <SelectItem value="engineer">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-primary" />
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
                  className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}