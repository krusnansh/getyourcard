import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function saveLead(data: {
  name: string;
  email: string;
  phone: string;
  hasCreditHistory: boolean;
}) {
  return await addDoc(collection(db, "leads"), {
    ...data,
    createdAt: serverTimestamp(),
    source: "getyourcard-mvp",
  });
}
