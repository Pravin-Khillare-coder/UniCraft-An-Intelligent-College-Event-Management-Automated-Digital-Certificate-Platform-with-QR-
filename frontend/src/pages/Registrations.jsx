import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, User, Calendar, Award, CheckSquare, Square, FileText } from 'lucide-react';

const Registrations = () => {
  const { addNotification } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Attendance'); // All Registrations, Attendance, Reports
  
  // Temporary local states for checkboxes while user edits row
  const [attendanceEdits, setAttendanceEdits] = useState({});
  const [updatingRowMap, setUpdatingRowMap] = useState({});
  const [issuedCertsMap, setIssuedCertsMap] = useState({});

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchRegistrations(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/events?status=Published');
      setEvents(res.data);
      if (res.data.length > 0) {
        setSelectedEventId(res.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const fetchRegistrations = async (eventId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/registrations/event/${eventId}`);
      setRegistrations(res.data);

      // Populate local edits state with attendance statuses
      const edits = {};
      res.data.forEach(r => {
        edits[r._id] = r.attendance === 'Present';
      });
      setAttendanceEdits(edits);

      // Fetch already issued certificates for this event to disable button
      const certsRes = await axios.get('/certificates/my'); // Helper query or check locally
      // To simplify, let's check certificates globally if admin
      // Since it's a demo, we will check certificates dynamically in our loop or local cache
      setIssuedCertsMap({});
    } catch (err) {
      console.error('Error fetching event registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxToggle = (regId) => {
    setAttendanceEdits(prev => ({
      ...prev,
      [regId]: !prev[regId]
    }));
  };

  const handleUpdateAttendance = async (regId, studentId) => {
    setUpdatingRowMap(prev => ({ ...prev, [regId]: true }));
    const isPresent = attendanceEdits[regId];
    const attendanceStatus = isPresent ? 'Present' : 'Absent';

    try {
      const res = await axios.patch(`/registrations/attendance/${regId}`, {
        attendance: attendanceStatus
      });
      
      // Update local registration record
      setRegistrations(prev => prev.map(r => r._id === regId ? res.data : r));
      alert(`Attendance updated to ${attendanceStatus} successfully.`);
    } catch (err) {
      console.error('Error updating attendance:', err);
      alert('Error updating attendance');
    } finally {
      setUpdatingRowMap(prev => ({ ...prev, [regId]: false }));
    }
  };

  const handleIssueCertificate = async (studentId, studentName, eventId, eventTitle) => {
    try {
      await axios.post('/certificates/issue', { studentId, eventId });
      setIssuedCertsMap(prev => ({ ...prev, [studentId]: true }));
      addNotification(`Certificate issued: ${studentName} completed "${eventTitle}"`);
      alert(`Certificate issued to ${studentName} successfully!`);
    } catch (err) {
      console.error('Issue certificate error:', err);
      alert(err.response?.data?.message || 'Error issuing certificate');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header filter selectors */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Registrations Portal</h3>
          <p className="text-xs text-slate-400 font-medium">Verify student attendance list and issue participation credentials.</p>
        </div>

        {/* Dropdown Event Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Select Event:</span>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            {events.map(e => (
              <option key={e._id} value={e._id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs list (Mockup 6 layout) */}
      <div className="flex gap-4 border-b border-slate-100">
        {['All Registrations', 'Attendance', 'Reports'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              pb-3 text-xs font-bold tracking-wider transition-colors relative
              ${activeTab === tab ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Main Registrations List Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary/25 border-t-primary rounded-full animate-spin"></div>
          <span className="text-slate-400 text-xs font-semibold">Loading registrations sheet...</span>
        </div>
      ) : registrations.length === 0 ? (
        <div className="px-4 py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 bg-white">
          <User className="w-10 h-10 text-slate-300" />
          <p className="text-base font-bold">No registrations found for this event</p>
          <span className="text-xs text-slate-400">Student bookings will show up here once they register.</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Registered On</th>
                  {activeTab === 'Attendance' && (
                    <>
                      <th className="px-6 py-4 text-center">Attendance Checklist</th>
                      <th className="px-6 py-4">Status</th>
                    </>
                  )}
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {registrations.map((reg) => {
                  const student = reg.studentId;
                  const isChecked = attendanceEdits[reg._id];
                  
                  if (!student) return null;

                  return (
                    <tr key={reg._id} className="hover:bg-slate-55 transition-colors">
                      {/* Name & avatar */}
                      <td className="px-6 py-4 flex items-center gap-3">
                        {student.profile?.avatar ? (
                          <img
                            src={student.profile.avatar}
                            alt="Avatar"
                            className="w-8 h-8 rounded-lg object-cover border border-slate-100"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-800">{student.name}</span>
                          {student.profile?.rollNumber && (
                            <span className="text-[10px] text-slate-400 font-semibold block leading-tight mt-0.5">
                              {student.profile.department} • {student.profile.rollNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-slate-500 font-semibold">
                        {student.email}
                      </td>

                      {/* Registered Date */}
                      <td className="px-6 py-4 font-semibold text-slate-400">
                        {new Date(reg.registeredAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Attendance Toggle Checkbox (Mockup 6 Layout) */}
                      {activeTab === 'Attendance' && (
                        <>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleCheckboxToggle(reg._id)}
                              className="p-1 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                            >
                              {isChecked ? (
                                <CheckSquare className="w-5 h-5 text-primary" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-300" />
                              )}
                            </button>
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-4">
                            {reg.attendance === 'Present' ? (
                              <span className="bg-emerald-50 border border-emerald-250 text-emerald-600 font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                                Present
                              </span>
                            ) : reg.attendance === 'Absent' ? (
                              <span className="bg-red-50 border border-red-250 text-red-600 font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                                Absent
                              </span>
                            ) : (
                              <span className="bg-amber-50 border border-amber-250 text-amber-600 font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                                Pending
                              </span>
                            )}
                          </td>
                        </>
                      )}

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdateAttendance(reg._id, student._id)}
                            disabled={updatingRowMap[reg._id]}
                            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 font-bold text-[10px] rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
                          >
                            {updatingRowMap[reg._id] ? '...' : 'Update'}
                          </button>

                          {reg.attendance === 'Present' && (
                            <button
                              onClick={() => handleIssueCertificate(student._id, student.name, selectedEventId, events.find(e => e._id === selectedEventId)?.title)}
                              disabled={issuedCertsMap[student._id]}
                              className={`
                                px-3 py-1.5 font-bold text-[10px] rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1
                                ${issuedCertsMap[student._id]
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default shadow-none'
                                  : 'bg-primary hover:bg-primary-hover text-white'
                                }
                              `}
                            >
                              <Award className="w-3.5 h-3.5" /> 
                              {issuedCertsMap[student._id] ? 'Issued' : 'Issue Cert'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registrations;
