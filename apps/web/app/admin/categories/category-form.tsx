'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useEffect } from 'react';

const categorySchema = z.object({
    name: z.string().trim().min(1, 'Tên danh mục không được trống').max(200),
    description: z.string().trim().max(2000).optional().or(z.literal('')),
    languageId: z.string().min(1, 'Vui lòng chọn ngôn ngữ'),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    defaultValues?: CategoryFormValues;
    onSubmit: (values: CategoryFormValues) => void;
    isLoading: boolean;
    submitText: string;
    onCancel: () => void;
    languages: any[];
}

export function CategoryForm({
    defaultValues,
    onSubmit,
    isLoading,
    submitText,
    onCancel,
    languages,
}: CategoryFormProps) {
    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: defaultValues || {
            name: '',
            description: '',
            languageId: 'vi',
        },
    });

    // Reset form when defaultValues change
    useEffect(() => {
        if (defaultValues) {
            form.reset(defaultValues);
        }
    }, [defaultValues, form]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 pt-4"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên danh mục</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ví dụ: Món chính, Món tráng miệng..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mô tả</FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={3}
                                    placeholder="Mô tả ngắn về danh mục này..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-4">
                    <FormField
                        control={form.control}
                        name="languageId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ngôn ngữ</FormLabel>
                                <Select
                                    value={field.value || 'vi'}
                                    onValueChange={field.onChange}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn ngôn ngữ" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {languages.map((l: any) => (
                                            <SelectItem key={l.id} value={l.id}>
                                                {l.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            submitText
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
