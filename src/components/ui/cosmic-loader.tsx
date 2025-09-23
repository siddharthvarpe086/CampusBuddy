import React from 'react';

export const CosmicLoader = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="w-32 h-32 rounded-full border-4 border-transparent border-t-blue-400 border-r-purple-400 animate-spin"></div>
        
        {/* Middle pulsing ring */}
        <div className="absolute top-2 left-2 w-28 h-28 rounded-full border-2 border-transparent border-l-cyan-300 border-b-pink-300 animate-spin animate-reverse animation-duration-1000"></div>
        
        {/* Inner glowing orb */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full animate-pulse shadow-2xl shadow-blue-500/50"></div>
          
          {/* Floating particles */}
          <div className="absolute -top-2 -left-2 w-2 h-2 bg-blue-300 rounded-full animate-bounce animation-delay-300"></div>
          <div className="absolute -top-4 left-4 w-1 h-1 bg-purple-300 rounded-full animate-bounce animation-delay-700"></div>
          <div className="absolute top-2 -right-3 w-2 h-2 bg-pink-300 rounded-full animate-bounce animation-delay-1000"></div>
          <div className="absolute -bottom-3 left-1 w-1 h-1 bg-cyan-300 rounded-full animate-bounce animation-delay-500"></div>
        </div>
        
        {/* Energy waves */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-40 h-40 rounded-full border border-blue-400/30 animate-ping animation-duration-2000"></div>
          <div className="absolute top-2 left-2 w-36 h-36 rounded-full border border-purple-400/20 animate-ping animation-delay-500 animation-duration-2000"></div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
        <div className="text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            Initializing Campus Buddy
          </h3>
          <div className="flex justify-center mt-4 space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
};