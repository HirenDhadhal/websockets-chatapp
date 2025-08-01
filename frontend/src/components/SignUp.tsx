import React, { useState } from 'react';
import bgImage from '../assets/bgimg2.jpg';

interface LoginPageProps {}

const LoginPage: React.FC<LoginPageProps> = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);

  const togglePassword = (): void => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    alert('Account creation functionality would be implemented here');
  };

  const switchToLogin = (): void => {
    alert('Login functionality would be implemented here');
  };

  const loginWithGoogle = (): void => {
    alert('Google OAuth integration would be implemented here');
  };

  const loginWithApple = (): void => {
    alert('Apple OAuth integration would be implemented here');
  };

  const backToWebsite = (): void => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#2a2937] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[600px] bg-[#3d3c4e] rounded-[20px] flex overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
        {/* Left Panel - Hidden on mobile */}
        <div 
          className="hidden md:flex flex-1 relative flex-col justify-between p-8"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="text-white text-3xl font-bold tracking-[2px]">AMU</div>
            <button 
              onClick={backToWebsite}
              className="bg-white/20 text-white border-none px-5 py-2.5 rounded-[25px] cursor-pointer text-sm transition-all duration-300 backdrop-blur-[10px] flex items-center gap-2 hover:bg-white/30 hover:-translate-y-0.5"
            >
              Back to website →
            </button>
          </div>
          
          {/* Content */}
          <div className="text-white text-left mb-16">
            <h1 className="text-[42px] font-light leading-[1.2] mb-8">
              Capturing Moments,<br />Creating Memories
            </h1>
            <div className="flex gap-2.5 mt-5">
              <div className="w-3 h-3 rounded-full bg-white/30"></div>
              <div className="w-3 h-3 rounded-full bg-white/30"></div>
              <div className="w-3 h-3 rounded-full bg-white"></div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 p-8 md:p-12 bg-[#2a2937] flex flex-col justify-center">
          <div>
            <h2 className="text-white text-4xl font-light mb-2.5">Create an account</h2>
            <p className="text-gray-400 text-sm mb-10">
              Already have an account?{' '}
              <button 
                onClick={switchToLogin}
                className="text-purple-500 hover:text-purple-400 transition-colors cursor-pointer bg-transparent border-none underline"
              >
                Log in
              </button>
            </p>
            
            <form onSubmit={handleSubmit}>
              {/* First Name and Last Name Row */}
              <div className="flex gap-4 mb-5">
                <div className="flex-1">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-4 bg-[#3d3c4e] border border-gray-600 rounded-xl text-white text-sm transition-all duration-300 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] placeholder:text-gray-400"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-4 bg-[#3d3c4e] border border-gray-600 rounded-xl text-white text-sm transition-all duration-300 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] placeholder:text-gray-400"
                  />
                </div>
              </div>
              
              {/* Email */}
              <div className="mb-5">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 bg-[#3d3c4e] border border-gray-600 rounded-xl text-white text-sm transition-all duration-300 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] placeholder:text-gray-400"
                />
              </div>
              
              {/* Password */}
              <div className="mb-5 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 pr-12 bg-[#3d3c4e] border border-gray-600 rounded-xl text-white text-sm transition-all duration-300 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none text-gray-400 cursor-pointer text-base hover:text-gray-300 transition-colors"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              
              {/* Checkbox */}
              <div className="flex items-center gap-2.5 my-8">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                  className="w-[18px] h-[18px] accent-purple-500"
                />
                <label htmlFor="terms" className="text-gray-400 text-sm">
                  I agree to the{' '}
                  <a href="#" className="text-purple-500 hover:text-purple-400 transition-colors">
                    Terms & Conditions
                  </a>
                </label>
              </div>
              
              {/* Create Account Button */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none rounded-xl text-base font-medium cursor-pointer transition-all duration-300 mb-8 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(139,92,246,0.3)]"
              >
                Create account
              </button>
            </form>
            
            {/* Divider */}
            <div className="text-center text-gray-500 text-sm mb-5 relative">
              <span className="bg-[#2a2937] px-4 relative z-10">Or register with</span>
              <div className="absolute top-1/2 left-0 w-[35%] h-px bg-gray-600"></div>
              <div className="absolute top-1/2 right-0 w-[35%] h-px bg-gray-600"></div>
            </div>
            
            {/* Social Buttons */}
            <div className="flex gap-4 flex-col md:flex-row">
              <button
                onClick={loginWithGoogle}
                className="flex-1 py-3.5 bg-transparent border border-gray-500 rounded-xl text-white text-sm cursor-pointer transition-all duration-300 flex items-center justify-center gap-2.5 hover:bg-gray-500/10 hover:-translate-y-0.5"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button
                onClick={loginWithApple}
                className="flex-1 py-3.5 bg-transparent border border-gray-500 rounded-xl text-white text-sm cursor-pointer transition-all duration-300 flex items-center justify-center gap-2.5 hover:bg-gray-500/10 hover:-translate-y-0.5"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;