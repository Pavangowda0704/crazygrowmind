import "../styles/pages/Privacy.css";

export default function Privacy() {
  return (
    <div className="doc-page">
      <div className="container doc-container">
        <header className="doc-header">
          <h1>Privacy Policy</h1>
          <p>Last Updated: July 9, 2026 • CrazyGrowMind Studio</p>
        </header>

        <article className="doc-body" id="privacy-content">
          <p>
            Welcome to CrazyGrowMind Studio ("we", "us", or "our"). We are committed to protecting your personal data and respecting your privacy. This Privacy Policy describes how we collect, process, and protect your information when you visit our website or submit consultation requests.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you fill out forms on our website, including:
          </p>
          <ul>
            <li>Your Name and Designation</li>
            <li>Corporate Email Address</li>
            <li>Contact Phone Number / WhatsApp coordinates</li>
            <li>Brand name and specific marketing/creative objectives</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We utilize the collected credentials to provide, analyze, and optimize our services. Specifically, we use your details for:
          </p>
          <ul>
            <li>Responding to your direct consultation and audit queries</li>
            <li>Conducting pre-meeting research regarding your brand’s social footprints</li>
            <li>Sending marketing intelligence reports (only if you subscribe to our newsletter)</li>
            <li>Calibrating custom commercial ad campaigns</li>
          </ul>

          <h2>3. Cookies and Tracking Technologies</h2>
          <p>
            We utilize standard browser cookies and tracking pixels (such as Google Analytics and Meta Pixels) to analyze general user navigation behavior, measure ad-campaign conversions, and improve website loading speed. You can opt out of browser cookie collection in your individual device browser settings.
          </p>

          <h2>4. Data Sharing and Protection</h2>
          <p>
            We strictly protect client and prospect data. <strong>We do not sell, lease, or distribute your email addresses or private brand details to third parties.</strong> Data is shared only with our internal growth consultants under strict confidentiality agreements.
          </p>

          <h2>5. Contact Information</h2>
          <p>
            If you have any questions or concerns regarding this Privacy Policy or your data, please contact our data safety lead at: <a href="mailto:privacy@crazygrowmind.com" style={{ color: "var(--primary-gold)", fontWeight: 600 }}>privacy@crazygrowmind.com</a>.
          </p>
        </article>
      </div>
    </div>
  );
}
