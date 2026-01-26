import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-foreground text-background py-12">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 overflow-hidden flex items-center justify-center">
                                <Image
                                    src="/images/logo-trans.png"
                                    alt="BAMIXO Logo"
                                    width={48}
                                    height={48}
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <span className="font-display text-2xl font-bold tracking-tight">
                                    BAMIXO
                                </span>
                            </div>
                        </div>
                        <p className="text-background/70 text-sm leading-relaxed">
                            Hương vị truyền thống Bánh Mì & Xôi Việt Nam, nâng
                            tầm phong cách hiện đại.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
                        <ul className="space-y-2 text-background/70 text-sm">
                            <li>
                                <a
                                    href="#home"
                                    className="hover:text-background transition-colors"
                                >
                                    Trang chủ
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#menu"
                                    className="hover:text-background transition-colors"
                                >
                                    Thực đơn
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#about"
                                    className="hover:text-background transition-colors"
                                >
                                    Về chúng tôi
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#contact"
                                    className="hover:text-background transition-colors"
                                >
                                    Liên hệ
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-semibold mb-4">Dịch vụ</h4>
                        <ul className="space-y-2 text-background/70 text-sm">
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-background transition-colors"
                                >
                                    Đặt hàng online
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-background transition-colors"
                                >
                                    Đặt bàn
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-background transition-colors"
                                >
                                    Tiệc & sự kiện
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-background transition-colors"
                                >
                                    Nhượng quyền
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4">Liên hệ</h4>
                        <ul className="space-y-2 text-background/70 text-sm">
                            <li>Kiến Hưng, Hà Đông, Hà Nội</li>
                            <li>0363290475</li>
                            <li>hello@banhmi-saigon.vn</li>
                            <li>Mở cửa: 6:00 - 22:00</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-background/10 pt-8 text-center text-background/50 text-sm">
                    <p>© {currentYear} BAMIXO. Tất cả quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
