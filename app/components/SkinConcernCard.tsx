import Link from 'next/link';

interface SkinConcernCardProps {
  title: string;
  description: string;
  image: string;
  productCount: number;
  /** Shop URL with tag + optional category (e.g. `/shop?tag=Dark%20Spots&category=Skincare`). */
  href: string;
}

export function SkinConcernCard({ title, description, image, productCount, href }: SkinConcernCardProps) {
  return (
    <Link href={href} className="group cursor-pointer">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all duration-500 h-full">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-primary group-hover:gap-3 transition-all font-medium">
            <span>{productCount} Products</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
