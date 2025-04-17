import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Property } from './properties';
import { serverTimestamp, Timestamp } from 'firebase/firestore';

export interface PredictionHistory {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: string;
  propertyType: string;
  propertyArea: string;
  propertyImage: string;
  prediction: {
    priceChange: number;
    recommendation: string;
    points: string[];
    reasoning: string;
  };
  createdAt: Timestamp;
}

export async function savePrediction(property: Property, prediction: any) {
  const user = auth.currentUser;
  if (!user) {
    console.warn('User must be authenticated to save predictions');
    return null;
  }

  try {
    const predictionsRef = collection(db, 'predictions');
    const docRef = await addDoc(predictionsRef, {
      userId: user.uid,
      createdAt: serverTimestamp(),
      propertyId: property.id,
      propertyTitle: property.title,
      propertyLocation: property.location,
      propertyPrice: property.price,
      propertyType: property.type,
      propertyArea: property.area,
      propertyImage: property.image,
      prediction,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving prediction:', error);
    return null;
  }
}

export async function getPredictionHistory(): Promise<PredictionHistory[]> {
  const user = auth.currentUser;
  if (!user) {
    console.warn('User must be authenticated to get prediction history');
    return [];
  }

  try {
    const predictionsRef = collection(db, 'predictions');
    const q = query(
      predictionsRef,
      where('userId', '==', user.uid)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => ({
      id: doc.id,
      propertyId: doc.data().propertyId,
      propertyTitle: doc.data().propertyTitle,
      propertyLocation: doc.data().propertyLocation,
      propertyPrice: doc.data().propertyPrice,
      propertyType: doc.data().propertyType,
      propertyArea: doc.data().propertyArea,
      propertyImage: doc.data().propertyImage,
      prediction: doc.data().prediction,
      createdAt: doc.data().createdAt,
    }))
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      }) as PredictionHistory[];
  } catch (error) {
    console.error('Error getting prediction history:', error);
    return [];
  }
}