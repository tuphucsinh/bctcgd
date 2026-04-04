'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await login(email, password);
    if (result.success) {
      toast.success('Đăng nhập thành công');
      router.push('/');
    } else {
      toast.error('Lỗi đăng nhập: ' + result.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background/50 backdrop-blur-3xl p-4">
      <Card className="w-full max-w-sm glass-card border-white/10 dark:border-white/5">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">BCTC Gia Đình</CardTitle>
            <p className="text-sm text-muted-foreground text-center">Đăng nhập bằng tài khoản quản lý</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="email" 
                name="email" 
                placeholder="Email" 
                defaultValue="tuphucsinh@gmail.com"
                required 
                disabled={loading} 
              />
            </div>
            <div className="space-y-2">
              <Input 
                type="password" 
                name="password" 
                placeholder="Mật khẩu" 
                required 
                disabled={loading} 
              />
            </div>
            <Button 
              type="submit"
              className="w-full h-12" 
              variant="default" 
              disabled={loading}
            >
              Đăng nhập
            </Button>
          </CardContent>
          <CardFooter className="text-xs text-center text-muted-foreground justify-center">
            Dùng tài khoản tuphucsinh@gmail.com
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
