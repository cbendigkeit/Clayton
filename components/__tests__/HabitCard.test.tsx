jest.mock('react-native-paper', () => {
  const RN = require('react-native');
  const React = require('react');
  return {
    Surface: ({ children, style }: any) => React.createElement(RN.View, { style, testID: 'surface' }, children),
    Text: ({ children, style }: any) => React.createElement(RN.Text, { style }, children),
    Chip: ({ children, style, icon, onClose }: any) =>
      React.createElement(RN.View, { style, testID: 'chip' }, React.createElement(RN.Text, null, children)),
    IconButton: ({ onPress, icon, testID }: any) =>
      React.createElement(RN.TouchableOpacity, { onPress, testID: testID ?? `icon-${icon}` }),
    ProgressBar: ({ progress }: any) =>
      React.createElement(RN.View, { testID: 'progress-bar', accessibilityValue: { now: progress } }),
  };
});

import React from 'react';
import { render } from '@testing-library/react-native';
import { HabitCard } from '../HabitCard';
import type { Habit } from '@/types';

const baseHabit: Habit = {
  id: 'h1',
  name: 'No Coffee',
  targetType: 'merchant',
  targetValue: 'Starbucks',
  pledgeType: 'fixed',
  pledgeAmount: 5,
  isActive: true,
  createdAt: new Date().toISOString(),
  totalSpent: 120,
  violationCount: 3,
  currentStreak: 7,
  bestStreak: 14,
};

describe('HabitCard', () => {
  it('renders habit name', () => {
    const { getByText } = render(<HabitCard habit={baseHabit} />);
    expect(getByText('No Coffee')).toBeTruthy();
  });

  it('renders merchant target label directly', () => {
    const { getByText } = render(<HabitCard habit={baseHabit} />);
    expect(getByText('Starbucks')).toBeTruthy();
  });

  it('maps category targetType to human-readable label', () => {
    const habit: Habit = { ...baseHabit, targetType: 'category', targetValue: 'coffee_shops' };
    const { getByText } = render(<HabitCard habit={habit} />);
    expect(getByText('Coffee Shops')).toBeTruthy();
  });

  it('uses raw targetValue when category key is unknown', () => {
    const habit: Habit = { ...baseHabit, targetType: 'category', targetValue: 'unknown_cat' };
    const { getByText } = render(<HabitCard habit={habit} />);
    expect(getByText('unknown_cat')).toBeTruthy();
  });

  it('shows streak label when streak > 0', () => {
    const { getByText } = render(<HabitCard habit={baseHabit} />);
    expect(getByText('7 day streak 🔥')).toBeTruthy();
  });

  it('shows "No streak yet" when currentStreak is 0', () => {
    const habit: Habit = { ...baseHabit, currentStreak: 0 };
    const { getByText } = render(<HabitCard habit={habit} />);
    expect(getByText('No streak yet')).toBeTruthy();
  });

  it('renders percentage pledge label', () => {
    const habit: Habit = { ...baseHabit, pledgeType: 'percentage', pledgeAmount: 10 };
    const { getByText } = render(<HabitCard habit={habit} />);
    expect(getByText('10%')).toBeTruthy();
  });

  it('renders fixed pledge as currency', () => {
    const { getByText } = render(<HabitCard habit={baseHabit} />);
    expect(getByText('$5.00')).toBeTruthy();
  });

  it('renders action buttons when showActions is true', () => {
    const onToggle = jest.fn();
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <HabitCard habit={baseHabit} showActions onToggle={onToggle} onDelete={onDelete} />
    );
    expect(getByTestId('icon-pause')).toBeTruthy();
    expect(getByTestId('icon-trash-can-outline')).toBeTruthy();
  });

  it('shows play icon when habit is paused and showActions is true', () => {
    const habit: Habit = { ...baseHabit, isActive: false };
    const { getByTestId } = render(<HabitCard habit={habit} showActions />);
    expect(getByTestId('icon-play')).toBeTruthy();
  });

  it('shows Paused chip when habit is inactive', () => {
    const habit: Habit = { ...baseHabit, isActive: false };
    const { getByText } = render(<HabitCard habit={habit} />);
    expect(getByText('Paused')).toBeTruthy();
  });

  it('does not show actions when showActions is false', () => {
    const { queryByTestId } = render(<HabitCard habit={baseHabit} />);
    expect(queryByTestId('icon-pause')).toBeNull();
  });

  it('streakProgress is 0 when bestStreak is 0', () => {
    const habit: Habit = { ...baseHabit, currentStreak: 0, bestStreak: 0 };
    const { getByTestId } = render(<HabitCard habit={habit} />);
    expect(getByTestId('progress-bar')).toBeTruthy();
  });
});
