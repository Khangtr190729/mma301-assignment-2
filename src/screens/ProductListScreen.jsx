import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import ProductCard from '../components/ProductCard';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Badge from '../components/Badge';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import { API_CONFIG } from '../config/apiConfig';

export default function ProductListScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { totalItems } = useCart();

  // Catalog State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & Loading State (R02 & M2)
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  // Guard against redundant onEndReached triggers
  const onEndReachedCalledDuringMomentum = useRef(true);

  // 1. Initial Load: Categories & First Page
  useEffect(() => {
    loadCategories();
    fetchCatalog({ reset: true });
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await productService.getCategories();
      const formatted = [
        { slug: 'all', name: 'Tất cả' },
        ...(Array.isArray(cats)
          ? cats.map((c) => (typeof c === 'string' ? { slug: c, name: c } : c))
          : []),
      ];
      setCategories(formatted.slice(0, 10)); // Top 10 categories
    } catch (err) {
      console.warn('[ProductListScreen] Category error:', err);
    }
  };

  /**
   * Fetch products with pagination (R01, R02)
   */
  const fetchCatalog = async ({ reset = false, search = searchQuery, category = selectedCategory } = {}) => {
    if (reset) {
      setIsLoading(true);
      setErrorMessage(null);
    }

    try {
      const skip = reset ? 0 : products.length;
      const res = await productService.getProducts({
        limit: API_CONFIG.PAGE_LIMIT,
        skip,
        search,
        category,
      });

      if (reset) {
        setProducts(res.products);
      } else {
        // Guard against duplicate IDs in infinite scroll
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newUnique = res.products.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newUnique];
        });
      }

      setTotalCount(res.total);
    } catch (err) {
      setErrorMessage(err.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  // Pull to refresh handler (R03)
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCatalog({ reset: true });
  }, [searchQuery, selectedCategory]);

  // Infinite scroll load more handler (R02)
  const handleLoadMore = () => {
    if (
      !onEndReachedCalledDuringMomentum.current &&
      !isLoadingMore &&
      !isLoading &&
      products.length < totalCount
    ) {
      setIsLoadingMore(true);
      onEndReachedCalledDuringMomentum.current = true;
      fetchCatalog({ reset: false });
    }
  };

  // Search submit handler (R03)
  const handleSearchSubmit = () => {
    fetchCatalog({ reset: true, search: searchQuery });
  };

  // Category select handler
  const handleCategoryPress = (slug) => {
    setSelectedCategory(slug);
    fetchCatalog({ reset: true, category: slug });
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Top Branding & Action Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>
            MMA301 E-Commerce
          </Text>
          <Text style={[styles.appTitle, { color: colors.textPrimary }]}>
            Khám Phá Sản Phẩm
          </Text>
        </View>

        <View style={styles.topActions}>
          {/* AI Assistant Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AiAssistant', { catalogProducts: products })}
            style={[styles.iconButton, { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' }]}
          >
            <Text style={styles.topIcon}>✨</Text>
          </TouchableOpacity>

          {/* Wishlist Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Wishlist')}
            style={[styles.iconButton, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}
          >
            <Text style={styles.topIcon}>❤️</Text>
          </TouchableOpacity>

          {/* Cart Button with Dynamic Badge */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Cart')}
            style={[styles.iconButton, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}
          >
            <Text style={styles.topIcon}>🛒</Text>
            <Badge count={totalItems} />
          </TouchableOpacity>

          {/* Settings Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Settings')}
            style={[styles.iconButton, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}
          >
            <Text style={styles.topIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Box (R03) */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Tìm kiếm sản phẩm, thương hiệu..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              fetchCatalog({ reset: true, search: '' });
            }}
          >
            <Text style={[styles.clearIcon, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Horizontal Scroll */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => {
          const isSelected = selectedCategory === item.slug;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleCategoryPress(item.slug)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.cardBackground,
                  borderColor: isSelected ? colors.primary : colors.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Results Count Banner */}
      <View style={styles.resultsBar}>
        <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
          Hiển thị {products.length} / {totalCount} sản phẩm
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingMoreText, { color: colors.textSecondary }]}>
          Đang tải thêm sản phẩm...
        </Text>
      </View>
    );
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {isLoading ? (
        <LoadingScreen message="Đang kết nối danh mục sản phẩm..." />
      ) : errorMessage && products.length === 0 ? (
        <ErrorState
          title="Lỗi nạp dữ liệu"
          message={errorMessage}
          onRetry={() => fetchCatalog({ reset: true })}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={(prod) => navigation.navigate('ProductDetail', { productId: prod.id, product: prod })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="🔍"
              title="Không tìm thấy sản phẩm"
              message={`Không có kết quả nào cho "${searchQuery}". Hãy thử tìm kiếm bằng từ khóa khác.`}
              actionLabel="Xóa bộ lọc"
              onAction={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                fetchCatalog({ reset: true, search: '', category: 'all' });
              }}
            />
          }
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum.current = false;
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  topIcon: {
    fontSize: 18,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    padding: 4,
  },
  categoryList: {
    paddingVertical: 4,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultsBar: {
    marginTop: 10,
    marginBottom: 4,
  },
  resultsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 13,
  },
});
