import Image, { StaticImageData } from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Star } from 'lucide-react';
import { toast } from 'sonner';

import banhMiThitNuong from '@/assets/banh-mi-thit-nuong.jpg';
import banhMiChaLua from '@/assets/banh-mi-cha-lua.jpg';
import banhMiXiuMai from '@/assets/banh-mi-xiu-mai.jpg';
import banhMiOpLa from '@/assets/banh-mi-op-la.jpg';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string | StaticImageData;
    category: string;
    rating: number;
    isPopular?: boolean;
}

const menuItems: MenuItem[] = [
    // Bánh Mì
    {
        id: 'bm1',
        name: 'Bánh Mì Pate Chả Nóng',
        description: 'Pate gan nhà làm, chả lụa, dưa góp, rau thơm',
        price: 25000,
        image: banhMiChaLua,
        category: 'Bánh Mì',
        rating: 4.8,
    },
    {
        id: 'bm2',
        name: 'Bánh Mì Xá Xíu',
        description: 'Thịt xá xíu đậm đà, nước sốt gia truyền',
        price: 25000,
        image: banhMiThitNuong,
        category: 'Bánh Mì',
        rating: 4.9,
        isPopular: true,
    },
    {
        id: 'bm3',
        name: 'Bánh Mì Thập Cẩm',
        description: 'Đầy đủ pate, chả, thịt nướng, xá xíu, trứng',
        price: 30000,
        image: banhMiOpLa,
        category: 'Bánh Mì',
        rating: 5.0,
        isPopular: true,
    },
    {
        id: 'bm4',
        name: 'Bánh Mì Đặc Biệt',
        description: 'Phiên bản đặc biệt đầy ắp nhân thịt và sốt',
        price: 40000,
        image: banhMiThitNuong,
        category: 'Bánh Mì',
        rating: 5.0,
    },

    // Xôi
    {
        id: 'x1',
        name: 'Xôi Pate Ruốc',
        description: 'Xôi nếp dẻo thơm, pate béo ngậy, ruốc bông',
        price: 20000,
        image: banhMiXiuMai, // Placeholder
        category: 'Xôi',
        rating: 4.7,
    },
    {
        id: 'x2',
        name: 'Xôi Trứng Chả',
        description: 'Xôi trắng, trứng kho, chả lụa kho tiêu',
        price: 25000,
        image: banhMiChaLua, // Placeholder
        category: 'Xôi',
        rating: 4.8,
    },
    {
        id: 'x3',
        name: 'Xôi Thập Cẩm',
        description: 'Thập cẩm các loại topping: thịt, trứng, chả, pate',
        price: 30000,
        image: banhMiThitNuong, // Placeholder
        category: 'Xôi',
        rating: 4.9,
        isPopular: true,
    },

    // Đồ Uống
    {
        id: 'd1',
        name: 'Trà Chanh',
        description: 'Trà chanh tươi mát lạnh, giải nhiệt',
        price: 10000,
        image: banhMiOpLa, // Placeholder
        category: 'Đồ Uống',
        rating: 4.5,
    },
    {
        id: 'd2',
        name: 'Cafe Muối',
        description: 'Sự kết hợp độc đáo giữa cafe và kem muối béo mặn',
        price: 20000,
        image: banhMiThitNuong, // Placeholder
        category: 'Đồ Uống',
        rating: 4.8,
        isPopular: true,
    },
    {
        id: 'd3',
        name: 'Sữa Tươi Trân Châu',
        description: 'Sữa tươi thanh trùng, trân châu đường đen dẻo dai',
        price: 20000,
        image: banhMiChaLua, // Placeholder
        category: 'Đồ Uống',
        rating: 4.7,
    },

    // Ăn Vặt
    {
        id: 's1',
        name: 'Bánh Cá Taiyaki',
        description: 'Bánh cá nhân phomai/bò khô (2 con)',
        price: 10000,
        image: banhMiXiuMai, // Placeholder
        category: 'Ăn Vặt',
        rating: 4.6,
    },
    {
        id: 's2',
        name: 'Nem Chua Rán',
        description: 'Nem chua rán giòn tan, tương ớt cay nồng',
        price: 25000,
        image: banhMiThitNuong, // Placeholder
        category: 'Ăn Vặt',
        rating: 4.8,
        isPopular: true,
    },
];

const categories = ['Tất cả', 'Bánh Mì', 'Xôi', 'Đồ Uống', 'Ăn Vặt'];

const MenuSection = () => {
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    const filteredItems =
        activeCategory === 'Tất cả'
            ? menuItems
            : menuItems.filter((item) => item.category === activeCategory);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    return (
        <section id="menu" className="py-20 bg-background">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                        Thực đơn
                    </span>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Khám phá hương vị đường phố
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Mỗi chiếc bánh mì là một tác phẩm nghệ thuật, kết hợp
                        hoàn hảo giữa vỏ bánh giòn và nhân thịt thơm lừng.
                    </p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {categories.map((category) => (
                        <Button
                            key={category}
                            variant={
                                activeCategory === category ? 'hero' : 'warm'
                            }
                            size="sm"
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </Button>
                    ))}
                </div>

                {/* Menu Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredItems.map((item, index) => (
                        <div
                            key={item.id}
                            className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Image */}
                            <div className="relative aspect-square overflow-hidden">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {item.isPopular && (
                                    <div className="absolute top-3 left-3 bg-chili text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                                        Bán chạy
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                                    <Star className="w-3 h-3 text-primary fill-primary" />
                                    <span className="text-xs font-semibold">
                                        {item.rating}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-display text-lg font-semibold text-card-foreground mb-1">
                                    {item.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                    {item.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-primary">
                                        {formatPrice(item.price)}
                                    </span>
                                    <Button
                                        variant="hero"
                                        size="sm"
                                        onClick={() => {
                                            toast.success(
                                                `Đã thêm ${item.name} vào giỏ hàng`,
                                                {
                                                    description:
                                                        'Bạn có thể xem trong giỏ hàng',
                                                    action: {
                                                        label: 'Xem giỏ',
                                                        onClick: () =>
                                                            console.log(
                                                                'Navigate to cart',
                                                            ),
                                                    },
                                                },
                                            );
                                        }}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Thêm
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <Button variant="warm" size="lg">
                        Xem tất cả thực đơn
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default MenuSection;
