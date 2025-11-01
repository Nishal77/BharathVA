import React, { useState } from 'react';
import { Pressable, Text, View, useColorScheme, Dimensions } from 'react-native';
import { Image } from 'expo-image';
// Removed MessageCircle import - using custom SVG
import { Svg, Path, Line } from 'react-native-svg';
import EmojiPickerModal from '../../components/EmojiPickerModal';
import ReactionsPicker from '../../components/ReactionsPicker';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FeedActionSectionProps {
  onLike?: () => void;
  onReply?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onEmojiSelect?: (emoji: string) => void;
  likes?: number;
  comments?: number;
  shares?: number;
}

// Utility function to format numbers with commas
function formatNumber(num: number): string {
  // Add commas for thousands separator
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function FeedActionSection({ 
  onLike, 
  onReply, 
  onShare, 
  onBookmark,
  onEmojiSelect,
  likes,
  comments,
  shares = 23
}: FeedActionSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isSmileActive, setIsSmileActive] = useState(false);
  const [isBookmarkActive, setIsBookmarkActive] = useState(false);
  const [isSendActive, setIsSendActive] = useState(false);
  const [isHeartActive, setIsHeartActive] = useState(false);
  const [isMessageActive, setIsMessageActive] = useState(false);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [isReactionsPickerVisible, setIsReactionsPickerVisible] = useState(false);
  
  // Generate random numbers for testing - always generate for premium look
  const randomLikes = React.useMemo(() => {
    if (likes !== undefined && likes > 0) {
      return likes;
    }
    // Generate random number between 500 and 10,500 for realistic testing
    return Math.floor(Math.random() * 10000) + 500;
  }, [likes]);
  
  const randomComments = React.useMemo(() => {
    if (comments !== undefined && comments > 0) {
      return comments;
    }
    // Generate random number between 10 and 510 for realistic testing
    return Math.floor(Math.random() * 500) + 10;
  }, [comments]);
  
  const randomShares = React.useMemo(() => {
    if (shares !== undefined && shares > 0) {
      return shares;
    }
    // Generate random number between 5 and 305 for realistic testing
    return Math.floor(Math.random() * 300) + 5;
  }, [shares]);
  
  // Theme-aware colors: white in dark mode, black in light mode
  const textColor = isDark ? '#FFFFFF' : '#000000';
  
  // Random usernames list for "Liked by" section (varying lengths - short to long)
  const usernames = [
    // Short usernames
    'arjun_01', 'priya_23', 'rohan_x', 'kavya_99', 'aditya_07', 'ananya22',
    'vikram_r', 'meera_s', 'rahul_k', 'sneha_p', 'karan12', 'pooja_l',
    // Medium usernames
    'aryan_kumar', 'divya_sharma', 'raj_patel', 'swati_reddy', 'neeraj_singh', 'kritika_mehta',
    'amit_gupta', 'radha_das', 'varun_jain', 'aishwarya_r', 'siddharth_k', 'nisha_thakur',
    'manish_shah', 'riya_chopra', 'abhishek_k', 'sanjana_m', 'nikhil_agarwal', 'tara_bansal',
    // Longer usernames
    'aditya_kumar_2024', 'priya_sharma_official', 'rohan_patel_01', 'kavya_reddy_99',
    'arjun_singh_real', 'ananya_mehta_23', 'vikram_gupta_live', 'meera_das_official',
    'rahul_jain_2024', 'sneha_thakur_07', 'karan_shah_xx', 'pooja_chopra_99',
    'aryan_bansal_2024', 'divya_agarwal_real', 'raj_kumar_official', 'swati_singh_live'
  ];
  
  // Generate random username (memoized for consistency per render)
  const randomUsername = React.useMemo(() => {
    return usernames[Math.floor(Math.random() * usernames.length)];
  }, []);
  
  // Random avatar URLs for "Liked by" section (keep two avatars for visual)
  const likedByUsers = [
    { username: randomUsername, avatar: 'https://i.pravatar.cc/150?img=12' },
    { username: randomUsername, avatar: 'https://i.pravatar.cc/150?img=47' }
  ];
  
  // Background colors for action buttons
  const likeBgColor = isDark ? '#4B1F1F' : '#FEE2E2';
  const actionBgColor = isDark ? '#2A2A2A' : '#F5F5F5';
  const actionTextColor = isDark ? '#E5E5E5' : '#1F1F1F';
  
  // Responsive sizing based on device dimensions
  // Calculate scale factor based on screen width (using iPhone 14 Pro as reference: 393px)
  const baseWidth = 393;
  const scaleFactor = Math.min(SCREEN_WIDTH / baseWidth, 1.2); // Max scale 1.2x for tablets
  const minScale = 0.8; // Minimum scale for very small devices
  
  // Responsive dimensions
  const iconSize = Math.max(16 * scaleFactor, 16 * minScale); // Icon size: 16-19.2px
  const fontSize = Math.max(11 * scaleFactor, 11 * minScale); // Font size: 11-13.2px
  const buttonPaddingH = Math.max(8 * scaleFactor, 6 * minScale); // Horizontal padding: 6-9.6px
  const buttonPaddingV = Math.max(5 * scaleFactor, 4 * minScale); // Vertical padding: 4-6px
  const iconMarginRight = Math.max(5 * scaleFactor, 4 * minScale); // Icon-text spacing: 4-6px
  const buttonSpacing = Math.max(8 * scaleFactor, 6 * minScale); // Button spacing: 6-9.6px
  const borderRadius = Math.max(18 * scaleFactor, 16 * minScale); // Border radius: 16-21.6px

  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect?.(emoji);
    setIsEmojiPickerVisible(false);
  };

  return (
    <View className="mb-3 pr-0">
      {/* Liked by Section */}
      <View className="flex-row items-center mb-3">
        <View className="flex-row items-center -mr-2">
          {likedByUsers.map((user, index) => (
            <View
              key={`${user.username}-${index}`}
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: isDark ? '#1F1F1F' : '#FFFFFF',
                marginLeft: index === 0 ? 0 : -8,
                backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
                zIndex: likedByUsers.length - index,
              }}
            >
              <Image
                source={{ uri: user.avatar }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 10,
                }}
                contentFit="cover"
              />
            </View>
          ))}
        </View>
        <Text
          className="text-sm ml-2"
          style={{
            color: isDark ? '#E5E5E5' : '#1F1F1F',
            fontWeight: '500',
            flexShrink: 1,
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Liked by <Text style={{ fontWeight: '600' }}>{randomUsername}</Text> and others
        </Text>
      </View>

      {/* Professional Action Buttons with Rounded Boxes */}
      <View className="flex-row items-center justify-between mb-0" style={{ flexWrap: 'wrap' }}>
        {/* Primary Actions - Most Used */}
        <View className="flex-row items-center" style={{ flexShrink: 1 }}>
          {/* Comments Button */}
          <Pressable
            onPress={() => {
            setIsMessageActive(!isMessageActive);
            onReply?.();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: buttonPaddingH,
              paddingVertical: buttonPaddingV,
              borderRadius: borderRadius,
              backgroundColor: actionBgColor,
              marginRight: buttonSpacing,
            }}
          >
            <Svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 18 18"
              style={{ marginRight: iconMarginRight }}
            >
              {isMessageActive ? (
                <Path
                  d="M9,1C4.589,1,1,4.589,1,9c0,1.397,.371,2.778,1.062,3.971,.238,.446-.095,2.002-.842,2.749-.209,.209-.276,.522-.17,.798,.105,.276,.364,.465,.659,.481,.079,.004,.16,.006,.242,.006,1.145,0,2.534-.407,3.44-.871,.675,.343,1.39,.587,2.131,.727,.484,.092,.981,.138,1.478,.138,4.411,0,8-3.589,8-8S13.411,1,9,1Zm3.529,11.538c-.944,.943-2.198,1.462-3.529,1.462s-2.593-.522-3.539-1.47c-.292-.293-.292-.768,0-1.061,.294-.293,.77-.292,1.062,0,1.322,1.326,3.621,1.328,4.947,.006,.293-.294,.768-.292,1.061,0,.292,.293,.292,.768-.002,1.061Z"
                  fill={actionTextColor}
                />
              ) : (
                <>
                  <Path
                    d="M9,1.75C4.996,1.75,1.75,4.996,1.75,9c0,1.319,.358,2.552,.973,3.617,.43,.806-.053,2.712-.973,3.633,1.25,.068,2.897-.497,3.633-.973,.489,.282,1.264,.656,2.279,.848,.433,.082,.881,.125,1.338,.125,4.004,0,7.25-3.246,7.25-7.25S13.004,1.75,9,1.75Z"
                    fill="none"
                    stroke={actionTextColor}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                  <Path
                    d="M5.992,12c.77,.772,1.834,1.25,3.008,1.25s2.231-.475,3-1.242"
                    fill="none"
                    stroke={actionTextColor}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </>
              )}
            </Svg>
            <Text
              style={{
                fontSize: fontSize,
                fontWeight: '600',
                color: actionTextColor,
                includeFontPadding: false,
              }}
            >
              {formatNumber(randomComments)}
            </Text>
          </Pressable>

          {/* Likes Button */}
          <Pressable
            onPress={() => {
            setIsHeartActive(!isHeartActive);
            onLike?.();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: buttonPaddingH,
              paddingVertical: buttonPaddingV,
              borderRadius: borderRadius,
              backgroundColor: likeBgColor,
              marginRight: buttonSpacing,
            }}
          >
            <Svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 18 18"
              style={{ marginRight: iconMarginRight }}
            >
              {isHeartActive ? (
                <Path
                  d="M12.164,2c-1.195,.015-2.324,.49-3.164,1.306-.84-.815-1.972-1.291-3.178-1.306-2.53,.015-4.582,2.084-4.572,4.609,0,5.253,5.306,8.429,6.932,9.278,.256,.133,.537,.2,.818,.2s.562-.067,.817-.2c1.626-.848,6.933-4.024,6.933-9.275,.009-2.528-2.042-4.597-4.586-4.612Z"
                  fill="#EF4444"
                />
              ) : (
                <Path
                  d="M8.529,15.222c.297,.155,.644,.155,.941,0,1.57-.819,6.529-3.787,6.529-8.613,.008-2.12-1.704-3.846-3.826-3.859-1.277,.016-2.464,.66-3.173,1.72-.71-1.06-1.897-1.704-3.173-1.72-2.123,.013-3.834,1.739-3.826,3.859,0,4.826,4.959,7.794,6.529,8.613Z"
                  fill="none"
                  stroke="#EF4444"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              )}
            </Svg>
            <Text
              style={{
                fontSize: fontSize,
                fontWeight: '600',
                color: isDark ? '#FCA5A5' : '#DC2626',
                includeFontPadding: false,
              }}
            >
              {formatNumber(randomLikes)}
            </Text>
          </Pressable>
        </View>
        
        {/* Secondary Actions - Less Frequent */}
        <View className="flex-row items-center" style={{ flexShrink: 1 }}>
          {/* Reactions Button */}
          <Pressable
            onPress={() => setIsReactionsPickerVisible(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: buttonPaddingH,
              paddingVertical: buttonPaddingV,
              borderRadius: borderRadius,
              backgroundColor: actionBgColor,
              marginRight: buttonSpacing,
            }}
          >
            <Svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 18 18"
            >
              {isSmileActive ? (
                <>
                  <Path
                    d="M16.786,7.192c-.358,.77-1.133,1.308-2.036,1.308-1.241,0-2.25-1.009-2.25-2.25v-.25h-.25c-1.241,0-2.25-1.009-2.25-2.25,0-1.108,.807-2.027,1.864-2.211-.891-.343-1.854-.539-2.864-.539C4.589,1,1,4.589,1,9s3.589,8,8,8,8-3.589,8-8c0-.623-.079-1.226-.214-1.808Zm-11.786,1.808c0-.552,.448-1,1-1s1,.448,1,1-.448,1-1,1-1-.448-1-1Zm6.884,3.16c-.631,.996-1.709,1.59-2.884,1.59s-2.253-.595-2.884-1.59c-.222-.35-.117-.813,.232-1.035,.349-.221,.813-.118,1.035,.232,.354,.559,.958,.893,1.616,.893s1.262-.334,1.616-.893c.222-.35,.684-.454,1.035-.232,.35,.222,.454,.685,.232,1.035Zm.116-2.16c-.552,0-1-.448-1-1s.448-1,1-1,1,.448,1,1-.448,1-1,1Z"
                    fill={actionTextColor}
                  />
                  <Path
                    d="M17.25,3h-1.75V1.25c0-.414-.336-.75-.75-.75s-.75,.336-.75,.75v1.75h-1.75c-.414,0-.75,.336-.75,.75s.336,.75,.75,.75h1.75v1.75c0,.414,.336,.75,.75,.75s.75-.336,.75-.75v-1.75h1.75c.414,0,.75-.336,.75-.75s-.336-.75-.75-.75Z"
                    fill={actionTextColor}
                  />
                </>
              ) : (
                <>
                  <Path
                    d="M11.251 11.758C10.779 12.504 9.94698 13 9.00098 13C8.05498 13 7.22298 12.504 6.75098 11.758"
                    stroke={actionTextColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d="M6.00098 10C6.55298 10 7.00098 9.5523 7.00098 9C7.00098 8.4477 6.55298 8 6.00098 8C5.44898 8 5.00098 8.4477 5.00098 9C5.00098 9.5523 5.44898 10 6.00098 10Z"
                    fill={actionTextColor}
                  />
                  <Path
                    d="M12.001 10C12.553 10 13.001 9.5523 13.001 9C13.001 8.4477 12.553 8 12.001 8C11.449 8 11.001 8.4477 11.001 9C11.001 9.5523 11.449 10 12.001 10Z"
                    fill={actionTextColor}
                  />
                  <Path
                    d="M14.751 1.25V6.25"
                    stroke={actionTextColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d="M17.251 3.75H12.251"
                    stroke={actionTextColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d="M9.95866 1.8155C9.64536 1.7729 9.32598 1.75 9.00098 1.75C4.99698 1.75 1.75098 4.996 1.75098 9C1.75098 13.004 4.99698 16.25 9.00098 16.25C13.005 16.25 16.251 13.004 16.251 9C16.251 8.9496 16.2505 8.8992 16.2494 8.849"
                    stroke={actionTextColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </>
              )}
            </Svg>
          </Pressable>

          {/* Share Button - No number */}
          <Pressable
            onPress={() => {
            setIsSendActive(!isSendActive);
            onShare?.();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: buttonPaddingH,
              paddingVertical: buttonPaddingV,
              borderRadius: borderRadius,
              backgroundColor: actionBgColor,
              marginRight: buttonSpacing,
            }}
          >
            <Svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 18 18"
            >
              {isSendActive ? (
                <Path
                  d="M16.345,1.654c-.344-.344-.845-.463-1.305-.315L2.117,5.493c-.491,.158-.831,.574-.887,1.087-.056,.512,.187,.992,.632,1.251l4.576,2.669,3.953-3.954c.293-.293,.768-.293,1.061,0s.293,.768,0,1.061l-3.954,3.954,2.669,4.576c.235,.402,.65,.639,1.107,.639,.048,0,.097-.003,.146-.008,.512-.056,.929-.396,1.086-.886L16.661,2.96h0c.148-.463,.027-.963-.316-1.306Z"
                  fill={actionTextColor}
                />
              ) : (
                <>
                  <Line
                    x1="15.813"
                    y1="2.187"
                    x2="7.657"
                    y2="10.343"
                    fill="none"
                    stroke={actionTextColor}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                  <Path
                    d="M15.947,2.73l-4.154,12.923c-.142,.443-.743,.509-.977,.106l-3.159-5.416L2.241,7.184c-.402-.235-.337-.835,.106-.977L15.27,2.053c.417-.134,.811,.26,.677,.677Z"
                    fill="none"
                    stroke={actionTextColor}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </>
              )}
            </Svg>
          </Pressable>

          {/* Bookmark Button */}
          <Pressable
            onPress={() => {
            setIsBookmarkActive(!isBookmarkActive);
            onBookmark?.();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: buttonPaddingH,
              paddingVertical: buttonPaddingV,
              borderRadius: borderRadius,
              backgroundColor: actionBgColor,
            }}
          >
            <Svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 18 18"
            >
              {isBookmarkActive ? (
                <Path
                  d="M12.25,1H5.75c-1.517,0-2.75,1.233-2.75,2.75v12.5c0,.276,.152,.531,.396,.661,.244,.131,.54,.117,.77-.037l4.834-3.223,4.834,3.223c.125,.083,.271,.126,.416,.126,.122,0,.243-.029,.354-.089,.244-.13,.396-.385,.396-.661V3.75c0-1.517-1.233-2.75-2.75-2.75Z"
                  fill={actionTextColor}
                />
              ) : (
                <Path
                  d="M14.25,16.25l-5.25-3.5-5.25,3.5V3.75c0-1.105,.895-2,2-2h6.5c1.105,0,2,.895,2,2v12.5Z"
                  fill="none"
                  stroke={actionTextColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              )}
            </Svg>
          </Pressable>
        </View>
      </View>

      {/* Reactions Picker */}
      <ReactionsPicker
        visible={isReactionsPickerVisible}
        onClose={() => setIsReactionsPickerVisible(false)}
        onReactionSelect={handleEmojiSelect}
      />

      {/* Emoji Picker Modal */}
      <EmojiPickerModal
        visible={isEmojiPickerVisible}
        onClose={() => setIsEmojiPickerVisible(false)}
        onEmojiSelect={handleEmojiSelect}
      />
    </View>
  );
}
