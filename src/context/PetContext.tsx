// src/context/PetContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState } from "react-native";
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

  // inventory + meters
  food: number; // 0..∞
  setFood: (next: number) => Promise<void>;

  hunger: number; // 0..5
  setHunger: (next: number) => Promise<void>;
  feedPet: () => Promise<void>; // costs 1 food, +1 hunger (max 5)

  checkAndDepleteHunger: () => Promise<void>; // run daily hunger decay
};

const PetContext = createContext<PetContextType | null>(null);

// Storage keys
const KEY = "selectedPetId";
const COINS_KEY = "coins";
const STREAK_KEY = "streak";
const LAST_DONE_KEY = "lastFocusDate";

// Closet keys
const OWNED_BY_PET_KEY = "ownedByPet_v1";
const EQUIPPED_BY_PET_KEY = "equippedByPet_v1";

// Inventory / meters keys
const FOOD_KEY = "food";
const HUNGER_KEY = "petHunger"; // 0..5
const HUNGER_LAST_KEY = "petHungerLast"; // YYYY-MM-DD

// Defaults
const EMPTY_OWNED: OwnedMap = { Strawb: [], Rugy: [], Ceviche: [] };
const EMPTY_EQUIPPED: EquippedByPetMap = { Strawb: {}, Rugy: {}, Ceviche: {} };

const todayKey = () => new Date().toISOString().split("T")[0];
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [selectedPetId, setSelectedPetId] = useState<PetId | null>(null);
  const [isReady, setIsReady] = useState(false);

  const [coins, setCoins] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lastFocusDate, setLastFocusDate] = useState<string | null>(null);

  const [ownedByPet, setOwnedByPet] = useState<OwnedMap>(EMPTY_OWNED);
  const [equippedByPet, setEquippedByPet] =
    useState<EquippedByPetMap>(EMPTY_EQUIPPED);

  // inventory + meters
  const [food, setFoodState] = useState<number>(0);
  const [hunger, setHungerState] = useState<number>(5);

  // ----- Load everything on startup -----
  useEffect(() => {
    (async () => {
      try {
        const savedPet = await AsyncStorage.getItem(KEY);
        const savedCoins = await AsyncStorage.getItem(COINS_KEY);
        const savedStreak = await AsyncStorage.getItem(STREAK_KEY);
        const savedLast = await AsyncStorage.getItem(LAST_DONE_KEY);

        const savedOwnedByPet = await AsyncStorage.getItem(OWNED_BY_PET_KEY);
        const savedEquippedByPet = await AsyncStorage.getItem(EQUIPPED_BY_PET_KEY);

        const savedFood = await AsyncStorage.getItem(FOOD_KEY);
        const savedHunger = await AsyncStorage.getItem(HUNGER_KEY);
        const savedHungerLast = await AsyncStorage.getItem(HUNGER_LAST_KEY);

        setSelectedPetId((savedPet as PetId) ?? null);
        setCoins(savedCoins ? Number(savedCoins) : 0);
        setStreak(savedStreak ? Number(savedStreak) : 0);
        setLastFocusDate(savedLast ?? null);

        const ownedParsed = savedOwnedByPet
          ? (JSON.parse(savedOwnedByPet) as OwnedMap)
          : EMPTY_OWNED;

        const equippedParsed = savedEquippedByPet
          ? (JSON.parse(savedEquippedByPet) as EquippedByPetMap)
          : EMPTY_EQUIPPED;

        setOwnedByPet({ ...EMPTY_OWNED, ...ownedParsed });
        setEquippedByPet({ ...EMPTY_EQUIPPED, ...equippedParsed });

        setFoodState(savedFood ? Math.max(0, Math.floor(Number(savedFood))) : 0);

        const h = savedHunger != null ? Number(savedHunger) : 5;
        setHungerState(clamp(Number.isFinite(h) ? Math.floor(h) : 5, 0, 5));

        // ensure hunger last exists
        if (!savedHungerLast) {
          await AsyncStorage.setItem(HUNGER_LAST_KEY, todayKey());
        }
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  // ----- Hunger decay helpers -----
  async function applyDailyHungerDecay() {
    const last = await AsyncStorage.getItem(HUNGER_LAST_KEY);
    const t = todayKey();

    if (!last) {
      await AsyncStorage.setItem(HUNGER_LAST_KEY, t);
      return;
    }
    if (last === t) return;

    const lastDate = new Date(last + "T00:00:00");
    const nowDate = new Date(t + "T00:00:00");
    const diffDays = Math.floor(
      (nowDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 0) {
      setHungerState((prev) => {
        const next = clamp(prev - diffDays, 0, 5);
        AsyncStorage.setItem(HUNGER_KEY, String(next));
        return next;
      });
      await AsyncStorage.setItem(HUNGER_LAST_KEY, t);
    }
  }

  const checkAndDepleteHunger = async () => {
    await applyDailyHungerDecay();
  };

  // Run decay on mount + when app returns active
  useEffect(() => {
    checkAndDepleteHunger();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkAndDepleteHunger();
      }
    });
    return () => sub.remove();
  }, []);

  // ----- Setters that persist -----
  const setFood = async (next: number) => {
    const safe = Math.max(0, Math.floor(next));
    await AsyncStorage.setItem(FOOD_KEY, String(safe));
    setFoodState(safe);
  };

  const setHunger = async (next: number) => {
    const safe = clamp(Math.floor(next), 0, 5);
    await AsyncStorage.setItem(HUNGER_KEY, String(safe));
    await AsyncStorage.setItem(HUNGER_LAST_KEY, todayKey());
    setHungerState(safe);
  };

  // ----- Feeding: costs 1 food, +1 hunger -----
  const feedPet = async () => {
    if (food <= 0) return;
    if (hunger >= 5) return;

    const nextFood = food - 1;
    const nextHunger = clamp(hunger + 1, 0, 5);

    await AsyncStorage.setItem(FOOD_KEY, String(nextFood));
    await AsyncStorage.setItem(HUNGER_KEY, String(nextHunger));
    await AsyncStorage.setItem(HUNGER_LAST_KEY, todayKey());

    setFoodState(nextFood);
    setHungerState(nextHunger);
  };

  // ----- Pet selection / reset -----
  const choosePet = async (petId: PetId) => {
    await AsyncStorage.setItem(KEY, petId);
    setSelectedPetId(petId);
    setOwnedByPet((prev) => ({ ...EMPTY_OWNED, ...prev }));
    setEquippedByPet((prev) => ({ ...EMPTY_EQUIPPED, ...prev }));
  };

  const resetPet = async () => {
    await AsyncStorage.multiRemove([
      KEY,
      COINS_KEY,
      STREAK_KEY,
      LAST_DONE_KEY,
      OWNED_BY_PET_KEY,
      EQUIPPED_BY_PET_KEY,
      FOOD_KEY,
      HUNGER_KEY,
      HUNGER_LAST_KEY,
    ]);

    setSelectedPetId(null);
    setCoins(0);
    setStreak(0);
    setLastFocusDate(null);
    setOwnedByPet(EMPTY_OWNED);
    setEquippedByPet(EMPTY_EQUIPPED);
    setFoodState(0);
    setHungerState(5);
  };

  // ----- Focus session -----
  const completeFocusSession = async () => {
    const newCoins = coins + 5;

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

  // ----- Closet helpers -----
  const isOwned = (itemId: ItemId) => {
    if (!selectedPetId) return false;
    return (ownedByPet[selectedPetId] || []).includes(itemId);
  };

  const isEquipped = (itemId: ItemId) => {
    if (!selectedPetId) return false;
    const eq = equippedByPet[selectedPetId] || {};
    return Object.values(eq).includes(itemId);
  };

  // ----- Closet actions -----
  const buyItem = async (itemId: ItemId) => {
    if (!selectedPetId) return false;

    const def = getItem(itemId);
    if (!def) return false;
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
      [def.slot]: itemId, // one item per slot
    };

    const nextEquippedByPet: EquippedByPetMap = {
      ...equippedByPet,
      [selectedPetId]: nextEquippedForPet,
    };

    await AsyncStorage.setItem(EQUIPPED_BY_PET_KEY, JSON.stringify(nextEquippedByPet));
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

    await AsyncStorage.setItem(EQUIPPED_BY_PET_KEY, JSON.stringify(nextEquippedByPet));
    setEquippedByPet(nextEquippedByPet);
  };

  const unequipAll = async () => {
    if (!selectedPetId) return;

    const nextEquippedByPet: EquippedByPetMap = {
      ...equippedByPet,
      [selectedPetId]: {},
    };

    await AsyncStorage.setItem(EQUIPPED_BY_PET_KEY, JSON.stringify(nextEquippedByPet));
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

        food,
        setFood,
        hunger,
        setHunger,
        feedPet,
        checkAndDepleteHunger,
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
