import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ showLabel = true, style }) {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggleTheme}
      style={[
        styles.toggleBtn,
        {
          backgroundColor: isDark ? colors.cardBackground : colors.primaryLight,
          borderColor: colors.cardBorder,
        },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        <Text style={styles.icon}>{isDark ? '🌙' : '☀️'}</Text>
        {showLabel && (
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            {isDark ? 'Chế độ Tối' : 'Chế độ Sáng'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
