import React ,{ useState ,useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { FaWallet } from "react-icons/fa6";
import { MdStars } from "react-icons/md";
import { MdLocationOn } from "react-icons/md";
import { GrLanguage } from "react-icons/gr";
import { GoAlertFill } from "react-icons/go";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";
import Wallet from "../pages/Wallet.jsx";
import { useTranslation } from "react-i18next";     // for language change
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion'
import ThemeToggle from "../pages/ThemeToggle.jsx";
import { FiLogOut } from "react-icons/fi";


const Navbar = ({user}) => {

    const navigate = useNavigate();

    const [showUserMenu, setShowUserMenu] = useState(false);

const handleLogout = () => {
  // clear auth/session storage
  localStorage.removeItem("user");
  localStorage.removeItem("token");

  setShowUserMenu(false);
  setIsMenuOpen(false);

  navigate("/"); 
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

  const handlePanic = () => {
  navigate("/panic"); // Assuming "/panic" is the route for PanicButton.jsx
};

// wallet

const [showWallet, setShowWallet] = useState(false);

const handleWalletClick = () => {
    navigate("/wallet");
};

const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
    {/* Navbar */}
        <motion.nav className="fixed top-0 left-0 w-full px-6 max-w-full overflow-x-hidden md:px-10 py-4 flex items-center bg-black text-white justify-between z-50 shadow-lg"
         initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{
          delay:0.5,
          duration: 1.8,
          ease: [0.16, 1, 0.3, 1], 
        }}>
               
    
        <div className="flex items-center gap-3 max-w-[70%] overflow-hidden">
            <h1 
            onClick={()=> navigate("/Homepage")}
            className="text-xl md:text-2xl font-semibold tracking-wide">Mobizee</h1> 

         <div className="flex items-center gap-2  md:ml-7">
        {/* location */}
         <div className=" flex items-center gap-1 text-white text-sm md:text-base
            relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full
                 after:bg-gradient-to-r after:from-orange-500 after:via-white after:to-green-500
                 after:scale-x-0 after:origin-left hover:after:scale-x-100
                 after:transition-transform after:duration-300">
         <MdLocationOn className="text-orange-500 w-5 h-5 flex-shrink-0"/> 
         <span className="truncate">{locationName}</span>      {/* Live location  */}
        </div>
    
         {/* // multilanguage */}
        <div className="relative">
      <button  
        onClick={() => setShowLangOptions(prev => !prev)}
        className="text-white px-4 py-2 flex items-center gap-3 text-xl md:text-2xl hover:text-green-500 transition-colors">
        <GrLanguage />
      </button>
    
     {showLangOptions && (
              <div className="absolute left-0 mt-2 w-32 bg-white text-black rounded shadow-xl z-[60] overflow-hidden">
                {['en', 'hi', 'pb'].map((lang) => (
                  <button
                    key={lang}
                    className="block w-full px-4 py-2 hover:bg-gray-100 text-left text-sm"
                    onClick={() => { i18n.changeLanguage(lang); setShowLangOptions(false); }}
                  >
                    {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'ਪੰਜਾਬੀ'}
                  </button>
                ))}
              </div>
            )}
    </div>
        
      </div>
        </div> 
    
           {/* right side */}
            <div className="hidden lg:flex items-center gap-4">
            
             {/* <ThemeToggle /> */}
            
              {/* panic button */}
              <button  
              onClick={handlePanic}
              className="text-white px-4 py-1  flex items-center gap-1 text-2xl rounded-lg 
              hover:text-white hover:border hover:scale-120
              transition-all duration-300 ease-in-out ">
                  <GoAlertFill />
            </button>
    
              {/* green points */}
            <button  
              className="text-white px-4 py-1  flex items-center gap-1 text-lg rounded-lg 
              hover:text-green-500 hover:border hover:scale-120
              transition-all duration-300 ease-in-out ">
                   <MdStars className="text-green-500" /> 
              <span className="text-green-500 font-semibold">{greenPoints}</span>
            </button>
    
                {/* wallet */}
              <button  
              onClick={() => navigate("/wallet")}
              className="text-white px-4 py-1  flex items-center gap-3 text-2xl rounded-lg 
              hover:text-white hover:border hover:scale-120
              transition-all duration-300 ease-in-out ">
                    <FaWallet /> 
            </button>
    
               {/* user */}
             
             <div className="relative">
  <button
    onClick={() => setShowUserMenu(prev => !prev)}
    className="bg-white text-black px-5 py-2 flex items-center gap-1 text-lg rounded-lg
               border hover:bg-black hover:text-white
               transition-all duration-300 ease-in-out"
  >
    <FaUser /> {user ? user.firstName : "Guest"}
  </button>

  {showUserMenu && (
    <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-xl z-[120] overflow-hidden">
    </div>
  )}
</div>

    
            </div>

            {/* MOBILE MENU ICON */}
            <div className="lg:hidden flex items-center">
          <button onClick={toggleMenu} className="text-2xl">
            {isMenuOpen ? <RxCross2 /> : <RxHamburgerMenu />}
          </button>
        </div>
 
          </motion.nav>

          {/* ADD THIS SPACER HERE */}
<div className="h-[72px] md:h-[80px]"></div>

          {/* MOBILE OVERLAY MENU */}
      <div className={`fixed inset-0 backdrop-blur-xl bg-black/10 z-[100] flex flex-col items-center justify-center gap-8 transition-transform duration-500 ease-in-out lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>

        {/* Close Button Inside Menu */}
        <button onClick={toggleMenu} className="absolute top-6 right-8 text-4xl text-white">
          <RxCross2 />
        </button>

        <div className="flex flex-col items-center gap-8 text-white text-2xl  px-15 py-10 rounded-lg bg-black/60">
            {/* Account Info */}
            <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black">
                    <FaUser size={30} />
                </div>
                <span className="font-semibold">{user ? user.firstName : "Guest"}</span>
              

            </div>

            {/* mobMagic card */}
             <button onClick={()=>navigate("/nfcCard")}
            className="md:hidden  text-white text-md">
            MobMagic Card</button>

            {/* Menu Links */}
            <button onClick={() => { navigate("/wallet"); toggleMenu(); }} className="flex items-center gap-4 hover:text-green-500">
                <FaWallet /> Wallet
            </button>

            <button onClick={() => { navigate("/panic"); toggleMenu(); }} className="flex items-center gap-4 text-red-500">
                <GoAlertFill /> Panic Button
            </button>

            <div className="flex items-center gap-4 text-green-500 border border-green-500 px-6 py-2 rounded-full">
                <MdStars /> {greenPoints} Points
            </div>

             <button 
            onClick={handleLogout}
            className="text-white hover:text-red-600 text-xl flex items-center gap-2 border px-6 py-2 rounded-full">
              <FiLogOut />
              Logout
            </button>
        </div>
      </div>
    
    
    
    </>
  )
}

export default Navbar
