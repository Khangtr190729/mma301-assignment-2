import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { useWishlist } from '../context/WishlistContext';
import { getGeminiApiKey, saveGeminiApiKey, clearAllStorage } from '../storage/appStorage';

export default function SettingsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { permissionStatus, isGranted, requestPermission, triggerCustomNotification } =
    useNotification();
  const { syncStatus } = useWishlist();

  const [geminiKey, setGeminiKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);

  useEffect(() => {
    getGeminiApiKey().then((key) => {
      if (key) {
        setGeminiKey(key);
        setIsKeySaved(true);
      }
    });
  }, []);

  const handleSaveGeminiKey = async () => {
    await saveGeminiApiKey(geminiKey.trim());
    setIsKeySaved(true);
    Alert.alert('Thành công', 'Gemini API Key đã được lưu an toàn trong bộ nhớ thiết bị.');
  };

  const handleClearKey = async () => {
    await saveGeminiApiKey('');
    setGeminiKey('');
    setIsKeySaved(false);
    Alert.alert('Đã xóa', 'Gemini API Key đã được xóa khỏi bộ nhớ.');
  };

  const handleTestNotification = async () => {
    if (!isGranted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          'Quyền thông báo bị từ chối',
          'Bạn cần cấp quyền thông báo trong Cài đặt của thiết bị để nhận được thông báo này.'
        );
        return;
      }
    }

    const sent = await triggerCustomNotification(
      'Thông báo thử nghiệm MMA301',
      'Hệ thống thông báo Notification Service đang hoạt động hoàn hảo!'
    );

    if (sent) {
      Alert.alert('Đã gửi', 'Thông báo đã được phát đi thành công.');
    } else {
      Alert.alert('Lưu ý', 'Không thể hiển thị thông báo (có thể do môi trường Web).');
    }
  };

  const handleResetAppStorage = () => {
    Alert.alert(
      'Xóa toàn bộ dữ liệu (First-Run Reset)',
      'Hành động này sẽ xóa toàn bộ Giỏ hàng, Yêu thích, Lịch sử đơn hàng và API key để quay về trạng thái app lần đầu khởi chạy.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa sạch',
          style: 'destructive',
          onPress: async () => {
            await clearAllStorage();
            Alert.alert('Hoàn tất', 'Đã đặt lại dữ liệu ứng dụng về mặc định ban đầu.', [
              { text: 'OK', onPress: () => navigation.navigate('Catalog') },
            ]);
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Student Profile Info Card (Matching Ass 1) */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Thông tin sinh viên & Học phần
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Sinh viên:</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>Trương Hoàng Khang</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>MSSV:</Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>CE190729</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Học phần:</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>MMA301 - Assignment 2</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Dự án:</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>Integrated E-Commerce App</Text>
          </View>
        </View>

        {/* Theme Settings Section */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Giao diện (Theme)</Text>
          <View style={styles.settingItemRow}>
            <View>
              <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                Chế độ màu hiển thị
              </Text>
              <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                {isDark ? 'Đang bật giao diện Tối (Dark)' : 'Đang bật giao diện Sáng (Light)'}
              </Text>
            </View>
            <ThemeToggle showLabel={false} />
          </View>
        </View>

        {/* Gemini AI Key Configuration (R10 & Security Compliance) */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.aiHeader}>
            <Text style={[styles.sectionTitle, { color: colors.primary, marginBottom: 0 }]}>
              Cấu hình Gemini AI API Key
            </Text>
          </View>
          <Text style={[styles.securityNotice, { color: colors.textSecondary }]}>
            Không commit secret vào repository. Hãy dán API key của bạn vào đây; key được lưu cục bộ an toàn trong thiết bị.
          </Text>

          <TextInput
            style={[
              styles.keyInput,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.cardBorder,
                color: colors.textPrimary,
              },
            ]}
            placeholder="Dán Gemini API Key (AIzaSy...)"
            placeholderTextColor={colors.textMuted}
            value={geminiKey}
            onChangeText={setGeminiKey}
            secureTextEntry={isKeySaved}
            autoCapitalize="none"
          />

          <View style={styles.keyBtnRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveGeminiKey}
              style={[styles.saveKeyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.saveKeyText}>Lưu API Key</Text>
            </TouchableOpacity>

            {isKeySaved && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleClearKey}
                style={[styles.clearKeyBtn, { borderColor: colors.error }]}
              >
                <Text style={[styles.clearKeyText, { color: colors.error }]}>Xóa Key</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notification Service Section (R09) */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Hệ thống thông báo (Notification)
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Trạng thái quyền:</Text>
            <Text
              style={[
                styles.infoValue,
                { color: isGranted ? colors.success : colors.warning, fontWeight: '700' },
              ]}
            >
              {isGranted ? 'Đã cấp quyền (Granted)' : `Chưa cấp quyền (${permissionStatus})`}
            </Text>
          </View>

          <View style={styles.notifBtnRow}>
            {!isGranted && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={requestPermission}
                style={[styles.notifBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.notifBtnText}>Yêu cầu cấp quyền</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleTestNotification}
              style={[styles.notifBtn, { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' }]}
            >
              <Text style={[styles.notifBtnText, { color: colors.primary }]}>
                Gửi thông báo thử nghiệm
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Firebase Synchronization Status (R08) */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Đồng bộ Firebase Cloud Firestore
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Cơ chế hoạt động:</Text>
            <Text style={[styles.infoValue, { color: colors.primary, fontWeight: '700' }]}>
              {syncStatus.mode}
            </Text>
          </View>
          <Text style={[styles.securityNotice, { color: colors.textSecondary, marginTop: 4 }]}>
            Hệ thống hỗ trợ tự động chuyển đổi giữa Cloud Firestore và Local Resilient Persistence khi ngoại tuyến, đảm bảo app không bao giờ bị dừng đột ngột.
          </Text>
        </View>

        {/* Reset Storage Button (Testing First-Run & Grading) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleResetAppStorage}
          style={[styles.resetBtn, { borderColor: colors.error }]}
        >
          <Text style={[styles.resetBtnText, { color: colors.error }]}>
            Đặt lại bộ nhớ ứng dụng (First-Run Reset)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  aiBadgeIcon: {
    fontSize: 18,
  },
  securityNotice: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  keyInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 10,
  },
  keyBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveKeyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveKeyText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  clearKeyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearKeyText: {
    fontWeight: '600',
    fontSize: 13,
  },
  notifBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  notifBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  notifBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  resetBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
