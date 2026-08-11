const bcrypt = require('bcryptjs');
const db = require('./config/db');

// Set use mock db if no URI is provided to allow seeding the correct storage
process.env.USE_MOCK_DB = (!process.env.MONGODB_URI) ? 'true' : 'false';

const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const Certificate = require('./models/Certificate');

const seed = async () => {
  console.log('Starting database seeding...');
  await db.connectDB();

  // Helper clear function
  const clearCollection = async (model) => {
    if (process.env.USE_MOCK_DB === 'true') {
      model.model.write([]);
    } else {
      await model.model.deleteMany({});
    }
  };

  await clearCollection(User);
  await clearCollection(Event);
  await clearCollection(Registration);
  await clearCollection(Certificate);

  console.log('Cleared existing data.');

  // Create hashed passwords
  const adminPassword = bcrypt.hashSync('admin123', 10);
  const studentPassword = bcrypt.hashSync('student123', 10);

  // 1. Create Users
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@gmail.com',
    password: adminPassword,
    role: 'admin',
    profile: {
      department: 'Administration',
      rollNumber: 'ADM-001',
      phone: '+15550100',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  });

  const student1 = await User.create({
    name: 'Rachana Jambhulkar',
    email: 'rachana@gmail.com',
    password: studentPassword,
    role: 'student',
    profile: {
      department: 'Computer Science',
      rollNumber: 'CS-2023-042',
      phone: '+15550199',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    badges: ['First Code', 'Event Explorer']
  });

  const student2 = await User.create({
    name: 'Aman Verma',
    email: 'aman.v@example.com',
    password: studentPassword,
    role: 'student',
    profile: {
      department: 'Information Technology',
      rollNumber: 'IT-2023-110',
      phone: '+15550188',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    badges: ['Code Warrior']
  });

  const student3 = await User.create({
    name: 'Sneha Patel',
    email: 'sneha.p@example.com',
    password: studentPassword,
    role: 'student',
    profile: {
      department: 'Computer Science',
      rollNumber: 'CS-2023-089',
      phone: '+15550177',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  });

  const student4 = await User.create({
    name: 'Rohit Singh',
    email: 'rohit.s@example.com',
    password: studentPassword,
    role: 'student',
    profile: {
      department: 'Electronics & Communication',
      rollNumber: 'EC-2023-015',
      phone: '+15550166',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  });

  const student5 = await User.create({
    name: 'Kavya Nair',
    email: 'kavya.n@example.com',
    password: studentPassword,
    role: 'student',
    profile: {
      department: 'Information Technology',
      rollNumber: 'IT-2023-007',
      phone: '+15550155',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  });

  console.log('Seeded users.');

  // 2. Create Events
  const eventsData = [
    {
      title: 'AI/ML Workshop',
      description: 'Explore the fundamentals of Machine Learning and Artificial Intelligence in this hands-on workshop. You will learn about algorithms, datasets, model training, and real-world applications.',
      date: '2025-05-24',
      time: '10:00 AM - 01:00 PM',
      venue: 'Seminar Hall, CSE Building',
      category: 'Workshops',
      poster: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
      organizer: 'Computer Science Department',
      maxSeats: 150,
      status: 'Published'
    },
    {
      title: 'CodeSprint 2.0',
      description: 'The ultimate competitive programming challenge is here! Test your problem-solving skills, algorithms speed, and data structure layouts to win exciting cash prizes.',
      date: '2025-05-31',
      time: '09:00 AM - 12:00 PM',
      venue: 'Online',
      category: 'Hackathons',
      poster: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80',
      organizer: 'Coding Club & CSE Department',
      maxSeats: 500,
      status: 'Published'
    },
    {
      title: 'Tech Talk: Cloud Computing',
      description: 'Understand the future of scalable infrastructure, Serverless technologies, AWS, GCP platforms, and modern deployment models like Docker and Kubernetes.',
      date: '2025-06-03',
      time: '11:00 AM - 01:00 PM',
      venue: 'Auditorium 1',
      category: 'Seminars',
      poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      organizer: 'Cloud Computing Cell',
      maxSeats: 250,
      status: 'Published'
    },
    {
      title: 'Web Development Bootcamp',
      description: 'A comprehensive frontend-to-backend web boot camp utilizing React.js, Express, and Mongo databases. Create responsive layout websites from scratch.',
      date: '2025-06-12',
      time: '10:00 AM - 04:00 PM',
      venue: 'Lab 4, CSE',
      category: 'Workshops',
      poster: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
      organizer: 'Web Club',
      maxSeats: 120,
      status: 'Draft'
    },
    {
      title: 'Cyber Security Awareness',
      description: 'Discover how to secure cloud services, local client interfaces, avoid social engineering exploits, and secure your web apps using JWT and CSRF safeguards.',
      date: '2025-06-20',
      time: '02:00 PM - 04:00 PM',
      venue: 'Seminar Hall, CSE Building',
      category: 'Seminars',
      poster: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
      organizer: 'Computer Science Department',
      maxSeats: 200,
      status: 'Draft'
    }
  ];

  const seededEvents = [];
  for (let eventData of eventsData) {
    const ev = await Event.create(eventData);
    seededEvents.push(ev);
  }

  console.log('Seeded events.');

  // 3. Create Registrations & Certificates
  const aimlEvent = seededEvents[0];
  const codeSprintEvent = seededEvents[1];
  const cloudEvent = seededEvents[2];

  // Register students to AIML Event
  const students = [student1, student2, student3, student4, student5];
  const aimlRegistrations = [];

  for (let i = 0; i < students.length; i++) {
    const reg = await Registration.create({
      studentId: students[i]._id,
      eventId: aimlEvent._id,
      status: 'Registered',
      attendance: i < 3 ? 'Present' : (i === 3 ? 'Absent' : 'Pending'), // 3 present, 1 absent, 1 pending
      registeredAt: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)).toISOString() // 5 days ago
    });
    aimlRegistrations.push(reg);

    // Issue certificates for present students
    if (i < 3) {
      const certId = `CERT-20250524-000${i + 1}`;
      await Certificate.create({
        certificateId: certId,
        studentId: students[i]._id,
        eventId: aimlEvent._id,
        issuedAt: new Date().toISOString(),
        verificationCode: Math.random().toString(36).substring(2, 15).toUpperCase()
      });
    }
  }

  // Register some to CodeSprint
  await Registration.create({
    studentId: student1._id,
    eventId: codeSprintEvent._id,
    status: 'Registered',
    attendance: 'Pending',
    registeredAt: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString()
  });
  await Registration.create({
    studentId: student2._id,
    eventId: codeSprintEvent._id,
    status: 'Registered',
    attendance: 'Pending',
    registeredAt: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)).toISOString()
  });

  // Register some to Cloud Computing
  await Registration.create({
    studentId: student1._id,
    eventId: cloudEvent._id,
    status: 'Registered',
    attendance: 'Pending',
    registeredAt: new Date(Date.now()).toISOString()
  });

  console.log('Seeded registrations and certificates.');
  console.log('Database seeding successfully completed.');
  process.exit(0);
};

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
