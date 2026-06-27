import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";
import { useState } from "react";
import firstpage from "../assets/firstpage.png";
import { Eye, EyeOff } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
   const [isLoading, setIsLoading] = useState(false);
  const API = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate("/homepage");
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const response = await fetch(`${API}/api/users/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        navigate("/homepage");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-end md:items-center justify-center bg-gray-100 relative overflow-hidden">
      <motion.div 
      initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 z-0"
        // className="absolute inset-0 z-0 transition-opacity duration-700"
        style={{
          backgroundImage: `url(${firstpage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
       
        <div className="hidden md:block absolute inset-0 bg-gray-100"></div>
        <div className="md:hidden absolute inset-0 bg-black/20"></div>
      </motion.div>

      <motion.div
    initial={{ y: "100%" }}
    animate={{ y: 0 }}
    transition={{ duration:0.6 }}
       className="relative z-10 flex w-full h-[92vh] md:h-auto md:max-w-5xl bg-white rounded-t-[40px] md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-700">
        
        {/* Left Side: Desktop Image Side */}
        <div
          className="hidden md:flex w-1/2 items-center justify-center p-10 relative"
          style={{
            backgroundImage: `url(${firstpage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Form Container */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-start md:justify-center overflow-y-auto">
          
          {/* Decorative Drag Handle (Mobile only) */}
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 md:hidden"></div>

          <motion.div 
           initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5}}
            className="text-center md:text-left mb-8">
          {/* className="text-center md:text-left mb-8"> */}
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              Welcome 
            </h2>
            <p className="text-gray-500 mt-2 font-medium">
              Ready to start your journey?
            </p>
          </motion.div>

           <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border-2 border-gray-100 py-3.5 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" className="w-5 h-5" />
            )}
            <span className="font-bold text-gray-700">Continue with Google</span>
          </motion.button>

           <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="px-4 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">or</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">Password</label>
              <div className="relative">
               <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl outline-none transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm pt-1 mt-3">
              <label className="flex items-center text-gray-500 font-medium cursor-pointer">
                <input type="checkbox" className="mr-2 w-4 h-4 rounded border-gray-300 accent-black cursor-pointer" />
                Keep me signed in
              </label>
              <a href="#" className="text-black font-bold hover:underline decoration-2">
                Forgot?
              </a>
            </div>

            {/* Error Message with Animation */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  <div className="w-1 h-1 bg-red-600 rounded-full animate-ping"></div>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className="w-full py-4 rounded-2xl bg-black text-white font-black text-lg shadow-xl shadow-gray-200 active:bg-gray-900 transition-all flex items-center justify-center gap-2 mt-8"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-auto md:mt-10 pb-4 md:pb-0">
            Don't have an account?{" "}
            <Link
            to='/signup'
             
              className="text-black font-extrabold hover:underline underline-offset-4 decoration-2 transition-colors"
            >
              Create 0ne!
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
