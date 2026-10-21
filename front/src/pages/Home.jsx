import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../companint/Loading";
import ProductCard from "../companint/ProductCard";
import { getCategories, getProducts } from "../Services/ClothesServices";
import { useAuth } from "../hooks/UseAuth";
import { useLocale } from "../hooks/UseLocale";

const testimonials = {
  en: [
    {
      quote: "The fabric feels even better than it looked online. My new go-to for pieces that work all week.",
      name: "Maya Hassan",
      detail: "Verified customer · Cairo",
    },
    {
      quote: "A thoughtful edit, lovely packaging, and the fit was spot on. I already have my next order picked out.",
      name: "Nour El Din",
      detail: "Verified customer · Alexandria",
    },
    {
      quote: "Finally, everyday clothes that feel special without trying too hard. The whole experience was effortless.",
      name: "Salma Adel",
      detail: "Verified customer · Giza",
    },
  ],
  ar: [
    {
      quote: "الخامة أحلى من الصور بكتير، وبقيت أرجع للقطع دي كل ما أحتار ألبس إيه.",
      name: "مايا حسن",
      detail: "عميلة موثّقة · القاهرة",
    },
    {
      quote: "اختيارات مميزة وتغليف جميل والمقاس مظبوط. أكيد دي مش آخر مرة أطلب فيها.",
      name: "نور الدين",
      detail: "عميلة موثّقة · الإسكندرية",
    },
    {
      quote: "أخيرًا لبس يومي بسيط وفي نفس الوقت مميز. تجربة الشراء كانت سهلة من أولها لآخرها.",
      name: "سلمى عادل",
      detail: "عميلة موثّقة · الجيزة",
    },
  ],
};

const selectFeaturedProducts = (items, limit = 4) => {
  const featured = [];
  const seenCategories = new Set();

  for (const product of items) {
    const categoryKey = product.category?._id || product.category?.name || product.category || product._id;
    if (!seenCategories.has(categoryKey)) {
      seenCategories.add(categoryKey);
      featured.push(product);
      if (featured.length === limit) return featured;
    }
  }

  for (const product of items) {
    if (!featured.includes(product)) featured.push(product);
    if (featured.length === limit) break;
  }

  return featured;
};

const AnimatedStat = ({ value, suffix, label }) => {
  const [count, setCount] = useState(0);
  const statRef = useRef(null);

  useEffect(() => {
    const node = statRef.current;
    if (!node) return undefined;

    let frame;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;

      const duration = 1400;
      let startTime;
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(animate);
      };

      frame = requestAnimationFrame(animate);
      observer.disconnect();
    }, { threshold: 0.35 });

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <div className="home-stat" ref={statRef}>
      <strong>{count.toLocaleString()}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slide, setSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { isAdmin } = useAuth();
  const { t, language } = useLocale();
  const ar = language === "ar";
  const quotes = testimonials[ar ? "ar" : "en"];
  const copy = ar ? {
    announcement: "توصيل مجاني للطلبات فوق ١٬٥٠٠ جنيه",
    heroEyebrow: "اختيارات جديدة · يومك بطريقتك",
    heroTitle: "قطع تحبها. وأيام تشبهك.",
    heroText: "أساسيات مريحة وتفاصيل مميزة، مختارة بعناية علشان تلبسها بطريقتك كل يوم.",
    shopNow: "تسوق التشكيلة",
    discover: "اكتشف حكاية NOVA",
    imageLabel: "اختيارات الموسم الجديد",
    imageNote: "من أول مشوار لآخر اليوم",
    categoryHeading: "اختار بدايتك",
    categoryText: "تشكيلات صغيرة، معمولة علشان تلاقي القطعة اللي تشبهك.",
    featuredHeading: "اختياراتنا ليك",
    addProduct: "إضافة منتج",
    statsHeading: "تفاصيل صغيرة، فرق كبير",
    statCustomers: "عميل سعيد",
    statStyles: "ستايل مختار",
    statDelivery: "رضا عن التوصيل",
    storyEyebrow: "ستايل على مهلك",
    storyHeading: "أقل، لكن أحلى.",
    storyText: "نؤمن إن خزانة الملابس الحلوة مش محتاجة تكون كبيرة. قطع أساسية بجودة تعيش، وتفاصيل تخلي كل تنسيق بطابعك.",
    storyButton: "شوف كل المنتجات",
    testimonialEyebrow: "قالوا عن NOVA",
    testimonialHeading: "حكايات من خزانة يومهم.",
    newsletterEyebrow: "رسالة صغيرة، من وقت للتاني",
    newsletterHeading: "خليك قريب من الجديد.",
    newsletterText: "تشكيلات جديدة، اختيارات من الفريق، ومفاجآت توصلك على بريدك.",
    emailPlaceholder: "بريدك الإلكتروني",
    subscribe: "اشترك",
    newsletterSuccess: "شكرًا لاشتراكك! تم استلام طلبك.",
    backToTop: "العودة إلى الأعلى",
    quoteLabel: "تجربة عميل",
  } : {
    announcement: "Complimentary delivery on orders over EGP 1,500",
    heroEyebrow: "A fresh edit · made for your every day",
    heroTitle: "Pieces you love. Days that feel like you.",
    heroText: "Easy essentials, thoughtful details, and little things that make getting dressed feel like you.",
    shopNow: "Shop the collection",
    discover: "Discover the NOVA edit",
    imageLabel: "A new-season favourite",
    imageNote: "From the first coffee to the last plan",
    categoryHeading: "Find your starting point",
    categoryText: "Considered collections to help you find the pieces that feel like you.",
    featuredHeading: "A few things we love",
    addProduct: "Add product",
    statsHeading: "A little care goes a long way",
    statCustomers: "happy customers",
    statStyles: "thoughtful styles",
    statDelivery: "delivery satisfaction",
    storyEyebrow: "The art of everyday",
    storyHeading: "Less, but so much better.",
    storyText: "A thoughtful wardrobe doesn't need to be complicated. Meet the dependable pieces, considered fabrics, and small details you'll keep coming back to.",
    storyButton: "Explore all pieces",
    testimonialEyebrow: "Kind words, honestly",
    testimonialHeading: "A little love from your wardrobes.",
    newsletterEyebrow: "A good note, every now and then",
    newsletterHeading: "Something lovely is on its way.",
    newsletterText: "New arrivals, considered edits, and the occasional little surprise—straight to your inbox.",
    emailPlaceholder: "Your email address",
    subscribe: "Sign me up",
    newsletterSuccess: "Thanks for signing up! Your request has been received.",
    backToTop: "Back to top",
    quoteLabel: "Customer story",
  };

  useEffect(() => {
    let active = true;
    Promise.all([getProducts(), getCategories()])
      .then(([productData, categoryData]) => {
        if (active) {
          setProducts(selectFeaturedProducts(productData));
          setCategories(categoryData.slice(0, 4));
        }
      })
      .catch((err) => active && setError(err.response?.data?.message || (ar ? "تعذر تحميل المتجر." : "Could not load the store.")))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [ar]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 520);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    setNewsletterMessage(copy.newsletterSuccess);
    setEmail("");
  };

  const changeSlide = (direction) => {
    setSlide((current) => (current + direction + quotes.length) % quotes.length);
  };

  return (
    <main className="flex-grow-1 nova-home">
      <div className="home-announcement">
        <span aria-hidden="true">✳</span> {copy.announcement}
      </div>

      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="container home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-eyebrow"><span />{copy.heroEyebrow}</p>
            <h1 id="home-hero-title">{copy.heroTitle}</h1>
            <p className="home-hero-description">{copy.heroText}</p>
            <div className="home-hero-actions">
              <Link to="/products" className="home-button">{copy.shopNow}<span aria-hidden="true">↗</span></Link>
              <a href="#collections" className="home-text-link">{copy.discover}</a>
            </div>
            <div className="home-hero-proof">
              <span className="home-proof-stars" aria-label="5 out of 5 stars">★★★★★</span>
              <span>{ar ? "اختيارات يحبها أكتر من ١٠٬٠٠٠ شخص" : "Loved by more than 10,000 happy customers"}</span>
            </div>
          </div>

          <div className="home-hero-visual">
            <img
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=88"
              alt={copy.imageLabel}
              fetchPriority="high"
            />
            <div className="home-image-caption">
              <span>{copy.imageLabel}</span>
              <strong>{copy.imageNote}</strong>
            </div>
            <span className="home-hero-stamp" aria-hidden="true">N<br />°01</span>
          </div>
        </div>
        <a href="#collections" className="home-scroll-cue"><span />{ar ? "اكتشف NOVA" : "Scroll to discover"}</a>
      </section>

      <section className="container home-collections" id="collections">
        <div className="home-section-heading">
          <div>
            <p className="home-eyebrow">{copy.categoryHeading}</p>
            <h2>{copy.categoryText}</h2>
          </div>
          <Link to="/products" className="home-text-link">{t("viewAll")} <span aria-hidden="true">↗</span></Link>
        </div>
        {categories.length > 0 && (
          <div className="home-category-grid">
            {categories.map((category, index) => (
              <Link
                className={`home-category-card home-category-${index + 1}`}
                key={category._id}
                to={`/products?category=${category._id}`}
              >
                <span className="home-category-number">0{index + 1}</span>
                <span className="home-category-label">{category.name}</span>
                <span className="home-category-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="container home-products" id="new-arrivals">
        <div className="home-section-heading">
          <div>
            <p className="home-eyebrow">{t("arrivals")}</p>
            <h2>{copy.featuredHeading}</h2>
          </div>
          <div className="home-section-heading-actions">
            {isAdmin && (
              <Link to="/products/new" className="home-add-product-link">
                <span aria-hidden="true">＋</span>{copy.addProduct}
              </Link>
            )}
            <Link to="/products" className="home-text-link">{t("viewAll")} <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {loading ? (
          <div className="text-center py-5"><Loading /></div>
        ) : products.length === 0 ? (
          <p className="text-muted text-center py-4">{ar ? "لا توجد منتجات متاحة حاليًا." : "There are no products available just yet."}</p>
        ) : (
          <div className="row g-4">
            {products.map((product) => (
              <div className="col-sm-6 col-lg-3" key={product._id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="home-statistics" aria-label={copy.statsHeading}>
        <div className="container">
          <div className="home-stats-intro">
            <p className="home-eyebrow">{ar ? "NOVA بالأرقام" : "The NOVA feeling"}</p>
            <h2>{copy.statsHeading}</h2>
          </div>
          <div className="home-stats-grid">
            <AnimatedStat value={10} suffix="k+" label={copy.statCustomers} />
            <AnimatedStat value={250} suffix="+" label={copy.statStyles} />
            <AnimatedStat value={98} suffix="%" label={copy.statDelivery} />
          </div>
        </div>
      </section>

      <section className="container home-story">
        <div className="home-story-image">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85"
            alt={ar ? "صديقتان تستمتعان باختيار إطلالتهما" : "Friends enjoying a day out in their favourite looks"}
            loading="lazy"
          />
          <span className="home-story-image-note">{ar ? "خليك على طبيعتك" : "A little more you"}</span>
        </div>
        <div className="home-story-copy">
          <p className="home-eyebrow">{copy.storyEyebrow}</p>
          <h2>{copy.storyHeading}</h2>
          <p>{copy.storyText}</p>
          <Link to="/products" className="home-button">{copy.storyButton}<span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="home-testimonials" aria-label={copy.testimonialHeading}>
        <div className="container">
          <div className="home-testimonial-heading">
            <p className="home-eyebrow">{copy.testimonialEyebrow}</p>
            <h2>{copy.testimonialHeading}</h2>
          </div>
          <div className="home-quote-card" aria-live="polite">
            <span className="home-quote-mark" aria-hidden="true">“</span>
            <p className="home-quote-label">{copy.quoteLabel}</p>
            <blockquote>{quotes[slide].quote}</blockquote>
            <div className="home-quote-author">
              <span className="home-quote-avatar">{quotes[slide].name.slice(0, 1)}</span>
              <span><strong>{quotes[slide].name}</strong><small>{quotes[slide].detail}</small></span>
            </div>
            <div className="home-carousel-controls">
              <button type="button" onClick={() => changeSlide(-1)} aria-label={ar ? "التقييم السابق" : "Previous testimonial"}>←</button>
              <span>{String(slide + 1).padStart(2, "0")} <i /> {String(quotes.length).padStart(2, "0")}</span>
              <button type="button" onClick={() => changeSlide(1)} aria-label={ar ? "التقييم التالي" : "Next testimonial"}>→</button>
            </div>
          </div>
        </div>
      </section>

      <section className="home-newsletter" aria-labelledby="newsletter-heading">
        <div className="container home-newsletter-inner">
          <div>
            <p className="home-eyebrow">{copy.newsletterEyebrow}</p>
            <h2 id="newsletter-heading">{copy.newsletterHeading}</h2>
            <p>{copy.newsletterText}</p>
          </div>
          <form className="home-newsletter-form" onSubmit={handleNewsletterSubmit}>
            <label className="visually-hidden" htmlFor="newsletter-email">{copy.emailPlaceholder}</label>
            <input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              placeholder={copy.emailPlaceholder}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setNewsletterMessage("");
              }}
              required
            />
            <button type="submit">{copy.subscribe}<span aria-hidden="true">↗</span></button>
            {newsletterMessage && <p className="home-newsletter-success" role="status">{newsletterMessage}</p>}
          </form>
        </div>
      </section>

      <button
        className={`home-back-to-top${showBackToTop ? " is-visible" : ""}`}
        type="button"
        aria-label={copy.backToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        tabIndex={showBackToTop ? 0 : -1}
      >
        ↑
      </button>
    </main>
  );
};

export default Home;
