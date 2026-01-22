import { Facebook, Instagram, MessageCircle } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-foreground text-background py-12">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center">
                                <span className="text-xl">🥖</span>
                            </div>
                            <div>
                                <span className="font-display text-xl font-bold">
                                    Bánh Mì Sài Gòn
                                </span>
                            </div>
                        </div>
                        <p className="text-background/70 text-sm leading-relaxed">
                            Hơn 40 năm gìn giữ hương vị truyền thống bánh mì
                            Việt Nam.
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
                    <p>
                        © {currentYear} Bánh Mì Sài Gòn. Tất cả quyền được bảo
                        lưu.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
