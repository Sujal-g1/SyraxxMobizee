import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ticket from "../assets/ticket.png";

gsap.registerPlugin(ScrollTrigger);

const ETicketsSection = () => {
  const { t } = useTranslation();

  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const rightBoxRef = useRef(null);
  const stepsRef = useRef([]);

  const steps = [
    t("Select"),
    t("Journey"),
    t("Payment"),
    t("online_ticket"),
    t("Ticket"),
    t("Check_in"),
  ];

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

      // Left image - parallax from left
      gsap.from(imageRef.current, {
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

      // Right white box - parallax from right
      gsap.from(rightBoxRef.current, {
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
    <section
      ref={sectionRef}
      className="w-full py-16 px-4 md:px-6 bg-gray-50"
    >
      {/* Section Title */}
      <h1
        className="text-3xl md:text-5xl flex justify-center font-bold mb-10
        relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full
        after:bg-gradient-to-r after:from-orange-500 after:via-white after:to-green-500
        after:scale-x-0 after:origin-left hover:after:scale-x-100
        after:transition-transform after:duration-300"
      >
        {t("E-Tickets")}
      </h1>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[55%_45%] gap-12 items-center">

        {/* Left Image Box */}
        <div
          ref={imageRef}
          className="relative bg-[#B7E1E2] rounded-2xl overflow-hidden p-8 w-full h-[320px] md:h-[420px]"
        >
          <img
            src={ticket}
            alt="E-Ticket"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Right Steps Box */}
        <div
          ref={rightBoxRef}
          className="w-full h-full flex items-center justify-center"
        >
          {/* Outer wrapper for animated tricolor border */}
          <div className="relative group w-full rounded-2xl p-[2px]">

            {/* Tricolor border layer */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl
                         bg-gradient-to-r from-orange-500 via-white to-green-500
                         opacity-0 group-hover:opacity-100
                         transition-opacity duration-300"
            />

            {/* Actual white content box */}
            <div
              className="relative w-full bg-white rounded-2xl shadow-lg p-8
                         border border-gray-100
                         transition-shadow duration-300
                         group-hover:shadow-xl"
            >
              <ul className="space-y-4 text-gray-700">
                {steps.map((step, idx) => (
                  <li
                    key={idx}
                    ref={(el) => (stepsRef.current[idx] = el)}
                    className="flex items-center gap-4 p-3 rounded-lg
                               hover:bg-gray-50 transition-colors duration-200"
                  >
                    {/* Step Number */}
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-full
                                 bg-gray-100 text-gray-700 font-semibold text-sm"
                    >
                      {idx + 1}
                    </div>

                    <span className="text-base md:text-lg font-medium">
                      {step}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ETicketsSection;
