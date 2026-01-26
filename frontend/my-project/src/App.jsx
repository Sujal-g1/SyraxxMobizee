import React, { useState, useEffect } from 'react';

import { Routes, Route , Navigate } from 'react-router-dom'; 
import Start from './components/Start';
import Login from './components/Login';
import UserSignup from './components/UserSignup';
import Homepage from './components/Homepage';
import NfcCard from './components/NfcCard';
import LiveStatus from './components/LiveStatus';
import Dashboard from './components/Dashboard';  
import BusInfo from "./components/BusInfo"; 
import Reserve from "./components/Reserve";
import PanicButton from "./components/PanicButton";
import RouteSearch from "./components/RouteSearch";
import Wallet from "./components/Wallet";


import "leaflet/dist/leaflet.css";

import { I18nextProvider } from 'react-i18next';
import i18n from './components/multiLang';

const App = () => {
 
  const [user, setUser] = useState(() => {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (storedUser && token) {
    return JSON.parse(storedUser);
  }

  return null;
});

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user");

      const data = await res.json();

      // 🔥 Always override old localStorage data
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Fresh user loaded from backend:", data.user);
    } catch (err) {
      console.error("Failed to refresh user:", err);
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  fetchUser();
}, []);



const ProtectedRoute = ({ user, children }) => {
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
  path="/Homepage"
  element={
    <ProtectedRoute user={user}>
      <Homepage user={user} />
    </ProtectedRoute>
  }
/>        <Route path='/live' element={<LiveStatus />} />
          <Route path='/nfcCard' element={<NfcCard user={user} refreshUser={setUser} />} />
          <Route path='/dashboard' element={<Dashboard />} />  
          <Route path="/businfo" element={<BusInfo />} />
         <Route path="/reserve" element={<Reserve />} />
         <Route path="/panic" element={<PanicButton />} />
         <Route path="/wallet" element={<Wallet user={user} refreshUser={setUser} />} />
         <Route path="/routesearch" element={<RouteSearch />} />

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