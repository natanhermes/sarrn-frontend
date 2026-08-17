import Image from "next/image";
import { isVideoUrl } from "@/lib/upload";

type MediaDisplayProps = {
  src: string;
  alt?: string;
  className?: string;
  videoClassName?: string;
  imageClassName?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  unoptimized?: boolean;
  useNextImage?: boolean;
};

export function MediaDisplay({
  src,
  alt = "",
  className = "",
  videoClassName,
  imageClassName,
  fill,
  priority,
  sizes,
  width,
  height,
  unoptimized,
  useNextImage = false,
}: MediaDisplayProps) {
  if (!src) {
    return null;
  }

  if (isVideoUrl(src)) {
    return (
      <video
        src={src}
        controls
        preload="metadata"
        playsInline
        controlsList="nodownload"
        className={videoClassName ?? className}
      />
    );
  }

  if (useNextImage) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        priority={priority}
        sizes={sizes}
        width={width}
        height={height}
        unoptimized={unoptimized}
        className={imageClassName ?? className}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={imageClassName ?? className}
      loading={priority ? "eager" : "lazy"}
    />
  );
}
