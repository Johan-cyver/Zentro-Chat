// ZentroSignIn.jsx
import React, { useState } from 'react';
import './ZentroSignIn.css';
import { auth } from '../firebase';
import { sendSignInLinkToEmail } from 'firebase/auth';

const actionCodeSettings = {
  url: 'http://localhost:3000/chat', // Replace with your domain
  handleCodeInApp: true,
};

function ZentroSignIn() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      window.localStorage.setItem('zentroName', name);
      setMessage('Check your inbox for the login link ✉️');
    } catch (error) {
      console.error(error);
      setMessage('Error sending email 😥');
    }
  };

  return (
    <div className="signin-container">
      <div className="form-section">
        <h1 className="neon-title">ZENTRO</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleLogin}>Send Login Link</button>
        <p className="info-msg">{message}</p>
      </div>
      <div className="gif-section">
        <img src="/assets/login-gif.gif" alt="Sign In GIF" />
      </div>
    </div>
  );
}

export default ZentroSignIn;
