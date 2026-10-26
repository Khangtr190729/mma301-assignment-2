import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export default function AiRecommendationCard({ product, onSelect }) {
  const { colors, isDark } = useTheme();
  const { addToCart } = useCart();

  if (!product) return null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>Gemini Verified</Text>
        </View>
        <Text style={[styles.category, { color: colors.textSecondary }]}>
          {(product.category || '').toUpperCase()}
        </Text>
      </View>

      <View style={styles.contentRow}>
        <Image
          source={{ uri: product.thumbnail }}
          style={[styles.thumbnail, { backgroundColor: colors.inputBackground }]}
          resizeMode="contain"
        />

        <View style={styles.details}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
            {product.title}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              Đánh giá: {product.rating ? Number(product.rating).toFixed(1) : '4.5'}/5
            </Text>
            <Text style={[styles.price, { color: colors.primary }]}>
              {formatCurrency(product.price)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelect && onSelect(product)}
          style={[styles.detailBtn, { borderColor: colors.primary }]}
        >
          <Text style={[styles.detailBtnText, { color: colors.primary }]}>Chi tiết</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => addToCart(product, 1)}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.addBtnText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {
    fontSize: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  detailBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
