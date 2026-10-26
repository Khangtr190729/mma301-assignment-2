import React from 'react';
import { StyleSheet, View, Text, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ showLabel = true, style }) {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          {isDark ? 'Chế độ Tối' : 'Chế độ Sáng'}
        </Text>
      )}
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        trackColor={{ false: '#CBD5E1', true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
