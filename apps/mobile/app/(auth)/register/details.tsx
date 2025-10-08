import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View
} from 'react-native';
import DatePickerModal from './DatePickerModal';

const { width, height } = Dimensions.get('window');

interface DetailsProps {
  email: string;
  onBack: () => void;
  onComplete: (details: {
    name: string;
    phone: string;
    dateOfBirth: string;
    countryCode: string;
  }) => void;
}

export default function Details({ email, onBack, onComplete }: DetailsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  
  // Popular country codes
  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'USA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  ];
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const inputBgColor = isDark ? '#1F2937' : '#F9FAFB';
  const buttonBgColor = isDark ? '#1F2937' : '#F3F4F6';

  const handleContinue = () => {
    if (name.trim() && phone.trim()) {
      onComplete({
        name: name.trim(),
        phone: phone.trim(),
        dateOfBirth: dateOfBirth.trim(),
        countryCode: selectedCountryCode,
      });
    }
  };

  const isFormValid = name.trim() && phone.trim(); // Date of birth is now optional

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Bottom Image - 30% Height */}
      <Image
        source={require('../../../assets/images/indmil.jpg')}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.3,
          width: '100%',
        }}
        resizeMode="cover"
      />
      
      {/* Theme-based Image Overlay */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.3,
          width: '100%',
          backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)',
        }}
      />
      
      {/* Gradient Fade Overlay - Top masking effect */}
      <LinearGradient
        colors={isDark 
          ? ['rgba(0,0,0,1)', 'rgba(0,0,0,0.95)', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0)']
          : ['rgba(255,255,255,1)', 'rgba(255,255,255,0.95)', 'rgba(255,255,255,0.75)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0)']
        }
        locations={[0, 0.12, 0.3, 0.5, 0.7, 0.85, 1]}
        style={{
          position: 'absolute',
          bottom: height * 0.15,
          left: 0,
          width: width,
          height: height * 0.15,
        }}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <View className="flex-row items-center px-6 pt-12 pb-4 mt-4">
            <Pressable
              onPress={onBack}
              className="p-2"
            >
              <Image
                source={require('../../../assets/logo/arrow.png')}
                style={{ width: 20, height: 20 }}
                contentFit="contain"
              />
            </Pressable>
          </View>

          {/* Main Container */}
          <View className="flex-1 px-6" style={{ paddingBottom: height * 0.35 }}>
            {/* Header Section */}
            <View className="items-center mb-8 mt-8">
              <Text 
                className="text-3xl font-bold text-center mb-3"
                style={{ color: textColor }}
              >
                Complete Your Profile
              </Text>
              <Text 
                className="text-base text-center leading-6"
                style={{ color: secondaryTextColor }}
              >
                We need a few more details to get you started
                {/* Just a few steps to make it yours. */}
              </Text>
            </View>


            {/* Name Input */}
            <View className="mb-4">
              <Text 
                className="text-base font-medium mb-2"
                style={{ color: textColor }}
              >
                Full Name
              </Text>
              <View 
                className="rounded-xl px-4 py-3"
                style={{ 
                  backgroundColor: inputBgColor,
                  borderWidth: 1,
                  borderColor: borderColor,
                }}
              >
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor={secondaryTextColor}
                  autoCapitalize="words"
                  autoCorrect={false}
                  className="text-base"
                  style={{ color: textColor }}
                />
              </View>
            </View>

            {/* Phone Number Input */}
            <View className="mb-4">
              <Text 
                className="text-base font-medium mb-2"
                style={{ color: textColor }}
              >
                Phone Number
              </Text>
              <View 
                className="rounded-xl px-4 py-3 flex-row items-center"
                style={{ 
                  backgroundColor: inputBgColor,
                  borderWidth: 1,
                  borderColor: borderColor,
                }}
              >
                {/* Country Code Selector */}
                <Pressable
                  onPress={() => setShowCountryPicker(true)}
                  className="flex-row items-center mr-3"
                >
                  <Text className="text-base mr-1" style={{ color: textColor }}>
                    {countryCodes.find(c => c.code === selectedCountryCode)?.flag}
                  </Text>
                  <Text className="text-base font-medium" style={{ color: textColor }}>
                    {selectedCountryCode}
                  </Text>
                </Pressable>
                
                {/* Divider */}
                <View 
                  className="w-px h-6 mr-3"
                  style={{ backgroundColor: borderColor }}
                />
                
                {/* Phone Number Input */}
                <TextInput
                  value={phone}
                  onChangeText={(text) => {
                    // Only allow numeric characters (0-9)
                    const numericText = text.replace(/[^0-9]/g, '');
                    setPhone(numericText);
                  }}
                  placeholder="Ph. no"
                  placeholderTextColor={secondaryTextColor}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                  className="text-base flex-1"
                  style={{ color: textColor }}
                  maxLength={15} // Reasonable phone number length limit
                />
              </View>
            </View>

            {/* Date of Birth Input */}
            <View className="mb-4">
              <Text 
                className="text-base font-medium mb-2"
                style={{ color: textColor }}
              >
                Date of Birth
              </Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="rounded-xl px-4 py-3 flex-row items-center"
                style={{ 
                  backgroundColor: inputBgColor,
                  borderWidth: 1,
                  borderColor: borderColor,
                }}
              >
                <Calendar size={20} color={secondaryTextColor} style={{ marginRight: 12 }} />
                <Text
                  className="text-base flex-1"
                  style={{ 
                    color: dateOfBirth ? textColor : secondaryTextColor 
                  }}
                >
                  {dateOfBirth || 'DD/MM/YYYY'}
                </Text>
              </Pressable>
            </View>

            {/* Next Button */}
            <Pressable
              onPress={handleContinue}
              disabled={!isFormValid}
              className="rounded-xl py-4 mb-6 bg-black"
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text 
                className="text-base font-semibold text-center text-white"
              >
                Next
              </Text>
            </Pressable>


            {/* Terms and Privacy */}
            <View className="items-center mb-8">
              <Text 
                className="text-sm text-center leading-5"
                style={{ color: secondaryTextColor }}
              >
                By joining Bharath, you agree to our{' '}
                <Text style={{ color: '#3B82F6' }}>Terms</Text>
                {' '}and{' '}
                <Text style={{ color: '#3B82F6' }}>Privacy Policy</Text>
                . Your trust and voice are protected under{' '}
                <Text style={{ color: '#3B82F6' }}>Secure Data & Cookie Policy</Text>
                .
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={setDateOfBirth}
        initialDate={dateOfBirth}
      />

      {/* Country Code Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View className="flex-1 justify-end">
          {/* Backdrop */}
          <Pressable
            className="flex-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onPress={() => setShowCountryPicker(false)}
          />
          
          {/* Country Picker Modal */}
          <View 
            className="rounded-t-3xl"
            style={{ 
              backgroundColor: bgColor,
              maxHeight: height * 0.6,
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b" style={{ borderBottomColor: borderColor }}>
              <Text className="text-lg font-semibold" style={{ color: textColor }}>
                Select Country Code
              </Text>
              <Pressable onPress={() => setShowCountryPicker(false)} className="p-2">
                <Text className="text-lg font-semibold" style={{ color: textColor }}>✕</Text>
              </Pressable>
            </View>

            {/* Country List */}
            <ScrollView className="max-h-96">
              {countryCodes.map((country, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    setSelectedCountryCode(country.code);
                    setShowCountryPicker(false);
                  }}
                  className="flex-row items-center justify-between px-4 py-4 border-b"
                  style={{ 
                    borderBottomColor: borderColor,
                    backgroundColor: selectedCountryCode === country.code ? inputBgColor : 'transparent'
                  }}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">{country.flag}</Text>
                    <View>
                      <Text className="text-base font-medium" style={{ color: textColor }}>
                        {country.country}
                      </Text>
                      <Text className="text-sm" style={{ color: secondaryTextColor }}>
                        {country.code}
                      </Text>
                    </View>
                  </View>
                  {selectedCountryCode === country.code && (
                    <Text className="text-lg" style={{ color: '#3B82F6' }}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
