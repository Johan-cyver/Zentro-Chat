import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function LoginLeftPanel() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={animate ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="flex flex-col justify-center items-center h-screen w-full md:w-1/2 bg-black text-white px-8 space-y-6"
    >
      {/* Logo + Welcome */}
      <div className="flex flex-col items-center space-y-2">
        <div className="text-4xl">🚀</div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Zentro
        </h1>
        <p className="text-sm text-gray-400 text-center">
          Welcome back! Let’s meet some new ppl 📓🧑‍🚀
        </p>
      </div>

      {/* Login Form */}
      <form className="w-full space-y-4 max-w-sm">
        <input
          type="text"
          placeholder="Username or Email"
          className="w-full px-4 py-3 rounded-md bg-zinc-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 rounded-md bg-zinc-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold rounded-md shadow-md hover:from-purple-600 hover:to-cyan-500 transition-all duration-300"
        >
          Sign In
        </button>
        <p className="text-sm text-center text-gray-400 hover:text-gray-200 cursor-pointer">
          Forgot password?
        </p>
      </form>

      {/* Divider */}
      <div className="flex items-center justify-center w-full max-w-sm">
        <div className="border-t border-zinc-700 flex-grow" />
        <span className="px-4 text-sm text-gray-500">OR</span>
        <div className="border-t border-zinc-700 flex-grow" />
      </div>

      {/* Social Logins */}
      <div className="flex space-x-4">
        <button className="bg-zinc-800 text-white p-3 rounded-full hover:bg-zinc-700 transition">
          <span className="text-xl">G</span>
        </button>
        <button className="bg-zinc-800 text-white p-3 rounded-full hover:bg-zinc-700 transition">
          <span className="text-xl">🔐</span>
        </button>
      </div>
    </motion.div>
  );
}
