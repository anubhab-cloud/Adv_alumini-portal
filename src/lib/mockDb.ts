// Mock Database for offline testing. Persisted via LocalStorage.

export interface MockUser {
  uid: string;
  email: string;
  name: string;
  role: 'alumni' | 'admin';
  batch?: string;
  branch?: string;
  company?: string;
  title?: string;
  bio?: string;
  skills?: string[];
  photoUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface MockEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  location: string;
  coordinator: string;
  activities: string[];
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
  qrCodeData: string; // Ticket token
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
}

const DEFAULT_USERS: MockUser[] = [
  {
    uid: "mock-user-1",
    email: "sarah.chen@gmail.com",
    name: "Sarah Chen",
    role: "alumni",
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
    activities: ["Campus Tour", "Formal Networking Dinner", "Alumni vs Student Football Match", "Keynote Addresses"]
  },
  {
    id: "event-2",
    title: "Silicon Valley Tech Mixer & Panel",
    description: "An evening of insights on AI and cloud scalability. Panel includes engineering leaders from Google, Meta, and OpenAI, followed by a networking dinner.",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35).toISOString(), // 35 days from now
    location: "Grand Hyatt Regency, San Francisco",
    coordinator: "Sarah Chen",
    activities: ["AI panel discussion", "Q&A with Speakers", "Cocktails & Networking Session"]
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
    id: "gal-1",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
    title: "Main Campus Landmark View",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString()
  },
  {
    id: "gal-2",
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800",
    title: "Annual Hackathon Winner Presentation",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString()
  },
  {
    id: "gal-3",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
    title: "Alumni Panel Meet 2025",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString()
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
  },

  // User Operations
  getUsers: (): MockUser[] => {
    return getStorageItem<MockUser[]>("mock_users", DEFAULT_USERS);
  },
  
  getUserById: (uid: string): MockUser | undefined => {
    const users = getStorageItem<MockUser[]>("mock_users", DEFAULT_USERS);
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

  createRegistration: (reg: Omit<MockRegistration, 'id' | 'registeredAt'>): MockRegistration => {
    const registrations = getStorageItem<MockRegistration[]>("mock_registrations", []);
    const newReg = {
      ...reg,
      id: `reg-${Date.now()}`,
      registeredAt: new Date().toISOString()
    };
    registrations.push(newReg);
    setStorageItem("mock_registrations", registrations);
    return newReg;
  },

  getRegistrationsByUser: (userId: string): MockRegistration[] => {
    const registrations = getStorageItem<MockRegistration[]>("mock_registrations", []);
    return registrations.filter(r => r.userId === userId);
  },

  // Memories Operations
  getMemories: (): MockMemory[] => {
    const memories = getStorageItem<MockMemory[]>("mock_memories", DEFAULT_MEMORIES);
    // Sort by created date descending
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
    return getStorageItem<MockGalleryImage[]>("mock_gallery", DEFAULT_GALLERY);
  },

  uploadGalleryImage: (url: string, title: string): MockGalleryImage => {
    const gallery = getStorageItem<MockGalleryImage[]>("mock_gallery", DEFAULT_GALLERY);
    const newImg = {
      id: `gal-${Date.now()}`,
      url,
      title,
      uploadedAt: new Date().toISOString()
    };
    gallery.push(newImg);
    setStorageItem("mock_gallery", gallery);
    return newImg;
  }
};
