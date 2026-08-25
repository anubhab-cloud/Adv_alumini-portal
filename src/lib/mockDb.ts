// Expanded Mock Database for offline testing. Persisted via LocalStorage.

export interface MockUser {
  uid: string;
  email: string;
  name: string;
  role: 'alumni' | 'admin';
  isActive: boolean;
  batch?: string;
  branch?: string;
  company?: string;
  title?: string;
  bio?: string;
  skills?: string[];
  photoUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
}

export interface MockEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  coordinator: string;
  activities: string[];
  capacity?: number;
}

export interface MockRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  activitiesSelected: string[];
  foodPreference: 'Veg' | 'Non-Veg';
  registeredAt: string;
  qrCodeData: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
  isWaitlisted?: boolean;
}

export interface MockMemoryComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface MockMemory {
  id: string;
  title: string;
  story: string;
  imageUrl: string;
  userId: string;
  userName: string;
  createdAt: string;
  likes: number;
  comments: MockMemoryComment[];
}

export interface MockGalleryImage {
  id: string;
  url: string;
  title: string;
  uploadedAt: string;
  type: 'photo' | 'video';
  category: '2026 Reunion' | 'Sports' | 'Cultural' | 'Batch Photos';
  batch: string;
  eventId?: string;
  uploadedBy?: string;
  uploadedById?: string;
}

export interface MockJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  description: string;
  postedBy: string;
  postedById: string;
  postedAt: string;
  applicants: string[];
}

export interface MockContribution {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  date: string;
  txToken: string;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────
export type AuditAction =
  | 'approve_user'
  | 'delete_user'
  | 'restore_user'
  | 'toggle_role'
  | 'create_event'
  | 'delete_event'
  | 'restore_event'
  | 'upload_gallery'
  | 'delete_gallery'
  | 'restore_gallery'
  | 'checkin'
  | 'undo_checkin';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  adminName: string;
  adminUid: string;
  target: string;       // human-readable target label
  targetId: string;
  timestamp: string;
  meta?: Record<string, string | number | boolean>;
}

// ─── Trash (soft-delete bins) ─────────────────────────────────────────────────
export interface TrashEntry<T> {
  id: string;
  data: T;
  deletedAt: string;
  deletedBy: string;
}

const DEFAULT_USERS: MockUser[] = [
  {
    uid: "mock-user-1",
    email: "sarah.chen@gmail.com",
    name: "Sarah Chen",
    role: "alumni",
    isActive: true, // Pre-approved
    batch: "2022",
    branch: "Computer Science & Engineering",
    company: "Google",
    title: "Senior Software Engineer",
    bio: "Passionate about building scalable cloud architectures and mentoring the next generation of engineers.",
    skills: ["Next.js", "Go", "Kubernetes", "System Design"],
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    linkedinUrl: "https://linkedin.com",
    githubUrl: "https://github.com",
  },
  {
    uid: "mock-user-2",
    email: "marcus.vance@gmail.com",
    name: "Marcus Vance",
    role: "alumni",
    isActive: true, // Pre-approved
    batch: "2020",
    branch: "Electronics & Communication Engineering",
    company: "Tesla",
    title: "Embedded Systems Architect",
    bio: "Designing the hardware-software interfaces that power electric drive systems. Let's chat hardware!",
    skills: ["C++", "Embedded RTOS", "PCB Design", "Rust"],
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    linkedinUrl: "https://linkedin.com",
    githubUrl: "https://github.com",
  },
  {
    uid: "mock-user-3",
    email: "priya.sharma@gmail.com",
    name: "Priya Sharma",
    role: "alumni",
    isActive: true, // Pre-approved
    batch: "2021",
    branch: "Information Technology",
    company: "Stripe",
    title: "Product Manager",
    bio: "Product enthusiast focusing on developer APIs and global payment corridors. Always happy to run a resume check.",
    skills: ["Product Strategy", "API Design", "SQL", "A/B Testing"],
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    linkedinUrl: "https://linkedin.com",
    githubUrl: "https://github.com",
  },
  {
    uid: "mock-admin",
    email: "admin@alumni.portal",
    name: "Admin Coordinator",
    role: "admin",
    isActive: true, // Pre-approved
    bio: "Official Advanced Alumni Portal administrative coordinator account.",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
  }
];

const DEFAULT_EVENTS: MockEvent[] = [
  {
    id: "event-1",
    title: "Annual Alumni Homecoming & Gala 2026",
    description: "Welcome back to where it all started! Join us for a formal gala dinner, campus tours, networking sessions, and sharing classic college stories.",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(), // 12 days from now
    location: "Main Campus Auditorium & Gardens",
    coordinator: "Admin Coordinator",
    activities: ["Campus Tour", "Formal Networking Dinner", "Alumni vs Student Football Match", "Keynote Addresses"],
    capacity: 5
  },
  {
    id: "event-2",
    title: "Silicon Valley Tech Mixer & Panel",
    description: "An evening of insights on AI and cloud scalability. Panel includes engineering leaders from Google, Meta, and OpenAI, followed by a networking dinner.",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35).toISOString(), // 35 days from now
    location: "Grand Hyatt Regency, San Francisco",
    coordinator: "Sarah Chen",
    activities: ["AI panel discussion", "Q&A with Speakers", "Cocktails & Networking Session"],
    capacity: 2
  },
  {
    id: "event-past-1",
    title: "Silver Jubilee Reunion Class of 2000",
    description: "Celebrating 25 years of graduating! A nostalgic weekend on campus with interactive panels, memories sharing session, and a campus walk down memory lane.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(), // 45 days ago
    location: "Auditorium Hall & Lake View Ground",
    coordinator: "Admin Coordinator",
    activities: ["Homecoming Registration", "Panel: 25 Years of Tech Growth", "Alumni Banquet Dinner", "Nostalgic Campus Walk"],
    capacity: 100
  }
];

const DEFAULT_MEMORIES: MockMemory[] = [
  {
    id: "memory-1",
    title: "Library All-Nighter before Semester Exams",
    story: "Remember when the library stayed open 24/7? We had double-espresso shots, piles of notes, and slept right on the desks. We barely passed the DSP exam, but wouldn't trade it for anything!",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600",
    userId: "mock-user-1",
    userName: "Sarah Chen",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    likes: 24,
    comments: [
      {
        id: "comm-1",
        userId: "mock-user-2",
        userName: "Marcus Vance",
        text: "I still have nightmares about that DSP exam paper! Absolute classic memory.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
      },
      {
        id: "comm-2",
        userId: "mock-user-3",
        userName: "Priya Sharma",
        text: "Pretty sure I was the one who bought the double espressos. Miss you all!",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
      }
    ]
  },
  {
    id: "memory-2",
    title: "Graduation Day - Batch of 2020!",
    story: "Throwing caps in the air during such a crazy year. We did it against all odds, and it started our beautiful professional journeys.",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600",
    userId: "mock-user-2",
    userName: "Marcus Vance",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(), // 18 days ago
    likes: 42,
    comments: []
  }
];

const DEFAULT_GALLERY: MockGalleryImage[] = [
  {
    id: "gal-p1",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
    title: "Alumni Panel Discussion Q&A",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    type: "photo",
    category: "2026 Reunion",
    batch: "All",
    eventId: "event-past-1",
    uploadedBy: "Marcus Vance",
    uploadedById: "mock-user-2"
  },
  {
    id: "gal-p2",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
    title: "Homecoming Group Photo Auditorium",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    type: "photo",
    category: "2026 Reunion",
    batch: "All",
    eventId: "event-past-1",
    uploadedBy: "Sarah Chen",
    uploadedById: "mock-user-1"
  },
  {
    id: "gal-1",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
    title: "Main Campus Landmark View",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    type: "photo",
    category: "2026 Reunion",
    batch: "All"
  },
  {
    id: "gal-2",
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800",
    title: "Annual Hackathon Winner Presentation",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    type: "photo",
    category: "Batch Photos",
    batch: "2022"
  },
  {
    id: "gal-3",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
    title: "Alumni Panel Meet 2025",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    type: "photo",
    category: "2026 Reunion",
    batch: "All"
  },
  {
    id: "gal-4",
    url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=800",
    title: "Alumni Soccer Championship Trophy",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    type: "photo",
    category: "Sports",
    batch: "2020"
  },
  {
    id: "gal-5",
    url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=800",
    title: "Cultural Night Music Festival",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    type: "photo",
    category: "Cultural",
    batch: "2021"
  },
  {
    id: "gal-v1",
    url: "https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-raising-toast-at-dinner-party-40243-large.mp4",
    title: "Homecoming Gala Highlights Dinner Toast",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    type: "video",
    category: "2026 Reunion",
    batch: "All"
  },
  {
    id: "gal-v2",
    url: "https://assets.mixkit.co/videos/preview/mixkit-people-celebrating-at-a-concert-with-confetti-and-lights-34293-large.mp4",
    title: "Cultural Festival DJ Night Celebrations",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    type: "video",
    category: "Cultural",
    batch: "2021"
  }
];

const DEFAULT_JOBS: MockJob[] = [
  {
    id: "job-1",
    title: "Senior Full Stack Engineer (Next.js & Go)",
    company: "Google",
    location: "Bangalore, India",
    type: "Full-time",
    description: "Looking for a seasoned developer to join our core cloud platform team. Requires 5+ years of experience building performant React frontend sites and Go microservices. Alumni referral available!",
    postedBy: "Sarah Chen",
    postedById: "mock-user-1",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    applicants: []
  },
  {
    id: "job-2",
    title: "Product Design Intern",
    company: "Stripe",
    location: "Remote (APAC)",
    type: "Internship",
    description: "Join the Stripe payment flows design team for a 6-month internship. You will work alongside engineers and product managers to redesign merchant onboarding checkouts. Ideal for final-year students.",
    postedBy: "Priya Sharma",
    postedById: "mock-user-3",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    applicants: []
  }
];

const DEFAULT_CONTRIBUTIONS: MockContribution[] = [
  {
    id: "contrib-1",
    userId: "mock-user-1",
    userName: "Sarah Chen",
    amount: 15000,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    txToken: "TXN-87612345"
  },
  {
    id: "contrib-2",
    userId: "mock-user-2",
    userName: "Marcus Vance",
    amount: 10000,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    txToken: "TXN-12398745"
  }
];

// LocalStorage Helper functions
const isClient = typeof window !== 'undefined';

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isClient) return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
}

function setStorageItem<T>(key: string, value: T): void {
  if (isClient) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export const mockDb = {
  initialize: () => {
    if (!isClient) return;
    if (!localStorage.getItem("mock_users")) {
      setStorageItem("mock_users", DEFAULT_USERS);
    }
    if (!localStorage.getItem("mock_events")) {
      setStorageItem("mock_events", DEFAULT_EVENTS);
    }
    if (!localStorage.getItem("mock_registrations")) {
      setStorageItem("mock_registrations", []);
    }
    if (!localStorage.getItem("mock_memories")) {
      setStorageItem("mock_memories", DEFAULT_MEMORIES);
    }
    if (!localStorage.getItem("mock_gallery")) {
      setStorageItem("mock_gallery", DEFAULT_GALLERY);
    }
    if (!localStorage.getItem("mock_jobs")) {
      setStorageItem("mock_jobs", DEFAULT_JOBS);
    }
    if (!localStorage.getItem("mock_contributions")) {
      setStorageItem("mock_contributions", DEFAULT_CONTRIBUTIONS);
    }
  },

  // User Operations
  getUsers: (): MockUser[] => {
    const users = getStorageItem<MockUser[]>("mock_users", DEFAULT_USERS);
    return users.map(u => ({
      ...u,
      isActive: u.isActive !== undefined ? u.isActive : true
    }));
  },
  
  getUserById: (uid: string): MockUser | undefined => {
    const users = mockDb.getUsers();
    return users.find(u => u.uid === uid);
  },

  updateUser: (uid: string, data: Partial<MockUser>): MockUser => {
    const users = getStorageItem<MockUser[]>("mock_users", DEFAULT_USERS);
    const updatedUsers = users.map(u => (u.uid === uid ? { ...u, ...data } : u));
    setStorageItem("mock_users", updatedUsers);
    return updatedUsers.find(u => u.uid === uid)!;
  },

  createUser: (user: MockUser): void => {
    const users = getStorageItem<MockUser[]>("mock_users", DEFAULT_USERS);
    if (!users.some(u => u.uid === user.uid)) {
      users.push(user);
      setStorageItem("mock_users", users);
    }
  },

  approveUser: (uid: string): void => {
    const users = getStorageItem<MockUser[]>("mock_users", DEFAULT_USERS);
    const updatedUsers = users.map(u => (u.uid === uid ? { ...u, isActive: true } : u));
    setStorageItem("mock_users", updatedUsers);
  },

  deleteUser: (uid: string): void => {
    const users = getStorageItem<MockUser[]>("mock_users", DEFAULT_USERS);
    const filtered = users.filter(u => u.uid !== uid);
    setStorageItem("mock_users", filtered);
  },

  // Event Operations
  getEvents: (): MockEvent[] => {
    return getStorageItem<MockEvent[]>("mock_events", DEFAULT_EVENTS);
  },

  createEvent: (event: Omit<MockEvent, 'id'>): MockEvent => {
    const events = getStorageItem<MockEvent[]>("mock_events", DEFAULT_EVENTS);
    const newEvent = { ...event, id: `event-${Date.now()}` };
    events.push(newEvent);
    setStorageItem("mock_events", events);
    return newEvent;
  },

  updateEvent: (id: string, data: Partial<MockEvent>): MockEvent => {
    const events = getStorageItem<MockEvent[]>("mock_events", DEFAULT_EVENTS);
    const updatedEvents = events.map(e => (e.id === id ? { ...e, ...data } : e));
    setStorageItem("mock_events", updatedEvents);
    return updatedEvents.find(e => e.id === id)!;
  },

  // Registration Operations
  getRegistrations: (): MockRegistration[] => {
    return getStorageItem<MockRegistration[]>("mock_registrations", []);
  },

  createRegistration: (reg: Omit<MockRegistration, 'id' | 'registeredAt' | 'isCheckedIn'>): MockRegistration => {
    const registrations = getStorageItem<MockRegistration[]>("mock_registrations", []);
    const newReg: MockRegistration = {
      ...reg,
      id: `reg-${Date.now()}`,
      registeredAt: new Date().toISOString(),
      isCheckedIn: false
    };
    registrations.push(newReg);
    setStorageItem("mock_registrations", registrations);
    return newReg;
  },

  getRegistrationsByUser: (userId: string): MockRegistration[] => {
    const registrations = getStorageItem<MockRegistration[]>("mock_registrations", []);
    return registrations.filter(r => r.userId === userId);
  },

  checkInRegistration: (regId: string): MockRegistration | undefined => {
    const registrations = getStorageItem<MockRegistration[]>("mock_registrations", []);
    const updated = registrations.map(r => (r.id === regId || r.qrCodeData === regId ? {
      ...r,
      isCheckedIn: true,
      checkedInAt: new Date().toISOString()
    } : r));
    setStorageItem("mock_registrations", updated);
    return updated.find(r => r.id === regId || r.qrCodeData === regId);
  },

  // Memories Operations
  getMemories: (): MockMemory[] => {
    const memories = getStorageItem<MockMemory[]>("mock_memories", DEFAULT_MEMORIES);
    return [...memories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createMemory: (memory: Omit<MockMemory, 'id' | 'createdAt' | 'likes' | 'comments'>): MockMemory => {
    const memories = getStorageItem<MockMemory[]>("mock_memories", DEFAULT_MEMORIES);
    const newMemory = {
      ...memory,
      id: `mem-${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    };
    memories.push(newMemory);
    setStorageItem("mock_memories", memories);
    return newMemory;
  },

  addCommentToMemory: (memoryId: string, comment: Omit<MockMemoryComment, 'id' | 'createdAt'>): MockMemoryComment => {
    const memories = getStorageItem<MockMemory[]>("mock_memories", DEFAULT_MEMORIES);
    const newComment = {
      ...comment,
      id: `comm-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updatedMemories = memories.map(m => {
      if (m.id === memoryId) {
        return { ...m, comments: [...m.comments, newComment] };
      }
      return m;
    });
    setStorageItem("mock_memories", updatedMemories);
    return newComment;
  },

  likeMemory: (memoryId: string): number => {
    const memories = getStorageItem<MockMemory[]>("mock_memories", DEFAULT_MEMORIES);
    let updatedLikes = 0;
    const updatedMemories = memories.map(m => {
      if (m.id === memoryId) {
        updatedLikes = m.likes + 1;
        return { ...m, likes: updatedLikes };
      }
      return m;
    });
    setStorageItem("mock_memories", updatedMemories);
    return updatedLikes;
  },

  // Gallery Operations
  getGalleryImages: (): MockGalleryImage[] => {
    const images = getStorageItem<MockGalleryImage[]>("mock_gallery", DEFAULT_GALLERY);
    // Ensure all have required properties mapped in case of legacy items
    return images.map(img => ({
      ...img,
      type: img.type || 'photo',
      category: img.category || '2026 Reunion',
      batch: img.batch || 'All'
    }));
  },

  uploadGalleryImage: (
    url: string, 
    title: string, 
    type: 'photo' | 'video', 
    category: '2026 Reunion' | 'Sports' | 'Cultural' | 'Batch Photos', 
    batch: string,
    eventId?: string,
    uploadedBy?: string,
    uploadedById?: string
  ): MockGalleryImage => {
    const gallery = getStorageItem<MockGalleryImage[]>("mock_gallery", DEFAULT_GALLERY);
    const newImg: MockGalleryImage = {
      id: `gal-${Date.now()}`,
      url,
      title,
      uploadedAt: new Date().toISOString(),
      type,
      category,
      batch,
      eventId,
      uploadedBy,
      uploadedById
    };
    gallery.push(newImg);
    setStorageItem("mock_gallery", gallery);
    return newImg;
  },

  // Job Board Operations
  getJobs: (): MockJob[] => {
    return getStorageItem<MockJob[]>("mock_jobs", DEFAULT_JOBS);
  },

  createJob: (job: Omit<MockJob, 'id' | 'postedAt' | 'applicants'>): MockJob => {
    const jobs = getStorageItem<MockJob[]>("mock_jobs", DEFAULT_JOBS);
    const newJob: MockJob = {
      ...job,
      id: `job-${Date.now()}`,
      postedAt: new Date().toISOString(),
      applicants: []
    };
    jobs.push(newJob);
    setStorageItem("mock_jobs", jobs);
    return newJob;
  },

  applyToJob: (jobId: string, userUid: string): void => {
    const jobs = getStorageItem<MockJob[]>("mock_jobs", DEFAULT_JOBS);
    const updated = jobs.map(j => {
      if (j.id === jobId && !j.applicants.includes(userUid)) {
        return { ...j, applicants: [...j.applicants, userUid] };
      }
      return j;
    });
    setStorageItem("mock_jobs", updated);
  },

  // Contribution Operations
  getContributions: (): MockContribution[] => {
    return getStorageItem<MockContribution[]>("mock_contributions", DEFAULT_CONTRIBUTIONS);
  },

  createContribution: (contrib: Omit<MockContribution, 'id' | 'date' | 'txToken'>): MockContribution => {
    const contributions = getStorageItem<MockContribution[]>("mock_contributions", DEFAULT_CONTRIBUTIONS);
    const newContrib: MockContribution = {
      ...contrib,
      id: `contrib-${Date.now()}`,
      date: new Date().toISOString(),
      txToken: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
    };
    contributions.push(newContrib);
    setStorageItem("mock_contributions", contributions);
    return newContrib;
  },

  // ─── Audit Log ────────────────────────────────────────────────────────────
  getAuditLog: (): AuditEntry[] => {
    return getStorageItem<AuditEntry[]>("mock_audit_log", []);
  },

  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry => {
    const log = getStorageItem<AuditEntry[]>("mock_audit_log", []);
    const newEntry: AuditEntry = {
      ...entry,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    log.unshift(newEntry);
    if (log.length > 200) log.pop();
    setStorageItem("mock_audit_log", log);
    return newEntry;
  },

  // ─── Soft-delete: Users ───────────────────────────────────────────────────
  softDeleteUser: (uid: string, deletedBy: string): MockUser | undefined => {
    const users = getStorageItem<MockUser[]>("mock_users", DEFAULT_USERS);
    const target = users.find(u => u.uid === uid);
    if (!target) return undefined;
    const trash = getStorageItem<TrashEntry<MockUser>[]>("trash_users", []);
    trash.unshift({ id: `trash-${uid}`, data: target, deletedAt: new Date().toISOString(), deletedBy });
    setStorageItem("trash_users", trash);
    setStorageItem("mock_users", users.filter(u => u.uid !== uid));
    return target;
  },

  getTrashedUsers: (): TrashEntry<MockUser>[] => {
    return getStorageItem<TrashEntry<MockUser>[]>("trash_users", []);
  },

  restoreUser: (uid: string): MockUser | undefined => {
    const trash = getStorageItem<TrashEntry<MockUser>[]>("trash_users", []);
    const entry = trash.find(t => t.data.uid === uid);
    if (!entry) return undefined;
    const users = getStorageItem<MockUser[]>("mock_users", DEFAULT_USERS);
    if (!users.some(u => u.uid === uid)) {
      users.push(entry.data);
      setStorageItem("mock_users", users);
    }
    setStorageItem("trash_users", trash.filter(t => t.data.uid !== uid));
    return entry.data;
  },

  // ─── Soft-delete: Events ──────────────────────────────────────────────────
  softDeleteEvent: (id: string, deletedBy: string): MockEvent | undefined => {
    const events = getStorageItem<MockEvent[]>("mock_events", DEFAULT_EVENTS);
    const target = events.find(e => e.id === id);
    if (!target) return undefined;
    const trash = getStorageItem<TrashEntry<MockEvent>[]>("trash_events", []);
    trash.unshift({ id: `trash-${id}`, data: target, deletedAt: new Date().toISOString(), deletedBy });
    setStorageItem("trash_events", trash);
    setStorageItem("mock_events", events.filter(e => e.id !== id));
    return target;
  },

  getTrashedEvents: (): TrashEntry<MockEvent>[] => {
    return getStorageItem<TrashEntry<MockEvent>[]>("trash_events", []);
  },

  restoreEvent: (id: string): MockEvent | undefined => {
    const trash = getStorageItem<TrashEntry<MockEvent>[]>("trash_events", []);
    const entry = trash.find(t => t.data.id === id);
    if (!entry) return undefined;
    const events = getStorageItem<MockEvent[]>("mock_events", DEFAULT_EVENTS);
    if (!events.some(e => e.id === id)) {
      events.push(entry.data);
      setStorageItem("mock_events", events);
    }
    setStorageItem("trash_events", trash.filter(t => t.data.id !== id));
    return entry.data;
  },

  // ─── Soft-delete: Gallery ─────────────────────────────────────────────────
  softDeleteGalleryImage: (id: string, deletedBy: string): MockGalleryImage | undefined => {
    const gallery = getStorageItem<MockGalleryImage[]>("mock_gallery", DEFAULT_GALLERY);
    const target = gallery.find(g => g.id === id);
    if (!target) return undefined;
    const trash = getStorageItem<TrashEntry<MockGalleryImage>[]>("trash_gallery", []);
    trash.unshift({ id: `trash-${id}`, data: target, deletedAt: new Date().toISOString(), deletedBy });
    setStorageItem("trash_gallery", trash);
    setStorageItem("mock_gallery", gallery.filter(g => g.id !== id));
    return target;
  },

  getTrashedGallery: (): TrashEntry<MockGalleryImage>[] => {
    return getStorageItem<TrashEntry<MockGalleryImage>[]>("trash_gallery", []);
  },

  restoreGalleryImage: (id: string): MockGalleryImage | undefined => {
    const trash = getStorageItem<TrashEntry<MockGalleryImage>[]>("trash_gallery", []);
    const entry = trash.find(t => t.data.id === id);
    if (!entry) return undefined;
    const gallery = getStorageItem<MockGalleryImage[]>("mock_gallery", DEFAULT_GALLERY);
    if (!gallery.some(g => g.id === id)) {
      gallery.push(entry.data);
      setStorageItem("mock_gallery", gallery);
    }
    setStorageItem("trash_gallery", trash.filter(t => t.data.id !== id));
    return entry.data;
  },

  // ─── Undo check-in ────────────────────────────────────────────────────────
  undoCheckIn: (regId: string): MockRegistration | undefined => {
    const registrations = getStorageItem<MockRegistration[]>("mock_registrations", []);
    const updated = registrations.map(r =>
      (r.id === regId || r.qrCodeData === regId)
        ? { ...r, isCheckedIn: false, checkedInAt: undefined }
        : r
    );
    setStorageItem("mock_registrations", updated);
    return updated.find(r => r.id === regId || r.qrCodeData === regId);
  },
};
