import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Import custom hooks and types
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../hooks/useUserProfile';
import { RootStackParamList } from '../../navigation/types';

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  screenName: keyof RootStackParamList;
  badge?: number;
}

type DrawerNavigationProp = StackNavigationProp<RootStackParamList>;

const DrawerMenu: React.FC<DrawerMenuProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DrawerNavigationProp>();
  const { logout } = useAuth();

  // Use the custom hook for all user profile data
  const {
    profile,
    notificationCounts,
    displayName,
    formattedPhone,
    memberDuration,
    userInitials,
    totalNotifications,
  } = useUserProfile();


  const handleNavigate = (screenName: keyof RootStackParamList) => {
    onClose(); // Close the drawer first

    // Navigate to the screen
    navigation.navigate(screenName as any);
  };

  const handleProfilePress = () => {
    handleNavigate('Profile');
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems: MenuItem[] = [
    // {
    //   id: 'home',
    //   title: 'Home',
    //   icon: 'home-outline',
    //   screenName: 'Main',
    // },
    // {
    //   id: 'services',
    //   title: 'My Services',
    //   icon: 'construct-outline',
    //   screenName: 'Services',
    //   badge: notificationCounts.services,
    // },
    // {
    //   id: 'requests',
    //   title: 'My Requests',
    //   icon: 'list-outline',
    //   screenName: 'Requests',
    //   badge: notificationCounts.requests,
    // },
    // {
    //   id: 'messages',
    //   title: 'Messages',
    //   icon: 'chatbubble-outline',
    //   screenName: 'Messages',
    //   badge: notificationCounts.messages,
    // },
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person-outline',
      screenName: 'Profile',
    },
    // {
    //   id: 'wallet',
    //   title: 'Wallet & Payments',
    //   icon: 'wallet-outline',
    //   screenName: 'Wallet',
    // },
    // {
    //   id: 'offers',
    //   title: 'Offers & Rewards',
    //   icon: 'gift-outline',
    //   screenName: 'Offers',
    //   badge: notificationCounts.offers,
    // },
    // {
    //   id: 'settings',
    //   title: 'Settings',
    //   icon: 'settings-outline',
    //   screenName: 'Settings',
    // },
    // {
    //   id: 'help',
    //   title: 'Help & Support',
    //   icon: 'help-circle-outline',
    //   screenName: 'Help',
    // },
  ];

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar backgroundColor="#F8F9FA" barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Menu</Text>
          {totalNotifications > 0 && (
            <View style={styles.totalNotificationBadge}>
              <Text style={styles.totalNotificationText}>
                {totalNotifications > 99 ? '99+' : totalNotifications}
              </Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* User Profile Card */}
          <TouchableOpacity
            style={styles.userProfileCard}
            onPress={handleProfilePress}
            activeOpacity={0.7}
          >
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {/* {profile?.profilePicture ? (
                  <Image 
                    source={{ uri: profile.profilePicture }} 
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{userInitials}</Text>
                  </View>
                )} */}
                {userInitials ? (
                  <View style={styles.avatar}>
                    {/* <Ionicons name="person" size={24} color="#000000" /> */}
                    <Text style={styles.avatarText}>{userInitials}</Text>
                  </View>
                ): (
                  <View>
                    <Ionicons name="person" size={24} color="#000000" />
                  </View>
                )}
                {profile?.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  </View>
                )}
              </View>

              <View style={styles.userDetails}>
                <View style={styles.nameContainer}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  {profile?.isVerified && (
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" style={styles.verifiedIcon} />
                  )}
                </View>
                <Text style={styles.userPhone}>{formattedPhone}</Text>
                {profile?.email && (
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {profile.email}
                  </Text>
                )}
                {memberDuration && (
                  <Text style={styles.memberSince}>
                    Member for {memberDuration}
                  </Text>
                )}
              </View>

              <TouchableOpacity style={styles.profileArrow}>
                <Ionicons name="chevron-forward" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Rating Card */}
          <TouchableOpacity
            style={styles.ratingCard}
            // onPress={() => handleNavigate('Ratings')}
            activeOpacity={0.7}
          >
            <View style={styles.ratingInfo}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <View style={styles.ratingDetails}>
                <Text style={styles.ratingText}>
                  {profile?.rating?.toFixed(2) || '5.00'} My Rating
                </Text>
                <Text style={styles.bookingsText}>
                  {profile?.totalBookings || 0} booking{(profile?.totalBookings || 0) !== 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity style={styles.ratingArrow}>
                <Ionicons name="chevron-forward" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.screenName)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color="#000000"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>{item.title}</Text>

                {/* Notification Badge */}
                {item.badge && item.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </Text>
                  </View>
                )}

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#666666"
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* App Info */}
          <View style={styles.appInfoContainer}>
            <Text style={styles.appVersion}>NearBy v1.0.0</Text>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color="#FF4444"
              style={styles.menuIcon}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  totalNotificationBadge: {
    backgroundColor: '#FF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  totalNotificationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  userProfileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 1,
  },
  userDetails: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: '#999999',
  },
  profileArrow: {
    padding: 4,
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingDetails: {
    flex: 1,
    marginLeft: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  bookingsText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  ratingArrow: {
    padding: 4,
  },
  menuContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIcon: {
    marginRight: 16,
    width: 24,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  badge: {
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  appInfoContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  appVersion: {
    fontSize: 12,
    color: '#999999',
  },
  bottomSpacing: {
    height: 32,
  },
  logoutSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '500',
  },
});

export default DrawerMenu;