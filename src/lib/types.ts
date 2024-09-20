export interface HeroCarouselProps {
  allEndorsers: Endorser[];
}

export interface Endorser {
  id: string;
  position: number;
  endorserName: string;
  endorserTitle: string;
  endorserSlug: string;
  endorserImage: {
    responsiveImage: {
      src: string;
      width: number;
      height: number;
      alt: string;
    };
  };
}
