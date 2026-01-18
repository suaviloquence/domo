import { PetId } from "../context/PetContext";

export type SlotId = "hat" | "glasses" | "shoes";

export type ItemId =
  | "CEVICHE_hat"
  | "CEVICHE_cat"
  | "RUGY_flower"
  | "RUGY_glasses"
  | "STRAWB_glasses"
  | "STRAWB_shoes";

export type ItemDef = {
  id: ItemId;
  petId: PetId;
  slot: SlotId;
  name: string;
  price: number;
  img: any;
};

export const ITEMS: ItemDef[] = [
  {
    id: "CEVICHE_hat",
    petId: "Ceviche",
    slot: "hat",
    name: "Lil Hat",
    price: 40,
    img: require("../assets/CEVICHE_hat.png"),
  },
  {
    id: "CEVICHE_cat",
    petId: "Ceviche",
    slot: "glasses", // change later if you add "accessory"
    name: "Cat Vibes",
    price: 60,
    img: require("../assets/CEVICHE_cat.png"),
  },
  {
    id: "RUGY_flower",
    petId: "Rugy",
    slot: "hat",
    name: "Flower",
    price: 35,
    img: require("../assets/RUGY_flower.png"),
  },
  {
    id: "RUGY_glasses",
    petId: "Rugy",
    slot: "glasses",
    name: "Glasses",
    price: 45,
    img: require("../assets/RUGY_glasses.png"),
  },
  {
    id: "STRAWB_glasses",
    petId: "Strawb",
    slot: "glasses",
    name: "Glasses",
    price: 45,
    img: require("../assets/STRAWB_glasses.png"),
  },
  {
    id: "STRAWB_shoes",
    petId: "Strawb",
    slot: "shoes",
    name: "Shoes",
    price: 50,
    img: require("../assets/STRAWB_shoes.png"),
  },
];

export const itemsForPet = (petId: PetId) => ITEMS.filter(i => i.petId === petId);
export const getItem = (id: ItemId) => ITEMS.find(i => i.id === id);