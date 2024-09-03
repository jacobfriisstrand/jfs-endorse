import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { NextButton, PrevButton, usePrevNextButtons } from "./EmblaCarouselArrowButtons";
import { DotButton, useDotButton } from "./EmblaCarouselDotButton";
import { fetchData } from "@/lib/fetchData";
import styles from "./HeroCarousel.module.css";
import { MaterialSymbolsArrowRightAlt } from "@/icons/MaterialSymbolsArrowRight";
import { useEffect, useState } from "react";
import { Logo } from "@/logo/Logo";

export interface HeroCarouselProps {
  allEndorsers: Endorser[];
}

export interface Endorser {
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

const data = await fetchData<HeroCarouselProps>(`{
  allEndorsers {
    endorserName
    endorserTitle
    endorserSlug
    endorserImage {
        responsiveImage(imgixParams: {fit: crop, auto: format, crop: focalpoint, ar: "16:9"}) {
        src
        width
        height
        alt
      }
    }
  }
}`);

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function HeroCarousel({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [shuffledEndorsers, setShuffledEndorsers] = useState(data.allEndorsers);

  // delay for autoplay must be equal to --hero-slide-time variable in HerCarousel.module.css
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
    },
    [Fade(), Autoplay({ delay: 5000, playOnInit: true, stopOnInteraction: false })]
  );

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

  useEffect(() => {
    setShuffledEndorsers(shuffleArray(data.allEndorsers));
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loading__indicator}>
        <Logo />
      </div>
    );
  }

  // TODO remove drag on desktop
  // TODO fix autoplay. bug when changing tab on browser

  return (
    <section className={styles.hero}>
      <header className={styles.hero__header}>{children}</header>
      <div className={`.embla ${styles.embla}`} ref={emblaRef}>
        <div className={`embla__container ${styles.embla__container}`}>
          {shuffledEndorsers.map((endorser: Endorser) => (
            <article key={endorser.endorserName} className={`embla__slide ${styles.embla__slide}`}>
              <img src={endorser.endorserImage.responsiveImage.src} alt={endorser.endorserImage.responsiveImage.alt} width={endorser.endorserImage.responsiveImage.width} height={endorser.endorserImage.responsiveImage.height} />
              <a href={`/${endorser.endorserSlug}`}>
                <div>
                  <h2>{endorser.endorserName}</h2>
                  <p>{endorser.endorserTitle}</p>
                </div>
                <div className={styles.endorser__link__arrow}>
                  <MaterialSymbolsArrowRightAlt />
                </div>
              </a>
            </article>
          ))}
        </div>
        <div className={`embla__controls ${styles.embla__controls}`}>
          <div className={`embla__buttons ${styles.embla__buttons}`}>
            <PrevButton className="" onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
            <NextButton className="" onClick={onNextButtonClick} disabled={nextBtnDisabled} />
          </div>
        </div>
        <div className={`embla__dots ${styles.embla__dots}`}>
          {scrollSnaps.map((_, index) => (
            <DotButton key={index} onClick={() => onDotButtonClick(index)} className={`embla__dot ${styles.embla__dot} ${selectedIndex === index ? styles.embla__dot__active : ""}`}>
              {children}
            </DotButton>
          ))}
        </div>
      </div>
    </section>
  );
}
