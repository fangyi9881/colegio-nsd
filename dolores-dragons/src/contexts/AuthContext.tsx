import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestore-errors';
import { calculateLevel } from '../utils/gamification';

interface AuthContextType {
  currentUser: User | null;
  userProfile: any | null;
  loading: boolean;
  justLoggedIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  sendResetEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

async function sendWelcomeEmail(email: string, displayName: string) {
  try {
    await fetch('/api/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, displayName }),
    });
  } catch (err) {
    console.error('Welcome email failed:', err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const pendingDisplayName = useRef<string | null>(null);

  const markLoggedIn = () => {
    setJustLoggedIn(true);
    setTimeout(() => setJustLoggedIn(false), 5000);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            const isAdmin = user.email === 'basketnsd@gmail.com';

            const urlParams = new URLSearchParams(window.location.search);
            const refId = urlParams.get('ref');
            let bonusXp = 0;
            let bonusScales = 0;

            if (refId && refId !== user.uid) {
              try {
                const referrerRef = doc(db, 'users', refId);
                const referrerSnap = await getDoc(referrerRef);
                if (referrerSnap.exists()) {
                  const referrerData = referrerSnap.data();
                  const newReferrerXp = (referrerData.xp || 0) + 500;
                  await setDoc(referrerRef, {
                    xp: newReferrerXp,
                    totalScales: (referrerData.totalScales || 0) + 5,
                    level: calculateLevel(newReferrerXp),
                  }, { merge: true });
                  bonusXp = 500;
                  bonusScales = 5;
                }
              } catch (err) {
                console.error('Error processing referral:', err);
              }
            }

            const effectiveName = user.displayName || pendingDisplayName.current || '';
            pendingDisplayName.current = null;

            const newProfile = {
              uid: user.uid,
              displayName: effectiveName,
              email: user.email || '',
              photoURL: user.photoURL || '',
              role: isAdmin ? 'admin' : 'user',
              username: `user_${user.uid.substring(0, 8).toLowerCase()}`,
              userType: 'Aficionado',
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              streakCount: 1,
              totalScales: 1 + bonusScales,
              specialScales: 0,
              xp: 100 + bonusXp,
              level: calculateLevel(100 + bonusXp),
              achievements: ['first_login'],
              dailyTriviaGames: 0,
              lastTriviaDate: serverTimestamp(),
              weeklyTriviaWins: 0,
              lastWeeklyReset: serverTimestamp(),
              lastStreakUpdate: serverTimestamp(),
              ownedFrames: ['default'],
              activeFrame: 'default',
              completedQuests: [],
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
            if (user.email) sendWelcomeEmail(user.email, effectiveName);

            if (refId) window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            const data = userSnap.data();
            const isAdmin = user.email === 'basketnsd@gmail.com';

            const now = new Date();
            const lastUpdate = data.lastStreakUpdate?.toDate() || data.lastLogin?.toDate() || new Date(0);
            const lastTriviaDate = data.lastTriviaDate?.toDate() || new Date(0);
            const lastWeeklyReset = data.lastWeeklyReset?.toDate() || new Date(0);

            const isSameDay = (d1: Date, d2: Date) =>
              d1.getFullYear() === d2.getFullYear() &&
              d1.getMonth() === d2.getMonth() &&
              d1.getDate() === d2.getDate();

            const isYesterday = (d1: Date, d2: Date) => {
              const y = new Date(d1);
              y.setDate(y.getDate() - 1);
              return isSameDay(y, d2);
            };

            const isWeeklyResetNeeded = (lr: Date) => {
              const ago = new Date();
              ago.setDate(ago.getDate() - 7);
              return lr < ago;
            };

            let newStreakCount = data.streakCount || 0;
            let newTotalScales = data.totalScales || 0;
            let newSpecialScales = data.specialScales || 0;
            let newXP = data.xp || 0;
            let streakUpdated = false;
            const triviaReset = !isSameDay(now, lastTriviaDate);
            const weeklyReset = isWeeklyResetNeeded(lastWeeklyReset);

            if (!isSameDay(now, lastUpdate)) {
              streakUpdated = true;
              if (isYesterday(now, lastUpdate)) {
                newStreakCount += 1;
                newXP += 50;
              } else {
                newStreakCount = 1;
                newXP += 20;
              }
              newTotalScales += 1;
              if (newStreakCount % 7 === 0) {
                newSpecialScales += 1;
                newXP += 200;
              }
            }

            const newLevel = calculateLevel(newXP);

            const updates: any = {
              lastLogin: serverTimestamp(),
              displayName: user.displayName || data.displayName || '',
              photoURL: data.photoURL || user.photoURL || '',
              ...(isAdmin ? { role: 'admin' } : {}),
              level: newLevel,
              ...(streakUpdated ? {
                streakCount: newStreakCount,
                totalScales: newTotalScales,
                specialScales: newSpecialScales,
                xp: newXP,
                lastStreakUpdate: serverTimestamp(),
                completedQuests: [],
              } : {}),
              ...(triviaReset ? { dailyTriviaGames: 0 } : {}),
              ...(weeklyReset ? { weeklyTriviaWins: 0, lastWeeklyReset: serverTimestamp() } : {}),
            };

            await setDoc(userRef, updates, { merge: true });
            setUserProfile({
              ...data,
              ...updates,
              lastLogin: now,
              lastStreakUpdate: streakUpdated ? now : lastUpdate,
              lastTriviaDate: data.lastTriviaDate,
            });
          }

          // Handle addFriend from URL
          const urlParams = new URLSearchParams(window.location.search);
          const addFriendId = urlParams.get('addFriend');
          if (addFriendId && addFriendId !== user.uid) {
            try {
              await setDoc(doc(db, 'friend_requests', `${user.uid}_${addFriendId}`), {
                senderId: user.uid,
                receiverId: addFriendId,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
              window.history.replaceState({}, document.title, window.location.pathname);
              alert('Solicitud de amistad enviada automáticamente.');
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, 'friend_requests');
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      } else {
        setUserProfile(null);
      }

      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      markLoggedIn();
    } catch (error) {
      console.error('Error signing in with Google', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      markLoggedIn();
    } catch (error) {
      console.error('Error signing in with email', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    pendingDisplayName.current = displayName;
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await firebaseUpdateProfile(user, { displayName });
      await sendEmailVerification(user);
      markLoggedIn();
    } catch (error) {
      pendingDisplayName.current = null;
      console.error('Error signing up with email', error);
      throw error;
    }
  };

  const sendResetEmail = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending reset email', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    if (currentUser) {
      await firebaseUpdateProfile(currentUser, updates);
      setCurrentUser({ ...currentUser, ...updates } as User);
      if (userProfile) setUserProfile({ ...userProfile, ...updates });
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    justLoggedIn,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendResetEmail,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
