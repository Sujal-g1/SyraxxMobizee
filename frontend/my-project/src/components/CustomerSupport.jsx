import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const CustomerSupport = () => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const features = [
    { title: "Free Cancellation", key: "Free_Cancel" },
    { title: "Flexi Ticket", key: "Free_Cancel" },
    { title: "Earn Rewards", key: "Free_Cancel" },
    { title: "Booking for Women", key: "Free_Cancel" },
    { title: "Primo Services", key: "Free_Cancel" },
    { title: "24/7 Customer Support", key: "Free_Cancel" },
    { title: "Instant Refund", key: "Free_Cancel" },
    { title: "Live Bus Tracking", key: "Free_Cancel" },
  ];

  const visibleFeatures = showAll ? features : features.slice(0, 4);


  return (
    <section className="w-full py-16 px-4 md:px-8 bg-white">
      {/* Section Title */}
      <h1
        className="text-3xl md:text-5xl flex justify-center font-bold mb-12
        relative after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-full
        after:bg-gradient-to-r after:from-orange-500 after:via-white after:to-green-500
        after:scale-x-0 after:origin-left hover:after:scale-x-100
        after:transition-transform after:duration-300"
      >
        {t("Customer_Support")}
      </h1>

      <div className="max-w-6xl mx-auto">

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleFeatures.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-3 p-6 rounded-2xl
                         bg-gray-50 border border-gray-100
                         hover:shadow-md hover:bg-gray-100
                         transition-all duration-300"
            >
              {/* Icon Circle */}
              <div className="w-10 h-10 flex items-center justify-center
                              rounded-full bg-green-100 text-green-600 font-bold">
                ✓
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 text-lg">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600">
                {t(item.key)}
              </p>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {features.length > 4 && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="px-8 py-2 rounded-full border border-gray-300
                         text-sm font-medium text-gray-700
                         hover:bg-gray-100 transition-colors duration-200"
            >
              {showAll ? "Show Less" : "Load More"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomerSupport;