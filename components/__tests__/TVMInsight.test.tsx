jest.mock('react-native-paper', () => {
  const RN = require('react-native');
  const React = require('react');
  return {
    Surface: ({ children, style }: any) => React.createElement(RN.View, { style }, children),
    Text: ({ children, style }: any) => React.createElement(RN.Text, { style }, children),
  };
});

import React from 'react';
import { render } from '@testing-library/react-native';
import { TVMInsight } from '../TVMInsight';

describe('TVMInsight', () => {
  it('renders with required monthlyAmount', () => {
    const { getByText } = render(<TVMInsight monthlyAmount={100} />);
    expect(getByText('7.0% avg return')).toBeTruthy();
  });

  it('shows the monthly amount in the detail text', () => {
    const { getByText } = render(<TVMInsight monthlyAmount={200} />);
    expect(getByText(/\$200\.00\/mo/)).toBeTruthy();
  });

  it('uses custom years prop', () => {
    const { getByText } = render(<TVMInsight monthlyAmount={100} years={20} />);
    expect(getByText(/20yr value/)).toBeTruthy();
  });

  it('uses custom annualRate prop', () => {
    const { getByText } = render(<TVMInsight monthlyAmount={100} annualRate={0.05} />);
    expect(getByText('5.0% avg return')).toBeTruthy();
  });

  it('shows "You put in" column', () => {
    const { getByText } = render(<TVMInsight monthlyAmount={100} />);
    expect(getByText('You put in')).toBeTruthy();
  });

  it('shows "Growth" column', () => {
    const { getByText } = render(<TVMInsight monthlyAmount={100} />);
    expect(getByText('Growth')).toBeTruthy();
  });

  it('shows the invest header', () => {
    const { getByText } = render(<TVMInsight monthlyAmount={100} />);
    expect(getByText('💰 If you invest these savings…')).toBeTruthy();
  });

  it('uses default years=10 when not provided', () => {
    const { getByText } = render(<TVMInsight monthlyAmount={100} />);
    expect(getByText(/10yr value/)).toBeTruthy();
  });
});
