import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  name: string;
  count: number;
  image: string;
  gradient?: string;
}

export function CategoryCard({ name, count, image, gradient }: CategoryCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl cursor-pointer h-96 shadow-sm hover:shadow-xl transition-all duration-500">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-8">
        <div className="transform group-hover:translate-y-[-8px] transition-transform duration-300">
          <h3 className="text-white text-2xl mb-2">{name}</h3>
          <p className="text-white/90 text-sm mb-4">{count} Products</p>
          <div className="inline-flex items-center gap-2 text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/20 transition-colors">
            <span className="text-sm">Shop Now</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
