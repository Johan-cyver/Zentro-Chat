import React, { useState } from 'react';
import { FaRocket, FaGoogle, FaGithub } from 'react-icons/fa';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex h-screen font-sans">
      {/* Left Side - Login Form */}
      <div className="w-1/2 bg-black flex justify-center items-center">
        <div className="w-full max-w-sm text-center text-white px-6 py-8 rounded-xl">
          <div className="flex flex-col items-center mb-8">
            <FaRocket className="text-purple-400 text-3xl mb-1" />
            <h1 className="text-4xl font-bold neon-text-purple">Zentro</h1>
          </div>

          <input
            type="text"
            placeholder="Username or Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-5 px-4 py-2 rounded bg-zinc-900 text-white text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 px-4 py-2 rounded bg-zinc-900 text-white text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <button className="w-full mb-6 py-2 rounded text-white font-medium bg-purple-500 hover:bg-purple-400 neon-glow">
            Sign In
          </button>

          <div className="text-sm text-purple-400 mb-6 cursor-pointer hover:underline">
            Forgot password?
          </div>

          <div className="flex items-center mb-4 text-zinc-400">
            <hr className="flex-grow border-zinc-700" />
            <span className="px-3 text-sm">OR</span>
            <hr className="flex-grow border-zinc-700" />
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <button className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700">
              <FaGoogle className="text-white text-lg" />
            </button>
            <button className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700">
              <FaGithub className="text-white text-lg" />
            </button>
          </div>

          <div className="text-sm text-zinc-400">
            Don’t have an account?{' '}
            <span className="text-purple-400 cursor-pointer hover:underline">
              Sign up
            </span>
          </div>
        </div>
      </div>

      {/* Right Side - GIF */}
      <div className="w-1/2 relative">
        <img
         src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2t2M3FsYmE4YWxpb3UzazNkMHh2eXYxa2NxNjNubnQyMXZwZHB4dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QTxF50wnvVaXDU3IJQ/giphy.gif"
          alt="Cyberpunk City"
         className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-30" />
      </div>
    </div>
  );
}
