import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTabStyles } from '../../../../../hooks/useTabStyles';

interface SearchHeaderProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  tabs: string[];
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  topOffset?: number;
}

export default function SearchHeader({ 
  activeTab, 
  onTabPress, 
  tabs,
  searchValue = '',
  onSearchChange = () => {},
  topOffset = 0
}: SearchHeaderProps) {
  const tabStyles = useTabStyles();

  return (
    <View
        style={{
          position: 'absolute',
          top: topOffset,
          left: 0,
          right: 0,
          zIndex: 50,
          paddingTop: 16,
          paddingBottom: 12,
          paddingHorizontal: 24,
          backgroundColor: tabStyles.screen.backgroundColor,
          borderWidth: 0,
          borderBottomWidth: 0,
        }}
      >
      {/* Header Content */}
      <View style={{ position: 'relative', zIndex: 10 }}>
        {/* Top Row - Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, marginTop: 4 }}>
          {/* Amazing Search Bar - Center with Premium Design */}
          <View
            className="flex-row items-center rounded-full bg-gray-100"
            style={{
              height: 44,
              paddingLeft: 16,
              paddingRight: 16,
              width: '100%',
              marginTop: 0,
            }}
          >
            {/* Search Input */}
            <TextInput
              value={searchValue}
              onChangeText={onSearchChange}
              placeholder="Search..."
              placeholderTextColor={tabStyles.text.inactive}
              className="flex-1 text-base font-medium"
              style={{
                color: tabStyles.text.active,
                height: '100%',
                paddingRight: 8,
              }}
              accessibilityLabel="Search input"
            />

            {/* Search Icon - Right */}
            <Svg width={18} height={18} viewBox="0 0 18 18">
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.1083 11.1083C11.4012 10.8154 11.876 10.8154 12.1689 11.1083L16.2803 15.2197C16.5732 15.5126 16.5732 15.9874 16.2803 16.2803C15.9874 16.5732 15.5126 16.5732 15.2197 16.2803L11.1083 12.1689C10.8154 11.876 10.8154 11.4012 11.1083 11.1083Z"
                fill={tabStyles.text.inactive}
              />
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.5 7.75C1.5 4.29829 4.29829 1.5 7.75 1.5C11.2017 1.5 14 4.29829 14 7.75C14 11.2017 11.2017 14 7.75 14C4.29829 14 1.5 11.2017 1.5 7.75ZM7.75 3C5.12671 3 3 5.12671 3 7.75C3 10.3733 5.12671 12.5 7.75 12.5C10.3733 12.5 12.5 10.3733 12.5 7.75C12.5 5.12671 10.3733 3 7.75 3Z"
                fill={tabStyles.text.inactive}
              />
            </Svg>
          </View>
        </View>

        {/* Navigation Tabs - Horizontally Scrollable */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingLeft: 0,
            paddingRight: 16,
            paddingBottom: 0,
            alignItems: 'center'
          }}
        >
          <View style={{ flexDirection: 'row', gap: 17 }}>
            {tabs.map((tab, index) => (
              <Pressable
                key={tab}
                onPress={() => onTabPress(tab)}
                style={({ pressed }) => ({
                  position: 'relative',
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  marginLeft: index === 0 ? 0 : 0,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: activeTab === tab ? tabStyles.text.active : tabStyles.text.inactive,
                  }}
                >
                  {tab}
                </Text>
                
                {/* Active Tab Indicator */}
                {activeTab === tab && (
                  <View 
                    style={{
                      position: 'absolute',
                      bottom: -3,
                      left: '8%',
                      right: '8%',
                      height: 3,
                      backgroundColor: '#3B82F6',
                      borderRadius: 2,
                    }}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}