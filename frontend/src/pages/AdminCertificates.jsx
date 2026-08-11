import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Award, Search, Plus, Edit3, Trash2, X, Download, ShieldCheck, Calendar, User, Settings } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

const AdminCertificates = () => {
  const { addNotification } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' or 'designer'

  // Manual Issue Modal State
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [customCertId, setCustomCertId] = useState('');
  const [issueError, setIssueError] = useState('');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [editCertId, setEditCertId] = useState('');
  const [editIssuedAt, setEditIssuedAt] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [editEventId, setEditEventId] = useState('');
  const [editError, setEditError] = useState('');

  // Designer Workspace State
  const [designerEventId, setDesignerEventId] = useState('');
  const [nextCertNo, setNextCertNo] = useState('');
  const [certTemplate, setCertTemplate] = useState('');
  const [coordinators, setCoordinators] = useState([]);
  const [layout, setLayout] = useState(null);
  const [selectedElement, setSelectedElement] = useState('studentName');
  const [eligibleCount, setEligibleCount] = useState(0);
  const [issuedForEventCount, setIssuedForEventCount] = useState(0);
  const [bulkIssuing, setBulkIssuing] = useState(false);

  useEffect(() => {
    fetchCertificates();
    fetchStudentsAndEvents();
  }, []);

  useEffect(() => {
    if (designerEventId) {
      fetchEventDetailsForDesigner(designerEventId);
    }
  }, [designerEventId, certificates]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/certificates');
      setCertificates(res.data);
    } catch (err) {
      console.error('Error fetching certificates list:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndEvents = async () => {
    try {
      const studentsRes = await axios.get('/auth/students');
      setStudents(studentsRes.data);
      if (studentsRes.data.length > 0) {
        setSelectedStudentId(studentsRes.data[0]._id);
      }

      const eventsRes = await axios.get('/events?status=Published');
      setEvents(eventsRes.data);
      if (eventsRes.data.length > 0) {
        setSelectedEventId(eventsRes.data[0]._id);
        setDesignerEventId(eventsRes.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching students and events for dropdowns:', err);
    }
  };

  const fetchEventDetailsForDesigner = async (eventId) => {
    if (!eventId) return;
    try {
      const res = await axios.get(`/events/${eventId}`);
      const event = res.data;
      setNextCertNo(event.nextCertificateNumber || '');
      setCertTemplate(event.certificateTemplate || '');
      setCoordinators(event.signatures || []);
      
      const mergedLayout = {
        showDefaultLabels: true,
        brandName: { text: 'UniCraft', x: 100, y: 60, fontSize: 22, color: '#0F1016', enabled: true },
        collegeName: { text: 'COLLEGE ENGAGEMENT SYSTEM', x: 100, y: 85, fontSize: 10, color: '#5A52E5', enabled: true },
        collegeLogo: { logoImage: '', x: 100, y: 25, size: 40, enabled: false },
        certificateTitle: { text: 'CERTIFICATE OF PARTICIPATION', x: 100, y: 140, fontSize: 36, color: '#0F1016', enabled: true, align: 'center', width: 642 },
        presentedTo: { text: 'This is proudly presented to', x: 100, y: 210, fontSize: 14, color: '#4B5563', enabled: true, align: 'center', width: 642 },
        participationText: { text: 'for active participation and completion of the college event', x: 100, y: 295, fontSize: 14, color: '#4B5563', enabled: true, align: 'center', width: 642 },
        studentName: { x: 100, y: 245, fontSize: 28, color: '#0F1016', enabled: true, align: 'center', width: 642, underline: true },
        eventTitle: { x: 100, y: 325, fontSize: 22, color: '#5A52E5', enabled: true, align: 'center', width: 642 },
        date: { x: 100, y: 365, fontSize: 12, color: '#6B7280', enabled: true, align: 'center', width: 642 },
        certificateId: { x: 612, y: 510, fontSize: 10, color: '#1F2937', enabled: true, align: 'center', width: 150 },
        qrCode: { x: 612, y: 415, size: 90, enabled: true },
        signatures: { x: 100, y: 470, width: 420, enabled: true },
        customStamp: { stampImage: '', x: 400, y: 350, size: 80, enabled: false },
      };
      
      if (event.certificateLayout) {
        Object.keys(event.certificateLayout).forEach(key => {
          if (typeof event.certificateLayout[key] === 'object' && event.certificateLayout[key] !== null) {
            mergedLayout[key] = {
              ...mergedLayout[key],
              ...event.certificateLayout[key]
            };
          } else {
            mergedLayout[key] = event.certificateLayout[key];
          }
        });
      }
      
      setLayout(mergedLayout);
      
      // Fetch registrations count
      const regRes = await axios.get(`/registrations/event/${eventId}`);
      const presents = regRes.data.filter(r => r.attendance === 'Present');
      setEligibleCount(presents.length);
      
      // Count certificates already issued
      const alreadyIssued = certificates.filter(c => {
        const evId = c.eventId?._id || c.eventId;
        return evId === eventId;
      });
      setIssuedForEventCount(alreadyIssued.length);
    } catch (err) {
      console.error('Error loading event in designer:', err);
    }
  };

  const updateLayoutElement = (element, keyValues) => {
    setLayout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [element]: {
          ...prev[element],
          ...keyValues
        }
      };
    });
  };

  const handleFileToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (err) => console.error(err);
  };

  const handleBulkIssue = async (e) => {
    e.preventDefault();
    if (!designerEventId) {
      alert('Please select an event.');
      return;
    }
    
    setBulkIssuing(true);
    try {
      const payload = {
        eventId: designerEventId,
        certificateTemplate: certTemplate,
        nextCertificateNumber: nextCertNo,
        signatures: coordinators,
        certificateLayout: layout
      };
      
      const res = await axios.post('/certificates/bulk-issue', payload);
      alert(res.data.message || 'Certificates generated successfully.');
      addNotification(`Admin bulk issued ${res.data.issuedCount} certificates for event: "${events.find(e => e._id === designerEventId)?.title}"`);
      await fetchCertificates(); // Reload certificates registry
    } catch (err) {
      console.error('Bulk generate certificates error:', err);
      alert(err.response?.data?.message || 'Error bulk issuing certificates');
    } finally {
      setBulkIssuing(false);
    }
  };

  const handleManualIssue = async (e) => {
    e.preventDefault();
    setIssueError('');

    if (!selectedStudentId || !selectedEventId) {
      setIssueError('Please select both a student and an event.');
      return;
    }

    try {
      const payload = {
        studentId: selectedStudentId,
        eventId: selectedEventId,
        customCertificateId: customCertId
      };

      const res = await axios.post('/certificates/manual', payload);
      setCertificates(prev => [res.data, ...prev]);
      setShowIssueModal(false);
      setCustomCertId('');
      
      const studentName = students.find(s => s._id === selectedStudentId)?.name || 'Student';
      const eventTitle = events.find(e => e._id === selectedEventId)?.title || 'Event';
      addNotification(`Admin manually issued certificate for student: ${studentName} (${eventTitle})`);
      alert('Certificate manually issued successfully.');
    } catch (err) {
      console.error('Manual issue error:', err);
      setIssueError(err.response?.data?.message || 'Error manually issuing certificate');
    }
  };

  const handleOpenEdit = (cert) => {
    setEditingCert(cert);
    setEditCertId(cert.certificateId || '');
    // Format ISO string to YYYY-MM-DD for date input
    const dateFormatted = cert.issuedAt ? new Date(cert.issuedAt).toISOString().slice(0, 10) : '';
    setEditIssuedAt(dateFormatted);
    setEditStudentId(cert.studentId?._id || cert.studentId || '');
    setEditEventId(cert.eventId?._id || cert.eventId || '');
    setEditError('');
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editCertId.trim()) {
      setEditError('Certificate ID is required.');
      return;
    }

    let validIssuedAt = editingCert.issuedAt;
    if (editIssuedAt) {
      const parsedDate = new Date(editIssuedAt);
      if (!isNaN(parsedDate.getTime())) {
        validIssuedAt = parsedDate.toISOString();
      }
    }

    try {
      const res = await axios.put(`/certificates/${editingCert._id}`, {
        certificateId: editCertId,
        issuedAt: validIssuedAt,
        studentId: editStudentId,
        eventId: editEventId
      });

      // Update certificate in state
      setCertificates(prev => prev.map(c => c._id === editingCert._id ? res.data : c));
      setShowEditModal(false);
      addNotification(`Admin edited certificate details for ID: ${editCertId}`);
      alert('Certificate updated successfully.');
    } catch (err) {
      console.error('Edit certificate error:', err);
      setEditError(err.response?.data?.message || 'Error updating certificate');
    }
  };

  const handleDeleteCert = async (id, serialId) => {
    if (window.confirm(`Are you sure you want to revoke and delete certificate ${serialId}? This action is permanent.`)) {
      try {
        await axios.delete(`/certificates/${id}`);
        setCertificates(prev => prev.filter(c => c._id !== id));
        addNotification(`Admin revoked certificate: ${serialId}`);
        alert('Certificate revoked successfully.');
      } catch (err) {
        console.error('Revoke certificate error:', err);
        alert('Error revoking certificate.');
      }
    }
  };

  const handleExportCSV = () => {
    if (!certificates.length) {
      alert('No certificate records available to export.');
      return;
    }
    const headers = ['Serial Number', 'Student Name', 'Student Email', 'Roll Number', 'Department', 'Event Title', 'Event Organizer', 'Issue Date', 'Verification Code'];
    const rows = certificates.map(c => [
      `"${c.certificateId || ''}"`,
      `"${c.studentId?.name || ''}"`,
      `"${c.studentId?.email || ''}"`,
      `"${c.studentId?.profile?.rollNumber || ''}"`,
      `"${c.studentId?.profile?.department || ''}"`,
      `"${c.eventId?.title || ''}"`,
      `"${c.eventId?.organizer || ''}"`,
      `"${c.issuedAt ? new Date(c.issuedAt).toLocaleDateString('en-US') : ''}"`,
      `"${c.verificationCode || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Certificate_Serial_Allotments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter list
  const filteredCerts = certificates.filter(cert => {
    const studentName = cert.studentId?.name || '';
    const eventTitle = cert.eventId?.title || '';
    const certId = cert.certificateId || '';
    const term = searchQuery.toLowerCase();
    return studentName.toLowerCase().includes(term) ||
           eventTitle.toLowerCase().includes(term) ||
           certId.toLowerCase().includes(term);
  });

  const handleStartDrag = (e, elementKey, yOnly = false) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    
    const initialLayoutX = layout[elementKey]?.x !== undefined ? layout[elementKey].x : 0;
    const initialLayoutY = layout[elementKey]?.y !== undefined ? layout[elementKey].y : 0;
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const scaleX = 640 / 842;
      const scaleY = 452 / 595;
      
      const newX = Math.round(initialLayoutX + deltaX / scaleX);
      const newY = Math.round(initialLayoutY + deltaY / scaleY);
      
      const elSize = layout[elementKey]?.size || 0;
      const maxBoundX = elementKey === 'qrCode' ? 842 - elSize : 842;
      const maxBoundY = elementKey === 'qrCode' ? 595 - elSize : 595;
      
      const updates = {};
      if (!yOnly) {
        updates.x = Math.max(0, Math.min(newX, maxBoundX));
      }
      updates.y = Math.max(0, Math.min(newY, maxBoundY));
      
      updateLayoutElement(elementKey, updates);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="p-8 space-y-6 font-sans">
      {/* Header & Tab navigation switcher */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-xl tracking-tight">Certificates Registry</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Design editable formats, auto-generate participant certificates, and manage records.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-150/70 p-1.5 rounded-2xl border border-slate-200/50">
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-4.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'registry' 
                ? 'bg-white text-primary shadow-md shadow-slate-200' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" /> Issued Registry
          </button>
          <button
            onClick={() => setActiveTab('designer')}
            className={`px-4.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'designer' 
                ? 'bg-white text-primary shadow-md shadow-slate-200' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Auto-Issue & Designer
          </button>
        </div>
      </div>

      {activeTab === 'registry' ? (
        <>
          {/* Header & Manual Add Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Issued Credentials Database ({certificates.length})</h4>
              <p className="text-xs text-slate-400">Records of all certificate serial numbers allotted to students and events.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                title="Export Serial Allotment Report CSV"
              >
                <Download className="w-4 h-4" /> Export Allotment Log (CSV)
              </button>
              <button
                onClick={() => setShowIssueModal(true)}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4.5 h-4.5" /> Manually Issue Certificate
              </button>
            </div>
          </div>

          {/* Filter Search Input */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search student, event, serial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Main Table view */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-4 border-primary/25 border-t-primary rounded-full animate-spin"></div>
              <span className="text-slate-400 text-xs font-semibold">Loading certificates registry...</span>
            </div>
          ) : filteredCerts.length === 0 ? (
            <div className="px-4 py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 bg-white">
              <Award className="w-10 h-10 text-slate-300" />
              <p className="text-base font-bold">No certificates found</p>
              <span className="text-xs text-slate-400">Issued credentials will be listed here. Click "+ Manually Issue Certificate" to add one.</span>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Certificate ID</th>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Event Details</th>
                      <th className="px-6 py-4">Issue Date</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                    {filteredCerts.map((cert) => (
                      <tr key={cert._id} className="hover:bg-slate-55 transition-colors">
                        {/* Certificate ID / Badge */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary shrink-0" />
                            <span className="font-extrabold text-slate-800 font-mono">{cert.certificateId}</span>
                          </div>
                        </td>

                        {/* Student */}
                        <td className="px-6 py-4 flex items-center gap-2.5">
                          {cert.studentId?.profile?.avatar ? (
                            <img src={cert.studentId.profile.avatar} alt="Student avatar" className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-700">{cert.studentId?.name || 'Unknown User'}</span>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{cert.studentId?.email}</span>
                              {cert.studentId?.profile?.rollNumber && (
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold text-[9px]">
                                  {cert.studentId.profile.rollNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Event details */}
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-bold text-slate-700">{cert.eventId?.title || 'Unknown Event'}</span>
                            <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">Organized by {cert.eventId?.organizer}</span>
                          </div>
                        </td>

                        {/* Issue Date */}
                        <td className="px-6 py-4 text-slate-500 font-semibold">
                          {new Date(cert.issuedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={`${API_URL}/certificates/download/${cert._id}`}
                              download
                              className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleOpenEdit(cert)}
                              className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Serial / Date"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCert(cert._id, cert.certificateId)}
                              className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Revoke Certificate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Designer tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: Config and settings */}
          <div className="lg:col-span-5 space-y-6 bg-white border border-slate-100 p-6 rounded-3xl shadow-premium">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-primary" /> Certificate Configuration
            </h4>

            <form onSubmit={handleBulkIssue} className="space-y-5">
              {/* Event Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Event *</label>
                <select
                  value={designerEventId}
                  onChange={(e) => setDesignerEventId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
                >
                  <option value="" disabled>-- Select Event --</option>
                  {events.map(e => (
                    <option key={e._id} value={e._id}>{e.title}</option>
                  ))}
                </select>
              </div>

              {/* Status information badge cards */}
              {designerEventId && (
                <div className="grid grid-cols-3 gap-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                  <div className="text-center p-2 rounded-xl bg-white shadow-sm border border-slate-100/50">
                    <span className="block text-[16px] font-extrabold text-emerald-600">{eligibleCount}</span>
                    <span className="text-[8px] uppercase font-bold text-slate-400 block mt-0.5">Present</span>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-white shadow-sm border border-slate-100/50">
                    <span className="block text-[16px] font-extrabold text-indigo-600">{issuedForEventCount}</span>
                    <span className="text-[8px] uppercase font-bold text-slate-400 block mt-0.5">Issued</span>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-white shadow-sm border border-slate-100/50">
                    <span className="block text-[16px] font-extrabold text-amber-600">{Math.max(0, eligibleCount - issuedForEventCount)}</span>
                    <span className="text-[8px] uppercase font-bold text-slate-400 block mt-0.5">Remaining</span>
                  </div>
                </div>
              )}

              {/* Certificate Template Background File */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custom Background Template</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileToBase64(e.target.files[0], (base64) => setCertTemplate(base64));
                      }
                    }}
                    className="flex-1 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer cursor-pointer border border-slate-200 p-1.5 rounded-xl bg-slate-50/50"
                  />
                  {certTemplate && (
                    <button
                      type="button"
                      onClick={() => setCertTemplate('')}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[10px] font-bold transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {certTemplate && (
                  <div className="mt-2 relative w-28 aspect-[1.414] rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                    <img src={certTemplate} alt="Background Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Certificate Number sequence prefix / format */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Starting Certificate Number</label>
                <input
                  type="text"
                  placeholder="e.g. CERT-2026-0001"
                  value={nextCertNo}
                  onChange={(e) => setNextCertNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Element Customization Panel */}
              {layout && (
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Customize Layout Element</label>
                    <select
                      value={selectedElement}
                      onChange={(e) => setSelectedElement(e.target.value)}
                      className="px-2 py-1 border border-slate-200 bg-white rounded-lg text-[10px] font-bold focus:outline-none"
                    >
                      <option value="brandName">Branding Text (UniCraft)</option>
                      <option value="collegeName">College Name Text</option>
                      <option value="collegeLogo">College Logo</option>
                      <option value="certificateTitle">Certificate Title</option>
                      <option value="presentedTo">Presented To Label</option>
                      <option value="studentName">Participant Name</option>
                      <option value="participationText">Description Text</option>
                      <option value="eventTitle">Event Title</option>
                      <option value="date">Date</option>
                      <option value="certificateId">Certificate Serial</option>
                      <option value="qrCode">Verification QR</option>
                      <option value="signatures">Signatures Layout</option>
                      <option value="customStamp">Custom Stamp / Badge Image</option>
                    </select>
                  </div>

                  {/* Settings based on selected element */}
                  <div className="space-y-3.5 text-xs font-medium text-slate-600">
                    {/* Toggle label visibility */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">Enable Field</span>
                      <input
                        type="checkbox"
                        checked={!!layout[selectedElement]?.enabled}
                        onChange={(e) => updateLayoutElement(selectedElement, { enabled: e.target.checked })}
                        className="w-4.5 h-4.5 text-primary rounded border-slate-350 focus:ring-primary cursor-pointer"
                      />
                    </div>

                    {/* Show/Hide name underline toggler */}
                    {selectedElement === 'studentName' && (
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-[11px] font-bold text-slate-500">Show Name Underline</span>
                        <input
                          type="checkbox"
                          checked={!!layout.studentName?.underline}
                          onChange={(e) => updateLayoutElement('studentName', { underline: e.target.checked })}
                          className="w-4.5 h-4.5 text-primary rounded border-slate-350 focus:ring-primary cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Text content editor */}
                    {layout[selectedElement]?.text !== undefined && (
                      <div className="space-y-1 border-t border-slate-100 pt-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Text Content</label>
                        <textarea
                          rows={selectedElement === 'participationText' || selectedElement === 'certificateTitle' ? 2 : 1}
                          value={layout[selectedElement].text}
                          onChange={(e) => updateLayoutElement(selectedElement, { text: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        />
                      </div>
                    )}

                    {/* College Logo Image Upload Control */}
                    {selectedElement === 'collegeLogo' && (
                      <div className="space-y-1.5 border-t border-slate-100 pt-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upload College Logo</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileToBase64(e.target.files[0], (base64) => {
                                  updateLayoutElement('collegeLogo', { logoImage: base64 });
                                });
                              }
                            }}
                            className="flex-1 text-[10px] text-slate-500 file:mr-3 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[9px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer cursor-pointer border border-slate-200 p-1 rounded-xl bg-white"
                          />
                          {layout.collegeLogo?.logoImage && (
                            <button
                              type="button"
                              onClick={() => updateLayoutElement('collegeLogo', { logoImage: '' })}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[9px] font-bold transition-all"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Custom Stamp / Badge Image Upload Control */}
                    {selectedElement === 'customStamp' && (
                      <div className="space-y-1.5 border-t border-slate-100 pt-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upload Custom Stamp / Badge Image</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileToBase64(e.target.files[0], (base64) => {
                                  updateLayoutElement('customStamp', { stampImage: base64 });
                                });
                              }
                            }}
                            className="flex-1 text-[10px] text-slate-500 file:mr-3 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[9px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer cursor-pointer border border-slate-200 p-1 rounded-xl bg-white"
                          />
                          {layout.customStamp?.stampImage && (
                            <button
                              type="button"
                              onClick={() => updateLayoutElement('customStamp', { stampImage: '' })}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[9px] font-bold transition-all"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        {layout.customStamp?.stampImage && (
                          <div className="mt-1.5 w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white p-1">
                            <img src={layout.customStamp.stampImage} alt="Stamp Preview" className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Coordinates Sliders */}
                    {layout[selectedElement] && (
                      <div className="space-y-3">
                        {/* X-Offset */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                            <span>X OFFSET</span>
                            <span>{layout[selectedElement].x !== undefined ? layout[selectedElement].x : 100} pt</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={selectedElement === 'qrCode' || selectedElement === 'collegeLogo' ? (842 - (layout[selectedElement].size || 40)) : 842}
                            value={layout[selectedElement].x !== undefined ? layout[selectedElement].x : 100}
                            onChange={(e) => updateLayoutElement(selectedElement, { x: parseInt(e.target.value) })}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>

                        {/* Y-Offset */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                            <span>Y OFFSET</span>
                            <span>{layout[selectedElement].y} pt</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={selectedElement === 'qrCode' || selectedElement === 'collegeLogo' ? (595 - (layout[selectedElement].size || 40)) : 595}
                            value={layout[selectedElement].y}
                            onChange={(e) => updateLayoutElement(selectedElement, { y: parseInt(e.target.value) })}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>

                        {/* Font Size (For text labels) */}
                        {layout[selectedElement].fontSize !== undefined && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                              <span>FONT SIZE</span>
                              <span>{layout[selectedElement].fontSize} pt</span>
                            </div>
                            <input
                              type="range"
                              min="8"
                              max="72"
                              value={layout[selectedElement].fontSize}
                              onChange={(e) => updateLayoutElement(selectedElement, { fontSize: parseInt(e.target.value) })}
                              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                          </div>
                        )}

                        {/* QR Code / College Logo / Custom Stamp Size */}
                        {(selectedElement === 'qrCode' || selectedElement === 'collegeLogo' || selectedElement === 'customStamp') && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                              <span>SIZE</span>
                              <span>{layout[selectedElement].size || 40} px</span>
                            </div>
                            <input
                              type="range"
                              min="20"
                              max="200"
                              value={layout[selectedElement].size || 40}
                              onChange={(e) => updateLayoutElement(selectedElement, { size: parseInt(e.target.value) })}
                              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                          </div>
                        )}

                        {/* Font Color / Hex */}
                        {layout[selectedElement].color !== undefined && (
                          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Text Color Hex</label>
                              <input
                                type="text"
                                value={layout[selectedElement].color}
                                onChange={(e) => updateLayoutElement(selectedElement, { color: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Picker</label>
                              <input
                                type="color"
                                value={layout[selectedElement].color.startsWith('#') ? layout[selectedElement].color : '#5A52E5'}
                                onChange={(e) => updateLayoutElement(selectedElement, { color: e.target.value })}
                                className="w-full h-8 p-0 border border-slate-200 rounded-lg cursor-pointer bg-transparent"
                              />
                            </div>
                          </div>
                        )}

                        {/* Text Align & Width / Spanning Width */}
                        {(layout[selectedElement].align !== undefined || selectedElement === 'signatures' || layout[selectedElement].width !== undefined) && (
                          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                            {layout[selectedElement].align !== undefined ? (
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Text Align</label>
                                <select
                                  value={layout[selectedElement].align}
                                  onChange={(e) => updateLayoutElement(selectedElement, { align: e.target.value })}
                                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-[10px]"
                                >
                                  <option value="left">Left</option>
                                  <option value="center">Center</option>
                                  <option value="right">Right</option>
                                </select>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Width Spanning</span>
                              </div>
                            )}
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Width ({layout[selectedElement].width || 420} pt)</label>
                              <input
                                type="range"
                                min="50"
                                max="842"
                                value={layout[selectedElement].width || 420}
                                onChange={(e) => updateLayoutElement(selectedElement, { width: parseInt(e.target.value) })}
                                className="w-full h-1 mt-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Custom coordinators signatures list */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40 space-y-3">
                <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-2 gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signatures List ({coordinators.length})</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCoordinators(prev => [...prev, { name: '', title: '', signatureImage: '' }])}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      + Add Signature
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoordinators(prev => [...prev, { name: '', title: 'Principal', signatureImage: '' }])}
                      className="text-[9px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded"
                    >
                      + Principal
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoordinators(prev => [...prev, { name: '', title: 'HOD', signatureImage: '' }])}
                      className="text-[9px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded"
                    >
                      + HOD
                    </button>
                  </div>
                </div>

                {coordinators.length === 0 ? (
                  <p className="text-[10px] text-slate-400 font-semibold py-1.5 text-center">
                    No custom signatures. Fallbacks to Event Organizer details.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {coordinators.map((coord, idx) => (
                      <div key={idx} className="bg-white border border-slate-200/60 p-2.5 rounded-xl shadow-sm space-y-2.5 relative">
                        <button
                          type="button"
                          onClick={() => setCoordinators(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1.5 right-1.5 text-slate-400 hover:text-red-500 transition-colors"
                          title="Remove Signature"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Name (Optional)"
                            value={coord.name}
                            onChange={(e) => {
                              const updated = [...coordinators];
                              updated[idx].name = e.target.value;
                              setCoordinators(updated);
                            }}
                            className="px-2 py-1 border border-slate-200 rounded-lg text-[10px] focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Title (Optional)"
                            value={coord.title}
                            onChange={(e) => {
                              const updated = [...coordinators];
                              updated[idx].title = e.target.value;
                              setCoordinators(updated);
                            }}
                            className="px-2 py-1 border border-slate-200 rounded-lg text-[10px] focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileToBase64(e.target.files[0], (base64) => {
                                  const updated = [...coordinators];
                                  updated[idx].signatureImage = base64;
                                  setCoordinators(updated);
                                });
                              }
                            }}
                            className="text-[9px] text-slate-400 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-primary/10 file:text-primary cursor-pointer"
                          />
                          {coord.signatureImage && (
                            <div className="flex items-center gap-1.5">
                              <img src={coord.signatureImage} alt="Preview" className="h-6 w-12 object-contain bg-slate-50 rounded border border-slate-100 shadow-sm" />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...coordinators];
                                  updated[idx].signatureImage = '';
                                  setCoordinators(updated);
                                }}
                                className="text-[9px] text-red-500 hover:underline font-bold"
                              >
                                Remove Sig
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit auto-issue Action */}
              <button
                type="submit"
                disabled={bulkIssuing || !designerEventId}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95"
              >
                {bulkIssuing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating certificates...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" /> Save Format & Auto-Generate Certificates
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right panel: visual certificate layout builder canvas (col-span-7) */}
          <div className="lg:col-span-7 flex flex-col items-center bg-slate-150 p-6 rounded-3xl border border-slate-200/70 shadow-inner space-y-4">
            <div className="flex justify-between items-center w-full max-w-[640px] px-1 text-slate-500">
              <span className="text-[10px] font-extrabold uppercase tracking-wider block">Visual Live Canvas Preview (640x452 px)</span>
              <span className="text-[9px] font-medium block">Drag labels to adjust X, Y coordinates</span>
            </div>

            {layout ? (
              <div 
                className="w-full max-w-[640px] aspect-[1.414] border border-slate-350 rounded-2xl relative shadow-premium bg-white select-none overflow-hidden"
                style={{ width: '640px', height: '452px' }}
              >
                {/* Background image if set */}
                {certTemplate ? (
                  <img
                    src={certTemplate}
                    alt="Certificate Background Template"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
                  />
                ) : (
                  <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
                    <div className="absolute top-0 bottom-0 left-0 w-[25px] bg-[#0F1016]"></div>
                    <div className="absolute top-0 bottom-0 right-0 w-[25px] bg-[#0F1016]"></div>
                    <div className="absolute top-0 bottom-0 left-[25px] w-[5px] bg-[#5A52E5]"></div>
                    <div className="absolute top-0 bottom-0 right-[25px] w-[5px] bg-[#5A52E5]"></div>
                    <div className="absolute inset-[30px_10px] border border-[#5A52E5] rounded-sm"></div>
                  </div>
                )}

                {/* Draggable overlays */}

                {/* Brand Name */}
                {layout.brandName?.enabled && (
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'brandName')}
                    onClick={() => setSelectedElement('brandName')}
                    className={`absolute z-10 select-none cursor-move font-bold px-1.5 py-0.5 border ${
                      selectedElement === 'brandName'
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                        : 'border-transparent hover:border-slate-300 hover:bg-slate-200/50'
                    } rounded transition-all`}
                    style={{
                      left: `${layout.brandName.x * (640 / 842)}px`,
                      top: `${layout.brandName.y * (452 / 595)}px`,
                      fontSize: `${layout.brandName.fontSize * (640 / 842)}px`,
                      color: layout.brandName.color || '#0F1016',
                      lineHeight: 1,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {layout.brandName.text || 'UniCraft'}
                  </div>
                )}

                {/* College Name */}
                {layout.collegeName?.enabled && (
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'collegeName')}
                    onClick={() => setSelectedElement('collegeName')}
                    className={`absolute z-10 select-none cursor-move px-1.5 py-0.5 border ${
                      selectedElement === 'collegeName'
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                        : 'border-transparent hover:border-slate-300 hover:bg-slate-200/50'
                    } rounded transition-all font-semibold`}
                    style={{
                      left: `${layout.collegeName.x * (640 / 842)}px`,
                      top: `${layout.collegeName.y * (452 / 595)}px`,
                      fontSize: `${layout.collegeName.fontSize * (640 / 842)}px`,
                      color: layout.collegeName.color || '#5A52E5',
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {layout.collegeName.text || 'COLLEGE ENGAGEMENT SYSTEM'}
                  </div>
                )}

                {/* College Logo */}
                {layout.collegeLogo?.enabled && (
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'collegeLogo')}
                    onClick={() => setSelectedElement('collegeLogo')}
                    className={`absolute z-10 select-none cursor-move flex items-center justify-center border ${
                      selectedElement === 'collegeLogo'
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                        : 'border-dashed border-slate-400 bg-slate-50/90 hover:bg-slate-100'
                    } rounded transition-all`}
                    style={{
                      left: `${(layout.collegeLogo.x !== undefined ? layout.collegeLogo.x : 100) * (640 / 842)}px`,
                      top: `${layout.collegeLogo.y * (452 / 595)}px`,
                      width: `${(layout.collegeLogo.size || 40) * (640 / 842)}px`,
                      height: `${(layout.collegeLogo.size || 40) * (452 / 595)}px`
                    }}
                  >
                    {layout.collegeLogo.logoImage ? (
                      <img src={layout.collegeLogo.logoImage} alt="Logo" className="w-full h-full object-contain pointer-events-none" />
                    ) : (
                      <span className="text-[7px] font-bold text-slate-400 text-center leading-none">College Logo</span>
                    )}
                  </div>
                )}

                {/* Certificate Title */}
                {layout.certificateTitle?.enabled && (
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'certificateTitle')}
                    onClick={() => setSelectedElement('certificateTitle')}
                    className={`absolute z-10 select-none cursor-move font-extrabold px-1.5 py-0.5 border ${
                      selectedElement === 'certificateTitle'
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                        : 'border-transparent hover:border-slate-300 hover:bg-slate-200/50'
                    } rounded transition-all`}
                    style={{
                      left: `${layout.certificateTitle.x * (640 / 842)}px`,
                      top: `${layout.certificateTitle.y * (452 / 595)}px`,
                      fontSize: `${layout.certificateTitle.fontSize * (640 / 842)}px`,
                      color: layout.certificateTitle.color || '#0F1016',
                      width: `${(layout.certificateTitle.width || 642) * (640 / 842)}px`,
                      textAlign: layout.certificateTitle.align || 'center',
                      lineHeight: 1
                    }}
                  >
                    {layout.certificateTitle.text || 'CERTIFICATE OF PARTICIPATION'}
                  </div>
                )}

                {/* Presented To Label */}
                {layout.presentedTo?.enabled && (
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'presentedTo')}
                    onClick={() => setSelectedElement('presentedTo')}
                    className={`absolute z-10 select-none cursor-move font-semibold px-1.5 py-0.5 border ${
                      selectedElement === 'presentedTo'
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                        : 'border-transparent hover:border-slate-300 hover:bg-slate-200/50'
                    } rounded transition-all`}
                    style={{
                      left: `${layout.presentedTo.x * (640 / 842)}px`,
                      top: `${layout.presentedTo.y * (452 / 595)}px`,
                      fontSize: `${layout.presentedTo.fontSize * (640 / 842)}px`,
                      color: layout.presentedTo.color || '#4B5563',
                      width: `${(layout.presentedTo.width || 642) * (640 / 842)}px`,
                      textAlign: layout.presentedTo.align || 'center',
                      lineHeight: 1
                    }}
                  >
                    {layout.presentedTo.text || 'This is proudly presented to'}
                  </div>
                )}

                {/* Name */}
                {layout.studentName?.enabled && (
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'studentName')}
                    onClick={() => setSelectedElement('studentName')}
                    className={`absolute z-10 select-none cursor-move font-bold px-1.5 py-0.5 border ${
                      selectedElement === 'studentName'
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                        : 'border-transparent hover:border-slate-300 hover:bg-slate-200/50'
                    } rounded transition-all`}
                    style={{
                      left: `${layout.studentName.x * (640 / 842)}px`,
                      top: `${layout.studentName.y * (452 / 595)}px`,
                      fontSize: `${layout.studentName.fontSize * (640 / 842)}px`,
                      color: layout.studentName.color || '#0F1016',
                      width: `${layout.studentName.width * (640 / 842)}px`,
                      textAlign: layout.studentName.align || 'center',
                      lineHeight: 1
                    }}
                  >
                    [Student Participant Name]
                  </div>
                )}

                {/* Underline for student name */}
                {layout.studentName?.enabled && layout.studentName?.underline && (
                  <div
                    className="absolute z-10 border-t pointer-events-none"
                    style={{
                      left: `${250 * (640 / 842)}px`,
                      top: `${(layout.studentName.y + layout.studentName.fontSize + 7) * (452 / 595)}px`,
                      width: `${(842 - 500) * (640 / 842)}px`,
                      borderColor: layout.studentName.color || '#5A52E5',
                      borderWidth: '1.5px'
                    }}
                  />
                )}

                {/* Description text */}
                {layout.participationText?.enabled && (
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'participationText')}
                    onClick={() => setSelectedElement('participationText')}
                    className={`absolute z-10 select-none cursor-move font-medium px-1.5 py-0.5 border ${
                      selectedElement === 'participationText'
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                        : 'border-transparent hover:border-slate-300 hover:bg-slate-200/50'
                    } rounded transition-all`}
                    style={{
                      left: `${layout.participationText.x * (640 / 842)}px`,
                      top: `${layout.participationText.y * (452 / 595)}px`,
                      fontSize: `${layout.participationText.fontSize * (640 / 842)}px`,
                      color: layout.participationText.color || '#4B5563',
                      width: `${(layout.participationText.width || 642) * (640 / 842)}px`,
                      textAlign: layout.participationText.align || 'center',
                      lineHeight: 1.2
                    }}
                  >
                    {layout.participationText.text || 'for active participation and completion of the college event'}
                  </div>
                )}

                {/* Title */}
                {layout.eventTitle?.enabled && (
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'eventTitle')}
                    onClick={() => setSelectedElement('eventTitle')}
                    className={`absolute z-10 select-none cursor-move font-bold px-1.5 py-0.5 border ${
                      selectedElement === 'eventTitle'
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                        : 'border-transparent hover:border-slate-300 hover:bg-slate-200/50'
                    } rounded transition-all`}
                    style={{
                      left: `${layout.eventTitle.x * (640 / 842)}px`,
                      top: `${layout.eventTitle.y * (452 / 595)}px`,
                      fontSize: `${layout.eventTitle.fontSize * (640 / 842)}px`,
                      color: layout.eventTitle.color || '#5A52E5',
                      width: `${layout.eventTitle.width * (640 / 842)}px`,
                      textAlign: layout.eventTitle.align || 'center',
                      lineHeight: 1
                    }}
                  >
                    [Event Title Highlight]
                  </div>
                )}

                {/* Date */}
                {layout.date?.enabled && (
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'date')}
                    onClick={() => setSelectedElement('date')}
                    className={`absolute z-10 select-none cursor-move font-bold px-1.5 py-0.5 border ${
                      selectedElement === 'date'
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                        : 'border-transparent hover:border-slate-300 hover:bg-slate-200/50'
                    } rounded transition-all`}
                    style={{
                      left: `${layout.date.x * (640 / 842)}px`,
                      top: `${layout.date.y * (452 / 595)}px`,
                      fontSize: `${layout.date.fontSize * (640 / 842)}px`,
                      color: layout.date.color || '#6B7280',
                      width: `${layout.date.width * (640 / 842)}px`,
                      textAlign: layout.date.align || 'center',
                      lineHeight: 1.1
                    }}
                  >
                    [Event Date Venue & Details Description]
                  </div>
                )}

                {/* QR Code */}
                {layout.qrCode?.enabled && (
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'qrCode')}
                    onClick={() => setSelectedElement('qrCode')}
                    className={`absolute z-10 select-none cursor-move flex flex-col items-center justify-center border ${
                      selectedElement === 'qrCode'
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                        : 'border-dashed border-slate-400 bg-slate-50/90 hover:bg-slate-100'
                    } rounded transition-all`}
                    style={{
                      left: `${layout.qrCode.x * (640 / 842)}px`,
                      top: `${layout.qrCode.y * (452 / 595)}px`,
                      width: `${layout.qrCode.size * (640 / 842)}px`,
                      height: `${layout.qrCode.size * (452 / 595)}px`
                    }}
                  >
                    <span className="text-[8px] font-extrabold text-slate-400 leading-none">QR Code</span>
                    <span className="text-[5px] font-bold text-slate-400 mt-1 uppercase leading-none">Verify</span>
                  </div>
                )}

                {/* Certificate ID */}
                {layout.certificateId?.enabled && (
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'certificateId')}
                    onClick={() => setSelectedElement('certificateId')}
                    className={`absolute z-10 select-none cursor-move font-bold px-1.5 py-0.5 border ${
                      selectedElement === 'certificateId'
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                        : 'border-transparent hover:border-slate-300 hover:bg-slate-200/50'
                    } rounded transition-all`}
                    style={{
                      left: `${layout.certificateId.x * (640 / 842)}px`,
                      top: `${layout.certificateId.y * (452 / 595)}px`,
                      fontSize: `${layout.certificateId.fontSize * (640 / 842)}px`,
                      color: layout.certificateId.color || '#1F2937',
                      width: `${layout.certificateId.width * (640 / 842)}px`,
                      textAlign: layout.certificateId.align || 'center',
                      lineHeight: 1
                    }}
                  >
                    [CERT-2026-0001]
                  </div>
                )}

                {/* Custom Stamp / Badge */}
                {layout.customStamp?.enabled && (
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'customStamp')}
                    onClick={() => setSelectedElement('customStamp')}
                    className={`absolute z-10 select-none cursor-move flex items-center justify-center border ${
                      selectedElement === 'customStamp'
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                        : 'border-dashed border-slate-400 bg-slate-50/90 hover:bg-slate-100'
                    } rounded transition-all`}
                    style={{
                      left: `${(layout.customStamp.x !== undefined ? layout.customStamp.x : 400) * (640 / 842)}px`,
                      top: `${(layout.customStamp.y !== undefined ? layout.customStamp.y : 350) * (452 / 595)}px`,
                      width: `${(layout.customStamp.size || 80) * (640 / 842)}px`,
                      height: `${(layout.customStamp.size || 80) * (452 / 595)}px`
                    }}
                  >
                    {layout.customStamp.stampImage ? (
                      <img src={layout.customStamp.stampImage} alt="Stamp" className="w-full h-full object-contain pointer-events-none" />
                    ) : (
                      <span className="text-[7px] font-bold text-slate-400 text-center leading-none">Custom Stamp / Seal</span>
                    )}
                  </div>
                )}

                {/* Signatures */}
                {layout.signatures?.enabled && (
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'signatures', false)}
                    onClick={() => setSelectedElement('signatures')}
                    className={`absolute z-10 select-none cursor-move flex justify-around border ${
                      selectedElement === 'signatures'
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                        : 'border-transparent hover:border-slate-300 hover:bg-slate-200/50'
                    } rounded transition-all`}
                    style={{
                      left: `${(layout.signatures.x !== undefined ? layout.signatures.x : 100) * (640 / 842)}px`,
                      top: `${layout.signatures.y * (452 / 595)}px`,
                      width: `${(layout.signatures.width || 420) * (640 / 842)}px`
                    }}
                  >
                    {coordinators.length === 0 ? (
                      <div className="text-[8px] text-slate-400 font-extrabold border-t border-slate-300/80 pt-0.5 px-4">
                        Event Coordinator
                      </div>
                    ) : (
                      coordinators.map((c, i) => (
                        <div key={i} className="text-center w-20 border-t border-slate-300 pt-0.5 pointer-events-none">
                          {c.signatureImage && (
                            <img src={c.signatureImage} alt="Sig" className="w-12 h-6 mx-auto object-contain -mt-8 pointer-events-none" />
                          )}
                          {c.name ? (
                            <div className="text-[8px] font-extrabold text-slate-700 truncate leading-none">{c.name}</div>
                          ) : null}
                          {c.title ? (
                            <div className="text-[6px] text-slate-400 truncate leading-none mt-0.5">{c.title}</div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full max-w-[640px] aspect-[1.414] border border-dashed border-slate-350 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-white">
                <ShieldCheck className="w-12 h-12 text-slate-300 mb-2 animate-pulse" />
                <p className="text-sm font-bold">Designer loading...</p>
                <span className="text-xs text-slate-400">Select an event from the config panel.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 text-base">Manually Issue Certificate</h4>
              <button
                onClick={() => setShowIssueModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleManualIssue} className="space-y-4">
              {issueError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-xs font-semibold">
                  ⚠️ {issueError}
                </div>
              )}

              {/* Student Dropdown Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Student *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>

              {/* Event Dropdown Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Event *</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {events.map(e => (
                    <option key={e._id} value={e._id}>{e.title}</option>
                  ))}
                </select>
              </div>

              {/* Custom Certificate ID */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Custom Certificate ID (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave blank to auto-generate"
                  value={customCertId}
                  onChange={(e) => setCustomCertId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Create Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 text-base">Edit Certificate Details</h4>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-xs font-semibold">
                  ⚠️ {editError}
                </div>
              )}

              {/* Certificate ID */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Certificate Serial ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CERT-2026-0001"
                  value={editCertId}
                  onChange={(e) => setEditCertId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Student Dropdown Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Recipient Student *</label>
                <select
                  value={editStudentId}
                  onChange={(e) => setEditStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>

              {/* Event Dropdown Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Associated Event *</label>
                <select
                  value={editEventId}
                  onChange={(e) => setEditEventId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {events.map(e => (
                    <option key={e._id} value={e._id}>{e.title}</option>
                  ))}
                </select>
              </div>

              {/* Issued Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Date Issued *</label>
                <input
                  type="date"
                  required
                  value={editIssuedAt}
                  onChange={(e) => setEditIssuedAt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;
