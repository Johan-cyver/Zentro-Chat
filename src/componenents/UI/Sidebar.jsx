import React from "react";
import { FaComments, FaUsers, FaEdit, FaPlus, FaUser } from "react-icons/fa";

const ZentroSidebar = ({ currentView, setCurrentView }) => {
  const icons = [
    { icon: <FaComments />, label: "Chat", view: "chat" },
    { icon: <FaUsers />, label: "Groups", view: "groups" },
    { icon: <FaEdit />, label: "Blog", view: "blog" },
    { icon: <FaPlus />, label: "Submit App", view: "submit" },
    { icon: <FaUser />, label: "Profile", view: "profile" },
  ];

  return (
    <div className="w-14 h-screen bg-black text-purple-400 flex flex-col items-center relative border-r border-purple-700">
      <div className="flex flex-col gap-6 mt-4">
        {icons.map(({ icon, label, view }) => (
          <div
            key={view}
            title={label}
            className={`text-2xl hover:text-white cursor-pointer transition-transform ${
              currentView === view ? "scale-110" : ""
            }`}
            onClick={() => setCurrentView(view)}
          >
            {icon}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZentroSidebar;