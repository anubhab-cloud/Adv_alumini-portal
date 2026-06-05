"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { isFirebaseEnabled, auth as fbAuth, db as fbDb } from "@/lib/firebase";
import { mockDb, MockUser } from "@/lib/mockDb";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

interface AuthContextType {
  user: MockUser | null;
  role: 'alumni' | 'admin' | null;
  loading: boolean;
  isFirebase: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string, 
    email: string, 
    password: string, 
    role: 'alumni' | 'admin',
    batch?: string,
    branch?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<MockUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize Mock DB in browser
  useEffect(() => {
    mockDb.initialize();
  }, []);

  useEffect(() => {
    if (isFirebaseEnabled && fbAuth) {
      const unsubscribe = onAuthStateChanged(fbAuth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // Get user role/profile from firestore
            const docRef = doc(fbDb, "users", firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                name: userData.name || "",
                role: userData.role || "alumni",
                batch: userData.batch || "",
                branch: userData.branch || "",
                company: userData.company || "",
                title: userData.title || "",
                bio: userData.bio || "",
                skills: userData.skills || [],
                photoUrl: userData.photoUrl || "",
                linkedinUrl: userData.linkedinUrl || "",
                githubUrl: userData.githubUrl || "",
              });
            } else {
              // Fallback if auth exists but firestore document doesn't yet
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                role: "alumni",
              });
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user document from Firestore:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      });
      return () => unsubscribe();
    } else {
      // Mock auth initial load check
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("mock_current_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          // Sync with mock database in case profile changed
          const freshUser = mockDb.getUserById(parsed.uid);
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem("mock_current_user", JSON.stringify(freshUser));
          } else {
            setUser(parsed);
          }
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isFirebaseEnabled && fbAuth) {
        await signInWithEmailAndPassword(fbAuth, email, password);
      } else {
        // Mock Auth login
        const users = mockDb.getUsers();
        const found = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        
        if (found) {
          // In a real app we'd check password, here we simulate success
          setUser(found);
          localStorage.setItem("mock_current_user", JSON.stringify(found));
        } else {
          // If no mock user found, and credentials match admin/alumni test emails, create them!
          const lowerEmail = email.toLowerCase();
          if (lowerEmail === "admin@alumni.portal") {
            const adminUser: MockUser = {
              uid: "mock-admin",
              email: "admin@alumni.portal",
              name: "Admin Coordinator",
              role: "admin",
              bio: "Official Admin Account",
              photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400"
            };
            mockDb.createUser(adminUser);
            setUser(adminUser);
            localStorage.setItem("mock_current_user", JSON.stringify(adminUser));
          } else if (lowerEmail === "sarah.chen@gmail.com") {
            const sarahUser: MockUser = {
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
            };
            mockDb.createUser(sarahUser);
            setUser(sarahUser);
            localStorage.setItem("mock_current_user", JSON.stringify(sarahUser));
          } else {
            throw new Error("Invalid credentials. Use 'sarah.chen@gmail.com' or 'admin@alumni.portal' to sign in, or register a new account.");
          }
        }
      }
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "alumni" | "admin",
    batch?: string,
    branch?: string
  ) => {
    setLoading(true);
    try {
      if (isFirebaseEnabled && fbAuth) {
        const userCredential = await createUserWithEmailAndPassword(
          fbAuth,
          email,
          password
        );
        const uid = userCredential.user.uid;
        
        // Save user fields to firestore
        const userProfile = {
          uid,
          email,
          name,
          role,
          batch: batch || "",
          branch: branch || "",
          company: "",
          title: "",
          bio: "",
          skills: [],
          photoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          linkedinUrl: "",
          githubUrl: "",
        };

        await setDoc(doc(fbDb, "users", uid), userProfile);
        
        setUser(userProfile);
      } else {
        // Mock Auth registration
        const users = mockDb.getUsers();
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("Email already in use.");
        }

        const newUid = `mock-${Date.now()}`;
        const newUser: MockUser = {
          uid: newUid,
          email,
          name,
          role,
          batch,
          branch,
          company: "",
          title: "",
          bio: "",
          skills: [],
          photoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          linkedinUrl: "",
          githubUrl: "",
        };

        mockDb.createUser(newUser);
        setUser(newUser);
        localStorage.setItem("mock_current_user", JSON.stringify(newUser));
      }
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseEnabled && fbAuth) {
        await fbSignOut(fbAuth);
      } else {
        localStorage.removeItem("mock_current_user");
        setUser(null);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<MockUser>) => {
    if (!user) throw new Error("No authenticated user.");
    
    try {
      if (isFirebaseEnabled && fbDb) {
        const userRef = doc(fbDb, "users", user.uid);
        await updateDoc(userRef, data as any);
        setUser((prev) => (prev ? { ...prev, ...data } : null));
      } else {
        const updated = mockDb.updateUser(user.uid, data);
        setUser(updated);
        localStorage.setItem("mock_current_user", JSON.stringify(updated));
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  const value = {
    user,
    role: user ? user.role : null,
    loading,
    isFirebase: isFirebaseEnabled,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
