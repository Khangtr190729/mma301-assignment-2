import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';

/**
 * Reusable ScreenContainer ensuring:
 * 1. Safe Area layout across devices
 * 2. Automatic dynamic theme background
 * 3. Synchronized StatusBar styling
 */
export default function ScreenContainer({
  children,
  style,
  contentContainerStyle,
  scrollable = false,
  edges = ['top', 'left', 'right'],
}) {
  const { colors, themeMode } = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.container, { backgroundColor: colors.background }, style]}
    >
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.innerView, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
});
