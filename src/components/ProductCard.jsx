import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatCurrency } from '../utils/formatters';

export default function ProductCard({ product, onPress }) {
  const { colors, isDark } = useTheme();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  if (!product) return null;

  const wishlisted = isWishlisted(product.id);
  const imageUri = product.thumbnail || (product.images && product.images[0]) || '';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress && onPress(product)}
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {/* Product Image & Badges */}
      <View style={[styles.imageContainer, { backgroundColor: isDark ? '#0B132B' : '#F1F5F9' }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>No image</Text>
          </View>
        )}

        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: colors.error }]}>
            <Text style={styles.discountText}>-{Math.round(product.discountPercentage)}%</Text>
          </View>
        )}

        {/* Wishlist Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleWishlist(product)}
          style={[
            styles.wishlistBtn,
            {
              backgroundColor: wishlisted ? colors.primary : colors.cardBackground,
              borderColor: wishlisted ? colors.primary : colors.cardBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.wishlistBtnText,
              { color: wishlisted ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {wishlisted ? 'Đã lưu' : 'Lưu'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Text style={[styles.category, { color: colors.primary }]} numberOfLines={1}>
          {(product.category || 'general').toUpperCase()}
        </Text>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.ratingRow}>
          <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
            Đánh giá: {product.rating ? Number(product.rating).toFixed(1) : '4.5'}/5
          </Text>
          {product.stock !== undefined && (
            <Text style={[styles.stockText, { color: product.stock < 10 ? colors.warning : colors.textMuted }]}>
              {product.stock < 10 ? `Còn ${product.stock}` : 'Có sẵn'}
            </Text>
          )}
        </View>

        {/* Price & Add to Cart button */}
        <View style={styles.footerRow}>
          <Text style={[styles.price, { color: colors.textPrimary }]}>
            {formatCurrency(product.price)}
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => addToCart(product, 1)}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.addBtnText}>Thêm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    height: 150,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnail: {
    width: '85%',
    height: '85%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoContainer: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    height: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    marginBottom: 8,
  },
  star: {
    fontSize: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockText: {
    fontSize: 11,
    marginLeft: 'auto',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
  },
  addBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
