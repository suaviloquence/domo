import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  Image,
  ImageSourcePropType,
} from "react-native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AccessoryId, usePet } from "../context/PetContext";

type Item = {
  id: AccessoryId | "soon";
  name: string;
  price?: number;
  // PNG-ready (use this later)
  img?: ImageSourcePropType;
  // placeholder fallback
  emoji?: string;
  comingSoon?: boolean;
};

// ✅ Placeholder coin icon for now
const coinIcon = require("../assets/coin.png"); 
// later swap to 

const ITEMS: Item[] = [
  {
    id: "none",
    name: "Regular",
    price: 0,
    emoji: "🐣",
    // later: img: require("../assets/items/regular.png")
  },
  {
    id: "hat",
    name: "Tiny Hat",
    price: 10,
    emoji: "🎩",
    // later: img: require("../assets/items/hat.png")
  },
  {
    id: "shoe",
    name: "Cute Shoes",
    price: 15,
    emoji: "👠",
    // later: img: require("../assets/items/shoe.png")
  },
  { id: "soon", name: "Coming soon…", emoji: "✨", comingSoon: true },
];

export default function ShopScreen({ navigation }: any) {
  const { coins, ownedAccessories, equippedAccessory, buyAccessory, equipAccessory } = usePet();

  const onPressItem = async (item: Item) => {
    if (item.comingSoon) return;

    const id = item.id as AccessoryId;
    const price = item.price ?? 0;

    const owned = ownedAccessories.includes(id) || id === "none";

    if (!owned) {
      const ok = await buyAccessory(id, price);
      if (!ok) {
        Alert.alert("Not enough coins 😭", "Complete a focus session to earn more!");
        return;
      }
      await equipAccessory(id); // auto-equip after buying
      return;
    }

    await equipAccessory(id);
  };

  const renderItem = ({ item }: { item: Item }) => {
    const isSoon = !!item.comingSoon;
    const id = item.id as AccessoryId;

    const owned = !isSoon && (ownedAccessories.includes(id) || id === "none");
    const equipped = !isSoon && equippedAccessory === id;

    return (
      <Pressable
        onPress={() => onPressItem(item)}
        style={[
          styles.card,
          !owned && !isSoon && styles.cardLocked,
          equipped && styles.cardEquipped,
          isSoon && styles.cardSoon,
        ]}
      >
        <View style={styles.iconWrap}>
          {/* PNG-ready display:
              If item.img exists -> show Image
              else -> show emoji placeholder
          */}
          {item.img ? (
            <Image source={item.img} style={[styles.itemImage, !owned && !isSoon && styles.lockedImg]} />
          ) : (
            <Text style={[styles.emoji, !owned && !isSoon && styles.lockedEmoji]}>
              {item.emoji ?? "✨"}
            </Text>
          )}

          {equipped && (
            <View style={styles.checkBadge}>
              <Text style={styles.checkText}>✓</Text>
            </View>
          )}

          {!owned && !isSoon && (
            <View style={styles.lockBadge}>
              <MaterialIcons name="lock" size={12} color="rgba(0,0,0,0.6)" />
            </View>
          )}
        </View>

        <Text style={[styles.itemName, (!owned && !isSoon) && styles.mutedText]}>
          {item.name}
        </Text>

        {isSoon ? (
          <Text style={[styles.metaText, styles.mutedText]}>more drops soon 👀</Text>
        ) : id === "none" ? (
          <Text style={styles.metaText}>{equipped ? "equipped" : "tap to use"}</Text>
        ) : owned ? (
          <Text style={styles.metaText}>{equipped ? "equipped" : "tap to equip"}</Text>
        ) : (
          <Text style={[styles.metaText, styles.mutedText]}>buy • {item.price} coins</Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={22} color="#3C5A49" />
        </Pressable>

        <Text style={styles.title}>Closet</Text>

        <View style={styles.balancePill}>
          <Image source={coinIcon} style={styles.coinIcon} />
          <Text style={styles.balanceText}>{coins}</Text>
        </View>
      </View>

      <FlatList
        data={ITEMS}
        keyExtractor={(i) => String(i.id)}
        numColumns={2}
        renderItem={renderItem}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6FAF7", padding: 24, paddingTop: 56 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#2E3D35" },

  balancePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#E7F3EC",
  },
  coinIcon: { width: 18, height: 18, borderRadius: 9, marginRight: 6 },
  balanceText: { fontWeight: "900", color: "#3C5A49" },

  row: { marginBottom: 12 },
  listContent: { paddingBottom: 12 },

  card: {
    flex: 1,
    backgroundColor: "#E7F3EC",
    borderRadius: 20,
    padding: 14,
    aspectRatio: 0.82,
    justifyContent: "space-between",
  },
  cardLocked: { opacity: 0.55 },
  cardEquipped: { borderWidth: 2, borderColor: "#6FAF8A" },
  cardSoon: { opacity: 0.7 },

  iconWrap: { alignItems: "center", justifyContent: "center", flex: 1 },

  // Placeholder emoji style
  emoji: { fontSize: 50 },
  lockedEmoji: {},

  // PNG placeholder style
  itemImage: { width: 64, height: 64, resizeMode: "contain" },
  lockedImg: { opacity: 0.7 },

  checkBadge: {
    position: "absolute",
    top: 6,
    right: 8,
    backgroundColor: "#6FAF8A",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: { color: "white", fontWeight: "900" },

  lockBadge: {
    position: "absolute",
    top: 6,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.12)",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  itemName: { fontSize: 15, fontWeight: "800", color: "#2E3D35", marginTop: 6 },
  metaText: { fontSize: 12, color: "#3C5A49", opacity: 0.9, marginTop: 4 },
  mutedText: { color: "#6B7D73" },
});
