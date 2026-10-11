// Brand intro: the logo draws itself in gold on navy, then two curtains part to reveal the site (about 2 seconds).
// Pure CSS, server-rendered, and skipped for reduced-motion users and for repeat visits in the same browser session.
export default function IntroSplash() {
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-curtain intro-curtain-top" />
      <div className="intro-curtain intro-curtain-bottom" />
      <div className="intro-stage">
        <svg className="intro-mark" viewBox="0 0 64 64" width="132" height="132" fill="none">
          <defs>
            <linearGradient id="intro-gold" gradientUnits="userSpaceOnUse" x1="14" y1="10" x2="50" y2="54">
              <stop offset="0" stopColor="#F8E6A6" />
              <stop offset="0.5" stopColor="#D9B04A" />
              <stop offset="1" stopColor="#A67C1C" />
            </linearGradient>
          </defs>
          <path className="intro-ring" pathLength="100" d="M43.49 22.36 A15 15 0 1 0 47 32" stroke="url(#intro-gold)" strokeWidth="6.5" strokeLinecap="round" />
          <path className="intro-bar" pathLength="100" d="M47 32 H34" stroke="url(#intro-gold)" strokeWidth="6.5" />
          <circle className="intro-node" cx="32" cy="32" r="4.6" fill="url(#intro-gold)" />
        </svg>
        <div className="intro-word gold-text-light">OpsGrit</div>
        <div className="intro-line" />
      </div>
    </div>
  );
}
