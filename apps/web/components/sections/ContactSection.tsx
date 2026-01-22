import { Button } from '@/components/ui/button';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

const ContactSection = () => {
    return (
        <section id="contact" className="py-20 bg-background">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                        Liên hệ
                    </span>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Ghé thăm chúng tôi
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Đến trực tiếp để thưởng thức bánh mì nóng hổi hoặc đặt
                        hàng trước để tiết kiệm thời gian.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="bg-card p-6 rounded-2xl shadow-soft">
                            <h3 className="font-display text-xl font-semibold text-card-foreground mb-6">
                                Thông tin liên hệ
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-card-foreground">
                                            Địa chỉ
                                        </h4>
                                        <p className="text-muted-foreground">
                                            Kiến Hưng, Hà Đông, Hà Nội
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-herb/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 text-herb" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-card-foreground">
                                            Điện thoại
                                        </h4>
                                        <p className="text-muted-foreground">
                                            0363290475
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-chili/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-chili" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-card-foreground">
                                            Email
                                        </h4>
                                        <p className="text-muted-foreground">
                                            hello@banhmi-saigon.vn
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-card-foreground">
                                            Giờ mở cửa
                                        </h4>
                                        <p className="text-muted-foreground">
                                            Thứ 2 - Chủ nhật: 6:00 - 22:00
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button variant="hero" size="lg" className="flex-1">
                                Đặt hàng online
                            </Button>
                            <Button variant="warm" size="lg" className="flex-1">
                                Đặt bàn
                            </Button>
                        </div>
                    </div>

                    {/* Map Placeholder */}
                    <div className="bg-card rounded-2xl shadow-soft overflow-hidden h-[400px] md:h-auto">
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                            <div className="text-center p-8">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                                    Bản đồ
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    Kiến Hưng, Hà Đông, Hà Nội
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
