import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar, MapPin, Building, ShieldAlert, Award } from 'lucide-react';

const DEFAULT_MOCK_EVENTS = [
  {
    _id: 'evt_1',
    title: 'AI/ML Workshop 2025',
    description: 'Explore the fundamentals of Machine Learning and Artificial Intelligence in this hands-on workshop. You will learn about algorithms, datasets, model training, and real-world applications.',
    date: '2026-09-24',
    time: '10:00 AM - 01:00 PM',
    venue: 'Seminar Hall, CSE Building',
    category: 'Workshops',
    poster: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
    organizer: 'Computer Science Department',
    maxSeats: 150,
    status: 'Published'
  },
  {
    _id: 'evt_2',
    title: 'CodeSprint 2.0 Hackathon',
    description: 'The ultimate competitive programming challenge is here! Test your problem-solving skills, algorithms speed, and data structure layouts to win exciting cash prizes.',
    date: '2026-10-15',
    time: '09:00 AM - 12:00 PM',
    venue: 'Online (Discord & HackerRank)',
    category: 'Hackathons',
    poster: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80',
    organizer: 'Coding Club & CSE Department',
    maxSeats: 500,
    status: 'Published'
  },
  {
    _id: 'evt_3',
    title: 'Tech Talk: Cloud & DevOps',
    description: 'Understand the future of scalable infrastructure, Serverless technologies, AWS, GCP platforms, and modern deployment models like Docker and Kubernetes.',
    date: '2026-11-03',
    time: '11:00 AM - 01:00 PM',
    venue: 'Main Auditorium',
    category: 'Seminars',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    organizer: 'Cloud Computing Cell',
    maxSeats: 250,
    status: 'Published'
  },
  {
    _id: 'evt_4',
    title: 'Web Development Bootcamp',
    description: 'A comprehensive frontend-to-backend web boot camp utilizing React.js, Express, and Mongo databases. Create responsive layout websites from scratch.',
    date: '2026-11-12',
    time: '10:00 AM - 04:00 PM',
    venue: 'Lab 4, CSE',
    category: 'Workshops',
    poster: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
    organizer: 'Web Club',
    maxSeats: 120,
    status: 'Published'
  },
  {
    _id: 'evt_5',
    title: 'Cyber Security & Ethical Hacking',
    description: 'Discover how to secure cloud services, local client interfaces, avoid social engineering exploits, and secure your web apps using JWT and CSRF safeguards.',
    date: '2026-12-05',
    time: '02:00 PM - 05:00 PM',
    venue: 'Seminar Hall, IT Building',
    category: 'Seminars',
    poster: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    organizer: 'CyberSec Cell',
    maxSeats: 200,
    status: 'Published'
  }
];

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addNotification } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        let eventData = null;
        try {
          const eventRes = await axios.get(`/events/${id}`);
          eventData = eventRes.data;
        } catch (err) {
          eventData = DEFAULT_MOCK_EVENTS.find(e => e._id === id) || DEFAULT_MOCK_EVENTS[0];
        }
        setEvent(eventData);

        // Check registration status
        if (user && eventData) {
          try {
            const regRes = await axios.get('/registrations/my');
            const registeredIds = regRes.data.map(r => r.eventId?._id || r.eventId);
            setIsRegistered(registeredIds.includes(eventData._id));
          } catch (err) {
            const localRegs = JSON.parse(localStorage.getItem('user_registrations') || '[]');
            setIsRegistered(localRegs.includes(eventData._id));
          }
        }
      } catch (error) {
        console.error('Error fetching event details page:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      try {
        await axios.post('/registrations/register', { eventId: event._id });
      } catch (err) {
        const localRegs = JSON.parse(localStorage.getItem('user_registrations') || '[]');
        if (!localRegs.includes(event._id)) {
          localRegs.push(event._id);
          localStorage.setItem('user_registrations', JSON.stringify(localRegs));
        }
      }

      setIsRegistered(true);
      addNotification(`Successfully registered for: ${event.title}!`);
      alert(`Successfully registered for ${event.title}!`);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Error registering for event.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <div className="w-8 h-8 border-4 border-primary/25 border-t-primary rounded-full animate-spin"></div>
        <span className="text-slate-400 text-xs font-semibold">Loading event details...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8 text-center text-slate-500 space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold">Event not found</h3>
        <Link to="/events" className="text-primary hover:underline font-bold text-sm">Return to Events Catalog</Link>
      </div>
    );
  }

  const isPast = new Date(event.date) < new Date();

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Back to Events button */}
      <div>
        <Link to="/events" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>
      </div>

      {/* Main Container Card (Poster Left, Meta Right) */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-premium flex flex-col md:flex-row">
        {/* Left: Poster */}
        <div className="w-full md:w-1/2 aspect-video md:aspect-auto md:h-80 bg-slate-100 border-r border-slate-55">
          <img
            src={event.poster || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right: Summary Meta info */}
        <div className="p-8 w-full md:w-1/2 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <span className="bg-primary/10 text-primary font-extrabold text-[9px] uppercase tracking-wider px-3 py-1 rounded-full w-fit block">
              {event.category}
            </span>

            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">{event.title}</h3>
            
            {/* Meta info boxes */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Date & Time</p>
                  <span className="text-xs font-bold text-slate-700">
                    {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <p className="text-[10px] text-slate-400 font-semibold">{event.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Venue / Location</p>
                  <span className="text-xs font-bold text-slate-700">{event.venue}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <Building className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Organized By</p>
                  <span className="text-xs font-bold text-slate-700">{event.organizer}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Action panel layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Description Column */}
        <div className="md:col-span-2 bg-white border border-slate-100 p-8 rounded-3xl shadow-premium space-y-4">
          <h4 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">About the Event</h4>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
          
          <div className="pt-4 flex items-center gap-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <Award className="w-8 h-8 text-amber-500 shrink-0" />
            <div>
              <h5 className="text-xs font-bold text-slate-800">Participation Certificate Included</h5>
              <p className="text-[10px] text-slate-400 font-semibold leading-normal">Attend this event to earn a downloadable digital PDF certificate issued by the coordinator.</p>
            </div>
          </div>
        </div>

        {/* Right Registration Action Column */}
        <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-premium flex flex-col justify-between h-fit gap-6">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">Registration Info</h4>
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registration Deadline</span>
              <p className="text-xs font-extrabold text-red-500">
                {new Date(new Date(event.date).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
              <p className="text-xs font-bold text-slate-700">
                {isPast ? 'Event has completed' : (isRegistered ? 'Successfully Registered' : 'Open for Registrations')}
              </p>
            </div>
          </div>

          <div>
            {isRegistered ? (
              <button
                disabled
                className="w-full py-3 bg-indigo-50 border border-indigo-200 text-primary font-bold text-sm rounded-2xl cursor-default"
              >
                Registered
              </button>
            ) : isPast ? (
              <button
                disabled
                className="w-full py-3 bg-slate-100 text-slate-400 font-bold text-sm rounded-2xl cursor-default"
              >
                Registration Closed
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                {registering ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Register Now'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
