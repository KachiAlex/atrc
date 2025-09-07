import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './config';

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  COMMUNITIES: 'communities',
  DISPUTES: 'disputes',
  EVENTS: 'events',
  ANNOUNCEMENTS: 'announcements',
  REPORTS: 'reports'
};

// Generic CRUD operations
export const createDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      id: docRef.id,
      data: { ...data, id: docRef.id }
    };
  } catch (error) {
    console.error(`Create ${collectionName} error:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data() }
      };
    } else {
      return {
        success: false,
        error: 'Document not found'
      };
    }
  } catch (error) {
    console.error(`Get ${collectionName} error:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      data: { id: docId, ...data }
    };
  } catch (error) {
    console.error(`Update ${collectionName} error:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    
    return { success: true };
  } catch (error) {
    console.error(`Delete ${collectionName} error:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getCollection = async (collectionName, filters = [], orderByField = 'createdAt', orderDirection = 'desc', limitCount = null) => {
  try {
    let q = collection(db, collectionName);
    
    // Apply filters
    filters.forEach(filter => {
      q = query(q, where(filter.field, filter.operator, filter.value));
    });
    
    // Apply ordering
    q = query(q, orderBy(orderByField, orderDirection));
    
    // Apply limit
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      success: true,
      data: documents
    };
  } catch (error) {
    console.error(`Get ${collectionName} collection error:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Real-time listeners
export const subscribeToCollection = (collectionName, callback, filters = [], orderByField = 'createdAt', orderDirection = 'desc') => {
  let q = collection(db, collectionName);
  
  // Apply filters
  filters.forEach(filter => {
    q = query(q, where(filter.field, filter.operator, filter.value));
  });
  
  // Apply ordering
  q = query(q, orderBy(orderByField, orderDirection));
  
  return onSnapshot(q, (querySnapshot) => {
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    callback(documents);
  });
};

export const subscribeToDocument = (collectionName, docId, callback) => {
  const docRef = doc(db, collectionName, docId);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

// Communities
export const createCommunity = async (communityData) => {
  return await createDocument(COLLECTIONS.COMMUNITIES, {
    ...communityData,
    statistics: {
      totalCitizens: 0,
      totalDisputes: 0,
      resolvedDisputes: 0,
      totalEvents: 0,
      lastActivity: new Date()
    }
  });
};

export const getCommunities = async (filters = []) => {
  return await getCollection(COLLECTIONS.COMMUNITIES, filters, 'name', 'asc');
};

export const getCommunity = async (communityId) => {
  return await getDocument(COLLECTIONS.COMMUNITIES, communityId);
};

export const updateCommunity = async (communityId, data) => {
  return await updateDocument(COLLECTIONS.COMMUNITIES, communityId, data);
};

// Disputes
export const createDispute = async (disputeData) => {
  return await createDocument(COLLECTIONS.DISPUTES, {
    ...disputeData,
    status: 'pending',
    priority: 'medium',
    hearings: [],
    evidence: [],
    notes: [],
    resolution: null,
    appeal: {
      isAppealed: false,
      appealStatus: 'pending'
    }
  });
};

export const getDisputes = async (filters = []) => {
  return await getCollection(COLLECTIONS.DISPUTES, filters, 'createdAt', 'desc');
};

export const getDispute = async (disputeId) => {
  return await getDocument(COLLECTIONS.DISPUTES, disputeId);
};

export const updateDispute = async (disputeId, data) => {
  return await updateDocument(COLLECTIONS.DISPUTES, disputeId, data);
};

export const addDisputeHearing = async (disputeId, hearingData) => {
  const docRef = doc(db, COLLECTIONS.DISPUTES, disputeId);
  await updateDoc(docRef, {
    hearings: arrayUnion({
      ...hearingData,
      date: new Date(hearingData.date),
      recordedAt: serverTimestamp()
    }),
    updatedAt: serverTimestamp()
  });
  
  return { success: true };
};

export const addDisputeEvidence = async (disputeId, evidenceData) => {
  const docRef = doc(db, COLLECTIONS.DISPUTES, disputeId);
  await updateDoc(docRef, {
    evidence: arrayUnion({
      ...evidenceData,
      uploadedAt: serverTimestamp()
    }),
    updatedAt: serverTimestamp()
  });
  
  return { success: true };
};

export const resolveDispute = async (disputeId, resolutionData) => {
  const docRef = doc(db, COLLECTIONS.DISPUTES, disputeId);
  await updateDoc(docRef, {
    status: 'resolved',
    resolution: {
      ...resolutionData,
      resolvedAt: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  });
  
  return { success: true };
};

// Events
export const createEvent = async (eventData) => {
  return await createDocument(COLLECTIONS.EVENTS, {
    ...eventData,
    status: 'planned',
    visibility: 'community',
    attendees: {
      expected: 0,
      confirmed: [],
      actual: 0
    },
    invitations: [],
    feedback: [],
    media: {
      images: [],
      videos: [],
      documents: []
    }
  });
};

export const getEvents = async (filters = []) => {
  return await getCollection(COLLECTIONS.EVENTS, filters, 'startDate', 'asc');
};

export const getEvent = async (eventId) => {
  return await getDocument(COLLECTIONS.EVENTS, eventId);
};

export const updateEvent = async (eventId, data) => {
  return await updateDocument(COLLECTIONS.EVENTS, eventId, data);
};

export const attendEvent = async (eventId, userId) => {
  const docRef = doc(db, COLLECTIONS.EVENTS, eventId);
  await updateDoc(docRef, {
    'attendees.confirmed': arrayUnion(userId),
    updatedAt: serverTimestamp()
  });
  
  return { success: true };
};

export const cancelEventAttendance = async (eventId, userId) => {
  const docRef = doc(db, COLLECTIONS.EVENTS, eventId);
  await updateDoc(docRef, {
    'attendees.confirmed': arrayRemove(userId),
    updatedAt: serverTimestamp()
  });
  
  return { success: true };
};

// Announcements
export const createAnnouncement = async (announcementData) => {
  return await createDocument(COLLECTIONS.ANNOUNCEMENTS, {
    ...announcementData,
    priority: 'medium',
    visibility: 'community',
    isActive: true,
    isPinned: false,
    readBy: [],
    statistics: {
      totalViews: 0,
      totalReads: 0,
      lastViewed: null
    },
    notifications: {
      email: { sent: false, sentAt: null, recipients: [] },
      sms: { sent: false, sentAt: null, recipients: [] },
      push: { sent: false, sentAt: null, recipients: [] }
    }
  });
};

export const getAnnouncements = async (filters = []) => {
  return await getCollection(COLLECTIONS.ANNOUNCEMENTS, filters, 'createdAt', 'desc');
};

export const getAnnouncement = async (announcementId) => {
  return await getDocument(COLLECTIONS.ANNOUNCEMENTS, announcementId);
};

export const updateAnnouncement = async (announcementId, data) => {
  return await updateDocument(COLLECTIONS.ANNOUNCEMENTS, announcementId, data);
};

export const markAnnouncementAsRead = async (announcementId, userId) => {
  const docRef = doc(db, COLLECTIONS.ANNOUNCEMENTS, announcementId);
  await updateDoc(docRef, {
    readBy: arrayUnion({
      user: userId,
      readAt: serverTimestamp()
    }),
    'statistics.totalReads': increment(1),
    'statistics.lastViewed': serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return { success: true };
};

// Users
export const getUsers = async (filters = []) => {
  return await getCollection(COLLECTIONS.USERS, filters, 'firstName', 'asc');
};

export const getUser = async (userId) => {
  return await getDocument(COLLECTIONS.USERS, userId);
};

export const updateUser = async (userId, data) => {
  return await updateDocument(COLLECTIONS.USERS, userId, data);
};

// Search functions
export const searchCommunities = async (searchTerm) => {
  const filters = [
    { field: 'name', operator: '>=', value: searchTerm },
    { field: 'name', operator: '<=', value: searchTerm + '\uf8ff' }
  ];
  return await getCollection(COLLECTIONS.COMMUNITIES, filters, 'name', 'asc');
};

export const searchDisputes = async (searchTerm) => {
  const filters = [
    { field: 'title', operator: '>=', value: searchTerm },
    { field: 'title', operator: '<=', value: searchTerm + '\uf8ff' }
  ];
  return await getCollection(COLLECTIONS.DISPUTES, filters, 'createdAt', 'desc');
};

export const searchEvents = async (searchTerm) => {
  const filters = [
    { field: 'title', operator: '>=', value: searchTerm },
    { field: 'title', operator: '<=', value: searchTerm + '\uf8ff' }
  ];
  return await getCollection(COLLECTIONS.EVENTS, filters, 'startDate', 'asc');
};

// Statistics and analytics
export const getCommunityStatistics = async (communityId) => {
  try {
    const [disputesResult, eventsResult, announcementsResult] = await Promise.all([
      getCollection(COLLECTIONS.DISPUTES, [{ field: 'community', operator: '==', value: communityId }]),
      getCollection(COLLECTIONS.EVENTS, [{ field: 'community', operator: '==', value: communityId }]),
      getCollection(COLLECTIONS.ANNOUNCEMENTS, [{ field: 'community', operator: '==', value: communityId }])
    ]);

    const disputes = disputesResult.data || [];
    const events = eventsResult.data || [];
    const announcements = announcementsResult.data || [];

    const statistics = {
      totalDisputes: disputes.length,
      resolvedDisputes: disputes.filter(d => d.status === 'resolved').length,
      totalEvents: events.length,
      totalAnnouncements: announcements.length,
      disputeResolutionRate: disputes.length > 0 ? (disputes.filter(d => d.status === 'resolved').length / disputes.length) * 100 : 0
    };

    return {
      success: true,
      data: statistics
    };
  } catch (error) {
    console.error('Get community statistics error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
