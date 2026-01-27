// src/App.jsx
import React ,{ useState ,useEffect , useRef} from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HomeSearch from "../components/HomeSearch";
import OffersSection from "../components/OffersSection";
import TripSection from "../components/TripSection";
import ETicketsSection from "../components/ETicketsSection";
import GreenPointsSection from "../components/GreenPointsSection";
import CustomerSupport from "../components/CustomerSupport";


function Homepage({user}) {

  const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

  const navigate = useNavigate();

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

  return (
    <div >
    
    <Navbar user={user}/>
    <HomeSearch />
    <OffersSection />
    <TripSection />
    <ETicketsSection />
    <GreenPointsSection />
    <CustomerSupport />
    <Footer />

    </div>
  );
}

export default Homepage;
