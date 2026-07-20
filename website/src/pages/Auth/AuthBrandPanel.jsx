import logo from "../../assets/logo.jpeg";

// Shared brand side used by both LoginPage and RegisterPage.
// `headline` / `body` let each page carry a slightly different message.
const AuthBrandPanel = ({ headline, body }) => (
  <div className="auth-brandpanel">
    <div className="auth-brand-mark">
      <img src={logo} alt="CrazyGrowMind Studio" />
      <div className="auth-brand-name">
        CRAZY<span>GROW</span>MIND
      </div>
    </div>

    <div className="auth-brand-copy">
      <h1>{headline}</h1>
      <p>{body}</p>

      <svg
        className="auth-circuit"
        viewBox="0 0 300 160"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="authGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f7c65b" />
            <stop offset="100%" stopColor="#c7861d" />
          </linearGradient>
        </defs>
        <path d="M10 140 L110 140 L150 70 L230 70 L270 20" />
        <circle cx="150" cy="70" r="5" />
        <circle cx="230" cy="70" r="5" />
        <circle cx="270" cy="20" r="5" />
      </svg>
    </div>

    <div className="auth-brand-foot">© {new Date().getFullYear()} CrazyGrowMind Studio</div>
  </div>
);

export default AuthBrandPanel;
