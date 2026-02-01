'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Shield, Package, MapPin } from 'lucide-react';

const sidebarNavItems = [
    {
        title: 'Hồ sơ',
        href: '/profile',
        icon: User,
    },
    {
        title: 'Bảo mật',
        href: '/profile/security',
        icon: Shield,
    },
    {
        title: 'Đơn hàng',
        href: '/profile/orders',
        icon: Package,
        disabled: true,
    },
    {
        title: 'Sổ địa chỉ',
        href: '/profile/addresses',
        icon: MapPin,
        disabled: true,
    },
];

export function ProfileSidebar({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();

    return (
        <nav
            className={cn(
                'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
                className,
            )}
            {...props}
        >
            {sidebarNavItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.disabled ? '#' : item.href}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all',
                        pathname === item.href
                            ? 'bg-accent text-accent-foreground shadow-sm'
                            : 'text-muted-foreground',
                        item.disabled && 'opacity-50 cursor-not-allowed',
                    )}
                    onClick={(e) => item.disabled && e.preventDefault()}
                >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                </Link>
            ))}
        </nav>
    );
}
