import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  

  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSignUpMode, setIsSignUpMode] = useState(false); 

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // validation helper function for email format
  const isValidEmail = (emailStr) => {
    // Standard Regex to force "something@something.something"
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

 // login logic
  const handleLogin = (e) => {
    e.preventDefault();
    
    // look through array of objects to find a matching email
    const foundUser = registeredUsers.find(user => user.email === email);

    if (!foundUser) {
      // email not found at all
      setMessage({ text: 'Account not found. Please create one.', type: 'error' });
    } else if (foundUser.password !== password) {
      // email found, but the password doesn't match 
      setMessage({ text: 'Incorrect password. Please try again.', type: 'error' });
    } else {
      // email found and password matched
      setMessage({ text: '', type: '' });
      onLoginSuccess(); 
    }
  };

  // sign up logic
  const handleSignUp = (e) => {
    e.preventDefault();
    
    if (!isValidEmail(email)) return setMessage({ text: 'Please enter a valid email address.', type: 'error' });
    if (password.length < 6) return setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
    if (password !== confirmPassword) return setMessage({ text: 'Passwords do not match!', type: 'error' });
    
    // check email exists
    const emailAlreadyExists = registeredUsers.some(user => user.email === email);
    if (emailAlreadyExists) return setMessage({ text: 'Account already exists. Please Log In.', type: 'error' });

    // save email and password into database
    setRegisteredUsers([...registeredUsers, { email: email, password: password }]);
    
    setMessage({ text: 'Account created successfully! You can now Log In.', type: 'success' });
    setPassword('');
    setConfirmPassword('');
    setIsSignUpMode(false); 
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isSignUpMode ? '📝 Create Account' : '🎹 Welcome to HarmoCraft'}</h2>
        <p>{isSignUpMode ? 'Join us to start your composing journey.' : 'Sign in to save your melodies.'}</p>

        {message.text && (
          <div className={`alert-message alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="login-form" onSubmit={isSignUpMode ? handleSignUp : handleLogin}>
          
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@u.nus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="reveal-btn"
                onPointerDown={() => setShowPassword(true)}   
                onPointerUp={() => setShowPassword(false)}    
                onPointerLeave={() => setShowPassword(false)} 
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

        {isSignUpMode && (
            <div className="input-group">
              <label>Confirm Password</label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="reveal-btn"
                  onPointerDown={() => setShowConfirmPassword(true)}
                  onPointerUp={() => setShowConfirmPassword(false)}
                  onPointerLeave={() => setShowConfirmPassword(false)}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          )}            

          <div className="button-group">
            {isSignUpMode ? (
              <>
                <button type="submit" className="primary-btn">Complete Sign Up</button>
                <button type="button" className="secondary-btn" onClick={() => setIsSignUpMode(false)}>
                  Cancel / Back to Login
                </button>
              </>
            ) : (
              <>
                <button type="submit" className="primary-btn">Log In</button>
                <button type="button" className="secondary-btn" onClick={() => {
                  setIsSignUpMode(true);
                  setMessage({ text: '', type: '' }); 
                }}>
                  Create New Account
                </button>
              </>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;