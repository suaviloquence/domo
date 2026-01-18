import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { usePet } from "../context/PetContext";
import { itemsForPet, ItemDef } from "../data/items";

type DefaultRow = { kind: "default" };
type SpacerRow = { kind: "spacer" };
type ShopRow = ItemDef | DefaultRow | SpacerRow;

function isDefaultRow(row: ShopRow): row is DefaultRow {
  return (row as any).kind === "default";
}
function isSpacerRow(row: ShopRow): row is SpacerRow {
  return (row as any).kind === "spacer";
}

const coinIcon = require("../assets/coin.png");

const baseImgs = {
  Strawb: require("../assets/STRAWB.png"),
  Rugy: require("../assets/RUGY.png"),
  Ceviche: require("../assets/CEVICHE.png"),
} as const;

export default function ShopScreen({ navigation }: any) {
  const {
    selectedPetId,
    coins,
    ownedByPet,
    equippedByPet,
    buyItem,
    equipItem,
    unequipAll,
  } = usePet();

  // If somehow they got here without picking a pet
  if (!selectedPetId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Closet</Text>
        <Text style={styles.emptyText}>Pick a pet first 🐣</Text>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const ownedIds = ownedByPet[selectedPetId] || [];
  const eq = equippedByPet[selectedPetId] || {};

  // Build grid list (default + pet items + spacer if odd)
  const baseList: ShopRow[] = [{ kind: "default" }, ...itemsForPet(selectedPetId)];
  const list: ShopRow[] =
    baseList.length % 2 === 1 ? [...baseList, { kind: "spacer" }] : baseList;

  const onPressItem = async (item: ItemDef) => {
    const owned = ownedIds.includes(item.id);
    const equipped = eq[item.slot] === item.id;

    if (!owned) {
      const ok = await buyItem(item.id);
      if (!ok) {
        Alert.alert(
          "Not enough coins 😭",
          "Complete a focus session to earn more!"
        );
        return;
      }
      await equipItem(item.id); // auto-equip after buying
      return;
    }

    if (!equipped) {
      await equipItem(item.id);
    }
  };

  const renderItem = ({ item }: { item: ShopRow }) => {
    // Spacer to keep grid even (prevents last item stretching)
    if (isSpacerRow(item)) {
      return <View style={[styles.card, styles.spacerCard]} />;
    }

    // Default card (Regular / unequip all)
    if (isDefaultRow(item)) {
      const hasAnythingEquipped = Object.keys(eq).length > 0;
      const regularEquipped = !hasAnythingEquipped;

      return (
        <Pressable
          onPress={unequipAll}
          style={[styles.card, regularEquipped && styles.cardEquipped]}
        >
          <View style={styles.imgArea}>
            <Image source={baseImgs[selectedPetId]} style={styles.previewImg} />
          </View>

          <Text style={styles.cardTitle}>Regular</Text>

          <View style={styles.bottomArea}>
            <View style={styles.ownedRow}>
              <Text style={styles.ownedCheck}>✓</Text>
              <Text style={styles.ownedText}>Owned</Text>
            </View>
          </View>
        </Pressable>
      );
    }

    // Normal item card
    const owned = ownedIds.includes(item.id);
    const equipped = eq[item.slot] === item.id;

    return (
      <Pressable
        onPress={() => onPressItem(item)}
        style={[
          styles.card,
          equipped && styles.cardEquipped,
          !owned && styles.cardLocked, //  greyed out when not owned
        ]}
      >
        <View style={styles.imgArea}>
          <Image
            source={item.img}
            style={[styles.previewImg, !owned && styles.lockedImg]}
          />
        </View>

        <Text style={[styles.cardTitle, !owned && styles.lockedText]}>
          {item.name}
        </Text>

        <View style={styles.bottomArea}>
          {owned ? (
            <View style={styles.ownedRow}>
              <Text style={styles.ownedCheck}>✓</Text>
              <Text style={styles.ownedText}>Owned</Text>
            </View>
          ) : (
            <View style={styles.pricePill}>
              <Text style={styles.priceText}>{item.price}</Text>
              <Image source={coinIcon} style={styles.priceCoin} />
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>

        <Text style={styles.title}>Closet</Text>

        <View style={styles.balancePill}>
          <Image source={coinIcon} style={styles.coinIcon} />
          <Text style={styles.balanceText}>{coins}</Text>
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(row) => {
          if (isDefaultRow(row)) return "default";
          if (isSpacerRow(row)) return "spacer";
          return row.id;
        }}
        numColumns={2}
        renderItem={renderItem}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const BG = "#F6FAF7";
const GREEN = "#3C5A49";
const GREEN_MID = "#6B7D73";
const CARD_BG = "#FFFFFF";
const PILL_BG = "#E7F3EC";
const ACCENT = "#6FAF8A";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, padding: 24, paddingTop: 80 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  back: { fontSize: 22, color: GREEN },
  title: { fontSize: 22, fontWeight: "900", color: "#2E3D35" },

  balancePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: PILL_BG,
  },
  coinIcon: { width: 18, height: 18, borderRadius: 9 },
  balanceText: { fontWeight: "900", color: GREEN, fontSize: 16 },

  row: { gap: 14 },
  listContent: { gap: 14, paddingBottom: 20 },

  card: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    height: 250, // a bit taller

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  // greyed out card when not owned
  cardLocked: {
    opacity: 0.55,
  },

  spacerCard: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },

  cardEquipped: {
    borderWidth: 2,
    borderColor: ACCENT,
  },

  imgArea: {
    height: 125,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 10,
  },

  // slightly bigger images
  previewImg: {
    width: 112,
    height: 112,
    resizeMode: "contain",
  },

  lockedImg: {
    opacity: 0.85,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: GREEN,
    textAlign: "center",
    marginBottom: 8,
  },

  lockedText: {
    color: GREEN_MID,
  },

  bottomArea: {
    marginTop: "auto",
    paddingBottom: 6,
    width: "100%",
    alignItems: "center",
  },

  ownedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  ownedCheck: {
    fontSize: 16,
    color: ACCENT,
    fontWeight: "900",
  },
  ownedText: {
    fontSize: 15,
    color: "#7DAA86",
    fontWeight: "800",
  },

  pricePill: {
    backgroundColor: PILL_BG,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "900",
    color: GREEN,
  },
  priceCoin: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  emptyText: { marginTop: 14, color: GREEN_MID, fontWeight: "700" },
  backBtn: {
    marginTop: 14,
    backgroundColor: ACCENT,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  backBtnText: { color: "white", fontWeight: "800" },
});
