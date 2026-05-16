import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: {
  name: string;
  title: string;
  icon: IoniconsName;
  iconActive: IoniconsName;
}[] = [
  { name: 'index',    title: 'Accueil', icon: 'grid-outline',    iconActive: 'grid' },
  { name: 'lists',    title: 'Listes',  icon: 'list-outline',    iconActive: 'list' },
  { name: 'stats',    title: 'Stats',   icon: 'bar-chart-outline', iconActive: 'bar-chart' },
  { name: 'settings', title: 'Réglages',icon: 'settings-outline', iconActive: 'settings' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E24B4A',
        tabBarInactiveTintColor: '#888780',
        tabBarStyle: { borderTopWidth: 0.5, borderTopColor: '#D3D1C7' },
        headerShown: false,
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
