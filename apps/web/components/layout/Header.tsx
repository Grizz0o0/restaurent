'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { cn } from '@/lib/utils';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cartCount] = useState(2); // TODO: Integrate with real cart state
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Trang chủ', href: '/' },
        { name: 'Thực đơn', href: '/menu' },
        { name: 'Về chúng tôi', href: '/about' },
        { name: 'Liên hệ', href: '/contact' },
    ];

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname?.startsWith(href);
    };

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-transparent',
                scrolled
                    ? 'bg-background/80 backdrop-blur-md shadow-sm py-2 border-border/40'
                    : 'bg-transparent py-4',
            )}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-14 md:h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                            <span className="text-xl">🥖</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display font-bold text-xl leading-tight text-foreground">
                                Bánh Mì Sài Gòn
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                                Hương vị truyền thống
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    'text-sm font-medium transition-colors hover:text-primary relative py-1',
                                    isActive(link.href)
                                        ? 'text-foreground font-semibold'
                                        : 'text-muted-foreground',
                                )}
                            >
                                {link.name}
                                {isActive(link.href) && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-in zoom-in-50 duration-300" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block">
                            <Link href="/cart">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="relative flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {cartCount > 0 && (
                                        <span className="bg-chili text-white text-[10px] font-bold px-1.5 h-4 flex items-center justify-center rounded-full animate-in zoom-in">
                                            {cartCount}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        </div>
                        <div className="hidden sm:block">
                            <Link href="/auth/login">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                >
                                    Đăng nhập
                                </Button>
                            </Link>
                        </div>
                        <Link href="/menu">
                            <Button
                                size="sm"
                                className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all px-6"
                            >
                                Đặt hàng ngay
                            </Button>
                        </Link>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors text-foreground"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 px-2 border-t border-border/50 animate-in slide-in-from-top-2 bg-background/95 backdrop-blur-md absolute top-full left-0 right-0 shadow-lg border-b">
                        <nav className="flex flex-col gap-2 container mx-auto">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn(
                                        'px-4 py-3 text-sm font-medium rounded-xl transition-all',
                                        isActive(link.href)
                                            ? 'bg-secondary text-primary'
                                            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-border/50 my-2" />
                            <div className="flex flex-col gap-2 px-2">
                                <Link
                                    href="/auth/login"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-xl"
                                        size="lg"
                                    >
                                        Đăng nhập
                                    </Button>
                                </Link>
                                <div className="flex items-center justify-between px-2 py-2">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Chế độ
                                    </span>
                                    <ModeToggle />
                                </div>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
