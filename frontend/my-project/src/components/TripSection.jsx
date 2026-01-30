import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import long_route from "../assets/long_route.png";

gsap.registerPlugin(ScrollTrigger);

const TripSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sectionRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const handleBookNow = () => {
    navigate("/reserve");
  };

  useEffect(() => {
  const ctx = gsap.context(() => {

    // Whole section - fade + move up with scroll
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

    // Left image block - parallax from left
    gsap.from(leftRef.current, {
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

    // Right benefits card - parallax from right
    gsap.from(rightRef.current, {
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
        {t("Trip")}
      </h1>

      <section
        ref={sectionRef}
        className="w-full py-16 px-4 md:px-6 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[60%_40%] gap-12 items-stretch">

          {/* Left Visual Booking Block */}
          <div
            ref={leftRef}
            className="relative rounded-3xl overflow-hidden
                       w-full min-h-[380px] flex flex-col justify-end"
          >
            {/* Background Image */}
            <img
              src={long_route}
              alt="Long Route Trip"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Content */}
            <div className="relative z-10 p-8 md:p-10 text-white max-w-xl flex flex-col gap-6">
              <p className="text-sm font-semibold tracking-wide text-green-300">
                PREMIUM GOVERNMENT BUSES
              </p>

              <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                {t("Trip1")}
              </h2>

              {/* Date Input */}
              <div className="flex gap-3 items-center">
                <div className="flex items-center bg-white rounded-lg px-4 py-2 w-full max-w-xs">
                  <input
                    type="date"
                    className="w-full outline-none text-gray-700 text-sm"
                  />
                </div>
              </div>

              {/* Primary CTA */}
              <button
              onClick={handleBookNow}
                className="mt-2 w-full sm:w-1/2 bg-white text-black py-3 rounded-lg
                           font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>

          {/* Right Benefits Card with Hover Tricolor Border */}
          <div
            ref={rightRef}
            className="w-full h-full flex items-center justify-center"
          >
            <div className="group relative w-full rounded-3xl">

              {/* Hover Tricolor Border Layer */}
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl
                           opacity-0 group-hover:opacity-100
                           transition-opacity duration-300"
                style={{
                  background: "linear-gradient(90deg, #ff9933, #ffffff, #138808)",
                  padding: "1.5px",
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />

              {/* Actual White Card */}
              <div
                className="relative w-full bg-white rounded-3xl shadow-lg p-10
                           transition-all duration-300
                           group-hover:shadow-xl"
              >
                {/* Heading */}
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  ✨ Benefits
                </h3>

                {/* Benefits List */}
                <ul className="space-y-5 text-gray-700">
                  <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                    <span className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-lg">
                      📅
                    </span>
                    <span className="leading-relaxed">
                      Choose your exact pickup time up to 15 days in advance.
                    </span>
                  </li>

                  <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                    <span className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-full text-lg">
                      ⏰
                    </span>
                    <span className="leading-relaxed">
                      Extra wait time included to meet your ride.
                    </span>
                  </li>

                  <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                    <span className="w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-lg">
                      ℹ️
                    </span>
                    <span className="leading-relaxed">
                      Cancel at low charge up to 2 days in advance.
                    </span>
                  </li>
                </ul>

                {/* Secondary CTA */}
                <button
                  onClick={handleBookNow}
                  className="mt-8 w-full inline-flex justify-center
                             rounded-full px-6 py-3 text-sm font-semibold
                             border border-gray-300 text-gray-900
                             hover:bg-gray-100 transition-colors duration-200"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default TripSection;
