import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import LoadingScreen from '../components/LoadingScreen';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productService } from '../services/productService';
import { formatCurrency, calculateDiscountPrice } from '../utils/formatters';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId, product: initialProduct } = route.params || {};
  const { colors, isDark } = useTheme();
  const { addToCart, cartItems } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(initialProduct || null);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Hydrate or fetch if only ID is provided (R04)
  useEffect(() => {
    if (!initialProduct && productId) {
      loadProductDetail();
    }
  }, [productId]);

  const loadProductDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.getProductById(productId);
      setProduct(data);
    } catch (err) {
      setError(err.message || 'Không thể tìm thấy sản phẩm này.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Đang tải thông tin sản phẩm..." />;
  }

  if (error || !product) {
    return (
      <ScreenContainer edges={['top', 'left', 'right']}>
        <ErrorState
          title="Không tìm thấy sản phẩm"
          message={error || 'Sản phẩm với mã này không tồn tại hoặc đã bị gỡ bỏ.'}
          onRetry={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail];
  const activeImage = images[selectedImageIndex] || product.thumbnail;
  const originalPrice = Number(product.price) || 0;
  const discountedPrice = calculateDiscountPrice(originalPrice, product.discountPercentage);

  // Existing quantity in cart
  const existingInCart = cartItems.find((item) => item.id === product.id)?.quantity || 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    Alert.alert(
      'Đã thêm vào giỏ',
      `Đã thêm ${quantity} x "${product.title}" vào giỏ hàng.`,
      [
        { text: 'Tiếp tục xem', style: 'cancel' },
        { text: 'Đến Giỏ Hàng', onPress: () => navigation.navigate('Cart') },
      ]
    );
  };

  return (
    <ScreenContainer edges={['left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Product Image Carousel */}
        <View style={[styles.imageGallery, { backgroundColor: isDark ? '#0B132B' : '#F1F5F9' }]}>
          <Image source={{ uri: activeImage }} style={styles.mainImage} resizeMode="contain" />

          {/* Discount Badge */}
          {product.discountPercentage > 0 && (
            <View style={[styles.discountBadge, { backgroundColor: colors.error }]}>
              <Text style={styles.discountText}>Giảm {Math.round(product.discountPercentage)}%</Text>
            </View>
          )}

          {/* Wishlist Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleWishlist(product)}
            style={[
              styles.floatingWishlist,
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

        {/* Thumbnail Preview Strip */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailStrip}
          >
            {images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedImageIndex(idx)}
                style={[
                  styles.thumbnailBtn,
                  {
                    borderColor: selectedImageIndex === idx ? colors.primary : colors.cardBorder,
                    backgroundColor: colors.cardBackground,
                  },
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImg} resizeMode="contain" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Details Section */}
        <View style={styles.infoSection}>
          <View style={styles.metaRow}>
            <Text style={[styles.categoryTag, { color: colors.primary }]}>
              {(product.category || 'e-commerce').toUpperCase()}
            </Text>
            {product.brand && (
              <Text style={[styles.brandText, { color: colors.textSecondary }]}>
                Thương hiệu: {product.brand}
              </Text>
            )}
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>{product.title}</Text>

          {/* Rating & Stock */}
          <View style={styles.ratingSection}>
            <View style={styles.starBadge}>
              <Text style={styles.ratingNumber}>
                Đánh giá: {product.rating ? Number(product.rating).toFixed(1) : '4.5'}/5
              </Text>
            </View>
            <Text style={[styles.stockBadge, { color: colors.success }]}>
              {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : 'Hết hàng'}
            </Text>
          </View>

          {/* Price Display */}
          <View
            style={[
              styles.priceBox,
              { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
            ]}
          >
            <View>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Đơn giá</Text>
              <View style={styles.priceRow}>
                <Text style={[styles.currentPrice, { color: colors.primary }]}>
                  {formatCurrency(discountedPrice)}
                </Text>
                {product.discountPercentage > 0 && (
                  <Text style={[styles.originalPrice, { color: colors.textMuted }]}>
                    {formatCurrency(originalPrice)}
                  </Text>
                )}
              </View>
            </View>

            {existingInCart > 0 && (
              <View style={[styles.inCartBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.inCartText, { color: colors.primary }]}>
                  Trong giỏ: {existingInCart}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Mô tả chi tiết</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {product.description || 'Không có mô tả chi tiết cho sản phẩm này.'}
          </Text>

          {/* AI Advisor Entry Point (R10) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('AiAssistant', {
                initialQuery: `Đánh giá và tư vấn cho tôi về sản phẩm: "${product.title}"`,
              })
            }
            style={[
              styles.aiCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
                borderColor: colors.primary,
              },
            ]}
          >
            <View style={styles.aiTextContainer}>
              <Text style={[styles.aiTitle, { color: colors.primary }]}>
                Tư vấn thông minh cùng Gemini AI
              </Text>
              <Text style={[styles.aiSubtitle, { color: colors.textSecondary }]}>
                Hỏi AI để so sánh tính năng hoặc tìm kiếm sản phẩm tương tự trong danh mục.
              </Text>
            </View>
            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.cardBackground,
            borderTopColor: colors.cardBorder,
          },
        ]}
      >
        {/* Quantity Stepper */}
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
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            style={styles.stepBtn}
          >
            <Text style={[styles.stepText, { color: colors.textPrimary }]}>−</Text>
          </TouchableOpacity>

          <Text style={[styles.qtyDisplay, { color: colors.textPrimary }]}>{quantity}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setQuantity((q) => q + 1)}
            style={styles.stepBtn}
          >
            <Text style={[styles.stepText, { color: colors.textPrimary }]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleAddToCart}
          style={[styles.addToCartBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.addToCartText}>Thêm vào giỏ ({formatCurrency(discountedPrice * quantity)})</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  imageGallery: {
    height: 280,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mainImage: {
    width: '80%',
    height: '80%',
  },
  discountBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  floatingWishlist: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  thumbnailStrip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  thumbnailBtn: {
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 2,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 10,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  starIcon: {
    fontSize: 14,
  },
  ratingNumber: {
    color: '#D97706',
    fontWeight: '700',
    fontSize: 13,
  },
  stockBadge: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  currentPrice: {
    fontSize: 22,
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: 15,
    textDecorationLine: 'line-through',
  },
  inCartBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inCartText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 12,
    gap: 12,
  },
  aiIcon: {
    fontSize: 24,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  aiSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  stepBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepText: {
    fontSize: 18,
    fontWeight: '700',
  },
  qtyDisplay: {
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  addToCartBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
