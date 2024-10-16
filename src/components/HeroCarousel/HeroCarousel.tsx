import styles from "./HeroCarousel.module.css";
import { shuffleArray } from "@/lib/shuffleArray";
import { useCallback, useEffect, useState, useRef } from "react";
import { Logo } from "@/logo/Logo";
import MaterialSymbolsArrowBack from "@/icons/MaterialSymbolsArrowBack";
import MaterialSymbolsArrowForward from "@/icons/MaterialSymbolsArrowForward";
import MaterialSymbolsArrowOutward from "@/icons/MaterialSymbolsArrowOutward";
import type { Endorser } from "@/lib/types";
import type { HeroCarouselProps } from "@/pages/index.astro";

export default function HeroCarousel({ children, allEndorsers }: Readonly<{ children: React.ReactNode }> & HeroCarouselProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const slideRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [shuffledEndorsers, setShuffledEndorsers] = useState(allEndorsers as Endorser[]);
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
    (newIndex: number, event?: React.MouseEvent) => {
      if (event) {
        event.preventDefault();
      }
      setCurrentIndex(newIndex);
      setAnimationKey((prev) => prev + 1);
      updateLiveRegion(newIndex);

      if (slideRefs.current[newIndex]) {
        slideRefs.current[newIndex]?.focus({ preventScroll: true });
      }
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
    setShuffledEndorsers(shuffleArray(allEndorsers as Endorser[]));
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
    setShuffledEndorsers(shuffleArray(allEndorsers));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleNext();
      setAnimationKey((prev) => prev + 1);
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
    <section aria-labelledby="carouselheading" className={styles.hero} role="region" aria-roledescription="carousel">
      <header className={styles.hero__header}>{children}</header>
      <div className={styles.visually__hidden} aria-live="polite" ref={liveRegionRef} />
      <ul role="list" id="carousel-content">
        {shuffledEndorsers.map((endorser: Endorser, index) => (
          <li
            ref={(el) => (slideRefs.current[index] = el)}
            className={`${styles.slide__container} ${currentIndex === index ? styles.show : styles.hide}`}
            key={endorser.endorserName}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${shuffledEndorsers.length}`}
          >
            <article className={styles.slide}>
              <img loading={index === 0 ? "eager" : "lazy"} width={endorser.endorserImage.responsiveImage.width} height={endorser.endorserImage.responsiveImage.height} src={endorser.endorserImage.responsiveImage.src} alt={endorser.endorserImage.responsiveImage.alt} />
              <a href={`/${endorser.endorserSlug}`} tabIndex={currentIndex === index ? 0 : -1}>
                <h2>
                  {endorser.endorserName}
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
          <button
            aria-label={`Gå til slide ${index + 1}`}
            aria-controls="carousel-content"
            aria-current={index === currentIndex ? "true" : "false"}
            key={endorser.id}
            className={`${styles.dot} ${index === currentIndex ? styles.dot__active : ""}`}
            onClick={() => changeSlide(index)}
          >
            {index === currentIndex && <div key={animationKey} style={{ animation: `${styles.dot__timer} ${slideTimer}ms linear` }} className={styles.dot__slider} aria-hidden />}
          </button>
        ))}
      </div>
      <div className={styles.carousel__controls}>
        <button onClick={handlePrevious} aria-label="Tidligere slide" className={styles.carousel__button} aria-controls="carousel-content">
          <MaterialSymbolsArrowBack />
        </button>
        <button onClick={handleNext} aria-label="Næste slide" className={styles.carousel__button} aria-controls="carousel-content">
          <MaterialSymbolsArrowForward />
        </button>
      </div>
    </section>
  );
}
