const SectionPanel = ({ activeTab, setActiveRoom }) => {
    if (activeTab === 'dm') {
      return (
        <div className="p-4">
          <h2 className="text-purple-400 mb-3">DM</h2>
          <ul>
            {['Zentro Bot', 'Random Chat', 'User1', 'User2'].map(user => (
              <li 
                key={user} 
                className="cursor-pointer hover:text-purple-300"
                onClick={() => setActiveRoom(user)}
              >
                {user}
              </li>
            ))}
          </ul>
        </div>
      );
    }
  
    if (activeTab === 'group') {
      return (
        <div className="p-4">
          <h2 className="text-purple-400 mb-3">Groups</h2>
          <ul>
            <li onClick={() => setActiveRoom("Group Chat View")} className="cursor-pointer hover:text-purple-300">Group Chat View</li>
          </ul>
        </div>
      );
    }
  
    if (activeTab === 'server') {
      return (
        <div className="p-4">
          <h2 className="text-purple-400 mb-3">Servers</h2>
          <ul>
            <li onClick={() => setActiveRoom("Admin Server")} className="cursor-pointer hover:text-purple-300">Admin Server</li>
            <li onClick={() => setActiveRoom("Joined Server 1")} className="cursor-pointer hover:text-purple-300">Joined Server 1</li>
          </ul>
        </div>
      );
    }
  
    if (activeTab === 'app') {
      return (
        <div className="p-4">
          <h2 className="text-purple-400 mb-3">Zentro Apps</h2>
          <ul>
            <li onClick={() => setActiveRoom("Kahoot Clone")} className="cursor-pointer hover:text-purple-300">Kahoot Clone</li>
            <li onClick={() => setActiveRoom("Among Us Chat")} className="cursor-pointer hover:text-purple-300">Among Us Chat</li>
          </ul>
          <button className="mt-4 text-sm text-gray-400 hover:text-purple-400">+ Submit Your App</button>
        </div>
      );
    }
  
    return null;
  };
  
  export default SectionPanel;
  