import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type PetId = "pet1" | "pet2" | "pet3";

type PetContextType = {
  selectedPetId: PetId | null;
  isReady: boolean;
  choosePet: (petId: PetId) => Promise<void>;
  resetPet: () => Promise<void>;
};

const PetContext = createContext<PetContextType | null>(null);
const KEY = "selectedPetId";

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [selectedPetId, setSelectedPetId] = useState<PetId | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(KEY);
      setSelectedPetId((saved as PetId) ?? null);
      setIsReady(true);
    })();
  }, []);

  const choosePet = async (petId: PetId) => {
    await AsyncStorage.setItem(KEY, petId);
    setSelectedPetId(petId);
  };

  const resetPet = async () => {
    await AsyncStorage.removeItem(KEY);
    setSelectedPetId(null);
  };

  return (
    <PetContext.Provider value={{ selectedPetId, isReady, choosePet, resetPet }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error("usePet must be used inside PetProvider");
  return ctx;
}
