"use client";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type LightboxModalProps = {
  open: boolean;
  close: () => void;
  slides: { src: string; alt?: string }[];
  index?: number;
};

export function LightboxModal({
  open,
  close,
  slides,
  index = 0,
}: LightboxModalProps) {
  if (!open) {
    return null;
  }

  return (
    <Lightbox
      open={open}
      close={close}
      index={index}
      slides={slides}
    />
  );
}
