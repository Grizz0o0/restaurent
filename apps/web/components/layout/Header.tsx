import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cartCount] = useState(2);
    const pathname = usePathname();

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
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center">
                            <span className="text-xl font-bold text-primary-foreground">
                                🥖
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display text-xl font-bold text-foreground">
                                Bánh Mì Sài Gòn
                            </span>
                            <span className="text-xs text-muted-foreground font-medium hidden sm:block">
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
                                className={`text-sm font-medium transition-colors duration-200 ${
                                    isActive(link.href)
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-primary'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block">
                            <ModeToggle />
                        </div>
                        <Link href="/cart">
                            <Button
                                variant="warm"
                                size="sm"
                                className="hidden sm:flex"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span>Giỏ hàng</span>
                                {cartCount > 0 && (
                                    <span className="bg-chili text-primary-foreground rounded-full px-2 py-0.5 text-xs font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </Button>
                        </Link>

                        <Link href="/auth/login" className="hidden sm:block">
                            <Button variant="ghost" size="sm">
                                <User className="w-4 h-4 mr-2" />
                                Đăng nhập
                            </Button>
                        </Link>

                        <Link href="/menu">
                            <Button
                                variant="hero"
                                size="sm"
                                className="hidden sm:flex"
                            >
                                Đặt hàng ngay
                            </Button>
                        </Link>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
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
                    <div className="md:hidden py-4 border-t border-border animate-fade-in">
                        <nav className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`px-4 py-3 text-base font-medium rounded-lg transition-all ${
                                        isActive(link.href)
                                            ? 'text-primary bg-secondary'
                                            : 'text-foreground hover:text-primary hover:bg-secondary'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-2 pt-4 px-4">
                                <Link
                                    href="/cart"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Button variant="warm" className="w-full">
                                        <ShoppingCart className="w-4 h-4" />
                                        Giỏ hàng ({cartCount})
                                    </Button>
                                </Link>
                                <Link
                                    href="/menu"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Button variant="hero" className="w-full">
                                        Đặt hàng ngay
                                    </Button>
                                </Link>
                                <div className="flex gap-2">
                                    <Link
                                        href="/auth/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex-1"
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            Đăng nhập
                                        </Button>
                                    </Link>
                                    <div className="flex items-center justify-center border rounded-md px-3">
                                        <ModeToggle />
                                    </div>
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
