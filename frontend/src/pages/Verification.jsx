import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, ShieldCheck, Download, Award } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

const Verification = () => {
  const { verificationCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const verify = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/certificates/verify/${verificationCode}`);
        setData(res.data);
      } catch (err) {
        console.error('Verification error:', err);
        setErrorMsg(err.response?.data?.message || 'Certificate verification failed: invalid code');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [verificationCode]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans selection:bg-primary selection:text-white">
      {/* Minimal Header Bar */}
      <header className="h-16 bg-slate-900/90 border-b border-slate-800 flex items-center px-6 justify-center sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary to-indigo-500 rounded-lg flex items-center justify-center font-black text-white text-base shadow-md">
            U
          </div>
          <span className="font-extrabold text-white text-sm tracking-wider">UniCraft Digital Certificate</span>
        </div>
      </header>

      {/* Main Download Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full my-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-9 h-9 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            <span className="text-slate-400 text-xs font-semibold tracking-wide">Validating certificate...</span>
          </div>
        ) : errorMsg ? (
          <div className="w-full bg-slate-800/90 border border-red-500/30 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
            <ShieldAlert className="w-14 h-14 text-red-500 mx-auto" />
            <h3 className="text-xl font-bold text-white">Invalid Certificate</h3>
            <p className="text-slate-400 text-xs leading-relaxed">{errorMsg}</p>
          </div>
        ) : (
          <div className="w-full bg-slate-800/90 border border-emerald-500/30 p-8 rounded-3xl text-center space-y-6 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">✓ Official Verified Credential</span>
              <h2 className="text-2xl font-black text-white tracking-tight">{data.student?.name}</h2>
              <p className="text-xs text-slate-300 font-medium">{data.event?.title}</p>
              <span className="text-[10px] text-slate-400 font-mono block pt-1">Serial: {data.certificateId}</span>
            </div>

            {data._id && (
              <a
                href={`${API_URL}/certificates/download/${data._id}`}
                download
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Download className="w-5 h-5" /> Download PDF Certificate
              </a>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
        © 2026 EVENTHUB CREDENTIAL VERIFICATION
      </footer>
    </div>
  );
};

export default Verification;
