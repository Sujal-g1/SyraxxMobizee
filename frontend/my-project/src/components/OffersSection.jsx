import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import offer1 from "../assets/offer1.png";
import offer2 from "../assets/offer2.png";
import offer3 from "../assets/offer3.png";
import offer4 from "../assets/offer4.png";

gsap.registerPlugin(ScrollTrigger);

const offers = [
  {
    img: offer1,
    title: "Save up to Rs 100 on bus tickets",
    validity: "Valid till 01 Oct",
    code: "BUS500",
  },
  {
    img: offer2,
    title: "Save up to Rs 250 on bus tickets",
    validity: "Valid till 30 Sep",
    code: "BUS250",
  },
  {
    img: offer3,
    title: "Save up to Rs 300 on bus tickets",
    validity: "Valid till 30 Sep",
    code: "BUS300",
  },
  {
    img: offer4,
    title: "Save up to Rs 500 with ICICI Bank Cards",
    validity: "Valid till 09 Oct",
    code: "ICICI500",
  },
];

const OffersSection = () => {
  const { t } = useTranslation();
  const [showAllMobile, setShowAllMobile] = useState(false);

  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  // On mobile: show 2 or all
  const visibleOffers = showAllMobile ? offers : offers.slice(0, 2);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Whole section fade + lift with scroll
      gsap.from(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top center",
          scrub: 1,
        },
        opacity: 0,
        y: 80,
        ease: "none",
      });

      // Cards stagger up with scroll
      gsap.from(cardsRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top center",
          scrub: 1,
        },
        opacity: 0,
        y: 60,
        stagger: 0.08,
        ease: "none",
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full py-16 px-4 md:px-8 bg-white"
    >
      {/* Section Title */}
      <h1
        className="text-3xl md:text-5xl flex justify-center font-bold mb-12
        relative after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-full
        after:bg-gradient-to-r after:from-orange-500 after:via-white after:to-green-500
        after:scale-x-0 after:origin-left hover:after:scale-x-100
        after:transition-transform after:duration-300"
      >
        {t("Offers")}
      </h1>

      {/* Desktop / Tablet Grid (shows all) */}
      <div className="hidden sm:grid max-w-7xl mx-auto grid-cols-2 lg:grid-cols-4 gap-8">
        {offers.map((offer, idx) => (
          <OfferCard
            key={idx}
            offer={offer}
            refCallback={(el) => (cardsRef.current[idx] = el)}
          />
        ))}
      </div>

      {/* Mobile Grid (shows 2 or all with Load More) */}
      <div className="grid sm:hidden max-w-7xl mx-auto grid-cols-1 gap-6">
        {visibleOffers.map((offer, idx) => (
          <OfferCard
            key={idx}
            offer={offer}
            refCallback={(el) => (cardsRef.current[idx] = el)}
          />
        ))}

        {/* Load More Button (Only on Mobile) */}
        {!showAllMobile && offers.length > 2 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowAllMobile(true)}
              className="px-8 py-2 rounded-full border border-gray-300
                         text-sm font-medium text-gray-700
                         hover:bg-gray-100 transition-colors duration-200"
            >
              Load More Offers
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const OfferCard = ({ offer, refCallback }) => {
  return (
    <div
      ref={refCallback}
      className="group relative rounded-2xl overflow-hidden
                 bg-white border border-gray-100 shadow-sm
                 hover:shadow-xl hover:-translate-y-1
                 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-[160px] overflow-hidden">
        <img
          src={offer.img}
          alt={offer.title}
          className="w-full h-full object-cover
                     group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col gap-3">
        <h3 className="font-semibold text-gray-900 leading-snug">
          {offer.title}
        </h3>

        <p className="text-sm text-gray-500">
          {offer.validity}
        </p>

        <div className="mt-4 inline-flex items-center justify-center
                        px-4 py-1.5 rounded-full text-sm font-semibold
                        bg-gray-100 text-gray-800
                        border border-dashed border-gray-300
                        self-start">
          {offer.code}
        </div>
      </div>

      {/* Tricolor Border on Hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl
                   opacity-0 group-hover:opacity-100
                   transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(90deg, #ff9933, #ffffff, #138808)",
          padding: "1px",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
    </div>
  );
};

export default OffersSection;
