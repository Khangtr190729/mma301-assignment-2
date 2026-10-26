import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import EmptyState from '../components/EmptyState';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function WishlistScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { wishlist, orders, syncStatus, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState('wishlist'); // 'wishlist' | 'orders'

  const renderWishlistItem = ({ item }) => (
    <View
      style={[
        styles.wishlistCard,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} resizeMode="contain" />
      <View style={styles.wishlistDetails}>
        <Text style={[styles.itemTitle, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>
          {formatCurrency(item.price)}
        </Text>
        <View style={styles.btnRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => addToCart(item, 1)}
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.actionBtnText}>+ Thêm vào giỏ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleWishlist(item)}
            style={[styles.removeBtn, { borderColor: colors.border }]}
          >
            <Text style={[styles.removeBtnText, { color: colors.error }]}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderOrderItem = ({ item }) => (
    <View
      style={[
        styles.orderCard,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={[styles.orderId, { color: colors.primary }]}>{item.orderId}</Text>
          <Text style={[styles.orderDate, { color: colors.textMuted }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.successLight }]}>
          <Text style={[styles.statusText, { color: colors.success }]}>{item.status || 'Đã xác nhận'}</Text>
        </View>
      </View>

      <View style={[styles.orderDivider, { backgroundColor: colors.border }]} />

      <Text style={[styles.itemsSummary, { color: colors.textSecondary }]}>
        Số lượng: {item.totalItems} sản phẩm
      </Text>

      <View style={styles.orderFooter}>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Tổng thanh toán:</Text>
        <Text style={[styles.orderTotal, { color: colors.textPrimary }]}>
          {formatCurrency(item.totalAmount)}
        </Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        {/* Sync Status Banner (R08) */}
        <View
          style={[
            styles.syncBanner,
            {
              backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.syncTextCol}>
            <Text style={[styles.syncTitle, { color: colors.textPrimary }]}>
              Trạng thái Firebase: {syncStatus.mode}
            </Text>
            <Text style={[styles.syncSubtitle, { color: colors.textSecondary }]}>
              {syncStatus.isInitialized
                ? 'Dữ liệu được đồng bộ trực tiếp lên Cloud Firestore.'
                : 'Đang hoạt động ở chế độ lưu trữ an toàn (Offline resilient).'}
            </Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: colors.inputBackground }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('wishlist')}
            style={[
              styles.tabBtn,
              activeTab === 'wishlist' && { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'wishlist' ? colors.primary : colors.textSecondary },
              ]}
            >
              Yêu thích ({wishlist.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('orders')}
            style={[
              styles.tabBtn,
              activeTab === 'orders' && { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'orders' ? colors.primary : colors.textSecondary },
              ]}
            >
              Đơn hàng ({orders.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'wishlist' ? (
          <FlatList
            data={wishlist}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderWishlistItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState
                title="Chưa có sản phẩm yêu thích"
                message="Hãy đánh dấu lưu các sản phẩm bạn quan tâm để xem lại sau nhé."
                actionLabel="Khám phá ngay"
                onAction={() => navigation.navigate('Catalog')}
              />
            }
          />
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.orderId}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState
                title="Chưa có đơn hàng nào"
                message="Các đơn hàng sau khi thanh toán thành công sẽ được lưu trữ và hiển thị tại đây."
                actionLabel="Mua sắm ngay"
                onAction={() => navigation.navigate('Catalog')}
              />
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  syncIcon: {
    fontSize: 20,
  },
  syncTextCol: {
    flex: 1,
  },
  syncTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  syncSubtitle: {
    fontSize: 11,
    lineHeight: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 20,
  },
  wishlistCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'center',
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  wishlistDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
  },
  orderDate: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderDivider: {
    height: 1,
    marginVertical: 10,
  },
  itemsSummary: {
    fontSize: 13,
    marginBottom: 6,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '800',
  },
});
