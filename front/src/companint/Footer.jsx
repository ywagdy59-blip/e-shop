import { useLocale } from "../hooks/UseLocale";

const Footer = () => {
  const { language } = useLocale();
  const ar = language === "ar";

  return (
    <footer className="site-footer py-5 mt-5">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <span className="brand-mark">✦</span><strong>NOVA</strong>
          <p className="mb-0 mt-2 small">{ar ? "اختيارات يومية، بعناية." : "Everyday pieces, thoughtfully chosen."}</p>
        </div>
        <p className="mb-0 small">© {new Date().getFullYear()} NOVA. {ar ? "اختار اللي يشبهك." : "Made for your everyday."}</p>
      </div>
    </footer>
  );
};

export default Footer;
