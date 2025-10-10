# 📱 Mobile App Quick Start

## ✅ Backend Integration Complete!

Your React Native app is now fully connected to the Spring Boot backend.

---

## 🎯 What Was Added

### API Service Layer
```
services/api/
├── config.ts           # API configuration
├── authService.ts      # API calls with error handling
└── README.md           # Documentation
```

### Features Added
- ✅ Session token management
- ✅ API error handling
- ✅ Loading states
- ✅ Real-time username checking
- ✅ Success/error alerts
- ✅ Console logging for debugging

---

## ⚙️ Configuration

**Update API URL based on your device:**

**File:** `services/api/config.ts`

```typescript
// iOS Simulator (default)
BASE_URL: 'http://localhost:8080/api'

// Android Emulator
BASE_URL: 'http://10.0.2.2:8080/api'

// Physical Device (replace with your IP)
BASE_URL: 'http://192.168.1.100:8080/api'
```

**Find your local IP:**
```bash
ipconfig getifaddr en0
```

---

## 🚀 How to Run

### 1. Start Backend (if not running)
```bash
cd ../../backend
docker-compose up
```

### 2. Start Mobile App
```bash
# From apps/mobile directory
npm start

# Or run directly
npx expo run:ios      # iOS
npx expo run:android  # Android
```

---

## 🧪 Test Registration Flow

1. **Enter email** → API sends OTP
2. **Check email** → Get 6-digit code
3. **Verify OTP** → Email verified
4. **Enter details** → Name, phone, DOB
5. **Create password** → Hashed securely
6. **Choose username** → Real-time availability check
7. **Complete** → User saved in database!

---

## 📧 Email Integration

**You'll receive:**
- ✅ OTP verification email (6 digits)
- ✅ Welcome email after registration

---

## 🐛 Debugging

**Check API calls in console:**
```
[API] POST http://localhost:8080/api/auth/register/email
[API] Success: OTP sent to your email
Registration response: { sessionToken: "..." }
```

**Test backend health:**
```bash
curl http://localhost:8080/api/auth/register/health
```

---

## 📚 Documentation

- **Complete integration guide:** `../../INTEGRATION_COMPLETE.md`
- **Backend documentation:** `../../backend/HOW_TO_RUN.md`
- **Testing guide:** `../../TEST_INTEGRATION_NOW.md`
- **API service docs:** `services/api/README.md`

---

## 🎯 Registration Flow

```
SignInAsSupport → Email
     ↓
OTPVerification → Verify OTP
     ↓
Details → Name, Phone, DOB
     ↓
CreatePassword → Password
     ↓
Username → Choose username (real-time check)
     ↓
COMPLETE! → User in database
```

---

**🚀 Ready to test! Start the app now.**

**🇮🇳 Jai Hind!**

