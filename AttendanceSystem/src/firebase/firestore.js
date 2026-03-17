import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';

// Generic CRUD operations
export const createDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Document not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getDocuments = async (collectionName, constraints = []) => {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: documents };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Upload file to Firebase Storage
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Specific operations for collections
export const getUsers = async (role = null) => {
  const constraints = role ? [where('role', '==', role)] : [];
  return getDocuments('users', constraints);
};

export const getSchedules = async (facultyId = null) => {
  const constraints = facultyId ? [where('facultyId', '==', facultyId)] : [];
  return getDocuments('schedules', constraints);
};

export const getAttendance = async (facultyId = null, startDate = null, endDate = null) => {
  let constraints = [];
  
  if (facultyId) {
    constraints.push(where('facultyId', '==', facultyId));
  }
  
  if (startDate && endDate) {
    constraints.push(where('timestamp', '>=', startDate));
    constraints.push(where('timestamp', '<=', endDate));
  }
  
  constraints.push(orderBy('timestamp', 'desc'));
  
  return getDocuments('attendance', constraints);
};

export const createAttendance = async (facultyId, photoUrl, scheduleId = null) => {
  return createDocument('attendance', {
    facultyId,
    scheduleId,
    photoUrl,
    timestamp: serverTimestamp()
  });
};
