import {useState , useEffect} from 'react'
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { useTranslation } from "react-i18next";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import homepage_right from "../assets/homepage_right.png";

const HomeSearch = () => {

 const navigate = useNavigate();
 // mobMagic Card
const navigateToNfcCard = () => {
  navigate("/nfcCard"); // path to your NFC card page
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

const { t } = useTranslation();

      const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
    
    const [allStations, setAllStations] = useState([]);
    const [startPoint, setStartPoint] = useState("");
    const [endPoint, setEndPoint] = useState("");
    const [startSuggestions, setStartSuggestions] = useState([]);
    const [endSuggestions, setEndSuggestions] = useState([]);
    const [showStartSuggestions, setShowStartSuggestions] = useState(false);
    const [showEndSuggestions, setShowEndSuggestions] = useState(false);
    
    useEffect(() => {
      const fetchStations = async () => {
        try {
          const res = await fetch(`${API}/api/users/stations`);
          const data = await res.json();
          setAllStations(data);
          console.log("Stations loaded:", data);
        } catch (err) {
          console.error("Failed to load stations", err);
        }
      };
    
      fetchStations();
    }, []);
    
    useEffect(() => {
      if (!startPoint) {
        setStartSuggestions([]);
        setShowStartSuggestions(false);
        return;
      }
    
      const filtered = allStations.filter((s) =>
        s.station_name.toLowerCase().includes(startPoint.toLowerCase())
      );
    
      setStartSuggestions(filtered);
      setShowStartSuggestions(filtered.length > 0);
    }, [startPoint, allStations]);
    
    useEffect(() => {
      if (!endPoint) {
        setEndSuggestions([]);
        setShowEndSuggestions(false);
        return;
      }
    
      const filtered = allStations.filter((s) =>
        s.station_name.toLowerCase().includes(endPoint.toLowerCase())
      );
    
      setEndSuggestions(filtered);
      setShowEndSuggestions(filtered.length > 0);
    }, [endPoint, allStations]);
    
    const handleSelectStart = (stationName) => {
      setStartPoint(stationName);
      setShowStartSuggestions(false);
    };
    
    const handleSelectEnd = (stationName) => {
      setEndPoint(stationName);
      setShowEndSuggestions(false);
    };

    // ----------- see buses --------------
const handleSeeBuses = async () => {
  if (!startPoint || !endPoint) return;
 navigate(`/businfo?start=${encodeURIComponent(startPoint)}&end=${encodeURIComponent(endPoint)}`);

};

// ----------- see route --------------
const handleSeeRoute = () => {
  if (!startPoint || !endPoint) return;
  navigate(
    `/live?start=${encodeURIComponent(startPoint)}&end=${encodeURIComponent(endPoint)}`
  );
};

  return (
    <>
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
      <ul className="absolute z-50 w-full bg-white border mt-1 rounded-md max-h-40 overflow-y-auto">
        {startSuggestions.map((station, idx) => (
          <li
            key={idx}
            onClick={() => handleSelectStart(station.station_name)}
            className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
          >
            {station.station_name}
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
      <ul className="absolute z-50 w-full bg-white border mt-1 rounded-md max-h-40 overflow-y-auto">
        {endSuggestions.map((station, idx) => (
          <li
            key={idx}
            onClick={() => handleSelectEnd(station.station_name)}
            className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
          >
            {station.station_name}
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
              duration:1.8,
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
    </>
  )
}

export default HomeSearch