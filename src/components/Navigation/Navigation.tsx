import { fetchData } from "@/lib/fetchData";
import styles from "./Navigation.module.css";

interface NavigationProps {
  generalInfo: {
    primaryLogo: {
      url: string;
      alt: string;
    };
  };
  allPages: {
    pageHeadline: string;
    pageSlug: string;
  }[];
}

const data = await fetchData<NavigationProps>(`{
  generalInfo {
    primaryLogo {
      url
      alt
    }
  }
  allPages {
    pageHeadline
    pageSlug
  }
}`);

export default function Navigation({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.nav__container}>
      <div className={styles.nav__logo_toggle}>
        <img src={data.generalInfo.primaryLogo.url} alt={data.generalInfo.primaryLogo.alt} />
        <div>
          {children}
          <button className={styles.nav__toggle}>
            <span />
            <span />
          </button>
        </div>
      </div>
      <nav>
        {data.allPages.map((page) => (
          <a href={`#${page.pageSlug}`}>{page.pageHeadline}</a>
        ))}
      </nav>
    </div>
  );
}
