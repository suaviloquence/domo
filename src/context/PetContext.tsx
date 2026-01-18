import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PetId = 'Rugy' | 'Strawb' | 'Ceviche';
export type AccessoryId = 'none' | 'hat' | 'shoe';

export type JournalEntry = {
  id: string;
  startTime: number; // timestamp in milliseconds
  duration: number; // duration in seconds
  goal: string;
  stars: number; // 1-5
  reflection?: string; // optional reflection message
};

type PetContextType = {
  selectedPetId: PetId | null;
  isReady: boolean;
  choosePet: (petId: PetId) => Promise<void>;
  resetPet: () => Promise<void>;
  coins: number;
  streak: number;
  completeFocusSession: () => Promise<void>;
  ownedAccessories: AccessoryId[];
  equippedAccessory: AccessoryId;
  buyAccessory: (id: AccessoryId, price: number) => Promise<boolean>;
  equipAccessory: (id: AccessoryId) => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  totalFocusSeconds: number;
  setTotalFocusSeconds: (seconds: number) => Promise<void>;
  food: number;
  setFood: (amount: number) => Promise<void>;
  coinsEarnedFromFocus: number;
  setCoinsEarnedFromFocus: (amount: number) => Promise<void>;
  foodEarnedFromFocus: number;
  setFoodEarnedFromFocus: (amount: number) => Promise<void>;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => Promise<void>;
  getJournalEntries: () => Promise<JournalEntry[]>;
};

const PetContext = createContext<PetContextType | null>(null);
const KEY = 'selectedPetId';
const COINS_KEY = 'coins';
const STREAK_KEY = 'streak';
const LAST_DONE_KEY = 'lastFocusDate';
const OWNED_KEY = 'ownedAccessories';
const EQUIPPED_KEY = 'equippedAccessory';
const JOURNAL_KEY = 'journalEntries';

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [selectedPetId, setSelectedPetId] = useState<PetId | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [coins, setCoins] = useState<number>(0);
  const [food, setFood] = useState<number>(0);
  const [totalFocusSeconds, setTotalFocusSeconds] = useState<number>(0);
  const [coinsEarnedFromFocus, setCoinsEarnedFromFocus] = useState<number>(0);
  const [foodEarnedFromFocus, setFoodEarnedFromFocus] = useState<number>(0);

  const [streak, setStreak] = useState<number>(0);
  const [lastFocusDate, setLastFocusDate] = useState<string | null>(null);
  const [ownedAccessories, setOwnedAccessories] = useState<AccessoryId[]>([
    'none',
  ]);
  const [equippedAccessory, setEquippedAccessory] =
    useState<AccessoryId>('none');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(KEY);
      const savedCoins = await AsyncStorage.getItem(COINS_KEY);
      const savedStreak = await AsyncStorage.getItem(STREAK_KEY);
      const savedLast = await AsyncStorage.getItem(LAST_DONE_KEY);
      const savedOwned = await AsyncStorage.getItem(OWNED_KEY);
      const savedEquipped = await AsyncStorage.getItem(EQUIPPED_KEY);

      setSelectedPetId((saved as PetId) ?? null);
      setCoins(savedCoins ? Number(savedCoins) : 0);
      setStreak(savedStreak ? Number(savedStreak) : 0);
      setLastFocusDate(savedLast ?? null);
      setOwnedAccessories(
        savedOwned ? (JSON.parse(savedOwned) as AccessoryId[]) : ['none'],
      );
      setEquippedAccessory(
        savedEquipped ? (savedEquipped as AccessoryId) : 'none',
      );

      setIsReady(true);
    })();
  }, []);

  const choosePet = async (petId: PetId) => {
    await AsyncStorage.setItem(KEY, petId);
    setSelectedPetId(petId);
  };

  const resetPet = async () => {
    // reset pet and moneyy
    await AsyncStorage.multiRemove([KEY, COINS_KEY, STREAK_KEY, LAST_DONE_KEY]);
    setSelectedPetId(null);
    setCoins(0);
    setStreak(0);
    setLastFocusDate(null);
  };

  const completeFocusSession = async () => {
    // +5 coins every completed session
    const newCoins = coins + 5;

    // streak increments only once per calendar day
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const shouldIncrementStreak = lastFocusDate !== today;
    const newStreak = shouldIncrementStreak ? streak + 1 : streak;

    await AsyncStorage.setItem(COINS_KEY, String(newCoins));
    await AsyncStorage.setItem(STREAK_KEY, String(newStreak));
    await AsyncStorage.setItem(LAST_DONE_KEY, today);

    setCoins(newCoins);
    setStreak(newStreak);
    setLastFocusDate(today);
  };

  const buyAccessory = async (id: AccessoryId, price: number) => {
    if (ownedAccessories.includes(id)) return true;
    if (coins < price) return false;

    const newCoins = coins - price;
    const newOwned = [...ownedAccessories, id];

    await AsyncStorage.setItem(COINS_KEY, String(newCoins));
    await AsyncStorage.setItem(OWNED_KEY, JSON.stringify(newOwned));

    setCoins(newCoins);
    setOwnedAccessories(newOwned);
    return true;
  };

  const equipAccessory = async (id: AccessoryId) => {
    // Only allow equip if owned (except "none")
    if (id !== 'none' && !ownedAccessories.includes(id)) return;

    await AsyncStorage.setItem(EQUIPPED_KEY, id);
    setEquippedAccessory(id);
  };

  const addCoins = async (amount: number) => {
    const newCoins = coins + amount;
    await AsyncStorage.setItem(COINS_KEY, String(newCoins));
    setCoins(newCoins);
  };

  const addJournalEntry = async (entry: Omit<JournalEntry, 'id'>) => {
    const journalEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const existingEntries = await getJournalEntries();
    const updatedEntries = [journalEntry, ...existingEntries];
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updatedEntries));
  };

  const getJournalEntries = async (): Promise<JournalEntry[]> => {
    const saved = await AsyncStorage.getItem(JOURNAL_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as JournalEntry[];
    } catch {
      return [];
    }
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
        ownedAccessories,
        equippedAccessory,
        buyAccessory,
        equipAccessory,
        addCoins,
        food,
        foodEarnedFromFocus,
        coinsEarnedFromFocus,
        totalFocusSeconds,
        setTotalFocusSeconds,
        setFood,
        setCoinsEarnedFromFocus,
        setFoodEarnedFromFocus,
        addJournalEntry,
        getJournalEntries,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error('usePet must be used inside PetProvider');
  return ctx;
}
