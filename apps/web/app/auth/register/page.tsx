'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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

const schema = z
    .object({
        firstName: z.string().trim().min(2, 'Ít nhất 2 ký tự'),
        lastName: z.string().trim().min(2, 'Ít nhất 2 ký tự'),
        email: z.string().trim().email('Email không hợp lệ').max(255),
        password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(72),
        confirmPassword: z.string().min(6).max(72),
    })
    .refine((v) => v.password === v.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Mật khẩu xác nhận không khớp',
    });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (values: FormValues) => {
        setSubmitting(true);

        // TODO: Implement actual registration logic
        console.log('Register values:', values);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const success = true;

        setSubmitting(false);

        if (success) {
            toast.success('Tạo tài khoản thành công', {
                description: 'Bạn có thể đăng nhập ngay.',
            });
            router.push('/auth/login');
        } else {
            toast.error('Đăng ký thất bại');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Về trang chủ</span>
                    </Link>
                </div>

                <Card className="rounded-2xl shadow-card border-border">
                    <CardHeader>
                        <CardTitle className="font-display text-2xl">
                            Đăng ký
                        </CardTitle>
                        <CardDescription>
                            Tạo tài khoản để lưu hồ sơ và quản lý đơn hàng.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-5"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Họ</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Nguyễn"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tên</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Văn A"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

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
                                                    autoComplete="new-password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Nhập lại mật khẩu
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    autoComplete="new-password"
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
                                        ? 'Đang tạo tài khoản...'
                                        : 'Đăng ký'}
                                </Button>

                                <div className="text-center text-sm">
                                    <span className="text-muted-foreground">
                                        Đã có tài khoản?{' '}
                                    </span>
                                    <Link
                                        href="/auth/login"
                                        className="font-medium text-primary hover:underline"
                                    >
                                        Đăng nhập
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
