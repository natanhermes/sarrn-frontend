import { resolvePublicMediaUrl } from "@/lib/public-api";
import { isVideoUrl } from "@/lib/upload";

type PostGalleryProps = {
  images: string[];
  title: string;
};

export function PostGallery({ images, title }: PostGalleryProps) {
  const items = images
    .map((url) => resolvePublicMediaUrl(url) || url)
    .filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="text-2xl font-extrabold tracking-tight">Galeria</h2>
      <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((url, index) => {
          const isVid = isVideoUrl(url);

          return (
            <div
              key={`${url}-${index}`}
              className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-muted/20"
            >
              {isVid ? (
                <video
                  src={url}
                  controls
                  preload="metadata"
                  playsInline
                  controlsList="nodownload"
                  className="h-auto w-full object-cover"
                />
              ) : (
                <img
                  src={url}
                  alt={`${title} — mídia ${index + 1}`}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
