# Privacy & Security Settings - Organized Structure

## 📁 **FOLDER STRUCTURE**

```
profile/components/settings/
├── index.ts                          # Main exports
├── PrivacySecurity.tsx               # Main orchestrator component
├── SettingItem.tsx                   # Reusable setting item component
├── SettingsIcon.tsx                  # Custom icons component
├── README.md                         # This documentation
│
├── accountpreference/
│   ├── index.ts                      # Account preferences exports
│   └── AccountPreferences.tsx        # Account preferences screen
│
├── securityinfo/
│   ├── index.ts                      # Security settings exports
│   └── SecuritySettings.tsx           # Security section component
│
├── privacy/
│   ├── index.ts                      # Privacy settings exports
│   └── PrivacySettings.tsx           # Privacy section component
│
└── appsetting/
    ├── index.ts                      # App settings exports
    └── AppSettings.tsx               # App settings section component
```

---

## 🎯 **COMPONENT ARCHITECTURE**

### **Root Level Components:**

#### **1. PrivacySecurity.tsx** (Main Component)
- **Purpose**: Main orchestrator component
- **Location**: `/settings/PrivacySecurity.tsx`
- **Features**:
  - Manages all state for settings
  - Handles navigation to Account Preferences
  - Renders all sections in organized order
  - Clean header with back navigation

#### **2. SettingItem.tsx** (Reusable Component)
- **Purpose**: Reusable setting item component
- **Location**: `/settings/SettingItem.tsx`
- **Features**:
  - Consistent styling across all settings
  - Supports toggles and navigation arrows
  - Supports destructive actions
  - Theme-aware

#### **3. SettingsIcon.tsx** (Icon Component)
- **Purpose**: Custom icon component
- **Location**: `/settings/SettingsIcon.tsx`
- **Features**:
  - Beautiful SVG-based account icon
  - Security, Privacy, Notification, Theme icons
  - Data, Location, Delete icons
  - Scalable and theme-aware

---

### **Organized Subfolders:**

#### **📂 accountpreference/**
- **AccountPreferences.tsx**: Account management screen
  - Account Information display
  - Change Password option
  - Deactivate Account option
  - Current account details card
  - Beautiful SVG account icon

#### **📂 securityinfo/**
- **SecuritySettings.tsx**: Security-related settings
  - Two-Factor Authentication toggle
  - Blocked Users management

#### **📂 privacy/**
- **PrivacySettings.tsx**: Privacy-related settings
  - Location Sharing toggle
  - Data Collection toggle
  - Export My Data option

#### **📂 appsetting/**
- **AppSettings.tsx**: App-level settings
  - Dark Mode toggle
  - Notifications toggle
  - Save History toggle

---

## 🎨 **DESIGN PRINCIPLES**

### **Clean & Organized**
- ✅ Modular folder structure
- ✅ Clear separation of concerns
- ✅ Reusable components
- ✅ Consistent styling
- ✅ Logical file organization

### **Theme Support**
- ✅ Full dark/light mode support
- ✅ Dynamic color system
- ✅ Consistent theming across all components

### **User Experience**
- ✅ Smooth navigation
- ✅ Clear visual hierarchy
- ✅ Touch-friendly interactions
- ✅ Professional animations
- ✅ Beautiful SVG icons

---

## 📱 **USAGE**

### **Import in Profile Tab:**
```typescript
import PrivacySecurity from '../profile/components/settings/PrivacySecurity';

// Use in component
<PrivacySecurity onBackPress={handleBackPress} />
```

### **Import Individual Components:**
```typescript
// From main index
import { AccountPreferences, SecuritySettings } from './components/settings';

// Or directly
import AccountPreferences from './components/settings/accountpreference';
import SecuritySettings from './components/settings/securityinfo';
```

---

## 🔧 **CUSTOMIZATION**

### **Adding New Settings:**
1. Add toggle state to PrivacySecurity.tsx
2. Update relevant section component (Security/Privacy/AppSettings)
3. Add handler function
4. Pass props to section component

### **Modifying Styles:**
- All styles are centralized in each component
- Color theme is managed through `colors` object
- Consistent spacing and layout across components

### **Adding New Icons:**
1. Add SVG path to SettingsIcon.tsx
2. Create new case in renderIcon() function
3. Use icon name in SettingItem component

---

## ✨ **FEATURES**

### **Current Implementation:**
- ✅ Organized folder structure
- ✅ Account Preferences with SVG icon
- ✅ Security settings with toggles
- ✅ Privacy settings with toggles
- ✅ App settings with toggles
- ✅ Account deletion with confirmation
- ✅ Theme switching support
- ✅ Clean, organized UI

### **Icon System:**
- ✅ Beautiful SVG account icon
- ✅ Custom vector icons for all settings
- ✅ Theme-aware icon colors
- ✅ Scalable icon sizing

---

## 🚀 **BENEFITS**

### **Developer Experience:**
- Clear component separation
- Easy to maintain and extend
- Reusable components
- Type-safe implementation
- Organized folder structure

### **User Experience:**
- Clean, professional UI
- Intuitive navigation
- Consistent design language
- Fast and responsive
- Beautiful visual design

---

## 📝 **STRUCTURE BENEFITS**

### **Before (Flat Structure):**
```
settings/
├── AccountPreferences.tsx
├── SecuritySettings.tsx
├── PrivacySettings.tsx
├── AppSettings.tsx
└── ...
```

### **After (Organized Structure):**
```
settings/
├── accountpreference/
│   └── AccountPreferences.tsx
├── securityinfo/
│   └── SecuritySettings.tsx
├── privacy/
│   └── PrivacySettings.tsx
└── appsetting/
    └── AppSettings.tsx
```

**Benefits:**
- ✅ Better organization
- ✅ Easier to navigate
- ✅ Scalable structure
- ✅ Clear categorization
- ✅ Professional architecture

---

## 🎯 **FINAL STRUCTURE SUMMARY**

```
Privacy & Security
├── Account Preferences (accountpreference/)
│   ├── Account Information
│   ├── Change Password
│   └── Deactivate Account
├── Security (securityinfo/)
│   ├── Two-Factor Authentication
│   └── Blocked Users
├── Privacy (privacy/)
│   ├── Location Sharing
│   ├── Data Collection
│   └── Export My Data
└── App Settings (appsetting/)
    ├── Dark Mode
    ├── Notifications
    └── Save History
```

**This structure provides a world-class foundation for Privacy & Security settings! 🎉**