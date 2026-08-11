import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, User, ShieldCheck, ArrowRight, UserPlus } from 'lucide-react';

const Login = () => {
  const { login, signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student'); // student or admin
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dept, setDept] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [phone, setPhone] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isLogin) {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        if (email === 'admin@college.edu' || email.includes('admin')) {
          navigate('/admin-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      } else {
        setErrorMsg(res.message);
      }
    } else {
      // Register fields validation
      if (!name || !email || !password) {
        setErrorMsg('Please enter all required fields.');
        setLoading(false);
        return;
      }
      
      const payload = {
        name,
        email,
        password,
        role: 'student', // Registering is always student by default
        department: dept,
        rollNumber: rollNo,
        phone
      };

      const res = await signup(payload);
      setLoading(false);
      if (res.success) {
        navigate('/student-dashboard');
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const handleMockGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);

    // Mock Google account response payload
    const mockGoogleProfile = {
      googleId: 'g_' + Math.random().toString(36).substring(2, 11),
      email: email || 'student.google@example.com',
      name: name || 'Google Student User',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    };

    const res = await googleLogin(mockGoogleProfile);
    setLoading(false);
    if (res.success) {
      navigate('/student-dashboard');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Left Banner */}
      <div className="hidden lg:flex w-[45%] bg-navy relative overflow-hidden flex-col justify-between p-12 text-white border-r border-navy-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-navy-dark/80 z-0"></div>
        {/* Background decorative glowing circles */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl z-0"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl z-0"></div>

        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-indigo-400 rounded-xl flex items-center justify-center font-bold text-white text-xl">
            E
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider text-white">EventHub</h1>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">College Platform</span>
          </div>
        </div>

        <div className="my-auto max-w-md space-y-5 z-10">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            Connect, Collaborate, and Elevate Your Experience.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Discover tech events, seminars, sports competitions, and cultural fests. Earn participation achievements and instantly verify your certificate credentials.
          </p>
        </div>

        <div className="z-10 flex gap-4 text-xs text-slate-400 border-t border-slate-800 pt-6">
          <span>© 2026 EventHub Inc.</span>
          <span>•</span>
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Support Desk</span>
        </div>
      </div>

      {/* Right Login Card */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-20 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {isLogin ? 'Sign In to Portal' : 'Create Student Account'}
            </h3>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              {isLogin 
                ? 'Welcome back! Select your role and sign in below.' 
                : 'Fill in your details below to register for college fests.'}
            </p>
          </div>



          {/* Error Banner */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-xs font-medium flex items-center gap-2">
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Switcher (Only visible on Login) */}
            {isLogin && (
              <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${role === 'student' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Student Portal
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${role === 'admin' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Admin Portal
                </button>
              </div>
            )}

            {/* Inputs */}
            {!isLogin && (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            )}

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                required
                placeholder="Email Address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4.5 h-4.5" />
              </span>
              <input
                type="password"
                required
                placeholder="Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Student Additional Fields for Signup */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Department (e.g. CSE)"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <input
                  type="text"
                  placeholder="Roll Number (e.g. CS-042)"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            )}

            {!isLogin && (
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 hover:shadow-indigo-600/25 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Switch & Google Login */}
          <div className="space-y-4">
            <div className="relative flex items-center justify-center text-xs uppercase text-slate-400 font-bold">
              <div className="absolute left-0 right-0 h-[1px] bg-slate-200 z-0"></div>
              <span className="bg-slate-50 px-3 z-10">Or Continue With</span>
            </div>

            {/* Mock Google Login */}
            <button
              type="button"
              onClick={handleMockGoogleLogin}
              disabled={loading}
              className="w-full py-3 border border-slate-200 hover:bg-slate-100/50 bg-white text-slate-700 font-semibold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-1.11 2.76-2.39 3.62v3h3.86c2.26-2.09 3.67-5.17 3.67-8.45z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.86-3c-1.08.72-2.45 1.16-4.1 1.16-3.15 0-5.83-2.13-6.79-5.01H1.28v3.1A11.99 11.99 0 0 0 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.21 14.24A7.21 7.21 0 0 1 4.8 12c0-.79.13-1.57.41-2.24V6.66H1.28A11.99 11.99 0 0 0 0 12c0 2.21.6 4.28 1.63 6.07l3.58-2.83z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.28 0 3.28 2.7 1.28 6.66L5.21 9.49c.96-2.87 3.64-5 6.79-5z"
                />
              </svg>
              Google Authentication
            </button>

            {/* Switch Mode Toggle */}
            <div className="text-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg('');
                }}
                className="text-slate-500 hover:text-primary font-bold transition-colors"
              >
                {isLogin 
                  ? "Don't have an account? Sign Up as Student" 
                  : 'Already have an account? Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
