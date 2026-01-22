import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl shadow-card border border-border">
                <div className="text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Về trang chủ</span>
                    </Link>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Đăng nhập
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Chào mừng bạn quay trở lại!
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input id="password" type="password" />
                    </div>
                    <Button variant="hero" className="w-full" size="lg">
                        Đăng nhập
                    </Button>
                </div>

                <div className="text-center text-sm">
                    <span className="text-muted-foreground">
                        Chưa có tài khoản?{' '}
                    </span>
                    <Link
                        href="/auth/register"
                        className="font-medium text-primary hover:underline"
                    >
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </div>
    );
}
