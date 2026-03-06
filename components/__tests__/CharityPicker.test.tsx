jest.mock('react-native-paper', () => {
  const RN = require('react-native');
  const React = require('react');
  return {
    Surface: ({ children, style }: any) => React.createElement(RN.View, { style }, children),
    Text: ({ children, style }: any) => React.createElement(RN.Text, { style }, children),
    TextInput: Object.assign(
      ({ value, onChangeText, placeholder, style }: any) =>
        React.createElement(RN.TextInput, { value, onChangeText, placeholder, style }),
      { Icon: () => null }
    ),
    Button: ({ children, onPress, disabled }: any) =>
      React.createElement(RN.TouchableOpacity, { onPress, disabled }, React.createElement(RN.Text, null, children)),
    Chip: ({ children, style, icon, onClose }: any) =>
      React.createElement(RN.View, { style }, React.createElement(RN.Text, null, children)),
    ActivityIndicator: ({ style }: any) => React.createElement(RN.View, { style, testID: 'loading' }),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const RN = require('react-native');
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: any) => React.createElement(RN.View, { style }, children),
  };
});

jest.mock('@/services/charityService', () => ({
  charityService: {
    getFeatured: jest.fn(() => [
      { id: 'c1', name: 'Red Cross', category: 'Disaster Relief', isVerified: true },
      { id: 'c2', name: 'Custom Church', category: 'Church', isVerified: false },
    ]),
    search: jest.fn(async () => [
      { id: 'c1', name: 'Red Cross', category: 'Disaster Relief', isVerified: true },
    ]),
  },
}));

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CharityPicker } from '../CharityPicker';
import type { Charity } from '@/types';

const charity: Charity = {
  id: 'c1',
  name: 'Red Cross',
  category: 'Disaster Relief',
  isVerified: true,
};

describe('CharityPicker', () => {
  it('renders search input', () => {
    const { getByPlaceholderText } = render(
      <CharityPicker selected={null} onSelect={jest.fn()} />
    );
    expect(getByPlaceholderText('Search charities or churches…')).toBeTruthy();
  });

  it('shows featured charities on load', async () => {
    const { getByText } = render(
      <CharityPicker selected={null} onSelect={jest.fn()} />
    );
    await waitFor(() => expect(getByText('Red Cross')).toBeTruthy());
  });

  it('shows selected charity chip when selected is provided', async () => {
    const { getAllByText } = render(
      <CharityPicker selected={charity} onSelect={jest.fn()} />
    );
    // "Red Cross" appears in both the selected chip and the results list
    await waitFor(() => expect(getAllByText('Red Cross').length).toBeGreaterThan(0));
  });

  it('shows "Add Church or Custom Org" button', async () => {
    const { getByText } = render(
      <CharityPicker selected={null} onSelect={jest.fn()} />
    );
    expect(getByText('Add Church or Custom Org')).toBeTruthy();
  });

  it('shows custom form when "Add Church" is tapped', async () => {
    const { getByText } = render(
      <CharityPicker selected={null} onSelect={jest.fn()} />
    );
    fireEvent.press(getByText('Add Church or Custom Org'));
    await waitFor(() => expect(getByText('Organization Name')).toBeTruthy());
  });

  it('hides custom form on Cancel', async () => {
    const { getByText, queryByText } = render(
      <CharityPicker selected={null} onSelect={jest.fn()} />
    );
    fireEvent.press(getByText('Add Church or Custom Org'));
    await waitFor(() => getByText('Cancel'));
    fireEvent.press(getByText('Cancel'));
    await waitFor(() => {
      expect(queryByText('Organization Name')).toBeNull();
    });
  });

  it('calls onSelect with custom charity when Add is submitted', async () => {
    const onSelect = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <CharityPicker selected={null} onSelect={onSelect} />
    );
    fireEvent.press(getByText('Add Church or Custom Org'));
    await waitFor(() => getByText('Organization Name'));
    fireEvent.changeText(
      getByPlaceholderText('e.g. Grace Community Church'),
      'My Church'
    );
    fireEvent.press(getByText('Add'));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'My Church', isCustom: true, isVerified: false })
    );
  });

  it('does not call onSelect when custom name is blank', async () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <CharityPicker selected={null} onSelect={onSelect} />
    );
    fireEvent.press(getByText('Add Church or Custom Org'));
    await waitFor(() => getByText('Add'));
    fireEvent.press(getByText('Add'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders in modal mode', async () => {
    const { getByText } = render(
      <CharityPicker selected={null} onSelect={jest.fn()} modal onDismiss={jest.fn()} />
    );
    await waitFor(() => expect(getByText('Choose a Cause')).toBeTruthy());
  });

  it('shows Cancel button in modal mode', () => {
    const onDismiss = jest.fn();
    const { getAllByText } = render(
      <CharityPicker selected={null} onSelect={jest.fn()} modal onDismiss={onDismiss} />
    );
    // There's a Cancel button at the bottom in modal mode
    expect(getAllByText('Cancel').length).toBeGreaterThan(0);
  });

  it('shows verified chip for verified charities', async () => {
    const { getByText } = render(
      <CharityPicker selected={null} onSelect={jest.fn()} />
    );
    await waitFor(() => getByText('Red Cross'));
    // Verified charities show 501(c)(3)
    expect(getByText('501(c)(3)')).toBeTruthy();
  });
});
