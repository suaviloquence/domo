import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ItemId, SlotId, getItem } from "../data/items";

export type PetId = "Rugy" | "Strawb" | "Ceviche";

type EquippedMap = Partial<Record<SlotId, ItemId>>;
type OwnedMap = Record<PetId, ItemId[]>;
type EquippedByPetMap = Record<PetId, EquippedMap>;

type PetContextType = {
  selectedPetId: PetId | null;
  isReady: boolean;

  choosePet: (petId: PetId) => Promise<void>;
  resetPet: () => Promise<void>;

  coins: number;
  streak: number;
  completeFocusSession: () => Promise<void>;
  addCoins: (amount: number) => Promise<void>;

  // per-pet closets
  ownedByPet: OwnedMap;
  equippedByPet: EquippedByPetMap;

  // actions
  buyItem: (itemId: ItemId) => Promise<boolean>;
  equipItem: (itemId: ItemId) => Promise<void>;
  unequipSlot: (slot: SlotId) => Promise<void>;
  unequipAll: () => Promise<void>;

  // helpers
  isOwned: (itemId: ItemId) => boolean;
  isEquipped: (itemId: ItemId) => boolean;
};

const PetContext = createContext<PetContextType | null>(null);

// Storage keys
const KEY = "selectedPetId";
const COINS_KEY = "coins";
const STREAK_KEY = "streak";
const LAST_DONE_KEY = "lastFocusDate";

// new storage keys
const OWNED_BY_PET_KEY = "ownedByPet_v1";
const EQUIPPED_BY_PET_KEY = "equippedByPet_v1";

// Defaults
const EMPTY_OWNED: OwnedMap = {
  Strawb: [],
  Rugy: [],
  Ceviche: [],
};

const EMPTY_EQUIPPED: EquippedByPetMap = {
  Strawb: {},
  Rugy: {},
  Ceviche: {},
};

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [selectedPetId, setSelectedPetId] = useState<PetId | null>(null);
  const [isReady, setIsReady] = useState(false);

  const [coins, setCoins] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lastFocusDate, setLastFocusDate] = useState<string | null>(null);

  // per-pet closet state
  const [ownedByPet, setOwnedByPet] = useState<OwnedMap>(EMPTY_OWNED);
  const [equippedByPet, setEquippedByPet] =
    useState<EquippedByPetMap>(EMPTY_EQUIPPED);

  useEffect(() => {
    (async () => {
      try {
        const savedPet = await AsyncStorage.getItem(KEY);
        const savedCoins = await AsyncStorage.getItem(COINS_KEY);
        const savedStreak = await AsyncStorage.getItem(STREAK_KEY);
        const savedLast = await AsyncStorage.getItem(LAST_DONE_KEY);

        const savedOwnedByPet = await AsyncStorage.getItem(OWNED_BY_PET_KEY);
        const savedEquippedByPet = await AsyncStorage.getItem(
          EQUIPPED_BY_PET_KEY
        );

        setSelectedPetId((savedPet as PetId) ?? null);
        setCoins(savedCoins ? Number(savedCoins) : 0);
        setStreak(savedStreak ? Number(savedStreak) : 0);
        setLastFocusDate(savedLast ?? null);

        // Load per-pet closet
        const ownedParsed = savedOwnedByPet
          ? (JSON.parse(savedOwnedByPet) as OwnedMap)
          : EMPTY_OWNED;

        const equippedParsed = savedEquippedByPet
          ? (JSON.parse(savedEquippedByPet) as EquippedByPetMap)
          : EMPTY_EQUIPPED;

        // Ensure all pets exist (safe merge)
        setOwnedByPet({ ...EMPTY_OWNED, ...ownedParsed });
        setEquippedByPet({ ...EMPTY_EQUIPPED, ...equippedParsed });
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const choosePet = async (petId: PetId) => {
    await AsyncStorage.setItem(KEY, petId);
    setSelectedPetId(petId);

    // Ensure structure exists in case of older saves
    setOwnedByPet((prev) => ({ ...EMPTY_OWNED, ...prev }));
    setEquippedByPet((prev) => ({ ...EMPTY_EQUIPPED, ...prev }));
  };

  const resetPet = async () => {
    // Reset all saved user state
    await AsyncStorage.multiRemove([
      KEY,
      COINS_KEY,
      STREAK_KEY,
      LAST_DONE_KEY,
      OWNED_BY_PET_KEY,
      EQUIPPED_BY_PET_KEY,
    ]);

    setSelectedPetId(null);
    setCoins(0);
    setStreak(0);
    setLastFocusDate(null);
    setOwnedByPet(EMPTY_OWNED);
    setEquippedByPet(EMPTY_EQUIPPED);
  };

  const completeFocusSession = async () => {
    // +5 coins every completed session
    const newCoins = coins + 5;

    // streak increments only once per calendar day
    const today = new Date().toISOString().slice(0, 10);
    const shouldIncrementStreak = lastFocusDate !== today;
    const newStreak = shouldIncrementStreak ? streak + 1 : streak;

    await AsyncStorage.setItem(COINS_KEY, String(newCoins));
    await AsyncStorage.setItem(STREAK_KEY, String(newStreak));
    await AsyncStorage.setItem(LAST_DONE_KEY, today);

    setCoins(newCoins);
    setStreak(newStreak);
    setLastFocusDate(today);
  };

  const addCoins = async (amount: number) => {
    const newCoins = coins + amount;
    await AsyncStorage.setItem(COINS_KEY, String(newCoins));
    setCoins(newCoins);
  };

  // ---------- Closet helpers ----------
  const isOwned = (itemId: ItemId) => {
    if (!selectedPetId) return false;
    return (ownedByPet[selectedPetId] || []).includes(itemId);
  };

  const isEquipped = (itemId: ItemId) => {
    if (!selectedPetId) return false;
    const eq = equippedByPet[selectedPetId] || {};
    return Object.values(eq).includes(itemId);
  };

  // ---------- Closet actions ----------
  const buyItem = async (itemId: ItemId) => {
    if (!selectedPetId) return false;

    const def = getItem(itemId);
    if (!def) return false;

    // prevent buying items for other pets
    if (def.petId !== selectedPetId) return false;

    const owned = ownedByPet[selectedPetId] || [];
    if (owned.includes(itemId)) return true;

    if (coins < def.price) return false;

    const newCoins = coins - def.price;
    const newOwnedForPet = [...owned, itemId];

    const nextOwnedByPet: OwnedMap = {
      ...ownedByPet,
      [selectedPetId]: newOwnedForPet,
    };

    await AsyncStorage.setItem(COINS_KEY, String(newCoins));
    await AsyncStorage.setItem(OWNED_BY_PET_KEY, JSON.stringify(nextOwnedByPet));

    setCoins(newCoins);
    setOwnedByPet(nextOwnedByPet);

    return true;
  };

  const equipItem = async (itemId: ItemId) => {
    if (!selectedPetId) return;

    const def = getItem(itemId);
    if (!def) return;

    if (def.petId !== selectedPetId) return;

    const owned = ownedByPet[selectedPetId] || [];
    if (!owned.includes(itemId)) return;

    const nextEquippedForPet: EquippedMap = {
        // wipe everything so only ONE item can be equipped at a time // hopefully this will work? hmm
        [def.slot]: itemId,
      };
      

    const nextEquippedByPet: EquippedByPetMap = {
      ...equippedByPet,
      [selectedPetId]: nextEquippedForPet,
    };

    await AsyncStorage.setItem(
      EQUIPPED_BY_PET_KEY,
      JSON.stringify(nextEquippedByPet)
    );

    setEquippedByPet(nextEquippedByPet);
  };

  const unequipSlot = async (slot: SlotId) => {
    if (!selectedPetId) return;

    const current = { ...(equippedByPet[selectedPetId] || {}) };
    delete current[slot];

    const nextEquippedByPet: EquippedByPetMap = {
      ...equippedByPet,
      [selectedPetId]: current,
    };

    await AsyncStorage.setItem(
      EQUIPPED_BY_PET_KEY,
      JSON.stringify(nextEquippedByPet)
    );

    setEquippedByPet(nextEquippedByPet);
  };

  const unequipAll = async () => {
    if (!selectedPetId) return;
  
    const nextEquippedByPet: EquippedByPetMap = {
      ...equippedByPet,
      [selectedPetId]: {},
    };
  
    await AsyncStorage.setItem(
      EQUIPPED_BY_PET_KEY,
      JSON.stringify(nextEquippedByPet)
    );
  
    setEquippedByPet(nextEquippedByPet);
  };
  

  return (
    <PetContext.Provider
      value={{
        selectedPetId,
        isReady,
        choosePet,
        resetPet,
        coins,
        streak,
        completeFocusSession,
        addCoins,

        ownedByPet,
        equippedByPet,
        buyItem,
        equipItem,
        unequipSlot,
        unequipAll,

        isOwned,
        isEquipped,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error("usePet must be used inside PetProvider");
  return ctx;
}
