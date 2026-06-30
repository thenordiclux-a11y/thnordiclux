import Image from 'next/image';
import Link from 'next/link';

export type BrandLogoProps = {
  name: string;
  logoUrl?: string;
  /** When set, the tile is clickable (internal path or full URL). */
  href?: string;
};

function isExternalUrl(h: string) {
  return /^https?:\/\//i.test(h);
}

export function BrandLogo({ name, logoUrl, href }: BrandLogoProps) {
  const trimmedLogo = logoUrl?.trim();
  const trimmedHref = href?.trim();
  const hasLogo = Boolean(trimmedLogo);

  const card = (
    <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group flex items-center justify-center min-h-[120px] sm:min-h-[140px]">
      {hasLogo ? (
        <div className="relative w-full h-14 sm:h-16 flex items-center justify-center">
          <Image
            src={trimmedLogo!}
            alt={name || 'Brand'}
            width={200}
            height={72}
            className="max-h-14 sm:max-h-16 w-auto max-w-[90%] object-contain mx-auto"
          />
        </div>
      ) : (
        <div className="text-center px-1">
          <div className="text-base sm:text-lg text-foreground group-hover:text-primary transition-colors font-medium line-clamp-3">
            {name}
          </div>
        </div>
      )}
    </div>
  );

  if (!trimmedHref) {
    return card;
  }

  if (isExternalUrl(trimmedHref)) {
    return (
      <a
        href={trimmedHref}
        className="block text-inherit no-underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {card}
      </a>
    );
  }

  return (
    <Link href={trimmedHref} className="block text-inherit no-underline">
      {card}
    </Link>
  );
}
