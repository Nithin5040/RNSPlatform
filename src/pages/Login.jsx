import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { SummaryApi } from "../api/SummaryApi";
import Swal from 'sweetalert2';
import { useTheme } from "../contexts/ThemeContext";
import Logo from '../assets/Logo.png';
import * as yup from 'yup';

export default function Login() {
  const { theme } = useTheme();
  const [form, setForm] = useState({
    employeeId: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    employeeId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [timeGreeting, setTimeGreeting] = useState("");
  const [employeeIdError, setEmployeeIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

  // Yup validation schema with Mobile Number - shows required first, then format/starting digit validation
  const loginSchema = yup.object().shape({
    employeeId: yup
      .string()
      .required('Mobile Number is required')
      .test('is-10-digits', 'Mobile Number must be exactly 10 digits', (value) => {
        if (!value || value.trim() === '') return true;
        return /^\d{10}$/.test(value);
      })
      .test('starts-with-6789', 'Mobile Number must start with 6, 7, 8, or 9', (value) => {
        if (!value || value.trim() === '') return true;
        return /^[6789]/.test(value.trim());
      }),
    password: yup
      .string()
      .test('is-required', 'Password is required', (value) => {
        // Check if password exists and is not empty or whitespace only
        if (!value || value.trim() === '') {
          return false;
        }
        return true;
      })
      .test('min-length', 'Password must be at least 8 characters', (value) => {
        // Only check min length if password is not empty
        if (!value || value.trim() === '') return true;
        return value.length >= 8;
      })
      .test('max-length', 'Password must be maximum 20 characters', (value) => {
        // Only check max length if password is not empty
        if (!value || value.trim() === '') return true;
        return value.length <= 20;
      })
  });

  // Dark mode state based on theme
  const darkMode = theme === 'dark';

  // Check if device is mobile and adjust font size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setFontSize(mobile ? 12 : 14);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Load saved credentials
    const savedCredentials = localStorage.getItem('rememberedCredentials');
    if (savedCredentials) {
      const { employeeId, password } = JSON.parse(savedCredentials);
      setForm({ employeeId, password });
      setRememberMe(true);
    }

    // Update greeting
    setTimeGreeting(getTimeBasedGreeting());

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 18) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  const cardStyle = {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#fff' : '#333',
    border: darkMode ? '1px solid #374151' : '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  };

  // Styles matching the main footer
  const footerStyle = {
    backgroundColor: darkMode ? '#124545' : '#1a5f5f',
    color: '#fff',
    padding: isMobile ? '8px 16px' : '0 24px',
    fontSize: isMobile ? '11px' : '14px',
    fontWeight: 'bold',
    boxShadow: '0 -2px 6px rgba(0, 0, 0, 0.15)',
    height: isMobile ? 'auto' : '48px',
    minHeight: isMobile ? '60px' : '48px',
    display: 'flex',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    width: '100%',
    boxSizing: 'border-box',
    flexShrink: 0,
    marginTop: 'auto'
  };

  const inputStyle = {
    backgroundColor: darkMode ? '#374151' : '#ffffff',
    color: darkMode ? '#fff' : '#333',
    fontSize: `${fontSize}px`,
    width: '100%',
    padding: isMobile ? '10px 12px' : '12px 16px',
    borderRadius: '8px',
    outline: 'none',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: darkMode ? '#4B5563' : '#D1D5DB',
    transition: 'all 0.2s ease',
  };

  const importantUpdates = [
    "Important Update: Only Admin access is available for now. Other roles will be enabled soon.",
    "Other roles are under development and will be available in the next release. Stay tuned for updates!"
  ];

  const scrollingText = importantUpdates.join(' • ') + ' • ';

  const [currentUpdate, setCurrentUpdate] = useState(0);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setCurrentUpdate((prev) => (prev + 1) % importantUpdates.length);
    }, 5000);
    return () => clearInterval(updateInterval);
  }, []);



  const validateForm = async () => {
    try {
      await loginSchema.validate(form, { abortEarly: false });
      setErrors({ employeeId: "", password: "" });
      return true;
    } catch (err) {
      const validationErrors = {};
      err.inner.forEach(error => {
        validationErrors[error.path] = error.message;
      });
      setErrors({
        employeeId: validationErrors.employeeId || "",
        password: validationErrors.password || ""
      });
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Only allow digits for mobile number (mapped to employeeId key)
    if (name === "employeeId") {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }

    // Clear field-specific errors
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setEmployeeIdError("");
    setPasswordError("");

    setForm((prev) => ({ ...prev, [name]: processedValue }));
  };

  const getDashboardPath = (roleId) => {
    const numericRoleId = Number(roleId);

    switch (numericRoleId) {
      case 1:
        return "/admin_dashboard";
      case 2:
        return "/field-promoters";
      case 3:
        return "/field_executive";
      case 4:
        return "/reporting_manager_dashboard";
      case 5:
        return "/dashboard";
      default:
        return "/admin_dashboard";
    }
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
    if (!e.target.checked) {
      localStorage.removeItem('rememberedCredentials');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setEmployeeIdError("");
    setPasswordError("");

    // Validate form using Yup
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('rememberedCredentials', JSON.stringify({
          employeeId: form.employeeId,
          password: form.password
        }));
      } else {
        localStorage.removeItem('rememberedCredentials');
      }

      // Send mobileNumber and password as per the API payload
      const loginRes = await axiosClient({
        method: SummaryApi.login.method,
        url: SummaryApi.login.url,
        data: {
          mobileNumber: form.employeeId,
          password: form.password
        }
      });

      if (!loginRes || !loginRes.data) {
        throw new Error("No response data received");
      }

      const responseData = loginRes.data;

      if (responseData.status === false) {
        throw new Error(responseData.message || "Login failed");
      }

      const user = responseData.data;

      if (!user) throw new Error("User profile not found");

      const checkRoleId = user.RoleId;
      if (Number(checkRoleId) !== 1 && Number(checkRoleId) !== 4) {
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'Only Admin and Reporting Manager access is available at this time.',
          timer: 3000,
          background: darkMode ? '#1f2937' : '#ffffff',
          color: darkMode ? '#ffffff' : '#000000',
        });
        setLoading(false);
        return;
      }

      // ================================================
      // STORE USER DATA IN SESSION STORAGE - OPTIMIZED
      // ================================================

      // Store the complete user data object as JSON
      sessionStorage.setItem("auth_user", JSON.stringify(user));

      // Store commonly used individual fields for easy access
      sessionStorage.setItem("userId", String(user.UserId));
      sessionStorage.setItem("firstName", user.FirstName || '');
      sessionStorage.setItem("lastName", user.LastName || '');

      // Store full name (combine first and last name)
      const fullName = `${user.FirstName || ''} ${user.LastName || ''}`.trim();
      sessionStorage.setItem("userName", fullName || user.name || '');

      // Store mobile number
      sessionStorage.setItem("mobileNumber", user.MobileNumber || form.employeeId);

      // Store email
      sessionStorage.setItem("userEmail", user.Email || user.email || '');

      // Store role information
      sessionStorage.setItem("roleId", String(user.RoleId));
      sessionStorage.setItem("userRole", user.RoleName || '');
      sessionStorage.setItem("roleName", user.RoleName || '');

      // Store gender information
      sessionStorage.setItem("genderId", String(user.GenderId || ''));
      sessionStorage.setItem("genderName", user.GenderName || '');

      // Store flags
      sessionStorage.setItem("isDisabled", String(user.IsDisabled || false));
      sessionStorage.setItem("isForcePasswordChange", String(user.IsForcePasswordChange || false));

      // Store additional fields if they exist in the response
      if (user.ReportingToId !== undefined && user.ReportingToId !== null) {
        sessionStorage.setItem("reportingToId", String(user.ReportingToId));
      }

      if (user.CurrentSessionId) {
        sessionStorage.setItem("currentSessionId", user.CurrentSessionId);
      }

      // ================================================
      // END OF SESSION STORAGE
      // ================================================

      await Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Welcome ${user.FirstName || 'User'}!`,
        timer: 2000,
        showConfirmButton: false,
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
      });

      const dashboardPath = getDashboardPath(user.RoleId);

      // Dispatch events for other components to react to auth changes
      window.dispatchEvent(new Event("auth"));
      window.dispatchEvent(new Event("storage"));

      // Use window.location for reliable navigation after async login
      // This ensures ProtectedRoute reads sessionStorage fresh on the new page
      window.location.href = dashboardPath;

    } catch (error) {
      console.error("Full error object:", error);

      let errorMessage = "Invalid login credentials or server error.";

      if (error.code === 'ERR_NETWORK') {
        errorMessage = "Network error: Unable to connect to the server.";
      } else if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server. Please try again.";
      }

      setMessage(errorMessage);

      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMessage,
        timer: 3000,
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      background: darkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    }}>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        overflow: 'auto',
        margin: 0,
        padding: '20px 0',
        background: darkMode
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 24px',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row-reverse',
            alignItems: 'center',
            justifyContent: 'space-around',
            gap: isMobile ? '20px' : '40px',
            width: '100%'
          }}>
            <div style={{
              width: '100%',
              maxWidth: isMobile ? '350px' : '450px',
              flexShrink: 0,
              animation: isMobile ? 'none' : 'fadeInCard 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 4.6s both'
            }}>
              {/* Card */}
              <div style={{
                ...cardStyle,
                backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                border: darkMode ? '1px solid #334155' : '1px solid rgba(79, 70, 229, 0.15)',
                boxShadow: darkMode
                  ? '0 8px 40px rgba(0, 0, 0, 0.5)'
                  : '0 8px 40px rgba(79, 70, 229, 0.15)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: isMobile ? '350px' : '400px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Animated Logo Background */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '220px',
                  height: '220px',
                  zIndex: 0,
                  pointerEvents: 'none',
                  opacity: darkMode ? 0.06 : 0.09,
                  animation: 'logoBgSpin 20s linear infinite, logoBgPulse 4s ease-in-out infinite alternate',
                }}>
                  <img
                    src={Logo}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                {/* Darker Overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: darkMode ? 'rgba(13, 11, 34, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                  zIndex: 0,
                  borderRadius: '12px'
                }}></div>

                {/* Scrollable Content Area */}
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  overflowY: 'auto',
                  height: '100%',
                  padding: isMobile ? '20px' : '32px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: darkMode ? '#4f46e5 #1e293b' : '#4f46e5 #e8e6ff',
                  WebkitOverflowScrolling: 'touch',
                }}>
                  {/* Greeting Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{
                      color: darkMode ? '#818cf8' : '#4f46e5',
                      fontSize: isMobile ? '20px' : '24px',
                      margin: '0 0 8px 0',
                      fontWeight: '600'
                    }}>
                      Hello
                    </h2>
                    <h3 style={{
                      color: darkMode ? '#818cf8' : '#4f46e5',
                      fontSize: isMobile ? '18px' : '20px',
                      margin: '0 0 12px 0',
                      fontWeight: '500'
                    }}>
                      {timeGreeting}
                    </h3>
                    <p style={{
                      color: darkMode ? '#9CA3AF' : '#6B7280',
                      fontSize: `${fontSize}px`,
                      margin: 0
                    }}>
                      Sign in to continue
                    </p>
                  </div>

                  {/* Error Message */}
                  {message && (
                    <div style={{
                      marginBottom: '20px',
                      padding: isMobile ? '10px' : '12px',
                      backgroundColor: '#FEE2E2',
                      border: '1px solid #FCA5A5',
                      borderRadius: '8px'
                    }}>
                      <p style={{
                        margin: 0,
                        color: '#DC2626',
                        fontSize: `${fontSize}px`,
                        textAlign: 'center'
                      }}>
                        {message}
                      </p>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit}>
                    {/* Mobile Number Field */}
                    <div style={{ marginBottom: isMobile ? '16px' : '20px' }}>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '6px',
                          color: darkMode ? '#E5E7EB' : '#4B5563',
                          fontSize: `${fontSize}px`,
                          fontWeight: '500'
                        }}
                      >
                        Mobile Number
                        <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                      </label>
                      <input
                        name="employeeId"
                        placeholder="Enter 10-digit Mobile Number"
                        type="text"
                        onChange={handleChange}
                        value={form.employeeId}
                        maxLength={10}
                        style={{
                          ...inputStyle,
                          borderColor: (errors.employeeId || employeeIdError) ? '#EF4444' : (darkMode ? '#4B5563' : '#D1D5DB'),
                        }}
                        onFocus={() => setEmployeeIdError("")}
                      />
                      {(errors.employeeId || employeeIdError) && (
                        <p style={{
                          margin: '4px 0 0 0',
                          color: '#EF4444',
                          fontSize: `${fontSize - 1}px`
                        }}>
                          {errors.employeeId || employeeIdError}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div style={{ marginBottom: isMobile ? '16px' : '20px' }}>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '6px',
                          color: darkMode ? '#E5E7EB' : '#4B5563',
                          fontSize: `${fontSize}px`,
                          fontWeight: '500'
                        }}
                      >
                        Password
                        <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          name="password"
                          value={form.password}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter Password"
                          onChange={handleChange}
                          style={{
                            ...inputStyle,
                            paddingRight: '40px',
                            borderColor: (errors.password || passwordError) ? '#EF4444' : (darkMode ? '#4B5563' : '#D1D5DB'),
                          }}
                          onFocus={() => setPasswordError("")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: darkMode ? '#9CA3AF' : '#6B7280',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          {showPassword ? <EyeOff size={isMobile ? 18 : 20} /> : <Eye size={isMobile ? 18 : 20} />}
                        </button>
                      </div>
                      {(errors.password || passwordError) && (
                        <p style={{
                          margin: '4px 0 0 0',
                          color: '#EF4444',
                          fontSize: `${fontSize - 1}px`
                        }}>
                          {errors.password || passwordError}
                        </p>
                      )}
                    </div>

                    {/* Remember Me */}
                    <div style={{
                      marginBottom: isMobile ? '16px' : '20px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <input
                        type="checkbox"
                        id="remember-me"
                        checked={rememberMe}
                        onChange={handleRememberMeChange}
                        style={{
                          marginRight: '8px',
                          width: isMobile ? '16px' : '18px',
                          height: isMobile ? '16px' : '18px',
                          cursor: 'pointer',
                          accentColor: '#4f46e5'
                        }}
                      />
                      <label htmlFor="remember-me" style={{
                        color: darkMode ? '#E5E7EB' : '#4B5563',
                        fontSize: `${fontSize}px`,
                        cursor: 'pointer'
                      }}>
                        Remember me
                      </label>
                    </div>

                    {/* Sign In Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: isMobile ? '12px' : '14px',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                        boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: `${fontSize}px`,
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        transition: 'all 0.2s ease',
                        marginBottom: '16px'
                      }}
                    >
                      {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <span style={{
                            width: isMobile ? '18px' : '20px',
                            height: isMobile ? '18px' : '20px',
                            border: '2px solid white',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></span>
                          Signing in...
                        </span>
                      ) : (
                        'Sign in'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Truck Animation Panel on the left */}
            {!isMobile && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                position: 'relative',
                overflow: 'visible',
                padding: '20px'
              }} className="truck-animation-panel">
                <div className="truck-container" style={{ width: '100%', maxWidth: '550px' }}>
                  <svg viewBox="0 0 600 300" width="100%" height="300" style={{ overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="cabinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                      <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                      <linearGradient id="lightBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255, 255, 150, 0.4)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 150, 0)" />
                      </linearGradient>
                      <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Headlight beam (pointing right) */}
                    <polygon points="480,190 600,160 600,230" fill="url(#lightBeam)" style={{ opacity: 0.8 }} />

                    {/* Ground/Road line with moving dash */}
                    <line x1="-50" y1="258" x2="650" y2="258" stroke={darkMode ? '#4f46e5' : '#6366f1'} strokeWidth="4" strokeDasharray="15, 15" className="road-line" />

                    {/* Truck Shadow */}
                    <ellipse cx="305" cy="256" rx="190" ry="10" fill="rgba(0, 0, 0, 0.35)" />

                    {/* Smoke Particles */}
                    <circle cx="125" cy="205" r="5" fill={darkMode ? '#4a5568' : '#cbd5e0'} className="smoke-particle smoke-1" />
                    <circle cx="125" cy="205" r="7" fill={darkMode ? '#2d3748' : '#e2e8f0'} className="smoke-particle smoke-2" />
                    <circle cx="125" cy="205" r="9" fill={darkMode ? '#1a202c' : '#edf2f7'} className="smoke-particle smoke-3" />

                    {/* Cargo Container */}
                    <rect x="130" y="80" width="240" height="130" rx="8" fill="url(#bodyGrad)" stroke="#4f46e5" strokeWidth="2.5" />

                    {/* Cabin */}
                    <path d="M 370,105 L 455,105 Q 480,105 480,130 L 480,210 L 370,210 Z" fill="url(#cabinGrad)" />
                    {/* Cabin Window */}
                    <path d="M 420,115 L 465,115 Q 470,115 470,125 L 470,155 L 420,155 Z" fill={darkMode ? '#1e293b' : '#e2e8f0'} opacity="0.85" stroke="#4f46e5" strokeWidth="1.5" />

                    {/* Cabin Door Group */}
                    <g className="cabin-door" style={{ transformOrigin: '380px 165px' }}>
                      <path d="M 380,125 L 425,125 L 425,205 L 380,205 Z" fill="url(#cabinGrad)" stroke={darkMode ? '#818cf8' : '#4f46e5'} strokeWidth="2" />
                      <rect x="418" y="160" width="4" height="8" rx="1" fill="#cbd5e0" />
                    </g>

                    {/* Headlight */}
                    <circle cx="480" cy="190" r="7" fill="#fff" filter="url(#neonGlow)" />
                    <circle cx="480" cy="190" r="4" fill="#fffae0" />

                    {/* Bumper */}
                    <rect x="476" y="198" width="12" height="12" rx="3" fill="#718096" />

                    {/* Brand Logo on the Container */}
                    <g transform="translate(250, 145)">
                      <text x="0" y="-15" fill="#fff" fontSize="18" fontWeight="bold" textAnchor="middle" letterSpacing="2" filter="url(#neonGlow)">VISHVIN</text>
                      <text x="0" y="5" fill="#818cf8" fontSize="9" fontWeight="600" textAnchor="middle" letterSpacing="1">LOGISTICS</text>
                      <line x1="-60" y1="20" x2="-20" y2="20" stroke="rgba(165, 160, 255, 0.4)" strokeWidth="1.5" />
                      <line x1="-20" y1="20" x2="20" y2="20" stroke="rgba(165, 160, 255, 0.4)" strokeWidth="1.5" />
                      <line x1="20" y1="20" x2="60" y2="20" stroke="rgba(165, 160, 255, 0.4)" strokeWidth="1.5" />
                      <circle cx="-60" cy="20" r="4" fill="#818cf8" />
                      <circle cx="-20" cy="20" r="4" fill="#6366f1" />
                      <circle cx="20" cy="20" r="4" fill="#818cf8" />
                      <circle cx="60" cy="20" r="4" fill="#6366f1" />
                    </g>

                    {/* Screech Smoke Particles under wheels */}
                    <circle cx="420" cy="245" r="0" fill={darkMode ? 'rgba(200, 200, 255, 0.4)' : 'rgba(220, 220, 255, 0.7)'} className="screech-smoke" style={{ transformOrigin: '420px 245px' }} />
                    <circle cx="280" cy="245" r="0" fill={darkMode ? 'rgba(200, 200, 255, 0.4)' : 'rgba(220, 220, 255, 0.7)'} className="screech-smoke" style={{ transformOrigin: '280px 245px' }} />
                    <circle cx="190" cy="245" r="0" fill={darkMode ? 'rgba(200, 200, 255, 0.4)' : 'rgba(220, 220, 255, 0.7)'} className="screech-smoke" style={{ transformOrigin: '190px 245px' }} />

                    {/* Wheels */}
                    <g transform="translate(420, 230)">
                      <g className="wheel-spin">
                        <circle cx="0" cy="0" r="26" fill="#1a202c" stroke="#4a5568" strokeWidth="4" />
                        <circle cx="0" cy="0" r="14" fill="#718096" />
                        <line x1="-26" y1="0" x2="26" y2="0" stroke="#e2e8f0" strokeWidth="2.5" />
                        <line x1="0" y1="-26" x2="0" y2="26" stroke="#e2e8f0" strokeWidth="2.5" />
                        <circle cx="0" cy="0" r="6" fill="#cbd5e0" />
                      </g>
                    </g>
                    <g transform="translate(280, 230)">
                      <g className="wheel-spin">
                        <circle cx="0" cy="0" r="26" fill="#1a202c" stroke="#4a5568" strokeWidth="4" />
                        <circle cx="0" cy="0" r="14" fill="#718096" />
                        <line x1="-26" y1="0" x2="26" y2="0" stroke="#e2e8f0" strokeWidth="2.5" />
                        <line x1="0" y1="-26" x2="0" y2="26" stroke="#e2e8f0" strokeWidth="2.5" />
                        <circle cx="0" cy="0" r="6" fill="#cbd5e0" />
                      </g>
                    </g>
                    <g transform="translate(190, 230)">
                      <g className="wheel-spin">
                        <circle cx="0" cy="0" r="26" fill="#1a202c" stroke="#4a5568" strokeWidth="4" />
                        <circle cx="0" cy="0" r="14" fill="#718096" />
                        <line x1="-26" y1="0" x2="26" y2="0" stroke="#e2e8f0" strokeWidth="2.5" />
                        <line x1="0" y1="-26" x2="0" y2="26" stroke="#e2e8f0" strokeWidth="2.5" />
                        <circle cx="0" cy="0" r="6" fill="#cbd5e0" />
                      </g>
                    </g>

                    {/* Driver Character */}
                    <g className="driver-group" style={{ opacity: 0 }}>
                      <circle cx="0" cy="208" r="8" fill="#fff" />
                      {/* Body */}
                      <path d="M -4,216 L 4,216 L 3,240 L -3,240 Z" fill="#6366f1" />
                      {/* Arm */}
                      <line x1="4" y1="220" x2="11" y2="228" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" className="driver-arm" />
                      {/* Left Leg */}
                      <line x1="-2" y1="240" x2="-5" y2="256" stroke="#fff" strokeWidth="3" strokeLinecap="round" className="driver-leg-left" />
                      {/* Right Leg */}
                      <line x1="2" y1="240" x2="5" y2="256" stroke="#fff" strokeWidth="3" strokeLinecap="round" className="driver-leg-right" />
                    </g>

                    {/* Tap Ripple Effect */}
                    <circle cx="535" cy="210" r="0" fill="none" stroke={darkMode ? '#818cf8' : '#4f46e5'} strokeWidth="3.5" className="tap-ripple" />
                  </svg>
                </div>

                <div style={{
                  marginTop: '20px',
                  textAlign: 'center',
                  animation: 'fadeInText 2s ease-out 2.5s both'
                }}>
                  <h3 style={{
                    color: darkMode ? '#ffffff' : '#1e293b',
                    margin: '0 0 5px 0',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  }}>
                    Resilient Network Architecture
                  </h3>
                  <p style={{
                    color: darkMode ? '#818cf8' : '#6366f1',
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Securing & Streamlining Workforce Logistics
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes scrollContinuous {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          
          /* Truck Animations */
          @keyframes driveAndStop {
            0% { transform: translateX(-120%); opacity: 0; }
            15% { opacity: 1; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes spinWheels {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(1440deg); }
          }
          @keyframes moveRoad {
            0% { stroke-dashoffset: -250; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes smokePuff {
            0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
            50% { transform: translate(-20px, -12px) scale(1.6); opacity: 0.3; }
            100% { transform: translate(-40px, -24px) scale(2.2); opacity: 0; }
          }
          @keyframes swingDoor {
            0% { transform: perspective(400px) rotateY(0deg); }
            100% { transform: perspective(400px) rotateY(-65deg); }
          }
          @keyframes walkOut {
            0% { transform: translate(395px, 0px); opacity: 0; }
            5% { opacity: 1; }
            100% { transform: translate(515px, 0px); opacity: 1; }
          }
          @keyframes swingLegsLeft {
            0%, 100% { transform: rotate(0deg); }
            10%, 30%, 50%, 70%, 90% { transform: rotate(-20deg); }
            20%, 40%, 60%, 80% { transform: rotate(20deg); }
          }
          @keyframes swingLegsRight {
            0%, 100% { transform: rotate(0deg); }
            10%, 30%, 50%, 70%, 90% { transform: rotate(20deg); }
            20%, 40%, 60%, 80% { transform: rotate(-20deg); }
          }
          @keyframes raiseHand {
            0%, 80% { transform: rotate(0deg); }
            100% { transform: rotate(-100deg); }
          }
          @keyframes ripplePlay {
            0% { r: 0px; opacity: 1; }
            100% { r: 35px; opacity: 0; }
          }
          @keyframes fadeInCard {
            0% { opacity: 0; transform: scale(0.92) translateY(30px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes fadeInText {
            0% { opacity: 0; transform: translateY(15px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes logoBgSpin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
          @keyframes logoBgPulse {
            0% { opacity: 0.04; transform: translate(-50%, -50%) scale(0.85); }
            100% { opacity: 0.12; transform: translate(-50%, -50%) scale(1.1); }
          }
          
          .truck-container {
            animation: driveAndStop 2.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
          }
          .road-line {
            animation: moveRoad 2.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
          }
          .wheel-spin {
            animation: spinWheels 2.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
            transform-origin: 0px 0px;
          }
          .cabin-door {
            animation: swingDoor 0.5s ease-in-out 2.5s forwards;
          }
          .driver-group {
            animation: walkOut 1.4s ease-in-out 2.8s forwards;
          }
          .driver-leg-left {
            transform-origin: -2px 240px;
            animation: swingLegsLeft 1.4s linear 2.8s forwards;
          }
          .driver-leg-right {
            transform-origin: 2px 240px;
            animation: swingLegsRight 1.4s linear 2.8s forwards;
          }
          .driver-arm {
            transform-origin: 4px 220px;
            animation: raiseHand 1.8s ease-in-out 2.8s forwards;
          }
          .tap-ripple {
            animation: ripplePlay 0.8s ease-out 4.4s forwards;
          }
          .smoke-1 { animation: smokePuff 1.8s infinite 0s linear; }
          .smoke-2 { animation: smokePuff 1.8s infinite 0.6s linear; }
          .smoke-3 { animation: smokePuff 1.8s infinite 1.2s linear; }
          
          html, body, #root {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            width: 100% !important;
            height: 100% !important;
          }
          
          * {
            overscroll-behavior: none;
          }
        `}
      </style>
    </div>
  );
}