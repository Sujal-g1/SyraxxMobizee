import React ,{ useState ,useEffect ,useRef } from "react";
import { FaUser } from "react-icons/fa";
import { FaWallet } from "react-icons/fa6";
import { MdStars } from "react-icons/md";
import { MdLocationOn } from "react-icons/md";
import { GrLanguage } from "react-icons/gr";
import { GoAlertFill } from "react-icons/go";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";
import { IoIdCardOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";     // for language change
import { useNavigate } from "react-router-dom";
import { motion,  AnimatePresence} from 'framer-motion'
import ThemeToggle from "../pages/ThemeToggle.jsx";
import { FiLogOut } from "react-icons/fi";


const Navbar = ({user}) => {

    const navigate = useNavigate();

    const [showUserMenu, setShowUserMenu] = useState(false);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
const [isMenuOpen, setIsMenuOpen] = useState(false);

const langRef = useRef(null);


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

useEffect(() => {
  const handleClickOutside = (e) => {
    if (langRef.current && !langRef.current.contains(e.target)) {
      setShowLangOptions(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

const handleGreen = ()=>{
  navigate("/green-points")
}

  return (
    <>
    {/* Navbar */}
        <motion.nav className="fixed top-0 left-0 w-full px-6 max-w-full overflow-visible  md:px-10 py-4 flex items-center bg-black text-white justify-between z-50 shadow-lg"
         initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{
          delay:0.5,
          duration: 1.8,
          ease: [0.16, 1, 0.3, 1], 
        }}>
               
    
        <div className="flex items-center gap-3 max-w-[70%] overflow-visible">
            <h1 
            onClick={()=> navigate("/Homepage")}
            className="text-xl md:text-2xl font-semibold tracking-wide">{t("Mobizee")}</h1> 

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
       <div ref={langRef} className="relative">
  <button
    onClick={(e) => {
      e.stopPropagation();
      setShowLangOptions(prev => !prev);
    }}
    className="text-white px-4 py-2 flex items-center gap-3 text-xl md:text-2xl hover:text-green-500 transition-colors">
    <GrLanguage />
  </button>
  <AnimatePresence>
    {showLangOptions && (
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute left-0 mt-2 w-32 bg-white text-black rounded shadow-xl z-[999] ">
        {["en", "hi", "pb"].map((lang) => (
          <button
            key={lang}
            className="block w-full px-4 py-2 hover:bg-gray-100 text-left text-sm"
            onClick={() => {
              i18n.changeLanguage(lang);
              setShowLangOptions(false);}}>
            {lang === "en"
              ? "English"
              : lang === "hi"
              ? "हिंदी"
              : "ਪੰਜਾਬੀ"}
          </button>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
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
            onClick={handleGreen} 
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
{isMenuOpen && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] lg:hidden"
  >
    {/* dark backdrop */}
    <div
      onClick={toggleMenu}
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
    />

    {/* sliding panel */}
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.35,ease: [0.22, 1, 0.36, 1]}}
      className="absolute right-0 top-0 h-full w-[85%] max-w-sm
                 bg-gradient-to-b from-black/90 to-black/70
                 backdrop-blur-xl border-l border-white/10
                 shadow-2xl flex flex-col p-8 gap-8 text-white"
    >
      {/* close button */}
      <button
        onClick={toggleMenu}
        className="absolute top-6 right-6 text-3xl hover:rotate-90 transition"
      >
        <RxCross2 />
      </button>

      {/* account header */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center gap-3 mt-8"
      >
        <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center text-black shadow-lg">
          <FaUser size={36} />
        </div>
        <span className="text-lg font-semibold">
          {user ? user.firstName : "Guest"}
        </span>
      </motion.div>

      {/* menu items */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="flex flex-col gap-6 mt-6 text-lg"
      >
        {[
          {
            icon:<IoIdCardOutline />,
            label: "MobMagic Card",
            action: () => navigate("/nfccard")
          },
          {
            icon: <FaWallet />,
            label: "Wallet",
            action: () => navigate("/wallet")
          },
          {
            icon: <GoAlertFill />,
            label: "Panic",
            action: () => navigate("/panic"),
            className: "text-red-400"
          }
        ].map((item, i) => (
          <motion.button
            key={i}
            variants={{
              hidden: { x: 40, opacity: 0 },
              visible: { x: 0, opacity: 1 }
            }}
            onClick={() => {
              item.action();
              toggleMenu();
            }}
            className={`flex items-center gap-4 px-6 py-4 rounded-xl
                        bg-white/5 hover:bg-white/10
                        border border-white/10
                        transition ${item.className || ""}`}
          >
            {item.icon}
            {item.label}
          </motion.button>
        ))}

        {/* green points card */}
        <motion.div
          variants={{
            hidden: { x: 40, opacity: 0 },
            visible: { x: 0, opacity: 1 }
          }}
          className="flex items-center gap-4 px-6 py-4 rounded-xl
                     bg-green-500/10 border border-green-500/30
                     text-green-400 font-semibold"
        >
          <MdStars /> {greenPoints} Points
        </motion.div>

        {/* logout */}
        <motion.button
          variants={{
            hidden: { x: 40, opacity: 0 },
            visible: { x: 0, opacity: 1 }
          }}
          onClick={handleLogout}
          className="flex items-center gap-4 px-6 py-4 rounded-xl
                     bg-red-500/10 border border-red-500/30
                     text-red-400 hover:bg-red-500/20 transition"
        >
          <FiLogOut /> Logout
        </motion.button>
      </motion.div>
    </motion.div>
  </motion.div>
)}

    
    
    
    </>
  )
}

export default Navbar
