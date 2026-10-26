import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import CartItem from '../components/CartItem';
import EmptyState from '../components/EmptyState';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency } from '../utils/formatters';

export default function CartScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { cartItems, totalItems, subtotal, discount, shipping, totalAmount, clearCart } =
    useCart();
  const { placeOrder } = useWishlist();
  const { triggerOrderNotification, isGranted, requestPermission } = useNotification();

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  /**
   * Complete business workflow:
   * 1. Place order & record to Firebase Firestore (R08)
   * 2. Send business notification (R09)
   * 3. Clear cart & prompt user
   */
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    // Check notification permission if not yet granted
    if (!isGranted) {
      await requestPermission();
    }

    Alert.alert(
      'Xác nhận đặt hàng',
      `Bạn có chắc chắn muốn đặt ${totalItems} sản phẩm với tổng số tiền ${formatCurrency(
        totalAmount
      )}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thanh toán ngay',
          style: 'default',
          onPress: async () => {
            setIsCheckingOut(true);
            try {
              // 1. Create order record in Firebase Firestore (R08)
              const orderResult = await placeOrder({
                items: cartItems,
                totalAmount,
                totalItems,
              });

              // 2. Trigger business notification (R09)
              await triggerOrderNotification({
                orderId: orderResult.orderId,
                totalAmount,
                itemCount: totalItems,
              });

              // 3. Clear cart (R05)
              await clearCart();

              Alert.alert(
                'Đặt hàng thành công',
                `Mã đơn hàng của bạn: ${orderResult.orderId}\nĐơn hàng đã được lưu trữ an toàn${
                  orderResult.syncedCloud ? ' trên Firebase Cloud' : ' cục bộ'
                }.`,
                [
                  { text: 'Xem đơn hàng', onPress: () => navigation.navigate('Wishlist') },
                  { text: 'Tiếp tục mua sắm', onPress: () => navigation.navigate('Catalog') },
                ]
              );
            } catch (err) {
              Alert.alert('Lỗi đặt hàng', err.message || 'Không thể hoàn tất đơn hàng.');
            } finally {
              setIsCheckingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      {cartItems.length === 0 ? (
        <EmptyState
          title="Giỏ hàng trống"
          message="Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá và thêm sản phẩm yêu thích nhé!"
          actionLabel="Khám phá ngay"
          onAction={() => navigation.navigate('Catalog')}
        />
      ) : (
        <View style={styles.container}>
          {/* Header Summary */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Giỏ hàng của bạn ({totalItems} món)
            </Text>
            <TouchableOpacity onPress={clearCart}>
              <Text style={[styles.clearBtnText, { color: colors.error }]}>Xóa tất cả</Text>
            </TouchableOpacity>
          </View>

          {/* Cart Items List */}
          <FlatList
            data={cartItems}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <CartItem item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Order Summary & Derived Totals Card (R06) */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
              Chi tiết thanh toán
            </Text>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tạm tính:</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                {formatCurrency(subtotal)}
              </Text>
            </View>

            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.success }]}>Khuyến mãi giảm:</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  -{formatCurrency(discount)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Phí vận chuyển:</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                {shipping === 0 ? (
                  <Text style={{ color: colors.success, fontWeight: '700' }}>Miễn phí</Text>
                ) : (
                  formatCurrency(shipping)
                )}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Tổng thanh toán:</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>

            {/* Checkout Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isCheckingOut}
              onPress={handleCheckout}
              style={[
                styles.checkoutBtn,
                { backgroundColor: colors.primary, opacity: isCheckingOut ? 0.7 : 1 },
              ]}
            >
              {isCheckingOut ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.checkoutBtnText}>
                  Xác nhận đặt hàng ({formatCurrency(totalAmount)})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
  },
  checkoutBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
