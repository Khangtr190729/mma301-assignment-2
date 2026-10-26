import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import AiRecommendationCard from '../components/AiRecommendationCard';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { geminiService } from '../services/geminiService';
import { productService } from '../services/productService';

const SUGGESTION_CHIPS = [
  'Gợi ý mỹ phẩm dưỡng da giá dưới $20',
  'Nước hoa sang trọng lưu hương lâu',
  'Sản phẩm giảm giá tốt nhất hôm nay',
  'Tư vấn sản phẩm bán chạy nhất',
];

export default function AiAssistantScreen({ route, navigation }) {
  const { initialQuery = '', catalogProducts: passedCatalog } = route.params || {};
  const { colors, isDark } = useTheme();
  const { cartItems } = useCart();

  const [query, setQuery] = useState(initialQuery);
  const [catalog, setCatalog] = useState(passedCatalog || []);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Load catalog context if not passed
  useEffect(() => {
    if (!catalog || catalog.length === 0) {
      productService.getProducts({ limit: 30 }).then((res) => {
        setCatalog(res.products);
      });
    }
  }, []);

  // Auto trigger if initial query was provided
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleAskAi(initialQuery);
    }
  }, [initialQuery]);

  const handleAskAi = async (promptText = query) => {
    const textToSubmit = promptText || query;
    if (!textToSubmit || !textToSubmit.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await geminiService.getRecommendations({
        userQuery: textToSubmit.trim(),
        catalogProducts: catalog,
        cartItems,
      });
      setResult(response);
    } catch (err) {
      setResult({
        advice: 'Đã xảy ra lỗi khi trao đổi với AI. Đã kích hoạt cơ chế hiển thị an toàn.',
        recommendations: catalog.slice(0, 2),
        isValidated: true,
        hallucinatedIds: [],
        isFallback: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Intro Header */}
        <View
          style={[
            styles.headerBanner,
            {
              backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
              borderColor: colors.primary,
            },
          ]}
        >
          <View style={styles.bannerHeader}>
            <Text style={styles.bannerIcon}>✨</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: colors.primary }]}>
                Gemini Shopping Assistant
              </Text>
              <Text style={[styles.bannerSubtitle, { color: colors.textSecondary }]}>
                Trợ lý AI phân tích nhu cầu và gợi ý trực tiếp từ {catalog.length} sản phẩm thực tế trong kho.
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Suggestion Chips */}
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Gợi ý nhanh:</Text>
        <View style={styles.chipGrid}>
          {SUGGESTION_CHIPS.map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.8}
              onPress={() => {
                setQuery(chip);
                handleAskAi(chip);
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: colors.textSecondary }]}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Box */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="Nhập nhu cầu mua sắm của bạn..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            multiline
            numberOfLines={2}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isLoading || !query.trim()}
            onPress={() => handleAskAi()}
            style={[
              styles.sendBtn,
              {
                backgroundColor: colors.primary,
                opacity: isLoading || !query.trim() ? 0.6 : 1,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendBtnText}>Gửi AI</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Presentation (R10) */}
        {result && (
          <View style={styles.resultSection}>
            {/* Anti-Hallucination Guard Badge */}
            <View
              style={[
                styles.validationBadge,
                {
                  backgroundColor: result.hallucinatedIds.length > 0 ? colors.warning : colors.successLight,
                  borderColor: result.hallucinatedIds.length > 0 ? colors.warning : colors.success,
                },
              ]}
            >
              <Text style={[styles.validationText, { color: colors.textPrimary }]}>
                {result.hallucinatedIds.length > 0
                  ? `⚠️ Phát hiện ID ảo giác [${result.hallucinatedIds.join(
                      ', '
                    )}]. Đã lọc và chỉ hiển thị sản phẩm thực tế.`
                  : '✓ Đã xác thực Catalog: 100% sản phẩm gợi ý tồn tại trong kho.'}
              </Text>
            </View>

            {/* AI Advice Box */}
            <View
              style={[
                styles.adviceBox,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Text style={[styles.adviceHeader, { color: colors.primary }]}>
                💡 Lời khuyên từ AI:
              </Text>
              <Text style={[styles.adviceText, { color: colors.textPrimary }]}>
                {result.advice}
              </Text>
            </View>

            {/* Recommended Products Cards */}
            {result.recommendations && result.recommendations.length > 0 && (
              <View style={styles.recContainer}>
                <Text style={[styles.recTitle, { color: colors.textPrimary }]}>
                  Sản phẩm đề xuất ({result.recommendations.length}):
                </Text>

                {result.recommendations.map((prod) => (
                  <AiRecommendationCard
                    key={prod.id}
                    product={prod}
                    onSelect={(p) =>
                      navigation.navigate('ProductDetail', { productId: p.id, product: p })
                    }
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerBanner: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  bannerHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  bannerIcon: {
    fontSize: 26,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginBottom: 16,
  },
  input: {
    fontSize: 14,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  sendBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  resultSection: {
    marginTop: 8,
  },
  validationBadge: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  validationText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  adviceBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  adviceHeader: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 22,
  },
  recContainer: {
    marginTop: 4,
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
});
