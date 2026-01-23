// src/App.jsx
import React ,{ useState ,useEffect , useRef} from "react";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import homepage_right from "../assets/homepage_right.png";
import long_route from "../assets/long_route.png";
import green_points from "../assets/green_points.png"
import offer1 from "../assets/offer1.png"
import offer2 from "../assets/offer2.png"
import offer3 from "../assets/offer3.png"
import offer4 from "../assets/offer4.png"
import ticket from "../assets/ticket.png"
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";     // for language change
import Navbar from "./Navbar";
import gsap from "gsap";
import { motion } from 'framer-motion'

import HeaderText from "./HeaderText";


function Homepage({user}) {

    // const [isScrolled, setIsScrolled] = useState(false); 
  const navigate = useNavigate();

useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 10);
  };

  window.addEventListener("scroll", handleScroll);

  // cleanup must be a function
  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

const handleClick = (e) =>{
    e.preventDefault();
    navigate("/Wallet");
  }

// This prevents: ❌ Unauthenticated access
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
  }
}, []);


// mobMagic Card

const navigateToNfcCard = () => {
  navigate("/nfcCard"); // path to your NFC card page
};


    // live location code 

  const [locationName, setLocationName] = useState("Fetching...");

// Route input state
const [startPoint, setStartPoint] = useState(""); // stays empty at first
const [endPoint, setEndPoint] = useState("");

// Suggestions state
const [startSuggestions, setStartSuggestions] = useState([]);
const [endSuggestions, setEndSuggestions] = useState([]);
const [showStartSuggestions, setShowStartSuggestions] = useState(false);
const [showEndSuggestions, setShowEndSuggestions] = useState(false);

useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.address) {
            const city =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.state ||
              "Unknown";
            const country = data.address.country_code?.toUpperCase() || "";
            const fullLocation = `${city}, ${country}`;

            setLocationName(fullLocation);

            // default start point only if user hasn’t typed
            setStartPoint((prev) => (prev ? prev : fullLocation));
          } else {
            setLocationName("Unknown location");
          }
        } catch (err) {
          console.error("Reverse geocode failed:", err);
          setLocationName("Location error");
        }
      },
      (err) => {
        console.warn("GPS error:", err);
        setLocationName("Location unavailable");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
    );
  } else {
    setLocationName("Geolocation not supported");
  }
}, []);

// Debounce helper
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Fetch suggestions from OpenStreetMap
const fetchSuggestions = async (query, setSuggestions, setShow) => {
  if (!query) {
    setSuggestions([]);
    setShow(false);
    return;
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=5&countrycodes=in`
    );
    const data = await res.json();
    setSuggestions(data);
    setShow(data.length > 0);
  } catch (err) {
    console.error("Failed to fetch suggestions", err);
    setSuggestions([]);
    setShow(false);
  }
};

// Debounced versions
const debouncedStartFetch = React.useMemo(
  () =>
    debounce((q) =>
      fetchSuggestions(q, setStartSuggestions, setShowStartSuggestions), 300),
  []
);
const debouncedEndFetch = React.useMemo(
  () =>
    debounce((q) =>
      fetchSuggestions(q, setEndSuggestions, setShowEndSuggestions), 300),
  []
);

// Trigger API on input change
useEffect(() => {
  debouncedStartFetch(startPoint);
}, [startPoint, debouncedStartFetch]);

useEffect(() => {
  debouncedEndFetch(endPoint);
}, [endPoint, debouncedEndFetch]);

// // Handle selection
// const handleSelectStart = (placeName) => {
//   setStartPoint(placeName);
//   setShowStartSuggestions(false);
// };
// const handleSelectEnd = (placeName) => {
//   setEndPoint(placeName);
//   setShowEndSuggestions(false);
// };

const normalizePlaceName = (displayName) => {
  // Take only the first part before comma
  return displayName.split(",")[0].trim();
};

const handleSelectStart = (placeName) => {
  const clean = normalizePlaceName(placeName);
  setStartPoint(clean);
  setShowStartSuggestions(false);
};

const handleSelectEnd = (placeName) => {
  const clean = normalizePlaceName(placeName);
  setEndPoint(clean);
  setShowEndSuggestions(false);
};


// Handle form submit
const handleSearch = (e) => {
  e.preventDefault();
  if (startPoint && endPoint) {
    navigate(
      `/live?start=${encodeURIComponent(startPoint)}&end=${encodeURIComponent(
        endPoint
      )}`
    );
  }
};




// --------------- green points -----------------

const [greenPoints, setGreenPoints] = useState(0);

useEffect(() => {
  const storedPoints = localStorage.getItem("greenPoints");
  if (storedPoints) {
    setGreenPoints(Number(storedPoints));
  }
}, []);


//  ------------------ multi language -----------------

const { t, i18n } = useTranslation();
const [showLangOptions, setShowLangOptions] = useState(false);

// ----------- see buses --------------
const handleSeeBuses = async () => {
  if (!startPoint || !endPoint) return;
  navigate(
    `/businfo?from=${encodeURIComponent(startPoint)}&to=${encodeURIComponent(endPoint)}`
  );
};

// ----------- see route --------------
const handleSeeRoute = () => {
  if (!startPoint || !endPoint) return;
  navigate(
    `/live?start=${encodeURIComponent(startPoint)}&end=${encodeURIComponent(endPoint)}`
  );
};


 const handleBookNow = () => {
    navigate("/reserve"); // navigate to Reserve.jsx
  };
  

 

// wallet

const [showWallet, setShowWallet] = useState(false);

const handleWalletClick = () => {
    navigate("/wallet");
};



  return (
    <div >
    {/* Navbar */}
    <Navbar user={user}/>



      {/* Hero Section */}

      <section className="flex flex-col md:flex-row items-center justify-between p-10">

        

        {/* Left side - form */}
        <div className="w-full md:w-1/2 space-y-6">

       {/* MobMagic Card button - moved above heading */}
             <div className="hidden md:flex justify-start md:justify-start">
             <button
              onClick={navigateToNfcCard}
              className="bg-gray-900 text-white px-6 py-3 text-xl hover:bg-black
              rounded-lg w-full md:w-[350px] text-center">
               <span className="  relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full
              after:bg-gradient-to-r after:from-orange-500 after:via-white after:to-green-500
              after:scale-x-0 after:origin-left hover:after:scale-x-100
              after:transition-transform after:duration-300"> 
              enable your <span className="font-semibold ">MobMagic Card</span></span>
               </button>
               </div>  

        <div className="overflow-hidden">
      <motion.h1
        className="text-xl  text-center md:text-left md:text-4xl font-bold"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{
          delay:0.2,
          duration:1.5,
          ease: [0.16, 1, 0.3, 1],}}>
        {t("welcome")}
      </motion.h1>
    </div>


      <form className="space-y-4" onSubmit={handleSearch}>

       {/* Start City */}
<div className="relative">
  <div className="flex items-center border p-3 rounded-lg hover:border-2">
    <MapPin className="mr-2 text-gray-500" />
    <input
      type="text"
      placeholder="Your City"
      value={startPoint}
      onChange={(e) => setStartPoint(e.target.value)}
      className="w-full outline-none"
    />
  </div>

  {showStartSuggestions && (
    <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md max-h-40 overflow-y-auto">
      {startSuggestions.map((place, idx) => (
        <li
          key={idx}
          onClick={() => handleSelectStart(place.display_name)}
          className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
        >
          {place.display_name}
        </li>
      ))}
    </ul>
  )}
</div>

{/* Destination */}
<div className="relative">
  <div className="flex items-center border p-3 rounded-lg hover:border-2 mt-3">
    <MapPin className="mr-2 text-gray-500" />
    <input
      type="text"
      placeholder="Destination"
      value={endPoint}
      onChange={(e) => setEndPoint(e.target.value)}
      className="w-full outline-none"
    />
  </div>

  {showEndSuggestions && (
    <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md max-h-40 overflow-y-auto">
      {endSuggestions.map((place, idx) => (
        <li
          key={idx}
          onClick={() => handleSelectEnd(place.display_name)}
          className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
        >
          {place.display_name}
        </li>
      ))}
    </ul>
  )}
</div>

  

 {/* date and route */}
<div className="flex gap-4 w-full max-w-[600px]">

  <div className="flex items-center border px-4 py-2 md:px-5 md:py-2 rounded-lg flex-1 w-[40%]">
    <Calendar className="mr-2 text-gray-500" />
    <input type="date" className="w-full outline-none" />
  </div>

<button
  type="button"
  onClick={handleSeeRoute}
  className="bg-black text-white rounded-lg w-[30%] text-sm md:text-lg">
  {t("see_route")}
</button>


   <button
  onClick={handleSeeBuses}
  className="bg-black text-white text-sm md:text-lg rounded-lg w-[30%]">
  {t("see_buses")}
</button>

</div>

 

</form>

        </div>



        {/* Right side - illustration */}
        <motion.div 
        initial={{y:80}}
        animate={{y:0}}
        transition={{
          duration:1.5,
          delay:0.2,ease: [0.16, 1, 0.3, 1],
          
        }}
        className="w-full md:w-1/2 flex justify-center mt-8 md:mt-0">
          <img
            src={homepage_right}
            alt="Car Illustration"
            className="w-full max-w-[600px] rounded-2xl"
          />
        </motion.div>
      </section>




      {/* offers section  */}

      {/* Offers Section */}
    <section className="mt-12  px-6">

   <h1 className="text-5xl flex justify-center font-semibold mb-10 mt-15 p-5
              relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full
              after:bg-gradient-to-r after:from-orange-500 after:via-white after:to-green-500
              after:scale-x-0 after:origin-left hover:after:scale-x-100
              after:transition-transform after:duration-300">{t("Offers")}</h1>

  {/* Offer Tabs */}

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Card 1 */}
  <div className="offer-card relative p-5 rounded-2xl overflow-hidden">
    {/* Background Image */}
    <div
      className="absolute inset-0 bg-cover bg-center opacity-20 -z-10">
        <img src={offer1}
        className="absolute inset-0 w-full h-full object-cover opacity-40 -z-10" />
    </div>

    <h3 className="mt-3 font-semibold">Save up to Rs 100 on bus tickets</h3>
    <p className="text-sm text-gray-600">Valid till 01 Oct</p>
    <div className="mt-4 text-sm font-medium bg-white px-3 py-1 rounded-lg inline-block">
      BUS500
    </div>
  </div>

  {/* Card 2 */}
  <div className="offer-card relative p-5 rounded-2xl overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center opacity-20 -z-10">
        <img src={offer2}
        className="absolute inset-0 w-full h-full object-cover opacity-40 -z-10" />
      </div>

    <h3 className="mt-3 font-semibold">Save up to Rs 250 on bus tickets</h3>
    <p className="text-sm text-gray-600">Valid till 30 Sep</p>
    <div className="mt-4 text-sm font-medium bg-white px-3 py-1 rounded-lg inline-block">
      BUS250
    </div>
  </div>

  {/* Card 3 */}
  <div className="offer-card relative p-5 rounded-2xl  overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center opacity-20 -z-10">
        <img src={offer3} 
        className="absolute inset-0 w-full h-full object-cover opacity-40 -z-10"/>
      </div>

    <h3 className="mt-3 font-semibold">Save up to Rs 300 on bus tickets</h3>
    <p className="text-sm text-gray-600">Valid till 30 Sep</p>
    <div className="mt-4 text-sm font-medium bg-white px-3 py-1 rounded-lg inline-block">
      BUS300
    </div>
  </div>

  {/* Card 4 */}
  <div className="offer-card relative p-5 rounded-2xl overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center opacity-20 -z-10">
        <img src={offer4}
        className="absolute inset-0 w-full h-full object-cover opacity-40 -z-10" />
      </div>

    <h3 className="mt-3 font-semibold">Save up to Rs 500 with ICICI Bank Cards</h3>
    <p className="text-sm text-gray-600">Valid till 09 Oct</p>
    <div className="mt-4 text-sm font-medium bg-white px-3 py-1 rounded-lg inline-block">
      ICICI500
    </div>
  </div>
</div>


</section>


{/* booking for mass / family trip for longer routes in premium gov buses */}

      <h1 className="text-5xl flex justify-center font-semibold mb-3 mt-15  p-5
              relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full
              after:bg-gradient-to-r after:from-orange-500 after:via-white after:to-green-500
              after:scale-x-0 after:origin-left hover:after:scale-x-100
              after:transition-transform after:duration-300">{t("Trip")} </h1>

<section className="w-full py-12 px-6  bg-gray-50">
  <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-[65%_35%] min-h-[420px] mx-auto gap-12 items-center">
    
    {/* Left Box (65%) */}
    <div className="relative bg-[#B7E1E2] rounded-xl overflow-hidden p-8 w-full h-full flex flex-col justify-end gap-6">
      {/* Background Image */}
      <img
        src={long_route} // replace with your image variable/path
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Content (keeps text area narrower so it feels centered) */}
      <div className="relative z-10 flex flex-col gap-6 text-white max-w-[85%]">
        <h2 className="text-3xl font-bold leading-tight">
          {t("Trip1")}
        </h2>

        <div>
          <div className="flex gap-2">
            {/* Date Input */}
            <div className="flex items-center border rounded-lg px-3 py-2 bg-white flex-1">
              <input type="date" className="w-full outline-none text-gray-700" />
            </div>

    
           
          </div>
        </div>

        {/* Button */}
        <button className="w-full md:w-1/2 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition">
          Next
        </button>
      </div>
    </div>

    {/* Right Box (35%) — centered vertically & horizontally in its column */}
    <div className="w-full h-full flex items-center justify-center ">
      <div className="w-full bg-white rounded-2xl shadow-md p-8 hover:shadow-xl transition flex flex-col justify-center tricolor-shadow">
        <h3 className="text-4xl font-bold text-gray-900 mb-4 ">✨  Benefits</h3>

        <ul className="space-y-4 text-gray-700">
          <li className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
            <span className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-lg">📅</span>
            <span>Choose your exact pickup time up to 15 days in advance.</span>
          </li>
          <li className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
            <span className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-full text-lg">⏰</span>
            <span>Extra wait time included to meet your ride.</span>
          </li>
          <li className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
            <span className="w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-lg">ℹ️</span>
            <span>Cancel at low charge up to 2 day in advance.</span>
          </li>
        </ul>

        <button
        className="inline-block mt-6 text-sm font-medium text-black rounded-full px-5 py-2 offer-card transition border-2"
        onClick={handleBookNow}
      >
        Book Now
      </button>
        
      </div>
    </div>

  </div>
</section>
              <div className="w-full flex flex-col md:flex-row gap-8 px-8 mt-5">

                {/* left section */}

              

          {/* right section */}
          
</div>


          {/* mobMagic card booking  */}

           <h1 className="text-5xl flex justify-center font-semibold mb-3 mt-15 
              relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full
              after:bg-gradient-to-r after:from-orange-500 after:via-white after:to-green-500
              after:scale-x-0 after:origin-left hover:after:scale-x-100
              after:transition-transform after:duration-300">{t("E-Tickets")} </h1>

<section className="w-full py-12 px-6  bg-gray-50">
  <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-[55%_45%] min-h-[420px] mx-auto gap-12 items-center">
    
    {/* Left Box (55%) */}
    <div className="relative bg-[#B7E1E2] rounded-xl overflow-hidden p-8 w-full h-full flex flex-col justify-end gap-6">
      {/* Background Image */}
      <img
        src={ticket} // replace with your image variable/path
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>

    {/* Right Box (45%) — centered vertically & horizontally in its column */}
    <div className="w-full h-full flex items-center justify-center ">
      <div className="w-full bg-white rounded-2xl shadow-md p-8 hover:shadow-xl transition flex flex-col justify-center tricolor-shadow">

        {/* <h3 className="text-4xl font-bold text-gray-900 mb-4 ">{t("Carbon")}</h3> */}

        <ul className="space-y-4 text-gray-700">

       
          <li className="flex items-center rounded-lg hover:bg-gray-50 ">
            {/* <span className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-lg"></span> */}
            <span>{t("Select")}</span>
          </li>
          <li className="flex items-center rounded-lg hover:bg-gray-50 ">
            {/* <span className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-lg"></span> */}
            <span>{t("Journey")}</span>
          </li>
          <li className="flex items-center rounded-lg hover:bg-gray-50 ">
            {/* <span className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-lg"></span> */}
            <span>{t("Payment")}</span>
          </li>
          <li className="flex items-center rounded-lg hover:bg-gray-50 ">
            {/* <span className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-lg"></span> */}
            <span>{t("online_ticket")}</span>
          </li>
          <li className="flex items-center rounded-lg hover:bg-gray-50 ">
            {/* <span className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-lg"></span> */}
            <span>{t("Ticket")}</span>
          </li>
          <li className="flex items-center rounded-lg hover:bg-gray-50 ">
            {/* <span className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-lg"></span> */}
            <span>{t("Check_in")}</span>
          </li>
          
        </ul>

      </div>
    </div>

  </div>
</section>

        {/* GREEN point benefits  */}

      <h1 className="text-5xl flex justify-center font-semibold mb-3 mt-15 
              relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full
              after:bg-gradient-to-r after:from-orange-500 after:via-white after:to-green-500
              after:scale-x-0 after:origin-left hover:after:scale-x-100
              after:transition-transform after:duration-300">{t("green_points")} </h1>

<section className="w-full py-12 px-6  bg-gray-50">
  <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-[45%_55%] min-h-[420px] mx-auto gap-12 items-center">
    

    {/* left Box (45%) — centered vertically & horizontally in its column */}
    <div className="w-full h-full flex items-center justify-center ">
      <div className="w-full bg-white rounded-2xl shadow-md p-8 hover:shadow-xl transition flex flex-col justify-center tricolor-shadow">
        <h3 className="text-4xl font-bold text-gray-900 mb-4 ">{t("Carbon")}</h3>

        <ul className=" text-gray-700">
          <li className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-200 ">
            <span>{t("Daily_Streaks")} </span>
          </li>

          <li className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-200 ">
            <span>{t("Ticket_Redemption")} </span>
          </li>

          <li className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-200 ">
            {/* <span className="w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-lg"></span> */}
            <span>{t("Exclusive_Vouchers")} </span>
          </li>
           <li className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-200 ">
            {/* <span className="w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-lg"></span> */}
            <span>{t("Milestone_Rewards")} </span>
          </li>
           <li className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-200 ">
            {/* <span className="w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-lg"></span> */}
            <span>{t("Eco_Bonus")} </span>
          </li>

            <li className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-200 ">
            {/* <span className="w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-lg"></span> */}
            <span>{t("Green_Donations")} </span>
          </li>
            <li className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-200 ">
            {/* <span className="w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-lg"></span> */}
            <span>{t("Referral_Rewards")} </span>
          </li>
            <li className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-200 ">
            {/* <span className="w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-lg"></span> */}
            <span>{t("Leaderboard")} </span>
          </li>
            <li className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-200 ">
            {/* <span className="w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-lg"></span> */}
            <span>{t("Lucky_Draws")} </span>
          </li>
        </ul>

      </div>
    </div>

     {/* right Box (55%) */}
    <div className="relative bg-[#B7E1E2] rounded-xl overflow-hidden p-8 w-full h-full flex flex-col justify-end gap-6">
      {/* Background Image */}
      <img
        src={green_points} // replace with your image variable/path
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>

  </div>
</section>

<div className="w-full">
                <h1 className="text-4xl flex  font-semibold mb-4 mt-5 ml-8
              relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full
              after:bg-gradient-to-r after:from-orange-500 after:via-white after:to-green-500
              after:scale-x-0 after:origin-left hover:after:scale-x-100
              after:transition-transform after:duration-300">{t("Customer_Support")}</h1>

     <div className="mb-12 ml-8">
  <ul className="list-disc space-y-2 text-gray-700">
    <li>
      <span className="font-semibold">Free Cancellation :</span> {t("Free_Cancel")}
    </li>
    <li>
      <span className="font-semibold">Flexi Ticket :</span>  {t("Free_Cancel")}
    </li>
    <li>
      <span className="font-semibold">Earn Rewards :</span> {t("Free_Cancel")}
    </li>
    <li>
      <span className="font-semibold">Booking for Women :</span> {t("Free_Cancel")}
    </li>
    <li>
      <span className="font-semibold">Primo Services :</span> {t("Free_Cancel")}
    </li>
    <li>
      <span className="font-semibold">24/7 Customer Support :</span>{t("Free_Cancel")}
    </li>
    <li>
      <span className="font-semibold">Instant Refund :</span> {t("Free_Cancel")}
    </li>
    <li>
      <span className="font-semibold">Live Bus Tracking :</span>  {t("Free_Cancel")}
    </li>
  </ul>
</div>
</div>


      {/* footer Section */}
       
   <footer className="bg-white text-gray-700">
  {/* Company Name */}
  <div className="max-w-7xl mx-auto px-6 pt-10">
    <h2 className="text-2xl font-bold text-gray-900">Mobizee</h2>
  </div>

  {/* Footer Links Section */}
  <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
    {/* Column 1 */}
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">Useful Links</h3>
      <ul className="space-y-2 text-sm">
        <li><a href="#">About Us</a></li>
        <li><a href="#">Contact Us</a></li>
        <li><a href="#">FAQs</a></li>
        <li><a href="#">Terms of Service</a></li>
        <li><a href="#">Privacy Policy</a></li>
      </ul>
    </div>

    {/* Column 2 */}
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">Careers</h3>
      <ul className="space-y-2 text-sm">
        <li><a href="#">Blog</a></li>
        <li><a href="#">Press</a></li>
        <li><a href="#">Partnerships</a></li>
        <li><a href="#">Support</a></li>
        <li><a href="#">Help Center</a></li>
      </ul>
    </div>

    {/* Column 3 */}
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
      <ul className="space-y-2 text-sm">
        <li><a href="#">Events</a></li>
        <li><a href="#">Community</a></li>
        <li><a href="#">Social Media</a></li>
        <li><a href="#">Newsletter</a></li>
        <li><a href="#">Subscribe</a></li>
      </ul>
    </div>

    {/* Column 4 - Subscribe */}
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">Subscribe</h3>
      <p className="text-sm mb-4">Join our community to receive updates</p>
      <div className="flex">
        <input
          type="email"
          placeholder="Enter your email"
          className="px-4 py-2 w-full rounded-l-full border border-gray-300 focus:outline-none"
        />
        <button className="bg-black text-white px-5 py-2 rounded-r-full">
          Subscribe
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        By subscribing, you agree to our Privacy Policy
      </p>
    </div>
  </div>

  {/* Copyright Section */}
  <div className="border-t border-gray-200 text-center py-6">
    <p className="text-sm text-gray-500">
      © {new Date().getFullYear()} created by team AlgoManiaX
    </p>
  </div>
</footer>



    </div>
  );
}

export default Homepage;
