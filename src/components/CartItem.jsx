import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export default function CartItem({ item }) {
  const { colors } = useTheme();
  const { updateQuantity, removeFromCart } = useCart();

  if (!item) return null;

  const itemTotal = (Number(item.price) || 0) * (item.quantity || 1);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {/* Product Image */}
      <View style={[styles.imageWrapper, { backgroundColor: colors.inputBackground }]}>
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => removeFromCart(item.id)}
            style={styles.deleteBtn}
          >
            <Text style={[styles.deleteText, { color: colors.error }]}>Xóa</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.unitPrice, { color: colors.textSecondary }]}>
          {formatCurrency(item.price)} / sản phẩm
        </Text>

        {/* Quantity Stepper & Line Total */}
        <View style={styles.bottomRow}>
          <View
            style={[
              styles.stepper,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              style={styles.stepBtn}
            >
              <Text style={[styles.stepText, { color: colors.textPrimary }]}>−</Text>
            </TouchableOpacity>

            <Text style={[styles.qtyText, { color: colors.textPrimary }]}>
              {item.quantity}
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              style={styles.stepBtn}
            >
              <Text style={[styles.stepText, { color: colors.textPrimary }]}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.totalPrice, { color: colors.primary }]}>
            {formatCurrency(itemTotal)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  imageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  image: {
    width: '85%',
    height: '85%',
  },
  details: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  deleteBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '600',
  },
  unitPrice: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 16,
    fontWeight: '700',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  totalPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
});
