import { fetchData } from "@/lib/fetchData";
import styles from "./HeroCarousel.module.css";
import { useCallback, useEffect, useState, useRef } from "react";
import { Logo } from "@/logo/Logo";
import MaterialSymbolsArrowBack from "@/icons/MaterialSymbolsArrowBack";
import MaterialSymbolsArrowForward from "@/icons/MaterialSymbolsArrowForward";
import MaterialSymbolsArrowOutward from "@/icons/MaterialSymbolsArrowOutward";

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

const data = await fetchData<HeroCarouselProps>(`{
  allEndorsers {
    id
    position
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

export default function HeroCarousel({ children }: Readonly<{ children: React.ReactNode }>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const slideRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [shuffledEndorsers, setShuffledEndorsers] = useState(data.allEndorsers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const slideTimer = 10000;

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledEndorsers.length);
  }, [shuffledEndorsers.length]);

  const updateLiveRegion = useCallback(
    (index: number) => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = `Item ${index + 1} of ${shuffledEndorsers.length}`;
      }
    },
    [shuffledEndorsers.length]
  );

  const changeSlide = useCallback(
    (newIndex: number) => {
      setCurrentIndex(newIndex);
      setAnimationKey((prev) => prev + 1);
      updateLiveRegion(newIndex);

      setTimeout(() => {
        if (slideRefs.current[newIndex]) {
          slideRefs.current[newIndex]?.focus();
        }
      }, 100);
    },
    [updateLiveRegion]
  );

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? shuffledEndorsers.length - 1 : currentIndex - 1;
    changeSlide(newIndex);
  }, [currentIndex, shuffledEndorsers.length, changeSlide]);

  const handleNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % shuffledEndorsers.length;
    changeSlide(newIndex);
  }, [currentIndex, shuffledEndorsers.length, changeSlide]);

  useEffect(() => {
    setShuffledEndorsers(shuffleArray(data.allEndorsers));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(nextSlide, slideTimer);

    return () => {
      resetTimeout();
    };
  }, [currentIndex, nextSlide, resetTimeout, slideTimer]);

  useEffect(() => {
    setShuffledEndorsers(shuffleArray(data.allEndorsers));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleNext();
      setAnimationKey((prev) => prev + 1); // Reset animation here too
    }, slideTimer);

    return () => clearTimeout(timer);
  }, [currentIndex, handleNext, slideTimer]);

  useEffect(() => {
    updateLiveRegion(currentIndex);
  }, [currentIndex, updateLiveRegion]);

  if (isLoading) {
    return (
      <div className={styles.loading__indicator}>
        <Logo />
      </div>
    );
  }

  return (
    <section aria-labelledby="carouselheading" className={styles.hero}>
      <header className={styles.hero__header}>{children}</header>
      <div className={styles.visually__hidden} aria-live="polite" ref={liveRegionRef} />
      <ul>
        {shuffledEndorsers.map((endorser: Endorser, index) => (
          <li ref={(el) => (slideRefs.current[index] = el)} tabIndex={currentIndex === index ? 0 : -1} className={currentIndex === index ? styles.show : styles.hide} style={{ opacity: index === currentIndex ? 1 : 0 }} key={endorser.endorserName}>
            <article className={styles.slide}>
              <img src={endorser.endorserImage.responsiveImage.src} alt={endorser.endorserImage.responsiveImage.alt} />
              <a href={`/${endorser.endorserSlug}`}>
                <h2>
                  {endorser.endorserName}{" "}
                  <span>
                    <MaterialSymbolsArrowOutward />
                  </span>
                </h2>
                <p>{endorser.endorserTitle}</p>
              </a>
            </article>
          </li>
        ))}
      </ul>
      <div className={styles.carousel__dot__group}>
        {shuffledEndorsers.map((endorser: Endorser, index) => (
          <button role="tab" aria-selected={index === currentIndex} aria-label={`Slide ${index + 1}`} key={endorser.id} className={`${styles.dot} ${index === currentIndex ? styles.dot__active : ""}`} onClick={() => changeSlide(index)}>
            {index === currentIndex && <div key={animationKey} style={{ animation: `${styles.dot__timer} ${slideTimer}ms linear` }} className={styles.dot__slider} aria-hidden />}
          </button>
        ))}
      </div>
      <div className={styles.carousel__controls}>
        <button onClick={handlePrevious} aria-label="Tidligere slide" className={styles.carousel__button}>
          <MaterialSymbolsArrowBack />
        </button>
        <button onClick={handleNext} aria-label="Næste slide" className={styles.carousel__button}>
          <MaterialSymbolsArrowForward />
        </button>
      </div>
    </section>
  );
}
