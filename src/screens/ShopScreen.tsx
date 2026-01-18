import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { usePet } from '../context/PetContext';
import { itemsForPet, ItemDef } from '../data/items';

type DefaultRow = { kind: 'default' };
type SpacerRow = { kind: 'spacer' };
type ShopRow = ItemDef | DefaultRow | SpacerRow;

function isDefaultRow(row: ShopRow): row is DefaultRow {
  return (row as any).kind === 'default';
}
function isSpacerRow(row: ShopRow): row is SpacerRow {
  return (row as any).kind === 'spacer';
}

const coinIcon = require('../assets/coin.png');

const baseImgs = {
  Strawb: require('../assets/STRAWB.png'),
  Rugy: require('../assets/RUGY.png'),
  Ceviche: require('../assets/CEVICHE.png'),
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
        <Text style={styles.emptyText}>Pick a pet first</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ownedIds = ownedByPet[selectedPetId] || [];
  const eq = equippedByPet[selectedPetId] || {};

  // Build grid list (default + pet items + spacer if odd)
  const baseList: ShopRow[] = [
    { kind: 'default' },
    ...itemsForPet(selectedPetId),
  ];
  const list: ShopRow[] =
    baseList.length % 2 === 1 ? [...baseList, { kind: 'spacer' }] : baseList;

  const onPressItem = async (item: ItemDef) => {
    const owned = ownedIds.includes(item.id);
    const equipped = eq[item.slot] === item.id;

    if (!owned) {
      const ok = await buyItem(item.id);
      if (!ok) {
        Alert.alert(
          'Not enough coins',
          'Complete a focus session to earn more!',
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
        <TouchableOpacity
          onPress={unequipAll}
          style={[styles.card, regularEquipped && styles.cardEquipped]}
          activeOpacity={0.7}
        >
          <View style={styles.imgArea}>
            <Image source={baseImgs[selectedPetId]} style={styles.previewImg} />
          </View>

          <Text style={styles.cardTitle}>Regular</Text>

          <View style={styles.bottomArea}>
            <View style={styles.ownedRow}>
              <MaterialIcons name="check-circle" size={14} color="#6FAF8A" />
              <Text style={styles.ownedText}>Owned</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    // Normal item card
    const owned = ownedIds.includes(item.id);
    const equipped = eq[item.slot] === item.id;

    return (
      <TouchableOpacity
        onPress={() => onPressItem(item)}
        style={[
          styles.card,
          equipped && styles.cardEquipped,
          !owned && styles.cardLocked,
        ]}
        activeOpacity={0.7}
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
              <MaterialIcons name="check-circle" size={14} color="#6FAF8A" />
              <Text style={styles.ownedText}>Owned</Text>
            </View>
          ) : (
            <View style={styles.pricePill}>
              <Text style={styles.priceText}>{item.price}</Text>
              <Image source={coinIcon} style={styles.priceCoin} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={22} color="#3C5A49" />
        </TouchableOpacity>

        <Text style={styles.title}>closet</Text>

        <View style={styles.balancePill}>
          <Image source={coinIcon} style={styles.coinIcon} />
          <Text style={styles.balanceText}>{coins}</Text>
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={row => {
          if (isDefaultRow(row)) return 'default';
          if (isSpacerRow(row)) return 'spacer';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FAF7',
    padding: 20,
    paddingTop: 60,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E7F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D4E5DA',
    shadowColor: '#3C5A49',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3C5A49',
    letterSpacing: 0.5,
  },

  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#E7F3EC',
    borderWidth: 1.5,
    borderColor: '#D4E5DA',
  },
  coinIcon: { width: 16, height: 16, borderRadius: 8 },
  balanceText: {
    fontWeight: '600',
    color: '#3C5A49',
    fontSize: 15,
    letterSpacing: 0.3,
  },

  row: { gap: 12 },
  listContent: { gap: 12, paddingBottom: 20 },

  card: {
    flex: 1,
    backgroundColor: '#E7F3EC',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    height: 300,
    borderWidth: 1.5,
    borderColor: '#D4E5DA',
    shadowColor: '#3C5A49',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  cardLocked: {
    opacity: 0.55,
  },

  spacerCard: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },

  cardEquipped: {
    borderWidth: 2,
    borderColor: '#6FAF8A',
  },

  imgArea: {
    height: 192,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },

  previewImg: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },

  lockedImg: {
    opacity: 0.85,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C5A49',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },

  lockedText: {
    color: '#6B7D73',
  },

  bottomArea: {
    marginTop: 'auto',
    paddingBottom: 4,
    width: '100%',
    alignItems: 'center',
  },

  ownedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  ownedText: {
    fontSize: 13,
    color: '#6FAF8A',
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  pricePill: {
    backgroundColor: '#F6FAF7',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#D4E5DA',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C5A49',
    letterSpacing: 0.2,
  },
  priceCoin: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  emptyText: {
    marginTop: 14,
    color: '#6B7D73',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  backBtn: {
    marginTop: 14,
    backgroundColor: '#6FAF8A',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#5A9A75',
  },
  backBtnText: {
    color: 'white',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
