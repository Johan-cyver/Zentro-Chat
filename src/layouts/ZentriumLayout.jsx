import React, { useState, Suspense, useEffect } from 'react';
import { Outlet, useOutletContext as useParentOutletContext } from 'react-router-dom';
import InAppBrowser from '../components/AppHub/InAppBrowser';

console.log('🔴🔴🔴 [ZentriumLayout.jsx] File is being loaded/parsed by JavaScript NOW! 🔴🔴🔴');

// THIS IS THE EXTREMELY SIMPLIFIED ZentriumLayout FOR TESTING
const ZentriumLayout = () => {
  console.log('🟠🟠🟠 [ZentriumLayout] Functional component body IS EXECUTING NOW! 🟠🟠🟠');
  // Log mounting
  useEffect(() => {
    console.log('🟢🟢🟢 [ZentriumLayout] Component MOUNTED (useEffect[] ran) 🟢🟢🟢');
  }, []);

  // Log context received by ZentriumLayout itself (should be from ChatRoom or undefined if top-level)
  const parentContext = useParentOutletContext(); 
  console.log('🟡🟡🟡 [ZentriumLayout] Context received by ZentriumLayout itself:', parentContext);

  // State for InAppBrowser
  const [showInAppBrowser, setShowInAppBrowser] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');

  // Simplified context for diagnostics
  const contextValue = { 
    //setShowInAppBrowser, 
    //setBrowserUrl,
    testMessage: "Hello from ZentriumLayout Context!"
  };
  console.log('🔵🔵🔵 [ZentriumLayout] Providing context to its own Outlet:', contextValue);

  return (
    <>
      <Outlet context={contextValue} />

      {showInAppBrowser && (
        <Suspense fallback={<div>Loading browser...</div>}>
          <InAppBrowser url={browserUrl} onClose={() => setShowInAppBrowser(false)} />
        </Suspense>
      )}
      {/* Optional: A small visual marker to confirm ZentriumLayout is rendering its own content */}
      {/* <div style={{position: 'fixed', bottom: '0', left: '0', backgroundColor: 'rgba(0,255,0,0.1)', padding: '2px', fontSize: '10px', zIndex: 9999}}>ZentriumLayout Shell</div> */}
    </>
  );
};

export default ZentriumLayout; 