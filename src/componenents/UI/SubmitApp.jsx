import React from 'react';

const SubmitApps = () => {
  return (
    <div className="text-purple-300 p-6">
      <h2 className="text-2xl font-bold mb-4">Submit Your App</h2>
      <form className="space-y-4">
        <input type="text" placeholder="App Name" className="w-full bg-[#111] p-3 rounded text-white" />
        <input type="text" placeholder="Live URL or GitHub Link" className="w-full bg-[#111] p-3 rounded text-white" />
        <textarea placeholder="Description" className="w-full bg-[#111] p-3 rounded text-white" rows="4" />
        <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">Submit</button>
      </form>
    </div>
  );
};

export default SubmitApps;
