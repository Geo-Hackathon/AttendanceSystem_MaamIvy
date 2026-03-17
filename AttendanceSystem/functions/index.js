const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Create user with role
exports.createUser = functions.https.onCall(async (data, context) => {
  // Check if the caller is an admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
  
  if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can create users.');
  }

  const { email, password, name, role } = data;

  if (!email || !password || !name || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
  }

  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name
    });

    // Create user profile in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: email,
      name: name,
      role: role,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      uid: userRecord.uid,
      message: 'User created successfully'
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Delete user
exports.deleteUser = functions.https.onCall(async (data, context) => {
  // Check if the caller is an admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
  
  if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can delete users.');
  }

  const { uid } = data;

  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'User UID is required.');
  }

  try {
    // Delete user from Firebase Auth
    await admin.auth().deleteUser(uid);

    // Delete user profile from Firestore
    await admin.firestore().collection('users').doc(uid).delete();

    return {
      success: true,
      message: 'User deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Update user role
exports.updateUserRole = functions.https.onCall(async (data, context) => {
  // Check if the caller is an admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
  
  if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can update user roles.');
  }

  const { uid, newRole } = data;

  if (!uid || !newRole) {
    throw new functions.https.HttpsError('invalid-argument', 'User UID and new role are required.');
  }

  if (!['faculty', 'admin'].includes(newRole)) {
    throw new functions.https.HttpsError('invalid-argument', 'Role must be either "faculty" or "admin".');
  }

  try {
    // Update user role in Firestore
    await admin.firestore().collection('users').doc(uid).update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      message: 'User role updated successfully'
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Get attendance analytics
exports.getAttendanceAnalytics = functions.https.onCall(async (data, context) => {
  // Check if the caller is an admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
  
  if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can access analytics.');
  }

  const { facultyId, startDate, endDate } = data;

  if (!facultyId || !startDate || !endDate) {
    throw new functions.https.HttpsError('invalid-argument', 'Faculty ID, start date, and end date are required.');
  }

  try {
    // Get attendance records
    const attendanceSnapshot = await admin.firestore()
      .collection('attendance')
      .where('facultyId', '==', facultyId)
      .where('timestamp', '>=', new Date(startDate))
      .where('timestamp', '<=', new Date(endDate))
      .orderBy('timestamp', 'desc')
      .get();

    // Get schedules
    const schedulesSnapshot = await admin.firestore()
      .collection('schedules')
      .where('facultyId', '==', facultyId)
      .get();

    const attendance = attendanceSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const schedules = schedulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      data: {
        attendance,
        schedules,
        totalAttendance: attendance.length,
        totalSchedules: schedules.length
      }
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Send attendance reminder notification
exports.sendAttendanceReminder = functions.https.onCall(async (data, context) => {
  // Check if the caller is an admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
  
  if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can send reminders.');
  }

  const { facultyId, message } = data;

  if (!facultyId) {
    throw new functions.https.HttpsError('invalid-argument', 'Faculty ID is required.');
  }

  try {
    // Get faculty member's email
    const facultyDoc = await admin.firestore().collection('users').doc(facultyId).get();
    
    if (!facultyDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Faculty member not found.');
    }

    const facultyEmail = facultyDoc.data().email;

    // In a real implementation, you would send an email or push notification here
    // For now, we'll just log it
    console.log(`Attendance reminder sent to ${facultyEmail}: ${message || 'Please mark your attendance for today\'s classes.'}`);

    return {
      success: true,
      message: 'Reminder sent successfully'
    };
  } catch (error) {
    console.error('Error sending reminder:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
