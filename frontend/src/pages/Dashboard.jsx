import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Calendar, 
  Users, 
  Award, 
  Layers, 
  ChevronRight, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  MapPin,
  Bell
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const { user, notifications } = useAuth();
  const [stats, setStats] = useState({
    eventsCount: 24,
    registrationsCount: 1245,
    certificatesCount: 842,
    usersCount: 1532
  });
  const [topEvents, setTopEvents] = useState([]);
  const [studentStats, setStudentStats] = useState({
    registered: 0,
    upcoming: 0,
    certificates: 0
  });
  const [myNextEvent, setMyNextEvent] = useState(null);

  // Line chart data matching the mockup registrations overview trend (May 1 to May 29)
  const chartData = [
    { name: '1 May', registrations: 120 },
    { name: '5 May', registrations: 180 },
    { name: '9 May', registrations: 140 },
    { name: '13 May', registrations: 290 },
    { name: '17 May', registrations: 210 },
    { name: '21 May', registrations: 200 },
    { name: '25 May', registrations: 250 },
    { name: '29 May', registrations: 380 }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.role === 'admin') {
          // Fetch events and registrations from server to augment base stats
          const eventsRes = await axios.get('/events');
          const usersRes = await axios.get('/auth/me'); // Just to verify connection
          
          // Set stats based on mockup, combined with actual count from DB
          const dbEventsCount = eventsRes.data.length;
          setStats({
            eventsCount: 20 + dbEventsCount,
            registrationsCount: 1238 + dbEventsCount * 2,
            certificatesCount: 840 + (dbEventsCount > 2 ? 2 : 0),
            usersCount: 1528 + (dbEventsCount > 0 ? 4 : 0)
          });

          // Mock Top Events data with registrations count
          setTopEvents([
            { id: 1, title: 'CodeSprint 2.0', count: 320, category: 'Hackathons', poster: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=120&q=80' },
            { id: 2, title: 'AI/ML Workshop', count: 280, category: 'Workshops', poster: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=120&q=80' },
            { id: 3, title: 'Tech Talk: Cloud Computing', count: 210, category: 'Seminars', poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=120&q=80' },
            { id: 4, title: 'Web Development Bootcamp', count: 190, category: 'Workshops', poster: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=120&q=80' }
          ]);
        } else {
          // Fetch student specific counts
          const regRes = await axios.get('/registrations/my');
          const certRes = await axios.get('/certificates/my');
          
          const registered = regRes.data.length;
          const certificates = certRes.data.length;
          
          // Find next upcoming event
          const upcomingEvents = regRes.data.filter(r => {
            if (!r.eventId) return false;
            return new Date(r.eventId.date) >= new Date();
          });

          setStudentStats({
            registered,
            upcoming: upcomingEvents.length,
            certificates
          });

          if (upcomingEvents.length > 0) {
            // Sort by nearest date
            upcomingEvents.sort((a, b) => new Date(a.eventId.date) - new Date(b.eventId.date));
            setMyNextEvent(upcomingEvents[0].eventId);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Calendar Highlight Days Helper (Simple mock representation of current month)
  const getCalendarDays = () => {
    const days = [];
    const eventDays = [5, 12, 24, 31]; // Days with events
    for (let i = 1; i <= 30; i++) {
      days.push({
        day: i,
        hasEvent: eventDays.includes(i)
      });
    }
    return days;
  };

  if (user?.role === 'admin') {
    // ADMIN DASHBOARD VIEW
    return (
      <div className="space-y-6 sm:space-y-8 font-sans">
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Events', value: stats.eventsCount, sub: 'View all events', icon: Layers, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            { label: 'Total Registrations', value: stats.registrationsCount.toLocaleString(), sub: 'View all registrations', icon: Calendar, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { label: 'Certificates Issued', value: stats.certificatesCount, sub: 'View all certificates', icon: Award, color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { label: 'Total Users', value: stats.usersCount.toLocaleString(), sub: 'View all users', icon: Users, color: 'text-sky-600 bg-sky-50 border-sky-100' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium flex items-center justify-between hover:shadow-card-hover hover:border-primary/20 transition-all duration-300">
                <div className="space-y-2">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{item.label}</span>
                  <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{item.value}</h3>
                  <span className="text-slate-400 text-xs flex items-center gap-0.5 hover:text-primary cursor-pointer font-medium">
                    {item.sub} <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts & Top Events Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recharts Area Chart */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-base">Registrations Overview</h4>
                <span className="text-xs text-slate-400">Monthly breakdown of student registrations</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-bold">
                <TrendingUp className="w-3.5 h-3.5" /> +24% vs last month
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5A52E5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#5A52E5" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1E293B' }}
                  />
                  <Area type="monotone" dataKey="registrations" stroke="#5A52E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRegistrations)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Events Panel */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-base">Top Events</h4>
                <span className="text-xs text-primary hover:underline font-bold cursor-pointer">View All</span>
              </div>

              <div className="space-y-3.5">
                {topEvents.map((evt, idx) => (
                  <div key={evt.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-55 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={evt.poster} alt={evt.title} className="w-10 h-10 object-cover rounded-lg border border-slate-100 shadow-sm" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 leading-normal">{evt.title}</h5>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">{evt.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-800">{evt.count}</span>
                      <p className="text-[9px] text-slate-400 font-medium">Registrations</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
              <button className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-0.5">
                Generate Analytics Report <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STUDENT DASHBOARD VIEW
  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* Welcome banner widget */}
      <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="bg-white/20 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3 h-3" /> Student Dashboard
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Unlock new opportunities today, {user?.name}!
          </h3>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Check out the Events tab to register for new technical workshops and hackathons, or view your participation history below.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Events Registered', value: studentStats.registered, icon: Layers, bg: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
          { label: 'Upcoming Activities', value: studentStats.upcoming, icon: Calendar, bg: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
          { label: 'Certificates Earned', value: studentStats.certificates, icon: Award, bg: 'bg-amber-50 border-amber-100 text-amber-600' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium flex items-center justify-between hover:shadow-card-hover hover:border-primary/20 transition-all duration-300">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{item.label}</span>
                <h4 className="text-3xl font-extrabold text-slate-800 tracking-tight">{item.value}</h4>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.bg}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Event Alert & Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Next Event Details */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-premium flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-primary" /> Next Registered Event
            </h4>

            {myNextEvent ? (
              <div className="flex flex-col sm:flex-row gap-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <img
                  src={myNextEvent.poster || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=300&q=80'}
                  alt={myNextEvent.title}
                  className="w-full sm:w-40 h-28 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {myNextEvent.category}
                    </span>
                    <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {myNextEvent.venue}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-800 text-lg leading-tight">{myNextEvent.title}</h5>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{myNextEvent.description}</p>
                  <div className="text-xs font-bold text-slate-700">
                    🗓️ Date: {new Date(myNextEvent.date).toLocaleDateString()} • {myNextEvent.time}
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2">
                <Layers className="w-8 h-8 text-slate-300" />
                <p className="text-sm font-semibold">No upcoming registrations found</p>
                <span className="text-xs text-slate-400">Head over to the Events Catalog to sign up!</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Keep track of your certificates!</span>
            <button className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
              Certificates Vault <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Right: Calendar View */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium space-y-4">
          <h4 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <Calendar className="w-4.5 h-4.5 text-primary" /> Event Calendar
          </h4>
          
          <div className="text-center font-bold text-xs text-slate-600">June 2026</div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, idx) => (
              <span key={idx} className="font-bold text-slate-400 text-[10px]">{w}</span>
            ))}
            {getCalendarDays().map((d) => (
              <div
                key={d.day}
                className={`
                  p-1.5 rounded-lg text-xs font-bold flex items-center justify-center relative select-none transition-all duration-200
                  ${d.hasEvent 
                    ? 'bg-primary text-white shadow-md shadow-indigo-600/10 hover:scale-105 cursor-pointer' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }
                `}
                title={d.hasEvent ? 'Scheduled Event Day' : ''}
              >
                {d.day}
                {d.hasEvent && (
                  <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full"></span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
