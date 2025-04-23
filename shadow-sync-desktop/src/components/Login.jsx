/* eslint-disable no-unused-vars */
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../AuthContext";

const Login = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [lab, setLab] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { setUserLoggedIn, setUserRole } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    if (!name || !role || !lab) {
      setError("Please fill in all fields");
      return;
    }
  
    setIsSubmitting(true);
  
    await new Promise((resolve) => setTimeout(resolve, 1000));
  
    try {
      // Save to localStorage
      localStorage.setItem("name", name);
      localStorage.setItem("role", role);
      localStorage.setItem("lab", lab);
  
      // Set context
      setUserLoggedIn(true);
      setUserRole(role);
  
      // 🔥 Call the API to set port
      const response = await fetch("http://localhost:3000/setPort", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lab }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to set port");
      }
  
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Login succeeded but failed to initialize session.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-xl p-8 w-full max-w-md shadow-2xl border border-gray-700"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white text-center">Welcome Back</h1>
          <p className="text-gray-400 mt-2">Sign in to access your account</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-900/50 text-red-100 rounded-lg text-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="Username"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="" disabled hidden>Select your role</option>
              <option value="Faculty" className="bg-gray-800">Faculty</option>
              <option value="Student" className="bg-gray-800">Student</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lab <span className="text-red-500">*</span>
            </label>
            <select
              value={lab}
              onChange={(e) => setLab(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="" disabled hidden>Select your lab</option>
              <option value="Lab-1" className="bg-gray-800">Lab-1</option>
              <option value="Lab-2" className="bg-gray-800">Lab-2</option>
              <option value="Lab-3" className="bg-gray-800">Lab-3</option>
              <option value="Lab-4" className="bg-gray-800">Lab-4</option>
              <option value="Lab-5" className="bg-gray-800">Lab-5</option>
            </select>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-all duration-200 ${
              isSubmitting
                ? "bg-indigo-700 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>
            Don't have an account?{" "}
            <a
              href="#"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
            >
              Contact admin
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
