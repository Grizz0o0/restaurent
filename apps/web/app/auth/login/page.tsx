'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const schema = z.object({
    email: z.string().trim().email('Email không hợp lệ').max(255),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(72),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (values: FormValues) => {
        setSubmitting(true);

        // TODO: Implement actual login logic with TRPC or Auth Provider
        console.log('Login values:', values);

        // Simulator delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const success = true; // Mock success

        setSubmitting(false);

        if (success) {
            toast.success('Đăng nhập thành công');
            router.push('/');
        } else {
            toast.error('Đăng nhập thất bại', {
                description: 'Vui lòng kiểm tra lại thông tin',
            });
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md space-y-8">
                <Card className="rounded-2xl shadow-card border-border">
                    <CardHeader>
                        <CardTitle className="font-display text-2xl">
                            Đăng nhập
                        </CardTitle>
                        <CardDescription>
                            Đăng nhập để xem hồ sơ và đặt hàng nhanh hơn.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-5"
                            >
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="email@example.com"
                                                    autoComplete="email"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mật khẩu</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    autoComplete="current-password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    variant="hero"
                                    className="w-full"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? 'Đang đăng nhập...'
                                        : 'Đăng nhập'}
                                </Button>

                                <div className="text-center text-sm">
                                    <span className="text-muted-foreground">
                                        Chưa có tài khoản?{' '}
                                    </span>
                                    <Link
                                        href="/auth/register"
                                        className="font-medium text-primary hover:underline"
                                    >
                                        Đăng ký
                                    </Link>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
