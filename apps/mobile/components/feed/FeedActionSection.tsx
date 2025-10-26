import React, { useState } from 'react';
import { Pressable, Text, View, useColorScheme } from 'react-native';
// Removed MessageCircle import - using custom SVG
import { Svg, Path, Line } from 'react-native-svg';
import EmojiPickerModal from '../../components/EmojiPickerModal';
import ReactionsPicker from '../../components/ReactionsPicker';

interface FeedActionSectionProps {
  onLike?: () => void;
  onReply?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onEmojiSelect?: (emoji: string) => void;
}

export default function FeedActionSection({ 
  onLike, 
  onReply, 
  onShare, 
  onBookmark,
  onEmojiSelect
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
  
  // Theme-aware colors: white in dark mode, black in light mode
  const textColor = isDark ? '#FFFFFF' : '#000000';

  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect?.(emoji);
    setIsEmojiPickerVisible(false);
  };

  return (
    <View className="mb-3 pr-0">
      {/* Professional Action Buttons - Left to Right Priority */}
      <View className="flex-row items-center justify-between mb-0">
        {/* Primary Actions - Most Used */}
        <View className="flex-row items-center space-x-4">
          <Pressable className="pr-2" onPress={() => {
            setIsMessageActive(!isMessageActive);
            onReply?.();
          }}>
            <Svg
              width={22}
              height={22}
              viewBox="0 0 18 18"
            >
              {isMessageActive ? (
                // Filled/Active state
                <Path
                  d="M9,1C4.589,1,1,4.589,1,9c0,1.397,.371,2.778,1.062,3.971,.238,.446-.095,2.002-.842,2.749-.209,.209-.276,.522-.17,.798,.105,.276,.364,.465,.659,.481,.079,.004,.16,.006,.242,.006,1.145,0,2.534-.407,3.44-.871,.675,.343,1.39,.587,2.131,.727,.484,.092,.981,.138,1.478,.138,4.411,0,8-3.589,8-8S13.411,1,9,1Zm3.529,11.538c-.944,.943-2.198,1.462-3.529,1.462s-2.593-.522-3.539-1.47c-.292-.293-.292-.768,0-1.061,.294-.293,.77-.292,1.062,0,1.322,1.326,3.621,1.328,4.947,.006,.293-.294,.768-.292,1.061,0,.292,.293,.292,.768-.002,1.061Z"
                  fill={textColor}
                />
              ) : (
                // Outlined/Inactive state
                <>
                  <Path
                    d="M9,1.75C4.996,1.75,1.75,4.996,1.75,9c0,1.319,.358,2.552,.973,3.617,.43,.806-.053,2.712-.973,3.633,1.25,.068,2.897-.497,3.633-.973,.489,.282,1.264,.656,2.279,.848,.433,.082,.881,.125,1.338,.125,4.004,0,7.25-3.246,7.25-7.25S13.004,1.75,9,1.75Z"
                    fill="none"
                    stroke={textColor}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                  <Path
                    d="M5.992,12c.77,.772,1.834,1.25,3.008,1.25s2.231-.475,3-1.242"
                    fill="none"
                    stroke={textColor}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </>
              )}
            </Svg>
          </Pressable>
          <Pressable className="px-2" onPress={() => {
            setIsHeartActive(!isHeartActive);
            onLike?.();
          }}>
            <Svg
              width={22}
              height={22}
              viewBox="0 0 18 18"
            >
              {isHeartActive ? (
                // Filled/Active state - Red heart when liked
                <Path
                  d="M12.164,2c-1.195,.015-2.324,.49-3.164,1.306-.84-.815-1.972-1.291-3.178-1.306-2.53,.015-4.582,2.084-4.572,4.609,0,5.253,5.306,8.429,6.932,9.278,.256,.133,.537,.2,.818,.2s.562-.067,.817-.2c1.626-.848,6.933-4.024,6.933-9.275,.009-2.528-2.042-4.597-4.586-4.612Z"
                  fill="#FF0000"
                />
              ) : (
                // Outlined/Inactive state - Theme aware colors
                <Path
                  d="M8.529,15.222c.297,.155,.644,.155,.941,0,1.57-.819,6.529-3.787,6.529-8.613,.008-2.12-1.704-3.846-3.826-3.859-1.277,.016-2.464,.66-3.173,1.72-.71-1.06-1.897-1.704-3.173-1.72-2.123,.013-3.834,1.739-3.826,3.859,0,4.826,4.959,7.794,6.529,8.613Z"
                  fill="none"
                  stroke={isDark ? '#FFFFFF' : '#000000'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              )}
            </Svg>
          </Pressable>
        </View>
        
        {/* Secondary Actions - Less Frequent */}
        <View className="flex-row items-center space-x-4">
          <Pressable className="px-2" onPress={() => setIsReactionsPickerVisible(true)}>
            <Svg
              width={22}
              height={22}
              viewBox="0 0 18 18"
            >
              {isSmileActive ? (
                // Filled/Active state
                <>
                  <Path
                    d="M16.786,7.192c-.358,.77-1.133,1.308-2.036,1.308-1.241,0-2.25-1.009-2.25-2.25v-.25h-.25c-1.241,0-2.25-1.009-2.25-2.25,0-1.108,.807-2.027,1.864-2.211-.891-.343-1.854-.539-2.864-.539C4.589,1,1,4.589,1,9s3.589,8,8,8,8-3.589,8-8c0-.623-.079-1.226-.214-1.808Zm-11.786,1.808c0-.552,.448-1,1-1s1,.448,1,1-.448,1-1,1-1-.448-1-1Zm6.884,3.16c-.631,.996-1.709,1.59-2.884,1.59s-2.253-.595-2.884-1.59c-.222-.35-.117-.813,.232-1.035,.349-.221,.813-.118,1.035,.232,.354,.559,.958,.893,1.616,.893s1.262-.334,1.616-.893c.222-.35,.684-.454,1.035-.232,.35,.222,.454,.685,.232,1.035Zm.116-2.16c-.552,0-1-.448-1-1s.448-1,1-1,1,.448,1,1-.448,1-1,1Z"
                    fill={textColor}
                  />
                  <Path
                    d="M17.25,3h-1.75V1.25c0-.414-.336-.75-.75-.75s-.75,.336-.75,.75v1.75h-1.75c-.414,0-.75,.336-.75,.75s.336,.75,.75,.75h1.75v1.75c0,.414,.336,.75,.75,.75s.75-.336,.75-.75v-1.75h1.75c.414,0,.75-.336,.75-.75s-.336-.75-.75-.75Z"
                    fill={textColor}
                  />
                </>
              ) : (
                // Outlined/Inactive state
                <>
                  <Path
                    d="M11.251 11.758C10.779 12.504 9.94698 13 9.00098 13C8.05498 13 7.22298 12.504 6.75098 11.758"
                    stroke={textColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d="M6.00098 10C6.55298 10 7.00098 9.5523 7.00098 9C7.00098 8.4477 6.55298 8 6.00098 8C5.44898 8 5.00098 8.4477 5.00098 9C5.00098 9.5523 5.44898 10 6.00098 10Z"
                    fill={textColor}
                  />
                  <Path
                    d="M12.001 10C12.553 10 13.001 9.5523 13.001 9C13.001 8.4477 12.553 8 12.001 8C11.449 8 11.001 8.4477 11.001 9C11.001 9.5523 11.449 10 12.001 10Z"
                    fill={textColor}
                  />
                  <Path
                    d="M14.751 1.25V6.25"
                    stroke={textColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d="M17.251 3.75H12.251"
                    stroke={textColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d="M9.95866 1.8155C9.64536 1.7729 9.32598 1.75 9.00098 1.75C4.99698 1.75 1.75098 4.996 1.75098 9C1.75098 13.004 4.99698 16.25 9.00098 16.25C13.005 16.25 16.251 13.004 16.251 9C16.251 8.9496 16.2505 8.8992 16.2494 8.849"
                    stroke={textColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </>
              )}
            </Svg>
          </Pressable>
          <Pressable className="px-2" onPress={() => {
            setIsSendActive(!isSendActive);
            onShare?.();
          }}>
            <Svg
              width={22}
              height={22}
              viewBox="0 0 18 18"
            >
              {isSendActive ? (
                // Filled/Active state
                <Path
                  d="M16.345,1.654c-.344-.344-.845-.463-1.305-.315L2.117,5.493c-.491,.158-.831,.574-.887,1.087-.056,.512,.187,.992,.632,1.251l4.576,2.669,3.953-3.954c.293-.293,.768-.293,1.061,0s.293,.768,0,1.061l-3.954,3.954,2.669,4.576c.235,.402,.65,.639,1.107,.639,.048,0,.097-.003,.146-.008,.512-.056,.929-.396,1.086-.886L16.661,2.96h0c.148-.463,.027-.963-.316-1.306Z"
                  fill={textColor}
                />
              ) : (
                // Outlined/Inactive state
                <>
                  <Line
                    x1="15.813"
                    y1="2.187"
                    x2="7.657"
                    y2="10.343"
                    fill="none"
                    stroke={textColor}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                  <Path
                    d="M15.947,2.73l-4.154,12.923c-.142,.443-.743,.509-.977,.106l-3.159-5.416L2.241,7.184c-.402-.235-.337-.835,.106-.977L15.27,2.053c.417-.134,.811,.26,.677,.677Z"
                    fill="none"
                    stroke={textColor}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </>
              )}
            </Svg>
          </Pressable>
          <Pressable className="pl-2 pr-1" onPress={() => {
            setIsBookmarkActive(!isBookmarkActive);
            onBookmark?.();
          }}>
            <Svg
              width={22}
              height={22}
              viewBox="0 0 18 18"
            >
              {isBookmarkActive ? (
                // Filled/Active state
                <Path
                  d="M12.25,1H5.75c-1.517,0-2.75,1.233-2.75,2.75v12.5c0,.276,.152,.531,.396,.661,.244,.131,.54,.117,.77-.037l4.834-3.223,4.834,3.223c.125,.083,.271,.126,.416,.126,.122,0,.243-.029,.354-.089,.244-.13,.396-.385,.396-.661V3.75c0-1.517-1.233-2.75-2.75-2.75Z"
                  fill={textColor}
                />
              ) : (
                // Outlined/Inactive state
                <Path
                  d="M14.25,16.25l-5.25-3.5-5.25,3.5V3.75c0-1.105,.895-2,2-2h6.5c1.105,0,2,.895,2,2v12.5Z"
                  fill="none"
                  stroke={textColor}
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
