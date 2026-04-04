import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const registerWorker = async (email, password, profileData) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'workers', cred.user.uid), {
      ...profileData,
      email,
      role: 'worker',
      createdAt: new Date().toISOString(),
    });
    return cred;
  };

  const registerAdmin = async (email, password, profileData) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'admins', cred.user.uid), {
      ...profileData,
      email,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    return cred;
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setUserRole(null);
  };

  const refreshProfile = async (uid) => {
    const workerDoc = await getDoc(doc(db, 'workers', uid));
    if (workerDoc.exists()) {
      setUserProfile(workerDoc.data());
      setUserRole('worker');
      return;
    }
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    if (adminDoc.exists()) {
      setUserProfile(adminDoc.data());
      setUserRole('admin');
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await refreshProfile(user.uid);
      } else {
        setUserProfile(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, userRole, loading, registerWorker, registerAdmin, login, logout, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
