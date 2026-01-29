import React from 'react'
import { useNavigate } from "react-router-dom";
import algomaniaX from '../assets/bus2.svg'
import firstpage2_blur from '../assets/firstpage2_blur.png'

import { ArrowRight } from 'lucide-react';

const Start = () => {
  const navigate = useNavigate();

 const handleContinue = () => {
  const token = localStorage.getItem("token");

  if (token) {
    navigate("/homepage");
  } else {
    navigate("/login");
  }
};


  return (
    <div className="min-h-screen w-full">
      {/* Background */}
      <div
        className="min-h-screen w-full flex flex-col justify-between bg-cover bg-center"
        style={{ backgroundImage: `url(${firstpage2_blur})` }}
      >

        {/* Logo Section */}
        <div className="w-full flex flex-col items-center mt-18 sm:mt-10 animate-bounceUp px-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white/40 shadow-lg">
            <img
              className="w-[180px] sm:w-[220px] md:w-[280px] lg:w-[300px] max-w-full"
              src={algomaniaX}
              alt="logo"
            />
          </div>

          <h1 className="mt-4 sm:mt-6 text-center text-3xl sm:text-4xl md:text-5xl font-extrabold text-black">
            Mobizee
          </h1>
        </div>

        {/* Continue Button */}
        <div className="w-full flex justify-center  mb-45 md:mb-20 spx-4">
          <button
            onClick={handleContinue}
            className="flex items-center justify-center 
                       py-3 sm:py-4 md:py-5 
                       px-6 sm:px-8 md:px-10 
                       w-full max-w-xs sm:max-w-sm md:max-w-md 
                       bg-white rounded-full text-black 
                       text-xl sm:text-2xl md:text-3xl 
                       font-bold animate-bounceUp 
                       transition hover:scale-105"
          >
            Continue
          <ArrowRight className='w-15 h-10 font-bold'/>
          </button>
        </div>

      </div>
    </div>
  )
}

export default Start;
