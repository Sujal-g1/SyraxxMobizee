import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import green_points from "../assets/green_points.png";

gsap.registerPlugin(ScrollTrigger);

const GreenPointsSection = () => {
  const { t } = useTranslation();

  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const imageTopRef = useRef(null);
  const imageBottomRef = useRef(null);

  const [showAll, setShowAll] = useState(false);

  const benefits = [
    "Daily_Streaks",
    "Ticket_Redemption",
    "Exclusive_Vouchers",
    "Milestone_Rewards",
    "Eco_Bonus",
    "Green_Donations",
    "Referral_Rewards",
    "Leaderboard",
    "Lucky_Draws",
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Whole section - fade + lift with scroll
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

      // Left white card - parallax from left
      gsap.from(cardRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top center",
          scrub: 1,
        },
        x: -120,
        opacity: 0,
        ease: "none",
      });

      // Top image - parallax from right
      gsap.from(imageTopRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top center",
          scrub: 1,
        },
        x: 120,
        opacity: 0,
        ease: "none",
      });

      // Bottom image - parallax from right (slightly offset)
      gsap.from(imageBottomRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top center",
          scrub: 1,
        },
        x: 160,
        opacity: 0,
        ease: "none",
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Section Title */}
      <h1
        className="text-3xl md:text-5xl flex justify-center font-bold mb-12 mt-16
        relative after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-full
        after:bg-gradient-to-r after:from-orange-500 after:via-white after:to-green-500
        after:scale-x-0 after:origin-left hover:after:scale-x-100
        after:transition-transform after:duration-300"
      >
        {t("green_points")}
      </h1>

      <section
        ref={sectionRef}
        className="w-full py-16 px-4 md:px-6 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[45%_55%] gap-12 items-stretch">

          {/* Left Feature Card */}
          <div className="w-full flex items-stretch justify-center">
            <div
              ref={cardRef}
              className="w-full bg-white rounded-2xl shadow-lg p-10
                         border border-gray-100
                         transition-shadow duration-300
                         hover:shadow-xl flex flex-col"
            >
              {/* Label */}
              <p className="text-sm font-semibold tracking-wide text-green-600 mb-2">
                ECO REWARDS
              </p>

              {/* Heading */}
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {t("Carbon")}
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-8 max-w-md">
                Earn rewards every time you travel green. Redeem points for tickets,
                vouchers and exclusive benefits.
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(showAll ? benefits : benefits.slice(0, 4)).map((key, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg
                               bg-gray-50 hover:bg-gray-100
                               transition-colors duration-200"
                  >
                    <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
                    <span className="text-gray-800 font-medium">
                      {t(key)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Load More — MOBILE ONLY */}
              <div className="mt-8 flex justify-center md:hidden">
                <button
                  onClick={() => setShowAll((prev) => !prev)}
                  className="px-6 py-2 rounded-full border border-gray-300
                             text-sm font-medium text-gray-700
                             hover:bg-gray-100 transition-colors duration-200"
                >
                  {showAll ? "Show Less" : "Load More"}
                </button>
              </div>

            </div>
          </div>

          {/* Right Image Column — matches left height */}
          <div className="w-full h-full grid grid-rows-2 gap-6">

            {/* Top Image */}
            <div
              ref={imageTopRef}
              className="relative bg-[#B7E1E2] rounded-2xl overflow-hidden w-full h-full"
            >
              <img
                src={green_points}
                alt="Green Points 1"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Bottom Image */}
            <div
              ref={imageBottomRef}
              className="relative bg-[#B7E1E2] rounded-2xl overflow-hidden w-full h-full"
            >
              <img
                src={green_points}
                alt="Green Points 2"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default GreenPointsSection;
