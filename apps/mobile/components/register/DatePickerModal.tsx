import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  initialDate?: string;
}

export default function DatePickerModal({
  visible,
  onClose,
  onDateSelect,
  initialDate,
}: DatePickerModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (initialDate) {
      const [day, month, year] = initialDate.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return new Date();
  });
  
  // State for current displayed month and year
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // State for showing year/month pickers
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const selectedBgColor = isDark ? '#3B82F6' : '#3B82F6';
  const todayBgColor = isDark ? '#1F2937' : '#F3F4F6';

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = selectedDate.getFullYear().toString();
    onDateSelect(`${day}/${month}/${year}`);
    onClose();
  };

  // Generate years for picker (from 1947 to current year)
  const generateYears = () => {
    const years = [];
    const currentYearNum = new Date().getFullYear();
    for (let year = 1947; year <= currentYearNum; year++) {
      years.push(year);
    }
    return years;
  };

  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
    setShowYearPicker(false);
  };

  const handleMonthSelect = (month: number) => {
    setCurrentMonth(month);
    setShowMonthPicker(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Pressable
          className="flex-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={onClose}
        />
        
        {/* Calendar Modal - Clean White Style */}
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            backgroundColor: '#FFFFFF', // White background
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: height * 0.7,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}
        >

          {/* Current Month Display - Clickable for Selection */}
          <View className="px-4 py-4">
            <View className="flex-row items-center justify-center">
              <Pressable
                onPress={() => setShowMonthPicker(true)}
                className="px-3 py-2 rounded-lg"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              >
                <Text className="text-xl font-bold" style={{ color: '#3B82F6' }}>
                  {monthNames[currentMonth]}
                </Text>
              </Pressable>
              <Text className="text-xl font-bold mx-2" style={{ color: '#000000' }}>
                {' '}
              </Text>
              <Pressable
                onPress={() => setShowYearPicker(true)}
                className="px-3 py-2 rounded-lg"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              >
                <Text className="text-xl font-bold" style={{ color: '#3B82F6' }}>
                  {currentYear}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Day Names - Clean Style */}
          <View className="flex-row px-4 pb-3">
            {dayNames.map((day) => (
              <View key={day} className="flex-1 items-center">
                <Text className="text-sm font-medium" style={{ color: '#6B7280' }}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid - Clean Style */}
          <View className="px-4 pb-6">
            <View className="flex-row flex-wrap">
              {generateCalendarDays().map((day, index) => (
                <View key={index} className="w-1/7 items-center mb-3">
                  {day ? (
                    <Pressable
                      onPress={() => handleDateSelect(day)}
                      className="w-12 h-12 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: isSelected(day)
                          ? '#3B82F6' // Blue selection
                          : isToday(day)
                          ? '#3B82F6' // Blue circle for today
                          : 'transparent',
                      }}
                    >
                      <Text
                        className="text-base font-medium"
                        style={{
                          color: isSelected(day)
                            ? '#FFFFFF'
                            : isToday(day)
                            ? '#FFFFFF' // White text for today's blue circle
                            : '#000000', // Black text for regular dates
                        }}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  ) : (
                    <View className="w-12 h-12" />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Confirm Selected Date Button - Black Style */}
          <View className="px-4 pb-6">
            <Pressable
              onPress={handleConfirm}
              className="rounded-xl py-4"
              style={{
                backgroundColor: '#000000', // Black button
                shadowColor: '#000000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Text className="text-base font-semibold text-center text-white">
                Confirm Selected Date
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Year Picker Modal */}
        {showYearPicker && (
          <View className="absolute inset-0 justify-center items-center">
            <View 
              className="bg-white rounded-2xl mx-8 max-h-96"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 12,
              }}
            >
              <View className="p-4 border-b border-gray-200">
                <Text className="text-lg font-bold text-center" style={{ color: '#000000' }}>
                  Select Year
                </Text>
              </View>
              <ScrollView 
                className="max-h-80"
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ padding: 16 }}
              >
                {generateYears().map((year) => (
                  <Pressable
                    key={year}
                    onPress={() => handleYearSelect(year)}
                    className={`py-3 px-4 rounded-lg mb-2 ${
                      year === currentYear ? 'bg-blue-100' : ''
                    }`}
                  >
                    <Text 
                      className={`text-base font-medium text-center ${
                        year === currentYear ? 'text-blue-600' : 'text-gray-800'
                      }`}
                    >
                      {year}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <View className="p-4 border-t border-gray-200">
                <Pressable
                  onPress={() => setShowYearPicker(false)}
                  className="py-2 px-4 rounded-lg bg-gray-100"
                >
                  <Text className="text-base font-medium text-center text-gray-600">
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Month Picker Modal */}
        {showMonthPicker && (
          <View className="absolute inset-0 justify-center items-center">
            <View 
              className="bg-white rounded-2xl mx-8 max-h-96"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 12,
              }}
            >
              <View className="p-4 border-b border-gray-200">
                <Text className="text-lg font-bold text-center" style={{ color: '#000000' }}>
                  Select Month
                </Text>
              </View>
              <View className="p-4">
                <View className="flex-row flex-wrap">
                  {monthNames.map((month, index) => (
                    <Pressable
                      key={index}
                      onPress={() => handleMonthSelect(index)}
                      className={`w-1/3 py-3 px-2 rounded-lg mb-2 ${
                        index === currentMonth ? 'bg-blue-100' : ''
                      }`}
                    >
                      <Text 
                        className={`text-sm font-medium text-center ${
                          index === currentMonth ? 'text-blue-600' : 'text-gray-800'
                        }`}
                      >
                        {month}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View className="p-4 border-t border-gray-200">
                <Pressable
                  onPress={() => setShowMonthPicker(false)}
                  className="py-2 px-4 rounded-lg bg-gray-100"
                >
                  <Text className="text-base font-medium text-center text-gray-600">
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
