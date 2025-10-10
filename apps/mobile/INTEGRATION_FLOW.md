# 📱 Mobile + Backend Integration Flow

## Complete Registration Flow Visualization

```
┌──────────────────────────────────────────────────────────────────────┐
│                         MOBILE APP SCREENS                            │
└──────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────┐
    │  1. SignInAsSupport     │
    │  ───────────────────    │
    │  Enter email:           │
    │  test@example.com       │
    │                         │
    │  [Next Button]          │
    └─────────────────────────┘
              │
              │ authService.registerEmail(email)
              ↓
    ┌─────────────────────────┐
    │  BACKEND API            │
    │  POST /register/email   │
    │  ───────────────────    │
    │  • Generate sessionToken│
    │  • Generate 6-digit OTP │
    │  • Save to database     │
    │  • Send OTP via email   │
    └─────────────────────────┘
              │
              │ Return sessionToken
              ↓
    ┌─────────────────────────┐
    │  SUCCESS ALERT          │
    │  "OTP sent to email 📧" │
    │  sessionToken saved     │
    └─────────────────────────┘
              │
              ↓
    ┌─────────────────────────┐
    │  2. OTPVerification     │
    │  ───────────────────    │
    │  Email: test@...        │
    │  Enter OTP: [8][4][7]   │
    │             [5][9][2]   │
    │                         │
    │  [Verify Button]        │
    │  [Resend OTP]           │
    └─────────────────────────┘
              │
              │ authService.verifyOtp(sessionToken, otp)
              ↓
    ┌─────────────────────────┐
    │  BACKEND API            │
    │  POST /verify-otp       │
    │  ───────────────────    │
    │  • Validate sessionToken│
    │  • Check OTP match      │
    │  • Check expiry (<10min)│
    │  • Mark email verified  │
    └─────────────────────────┘
              │
              │ OTP valid
              ↓
    ┌─────────────────────────┐
    │  SUCCESS ALERT          │
    │  "Email verified! ✅"   │
    └─────────────────────────┘
              │
              ↓
    ┌─────────────────────────┐
    │  3. Details             │
    │  ───────────────────    │
    │  Full Name:             │
    │  Nishal Poojary         │
    │                         │
    │  Phone Number:          │
    │  +91 9876543210         │
    │                         │
    │  Date of Birth:         │
    │  15/05/1995             │
    │                         │
    │  [Next Button]          │
    └─────────────────────────┘
              │
              │ authService.submitDetails(sessionToken, ...)
              ↓
    ┌─────────────────────────┐
    │  BACKEND API            │
    │  POST /register/details │
    │  ───────────────────    │
    │  • Validate sessionToken│
    │  • Save to session      │
    │  • Update current step  │
    └─────────────────────────┘
              │
              │ Details saved
              ↓
    ┌─────────────────────────┐
    │  SUCCESS ALERT          │
    │  "Details saved!"       │
    └─────────────────────────┘
              │
              ↓
    ┌─────────────────────────┐
    │  4. CreatePassword      │
    │  ───────────────────    │
    │  Password:              │
    │  ••••••••••             │
    │                         │
    │  Confirm Password:      │
    │  ••••••••••             │
    │                         │
    │  [Continue Button]      │
    └─────────────────────────┘
              │
              │ authService.createPassword(sessionToken, password, confirmPassword)
              ↓
    ┌─────────────────────────┐
    │  BACKEND API            │
    │  POST /register/password│
    │  ───────────────────    │
    │  • Validate sessionToken│
    │  • Check passwords match│
    │  • Hash with BCrypt     │
    │  • Save hash to session │
    └─────────────────────────┘
              │
              │ Password created
              ↓
    ┌─────────────────────────┐
    │  SUCCESS ALERT          │
    │  "Password created!"    │
    └─────────────────────────┘
              │
              ↓
    ┌─────────────────────────┐
    │  5. Username            │
    │  ───────────────────    │
    │  Username:              │
    │  nishalp_               │  ← User typing...
    │                         │
    │  ⏳ Checking...         │  ← Debounce timer (500ms)
    └─────────────────────────┘
              │
              │ authService.checkUsername(username) [debounced]
              ↓
    ┌─────────────────────────┐
    │  BACKEND API            │
    │  GET /check-username    │
    │  ───────────────────    │
    │  • Check if exists      │
    │  • Return availability  │
    └─────────────────────────┘
              │
              │ { available: true }
              ↓
    ┌─────────────────────────┐
    │  5. Username            │
    │  ───────────────────    │
    │  Username:              │
    │  nishalp                │
    │                         │
    │  ✓ Username available   │  ← Real-time feedback
    │                         │
    │  [Continue Button]      │
    └─────────────────────────┘
              │
              │ authService.createUsername(sessionToken, username)
              ↓
    ┌─────────────────────────┐
    │  BACKEND API            │
    │  POST /register/username│
    │  ───────────────────    │
    │  • Validate sessionToken│
    │  • Check username unique│
    │  • Create user in DB    │
    │  • Copy session data    │
    │  • Delete session       │
    │  • Send welcome email   │
    └─────────────────────────┘
              │
              │ User created!
              ↓
    ┌─────────────────────────┐
    │  SUCCESS ALERT          │
    │  "Registration Complete │
    │   🎉"                   │
    │  "Welcome @nishalp!"    │
    │  "Check your email"     │
    │                         │
    │  [Continue]             │
    └─────────────────────────┘
              │
              ↓
    ┌─────────────────────────┐
    │  Navigate to Home       │
    │  /(user)/user123/(tabs) │
    └─────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                         DATABASE CHANGES                              │
└──────────────────────────────────────────────────────────────────────┘

Step 1: Email Registration
    ┌────────────────────────────────┐
    │  registration_sessions         │
    │  ────────────────────────────  │
    │  session_token: "8e367a52..."  │
    │  email: "test@example.com"     │
    │  current_step: "EMAIL"         │
    │  expiry: NOW() + 24 hours      │
    └────────────────────────────────┘
    
    ┌────────────────────────────────┐
    │  email_otps                    │
    │  ────────────────────────────  │
    │  email: "test@example.com"     │
    │  otp_code: "847592"            │
    │  expiry: NOW() + 10 minutes    │
    └────────────────────────────────┘

Step 2: OTP Verification
    ┌────────────────────────────────┐
    │  registration_sessions         │
    │  ────────────────────────────  │
    │  is_email_verified: true ✓     │
    │  current_step: "OTP_VERIFIED"  │
    └────────────────────────────────┘
    
    ┌────────────────────────────────┐
    │  email_otps                    │
    │  ────────────────────────────  │
    │  is_used: true ✓               │
    │  DELETED (cleanup)             │
    └────────────────────────────────┘

Step 3: Details Submission
    ┌────────────────────────────────┐
    │  registration_sessions         │
    │  ────────────────────────────  │
    │  full_name: "Nishal Poojary"   │
    │  phone_number: "9876543210"    │
    │  country_code: "+91"           │
    │  date_of_birth: "1995-05-15"   │
    │  current_step: "DETAILS"       │
    └────────────────────────────────┘

Step 4: Password Creation
    ┌────────────────────────────────┐
    │  registration_sessions         │
    │  ────────────────────────────  │
    │  password_hash: "$2a$12$..."   │
    │  current_step: "PASSWORD"      │
    └────────────────────────────────┘

Step 6: Registration Complete
    ┌────────────────────────────────┐
    │  users (NEW!)                  │
    │  ────────────────────────────  │
    │  id: 1                         │
    │  full_name: "Nishal Poojary"   │
    │  username: "nishalp"           │
    │  email: "test@example.com"     │
    │  phone_number: "9876543210"    │
    │  country_code: "+91"           │
    │  date_of_birth: "1995-05-15"   │
    │  password_hash: "$2a$12$..."   │
    │  is_email_verified: true       │
    │  created_at: NOW()             │
    └────────────────────────────────┘
    
    ┌────────────────────────────────┐
    │  registration_sessions         │
    │  ────────────────────────────  │
    │  DELETED (cleanup) ✓           │
    └────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                         EMAIL NOTIFICATIONS                           │
└──────────────────────────────────────────────────────────────────────┘

After Step 1:
    ┌────────────────────────────────┐
    │  📧 OTP Email                  │
    │  ────────────────────────────  │
    │  To: test@example.com          │
    │  Subject: BharathVA - Your     │
    │           Email Verification   │
    │           Code                 │
    │                                │
    │  🧡 Your OTP: 847592           │
    │  🤍 Valid for 10 minutes       │
    │  💚 Jai Hind! 🇮🇳             │
    └────────────────────────────────┘

After Step 6:
    ┌────────────────────────────────┐
    │  📧 Welcome Email              │
    │  ────────────────────────────  │
    │  To: test@example.com          │
    │  Subject: Welcome to BharathVA,│
    │           @nishalp!            │
    │                                │
    │  🇮🇳 Welcome message           │
    │  📱 Platform introduction      │
    │  🎯 Getting started            │
    └────────────────────────────────┘

```

## 🔐 Session Token Flow

```
1. Register Email
   └─> Backend generates sessionToken: "8e367a52-c684-4e2a-aa2f-09ce5a2755f5"
   └─> Mobile saves: setSessionToken("8e367a52-...")

2. All subsequent calls include sessionToken:
   ├─> verifyOtp(sessionToken, otp)
   ├─> submitDetails(sessionToken, ...)
   ├─> createPassword(sessionToken, ...)
   └─> createUsername(sessionToken, username)

3. Backend validates sessionToken on EVERY request:
   ├─> Check if exists in database
   ├─> Check if not expired (<24 hours)
   ├─> Check current step (can't skip steps)
   └─> Return error if invalid

4. After completion:
   └─> sessionToken deleted from database
   └─> Mobile clears: setSessionToken('')
```

## 🎯 Key Features

### Real-time Username Checking
```
User types: "n" → No check (too short)
User types: "ni" → No check (too short)
User types: "nis" → Debounce timer starts (500ms)
     ⏳ "Checking availability..."
     └─> setTimeout(() => checkUsername("nis"), 500)

User continues: "nish" → Previous timer cancelled
     └─> New timer starts

User stops typing → Timer completes after 500ms
     └─> API call: GET /check-username?username=nish
     └─> Response: { available: true }
     └─> Show: ✓ "Username is available"

User types more: "nishal" → Timer resets again
     └─> Prevents excessive API calls!
```

### Error Handling
```
Try-Catch blocks in ALL API calls:
├─> Network error → "Please check your connection"
├─> Timeout (>30s) → "Request timeout"
├─> Invalid OTP → "Invalid OTP. Please try again."
├─> Username taken → "Username already taken"
└─> Generic error → User-friendly message
```

### Loading States
```
Before API call:
└─> setLoading(true)
└─> Full-screen spinner appears (blocks UI)

After API call (success or error):
└─> setLoading(false)
└─> Spinner disappears
└─> User can interact again
```

---

**✅ Complete integration working!**

**🚀 Test it now - See `TEST_INTEGRATION_NOW.md`**

