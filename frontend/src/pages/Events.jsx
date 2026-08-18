import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, Sparkles, Filter } from 'lucide-react';

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

const Events = () => {
  const { user, addNotification } = useAuth();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [type, setType] = useState('All Types'); // Online vs Offline
  const [sortBy, setSortBy] = useState('Upcoming');

  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringMap, setRegisteringMap] = useState({});

  useEffect(() => {
    fetchEventsAndRegistrations();
  }, [category, type, sortBy]);

  const fetchEventsAndRegistrations = async () => {
    setLoading(true);
    try {
      let loadedEvents = [];
      try {
        const eventsRes = await axios.get('/events', {
          params: {
            category: category !== 'All Categories' ? category : undefined,
            status: 'Published'
          }
        });
        loadedEvents = eventsRes.data && eventsRes.data.length > 0 ? eventsRes.data : DEFAULT_MOCK_EVENTS;
      } catch (err) {
        console.warn('API unavailable, using fallback mock events catalog:', err.message);
        loadedEvents = DEFAULT_MOCK_EVENTS;
      }

      // Filter category if mock was used
      if (category !== 'All Categories') {
        loadedEvents = loadedEvents.filter(e => e.category === category);
      }

      // Apply type filtering manually (Online vs Offline)
      if (type !== 'All Types') {
        if (type === 'Online') {
          loadedEvents = loadedEvents.filter(e => e.venue.toLowerCase().includes('online'));
        } else if (type === 'In-Person') {
          loadedEvents = loadedEvents.filter(e => !e.venue.toLowerCase().includes('online'));
        }
      }

      // Apply sorting
      if (sortBy === 'Upcoming') {
        loadedEvents = loadedEvents.filter(e => new Date(e.date) >= new Date());
      } else if (sortBy === 'Past') {
        loadedEvents = loadedEvents.filter(e => new Date(e.date) < new Date());
      }

      // Filter by searchQuery on client side for speed
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        loadedEvents = loadedEvents.filter(e =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.venue.toLowerCase().includes(query)
        );
      }

      setEvents(loadedEvents);

      // Fetch student's registrations to show register/registered buttons
      if (user) {
        try {
          const regRes = await axios.get('/registrations/my');
          setMyRegistrations(regRes.data.map(r => r.eventId?._id || r.eventId));
        } catch (err) {
          const localRegs = JSON.parse(localStorage.getItem('user_registrations') || '[]');
          setMyRegistrations(localRegs);
        }
      }
    } catch (error) {
      console.error('Error fetching events catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEventsAndRegistrations();
  };

  const handleRegister = async (eventId, eventTitle) => {
    setRegisteringMap(prev => ({ ...prev, [eventId]: true }));
    try {
      try {
        await axios.post('/registrations/register', { eventId });
      } catch (err) {
        // Fallback for static hosting
        const localRegs = JSON.parse(localStorage.getItem('user_registrations') || '[]');
        if (!localRegs.includes(eventId)) {
          localRegs.push(eventId);
          localStorage.setItem('user_registrations', JSON.stringify(localRegs));
        }
      }

      setMyRegistrations(prev => [...prev, eventId]);
      
      // Send notification alerts
      addNotification(`You have successfully registered for: ${eventTitle}. Details are visible in My Registrations page.`);
      alert(`Successfully registered for ${eventTitle}!`);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Error registering for event.');
    } finally {
      setRegisteringMap(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const categories = [
    'All Categories',
    'Hackathons',
    'Workshops',
    'Seminars',
    'Technical',
    'Cultural',
    'Sports'
  ];

  const types = [
    'All Types',
    'Online',
    'In-Person'
  ];

  const sortOptions = [
    'Upcoming',
    'All Events',
    'Past'
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Search & Filter Bar Section */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-slate-100 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 w-full md:w-auto items-center">
          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Type Dropdown */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="col-span-2 sm:col-span-1 px-3 sm:px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            {sortOptions.map(sort => (
              <option key={sort} value={sort}>{sort}</option>
            ))}
          </select>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={() => {
              setCategory('All Categories');
              setType('All Types');
              setSortBy('Upcoming');
              setSearchQuery('');
            }}
            className="col-span-2 sm:col-span-1 text-xs font-bold text-slate-400 hover:text-primary transition-colors py-1.5 px-2 text-center"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Events Grid Catalog */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary/25 border-t-primary rounded-full animate-spin"></div>
          <span className="text-slate-400 text-xs font-semibold">Loading events catalog...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="px-4 py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2">
          <Calendar className="w-10 h-10 text-slate-300" />
          <p className="text-base font-bold">No events found matching filters</p>
          <span className="text-xs text-slate-400">Try adjusting your search criteria or filters.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {events.map((event) => {
            const isRegistered = myRegistrations.includes(event._id);
            const isPast = new Date(event.date) < new Date();
            
            return (
              <div 
                key={event._id} 
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-premium hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Poster Thumbnail */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 border-b border-slate-50 shrink-0">
                  <img 
                    src={event.poster || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-primary font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <Link to={`/events/${event._id}`} className="block">
                      <h4 className="font-extrabold text-slate-800 text-sm leading-snug hover:text-primary transition-colors group-hover:text-primary-hover line-clamp-1">
                        {event.title}
                      </h4>
                    </Link>

                    {/* Metadata widgets */}
                    <div className="space-y-1 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • {event.time.split(' - ')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Register Action Button */}
                  <div className="pt-2">
                    {isRegistered ? (
                      <button
                        disabled
                        className="w-full py-2 bg-indigo-50 border border-indigo-200 text-primary font-bold text-xs rounded-xl cursor-default"
                      >
                        Registered
                      </button>
                    ) : isPast ? (
                      <button
                        disabled
                        className="w-full py-2 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl cursor-default"
                      >
                        Event Closed
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(event._id, event.title)}
                        disabled={registeringMap[event._id]}
                        className="w-full py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 active:scale-95 transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        {registeringMap[event._id] ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          'Register'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;
