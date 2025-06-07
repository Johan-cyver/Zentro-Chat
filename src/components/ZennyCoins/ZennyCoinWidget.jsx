// ZennyCoinWidget.jsx
import React, { useEffect, useState } from 'react';
import { getBalance } from '../../services/zennyCoinsService';

export default function ZennyCoinWidget({ uid, onPurchaseClick }) {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (uid) {
      getBalance(uid).then(setBalance);
    }
  }, [uid]);

  return (
    <div className="zenny-coin-widget flex items-center gap-2">
      <img src="/assets/images/zenny-coin.png" alt="Zenny Coin" width={24} />
      <span className="font-bold">{balance.toFixed(2)}</span>
      <button className="zenny-plus-btn" onClick={onPurchaseClick} title="Buy Zenny Coins">+</button>
    </div>
  );
}
