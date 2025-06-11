import React from 'react';
import { useParams } from 'react-router-dom';
import SmartProfilePanel from '../SmartProfilePanel/SmartProfilePanel';

const UserProfile = () => {
  const { userId } = useParams();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <SmartProfilePanel targetUserId={userId} />
    </div>
  );
};

export default UserProfile;
