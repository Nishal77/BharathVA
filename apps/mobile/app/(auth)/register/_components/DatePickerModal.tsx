import React, { useState, useEffect } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

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

  const parseInitialDate = (): Date => {
    if (initialDate) {
      const [day, month, year] = initialDate.split('/');
      if (day && month && year) {
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
    const today = new Date();
    const minAge = new Date();
    minAge.setFullYear(today.getFullYear() - 100);
    return minAge;
  };

  const [selectedDate, setSelectedDate] = useState<Date>(parseInitialDate());

  useEffect(() => {
    if (visible) {
      setSelectedDate(parseInitialDate());
    }
  }, [visible, initialDate]);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && date) {
        handleConfirm(date);
      } else {
        onClose();
      }
    } else {
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const handleConfirm = (date?: Date) => {
    const dateToUse = date || selectedDate;
    const day = dateToUse.getDate().toString().padStart(2, '0');
    const month = (dateToUse.getMonth() + 1).toString().padStart(2, '0');
    const year = dateToUse.getFullYear().toString();
    onDateSelect(`${day}/${month}/${year}`);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.87)' : '#000000';
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.4)' : '#6B7280';
  const borderColor = isDark ? '#FFFFFF0D' : '#E5E7EB';

  if (Platform.OS === 'android') {
    if (!visible) {
      return null;
    }
    return (
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        onChange={handleDateChange}
        maximumDate={new Date()}
        minimumDate={new Date(1900, 0, 1)}
        themeVariant={isDark ? 'dark' : 'light'}
      />
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="flex-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={handleCancel}
        />
        <View
          className="rounded-t-3xl"
          style={{
            backgroundColor: bgColor,
            paddingBottom: 40,
          }}
        >
          <View
            className="flex-row items-center justify-between px-4 py-4 border-b"
            style={{ borderBottomColor: borderColor }}
          >
            <Pressable onPress={handleCancel}>
              <Text className="text-base" style={{ color: secondaryTextColor }}>
                Cancel
              </Text>
            </Pressable>
            <Text className="text-lg font-semibold" style={{ color: textColor }}>
              Select Date
            </Text>
            <Pressable onPress={() => handleConfirm()}>
              <Text className="text-base font-semibold" style={{ color: '#3B82F6' }}>
                Done
              </Text>
            </Pressable>
          </View>
          <View className="items-center py-4">
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              themeVariant={isDark ? 'dark' : 'light'}
              style={{ width: '100%', height: 200 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

