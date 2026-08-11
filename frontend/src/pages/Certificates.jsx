import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Award, Download, Search, ShieldCheck } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCertificates();
  }, []);

  const fetchMyCertificates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/certificates/my');
      setCertificates(res.data);
    } catch (error) {
      console.error('Error fetching certificates list:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCerts = certificates.filter(cert => {
    const eventTitle = cert.eventId?.title || '';
    const certId = cert.certificateId || '';
    return eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
           certId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getBorderClass = (idx) => {
    const classes = [
      'cert-border-purple',
      'border-10 border-solid border-emerald-500',
      'border-10 border-solid border-amber-500',
      'cert-border-gold'
    ];
    return classes[idx % classes.length];
  };

  return (
    <div className="p-8 space-y-6 font-sans">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">My Certificates</h3>
          <p className="text-xs text-slate-400 font-medium">Download credentials for your completed event participations.</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white"
          />
        </div>
      </div>

      {/* Grid view of Certificates */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary/25 border-t-primary rounded-full animate-spin"></div>
          <span className="text-slate-400 text-xs font-semibold">Loading certificates vault...</span>
        </div>
      ) : filteredCerts.length === 0 ? (
        <div className="px-4 py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 bg-white">
          <Award className="w-10 h-10 text-slate-300" />
          <p className="text-base font-bold">No certificates found</p>
          <span className="text-xs text-slate-400">Certificates are issued by the admin after attendance verification.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCerts.map((cert, idx) => {
            const event = cert.eventId;
            if (!event) return null;

            return (
              <div 
                key={cert._id}
                className="bg-white p-5 rounded-2xl shadow-premium hover:shadow-card-hover border border-slate-100 transition-all duration-300 flex flex-col justify-between items-center text-center space-y-5"
              >
                {/* Certificate Thumbnail preview representation */}
                <div className={`w-full aspect-[3/4] p-4 bg-slate-50 flex flex-col justify-between items-center rounded-xl shadow-inner relative overflow-hidden ${getBorderClass(idx)}`}>
                  
                  {/* Small watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] rotate-12 select-none pointer-events-none">
                    <Award className="w-32 h-32 text-navy" />
                  </div>

                  <div className="text-[9px] font-bold text-slate-400 tracking-wider">EVENTHUB</div>
                  
                  <div className="space-y-2.5 w-full">
                    <h5 className="font-extrabold text-[10px] text-slate-800 tracking-tight leading-none">
                      CERTIFICATE
                    </h5>
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block leading-none">
                      OF PARTICIPATION
                    </span>
                    
                    <div className="pt-2 text-[8px] font-medium text-slate-500 leading-tight">
                      This is presented to
                      <p className="font-extrabold text-[10px] text-slate-800 tracking-tight my-1">{user?.name}</p>
                      for active participation in
                    </div>
                  </div>

                  <div className="space-y-1.5 w-full">
                    <h6 className="font-extrabold text-[9px] text-primary leading-tight line-clamp-2">
                      {event.title}
                    </h6>
                    <span className="text-[6px] font-semibold text-slate-400 uppercase block">
                      Issued on {new Date(cert.issuedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-primary/5 border border-primary/15 px-1.5 py-0.5 rounded text-[6px] font-semibold text-primary">
                    <ShieldCheck className="w-2.5 h-2.5" /> Verified Badge
                  </div>
                </div>

                {/* Info & Download Action */}
                <div className="w-full space-y-3">
                  <div className="text-left">
                    <h5 className="text-xs font-extrabold text-slate-800 line-clamp-1 leading-snug">{event.title}</h5>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{cert.certificateId}</span>
                  </div>

                  <a
                    href={`${API_URL}/certificates/download/${cert._id}`}
                    download
                    className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Certificates;
