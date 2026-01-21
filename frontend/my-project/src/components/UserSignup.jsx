import { useState } from "react";
import firstpage from '../assets/firstpage.png'
import { Link } from "react-router-dom";

const UserSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNum, setPhoneNum] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

 const userData = {
  email,
  phone: phoneNum,
  password,
  firstName,
  lastName,
};


    try {
      const response = await fetch("http://localhost:5001/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("User registered successfully!");
        // Reset form fields
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setPhoneNum("");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Something went wrong, please try again.");
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

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-2">
          <h2 className="text-3xl font-bold flex justify-center text-gray-800">Welcome</h2>
          <p className="text-gray-500 mb-3 mt-2 flex justify-center text-3xl font-extrabold">Create Your Account</p>

          <form onSubmit={handleSubmit} className="space-y-5 p-3">
            <div>
              <h3 className="block text-lg font-bold text-gray-600">Enter Your Details</h3>
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-1/2 px-2 py-2 border rounded-lg focus:ring-1 focus:ring-black outline-none"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-1/2 px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <h3 className="block text-lg mt-2 font-bold text-gray-600">Phone Number</h3>
             <input
              type="tel"
              placeholder="Phone number"
              pattern="[0-9]{10}"
              required
              value={phoneNum}
              onChange={(e) => setPhoneNum(e.target.value)}
              className="w-full px-2 py-3 border rounded-lg focus:ring-1 focus:ring-black outline-none"
              />


              <label className="block text-lg mt-3 font-bold text-gray-600">Email</label>
              <input
                type="email"
                placeholder="sample@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-2 py-3 border rounded-lg focus:ring-1 focus:ring-black outline-none"
              />
            </div>

            <div>
              <label className="block text-lg font-bold mb-2 text-gray-600">Password</label>
              <input
                type="password"
                placeholder="Set password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-2 py-3 border rounded-lg focus:ring-1 focus:ring-black outline-none"
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

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
              Sign Up
            </button>

            <button
              type="button"
              className="w-full border py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Sign Up with Google
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
