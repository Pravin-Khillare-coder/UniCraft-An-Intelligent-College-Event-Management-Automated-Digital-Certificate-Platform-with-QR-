import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Layers, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const MyEvents = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/registrations/my');
      setRegistrations(res.data);
    } catch (error) {
      console.error('Error fetching registrations list:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceBadge = (status) => {
    if (status === 'Present') {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-600 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" /> Present
        </span>
      );
    }
    if (status === 'Absent') {
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
          <XCircle className="w-3.5 h-3.5" /> Absent
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-600 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
        <AlertCircle className="w-3.5 h-3.5" /> Pending Attendance
      </span>
    );
  };

  return (
    <div className="p-8 space-y-6 font-sans">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary/25 border-t-primary rounded-full animate-spin"></div>
          <span className="text-slate-400 text-xs font-semibold">Retrieving your registrations...</span>
        </div>
      ) : registrations.length === 0 ? (
        <div className="px-4 py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2">
          <Layers className="w-10 h-10 text-slate-300" />
          <p className="text-base font-bold">You have not registered for any events yet</p>
          <span className="text-xs text-slate-400">Head over to the Events page to explore workshops and seminars!</span>
          <Link to="/events" className="mt-4 px-6 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-all">
            Discover Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((reg) => {
            const event = reg.eventId;
            if (!event) return null;

            return (
              <div 
                key={reg._id} 
                className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between hover:shadow-card-hover hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={event.poster || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=200&q=80'}
                    alt={event.title}
                    className="w-16 h-16 object-cover rounded-xl border border-slate-100 shadow-sm shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="bg-primary/10 text-primary font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {event.category}
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-sm leading-tight line-clamp-1">{event.title}</h4>
                    
                    {/* Metadata widgets */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {event.venue}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-2 shrink-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Attendance Status</p>
                  <div>
                    {getAttendanceBadge(reg.attendance)}
                  </div>
                  {reg.attendance === 'Present' && (
                    <Link
                      to="/my-certificates"
                      className="text-[10px] text-primary hover:underline font-extrabold block text-left sm:text-right"
                    >
                      Get Certificate →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
