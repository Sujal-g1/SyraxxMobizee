import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";

import { useState } from "react";
import firstpage from '../assets/firstpage.png';
import { Link, useNavigate } from "react-router-dom";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

// Login.jsx (example)
// const handleLogin = async () => {
//   const userData = await loginUser(email, password); // fetch from DB
//   setUser(userData); // pass this up to App.jsx
//    console.log("Logged-in user:", data.user);

// };


  // This function will call your backend API to login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
          const response = await fetch("http://localhost:5001/api/users/login", {
          method: "POST",
           headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          });


      const data = await response.json();

      if (!response.ok) {
        // login failed
        setError(data.error || "Login failed");
        return;
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);

      setUser(data.user); // Store user data in parent state or context
      navigate("/Homepage"); // Redirect after successful login
    } catch (err) {
      setError("Server error. Please try again later.");
      console.error(err);
    }
  };


  // authentication firebase
const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // IMPORTANT: Get the ID Token from Firebase
    const idToken = await user.getIdToken(); 

    // Send only the idToken to the backend
    const response = await fetch("http://localhost:5001/api/users/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }), 
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/Homepage");
    }
  } catch (error) {
    console.error("Google Login Error:", error);
  }
};

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div
          className="hidden md:flex w-1/2 items-center justify-center p-10 text-white relative"
          style={{
            backgroundImage: `url(${firstpage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-3xl font-bold mb-6 flex justify-center text-gray-800">Welcome</h2>
          <p className="text-gray-500 mb-6">Enter your email and password to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-lg mb-2 font-bold text-gray-600">Email</label>
              <input
                type="email"
                placeholder="sample@gmail.com"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-2 text-gray-600">Password</label>
              <input
                type="password"
                placeholder="password"
                autoComplete="current-password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black outline-none"
              />
              <div className="flex justify-between items-center text-sm mt-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Remember me
                </label>
                <a href="#" className="text-indigo-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full border py-3 rounded-lg flex items-center justify-center gap-2 bg-black text-white transition
              hover:bg-white hover:text-black transition-transform duration-[600ms] ease-[cubic-bezier(0, 0.55, 0.45, 1)]  hover:scale-101">
              Sign in
            </button>
          </form>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-black hover:text-white  mt-4
            transition-transform duration-[600ms] ease-[cubic-bezier(0, 0.55, 0.45, 1)]  hover:scale-101">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"/>
            Sign in with Google
          </button>
{/* 
          <p className="text-sm text-gray-500 text-center mt-6">
            Don’t have an account?{" "}
            <Link to="/login/Signup" className="text-indigo-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p> */}
          
        </div>
      </div>
    </div>
  );
};

export default Login;
