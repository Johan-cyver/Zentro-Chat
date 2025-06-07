const MainPanel = ({ activeTab, activeRoom }) => {
    if (!activeRoom) {
      return (
        <div className="flex justify-center items-center h-full text-purple-400">
          Select a {activeTab} to start
        </div>
      );
    }
  
    if (activeTab === 'app') {
      if (activeRoom === "Kahoot Clone") {
        return <div className="p-6">🎮 Kahoot Game UI Here</div>;
      }
      if (activeRoom === "Among Us Chat") {
        return <div className="p-6">🕵️ Among Us Style Chat Room</div>;
      }
    }
  
    return (
      <div className="p-6">
        <h2 className="text-xl mb-4 text-purple-300">{activeRoom}</h2>
        {/* Embed chat window or app window */}
        <div className="bg-gray-900 p-4 rounded">Chat or content here...</div>
      </div>
    );
  };
  
  export default MainPanel;
  