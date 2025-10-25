// Type declarations for pnpm workspace modules
declare module '@expo/vector-icons' {
  import { ComponentType } from 'react';
  import { TextProps } from 'react-native';

  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export const AntDesign: ComponentType<IconProps>;
  export const Entypo: ComponentType<IconProps>;
  export const EvilIcons: ComponentType<IconProps>;
  export const Feather: ComponentType<IconProps>;
  export const FontAwesome: ComponentType<IconProps>;
  export const FontAwesome5: ComponentType<IconProps>;
  export const FontAwesome6: ComponentType<IconProps>;
  export const Fontisto: ComponentType<IconProps>;
  export const Foundation: ComponentType<IconProps>;
  export const Ionicons: ComponentType<IconProps>;
  export const MaterialCommunityIcons: ComponentType<IconProps>;
  export const MaterialIcons: ComponentType<IconProps>;
  export const Octicons: ComponentType<IconProps>;
  export const SimpleLineIcons: ComponentType<IconProps>;
  export const Zocial: ComponentType<IconProps>;
}

declare module 'lucide-react-native' {
  import { ComponentType } from 'react';
  import { SvgProps } from 'react-native-svg';

  export interface LucideProps extends SvgProps {
    size?: number;
    color?: string;
    strokeWidth?: number;
  }

  // Common Lucide icons
  export const Activity: ComponentType<LucideProps>;
  export const AlertCircle: ComponentType<LucideProps>;
  export const ArrowLeft: ComponentType<LucideProps>;
  export const ArrowRight: ComponentType<LucideProps>;
  export const Bell: ComponentType<LucideProps>;
  export const Camera: ComponentType<LucideProps>;
  export const Check: ComponentType<LucideProps>;
  export const ChevronDown: ComponentType<LucideProps>;
  export const ChevronLeft: ComponentType<LucideProps>;
  export const ChevronRight: ComponentType<LucideProps>;
  export const ChevronUp: ComponentType<LucideProps>;
  export const Edit: ComponentType<LucideProps>;
  export const Eye: ComponentType<LucideProps>;
  export const EyeOff: ComponentType<LucideProps>;
  export const Heart: ComponentType<LucideProps>;
  export const Home: ComponentType<LucideProps>;
  export const Image: ComponentType<LucideProps>;
  export const Mail: ComponentType<LucideProps>;
  export const Menu: ComponentType<LucideProps>;
  export const MessageCircle: ComponentType<LucideProps>;
  export const MoreHorizontal: ComponentType<LucideProps>;
  export const MoreVertical: ComponentType<LucideProps>;
  export const Plus: ComponentType<LucideProps>;
  export const Search: ComponentType<LucideProps>;
  export const Send: ComponentType<LucideProps>;
  export const Settings: ComponentType<LucideProps>;
  export const Share: ComponentType<LucideProps>;
  export const Star: ComponentType<LucideProps>;
  export const Trash2: ComponentType<LucideProps>;
  export const User: ComponentType<LucideProps>;
  export const Users: ComponentType<LucideProps>;
  export const X: ComponentType<LucideProps>;
  
  // Index signature for dynamic icon access
  export const [key: string]: ComponentType<LucideProps>;
}