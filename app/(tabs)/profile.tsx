import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Surface, Button, Avatar, List, Switch, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUserStore } from '@/store/useUserStore';
import { CharityPicker } from '@/components/CharityPicker';
import { useState } from 'react';
import type { Charity } from '@/types';

export default function ProfileScreen() {
  const { user, logout, setDefaultCharity, updateNotifications } = useUserStore();
  const [showCharityPicker, setShowCharityPicker] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)');
        },
      },
    ]);
  };

  const handleSelectCharity = (charity: Charity) => {
    setDefaultCharity(charity);
    setShowCharityPicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={56}
          label={user?.name?.slice(0, 2).toUpperCase() ?? 'ME'}
          style={styles.avatar}
        />
        <View style={{ marginLeft: 16 }}>
          <Text variant="titleLarge" style={styles.name}>{user?.name}</Text>
          <Text variant="bodyMedium" style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Surface style={styles.section} elevation={1}>
          <List.Section>
            <List.Subheader style={styles.sectionLabel}>Connected Accounts</List.Subheader>
            {user?.connectedAccounts?.length ? (
              user.connectedAccounts.map((acct) => (
                <List.Item
                  key={acct.id}
                  title={acct.name}
                  description={acct.institutionName}
                  left={(props) => <List.Icon {...props} icon="bank" color="#1B4332" />}
                  right={() => (
                    <Text variant="labelSmall" style={styles.connected}>Connected</Text>
                  )}
                />
              ))
            ) : (
              <List.Item
                title="No accounts connected"
                description="Connect a bank account to track transactions"
                left={(props) => <List.Icon {...props} icon="bank-off" color="#ADB5BD" />}
              />
            )}
          </List.Section>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <List.Section>
            <List.Subheader style={styles.sectionLabel}>Default Charity</List.Subheader>
            <List.Item
              title={user?.defaultCharity?.name ?? 'Not set'}
              description={user?.defaultCharity?.category ?? 'Tap to choose a cause'}
              left={(props) => <List.Icon {...props} icon="hand-heart" color="#1B4332" />}
              onPress={() => setShowCharityPicker(true)}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          </List.Section>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <List.Section>
            <List.Subheader style={styles.sectionLabel}>Notifications</List.Subheader>
            <List.Item
              title="Habit violation alerts"
              description="Notify when a tracked purchase is detected"
              left={(props) => <List.Icon {...props} icon="bell" color="#1B4332" />}
              right={() => (
                <Switch
                  value={user?.notifications?.violations ?? true}
                  onValueChange={(val) => updateNotifications({ violations: val })}
                  color="#1B4332"
                />
              )}
            />
            <Divider />
            <List.Item
              title="Weekly savings summary"
              description="See your progress every Monday"
              left={(props) => <List.Icon {...props} icon="chart-line" color="#1B4332" />}
              right={() => (
                <Switch
                  value={user?.notifications?.weeklySummary ?? true}
                  onValueChange={(val) => updateNotifications({ weeklySummary: val })}
                  color="#1B4332"
                />
              )}
            />
          </List.Section>
        </Surface>

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#D62828"
        >
          Sign Out
        </Button>
      </ScrollView>

      {showCharityPicker && (
        <CharityPicker
          selected={user?.defaultCharity ?? null}
          onSelect={handleSelectCharity}
          modal
          onDismiss={() => setShowCharityPicker(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#1B4332',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  avatar: { backgroundColor: '#40916C' },
  name: { color: '#FFFFFF', fontWeight: 'bold' },
  email: { color: '#B7E4C7' },
  content: { padding: 16, paddingBottom: 32 },
  section: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionLabel: { color: '#6C757D', fontSize: 12 },
  connected: { color: '#28A745', alignSelf: 'center' },
  logoutButton: {
    borderRadius: 8,
    borderColor: '#D62828',
    marginTop: 8,
  },
});
