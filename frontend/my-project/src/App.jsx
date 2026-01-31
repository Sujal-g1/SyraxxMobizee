import React, { useState, useEffect } from 'react';

import { Routes, Route , Navigate } from 'react-router-dom'; 
import Start from './pages/Start';
import Login from './pages/Login';
import UserSignup from './pages/UserSignup';
import Homepage from './pages/Homepage';
import NfcCard from './pages/NfcCard';
import LiveStatus from './pages/LiveStatus';
import BusInfo from "./pages/BusInfo"; 
import Reserve from "./pages/Reserve";
import PanicButton from "./pages/PanicButton";
import RouteSearch from "./pages/RouteSearch";
import Wallet from "./pages/Wallet";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import WalletEntry from './pages/WalletEntry';
import "leaflet/dist/leaflet.css";

import { I18nextProvider } from 'react-i18next';
import i18n from './pages/multiLang';
import DriverAlcohol from './pages/DriverAlcohol';
import GreenPointsPage from './pages/GreenPointsPage';


const App = () => {
 
  const [user, setUser] = useState(() => {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (storedUser && token) {
    return JSON.parse(storedUser);
  }

  return null;
});

const [loading, setLoading] = useState(true);


useEffect(() => {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");


  if (storedUser && token) {
    setUser(JSON.parse(storedUser));
  }

  setLoading(false);
}, []);

const API = import.meta.env.VITE_API_URL;

const refreshUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.ok) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  } catch (err) {
    console.error("Refresh user error:", err);
  }
};


const ProtectedRoute = ({ user,  loading, children }) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


  return (
    <div>
      <I18nextProvider i18n={i18n}>
        <Routes>
          <Route path='/' element={<Start />} />
          <Route path='/login' element={<Login setUser={setUser} />} />
          {/* <Route path='/login/signup' element={<UserSignup />} /> */}
         <Route
  path="/homepage"
  element={
    <ProtectedRoute user={user} loading={loading}>
      <Homepage user={user} />
    </ProtectedRoute>
  }
/>        <Route path='/live' element={<LiveStatus />} />
          <Route path="/nfccard" element={<NfcCard user={user} setUser={setUser} />} /> 
          <Route path="/businfo" element={<BusInfo user={user}/>} />
         <Route path="/reserve" element={<Reserve />} />
         <Route path="/panic" element={<PanicButton user={user}/>} />
         {/* <Route path="/wallet" element={<Wallet user={user} refreshUser={setUser} />} /> */}
         <Route
       path="/wallet"
        element={<WalletEntry user={user} refreshUser={refreshUser} />}/>
         <Route path="/routesearch" element={<RouteSearch />} />
         <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="driver-alcohol" element={<DriverAlcohol />}/>
        <Route path="green-points" element={<GreenPointsPage />}/>


        </Routes>
      </I18nextProvider>
    </div>
  );
}

export default App;


/*

Do the same for:

/dashboard

/wallet

/nfcCard

Any page that requires login

*/