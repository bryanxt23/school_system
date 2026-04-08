import { Link } from "react-router-dom";
import s from "./HomePage.module.css";

export default function HomePage() {
  return (
    <div className={s.landing}>
      {/* ── Navbar ── */}
      <nav className={s.navbar}>
        <Link to="/" className={s.logo}>
          <span className={s.logoIcon}>◐</span>
          PathWise
        </Link>

        <div className={s.navLinks}>
          <a href="#features">Overview</a>
          <a href="#about"><span className={s.navDot}>•</span> Pages</a>
          <a href="#features">Cart (0)</a>
        </div>

        <div className={s.navActions}>
          <span className={s.navInfo} aria-hidden="true">i</span>
          <a href="#features" className={s.navMore}>More Templates</a>
          <Link to="/login" className={s.btnPrimary}>Buy PathWise</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={s.hero}>
        <div className={s.heroOverlay} />
        <div className={s.heroContent}>
          <div className={s.heroText}>
            <p className={s.heroLabel}>Welcome to PathWise</p>
            <h1 className={s.heroTitle}>
              Guiding Growth,<br />
              Inspiring Success
            </h1>
          </div>

          <div className={s.heroCard}>
            <div className={s.heroCardTop}>
              <span className={s.heroStars}>★★★★★</span>
              <span className={s.heroRating}>4.9/5</span>
              <span className={s.heroStudents}>Join Over 600+ Students</span>
            </div>
            <p className={s.heroCardDesc}>
              Pathwise helps schools, educators, and professional coaches
              showcase their programs and services with clarity, trust, and
              modern design.
            </p>
            <div className={s.heroCardBtns}>
              <Link to="/login" className={s.btnOutline}>Explore Programs</Link>
              <a href="#footer" className={s.btnPrimary}>Contact Us</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section id="features" className={s.features}>
        <div className={s.featureCard}>
          <div className={`${s.featureIcon} ${s.iconBlue}`}>📚</div>
          <h3 className={s.featureTitle}>Explore Programs</h3>
          <p className={s.featureDesc}>
            Tailored pathways for learners and clients
          </p>
          <Link to="/login" className={s.featureLink}>
            Explore <span>→</span>
          </Link>
        </div>

        <div className={s.featureCard}>
          <div className={`${s.featureIcon} ${s.iconAmber}`}>🎓</div>
          <h3 className={s.featureTitle}>Browse Workshops</h3>
          <p className={s.featureDesc}>
            Interactive learning experiences
          </p>
          <Link to="/login" className={s.featureLink}>
            Browse <span>→</span>
          </Link>
        </div>

        <div className={s.featureCard}>
          <div className={`${s.featureIcon} ${s.iconPurple}`}>👨‍🏫</div>
          <h3 className={s.featureTitle}>Meet Couches</h3>
          <p className={s.featureDesc}>
            Personalized guidance from experts
          </p>
          <Link to="/login" className={s.featureLink}>
            Explore <span>→</span>
          </Link>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className={s.about}>
        <div>
          <p className={s.aboutLabel}>About</p>
          <h2 className={s.aboutTitle}>
            A <span className={s.aboutTitleItalic}>Platform</span> for<br />
            Knowledge &amp; Growth
          </h2>
          <p className={s.aboutDesc}>
            At Pathwise, we believe education and coaching are about more than
            information — they're about transformation. Whether you're leading a
            classroom or guiding professionals, our template helps you share your
            mission with impact.
          </p>

          <div className={s.aboutPoints}>
            <div className={s.aboutPoint}>
              <div className={s.aboutPointIcon}>✦</div>
              <div>
                <div className={s.aboutPointTitle}>Clarity</div>
                <p className={s.aboutPointDesc}>
                  Simple layouts that make information easy to find</p>
              </div>
            </div>
            <div className={s.aboutPoint}>
              <div className={s.aboutPointIcon}>♡</div>
              <div>
                <div className={s.aboutPointTitle}>Credibility</div>
                <p className={s.aboutPointDesc}>
                  Designed to inspire trust among students, parents, or clients
                </p>
              </div>
            </div>
          </div>

          <Link to="/login" className={s.btnLearn}>Learn More</Link>
        </div>

        <div className={s.aboutVisual}>
          <div className={s.aboutImageMain}>
            <div className={s.statBox}>
              <div className={s.statNumber}>2,500+</div>
              <div className={s.statLabel}>Learners Guided</div>
            </div>
          </div>
          <div className={s.aboutImageSecondary} />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="footer" className={s.footer}>
        <div className={s.footerGrid}>
          <div className={s.footerBrand}>
            <div className={s.footerLogo}>
              <span className={s.footerLogoIcon}>◐</span>
              PathWise
            </div>
            <p className={s.footerDesc}>
              Empowering schools, educators, and coaches to share their mission
              with clarity and modern design.
            </p>
          </div>

          <div className={s.footerCol}>
            <h4>Platform</h4>
            <a href="#features">Programs</a>
            <a href="#features">Workshops</a>
            <a href="#about">About Us</a>
          </div>

          <div className={s.footerCol}>
            <h4>Resources</h4>
            <a href="#about">Documentation</a>
            <a href="#about">Support</a>
            <a href="#about">FAQ</a>
          </div>

          <div className={s.footerCol}>
            <h4>Connect</h4>
            <a href="#footer">Email Us</a>
            <a href="#footer">Twitter</a>
            <a href="#footer">LinkedIn</a>
          </div>
        </div>

        <div className={s.footerBottom}>
          <span>&copy; 2026 PathWise. All rights reserved.</span>
          <div className={s.footerSocial}>
            <a href="#footer">Privacy</a>
            <a href="#footer">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
