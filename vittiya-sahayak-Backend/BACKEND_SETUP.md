# Vittiya Sahayak - Backend Setup Guide

## 🎯 Overview

This document provides complete setup instructions for the Vittiya Sahayak backend using Supabase. All database tables, Edge Functions, and authentication are configured.

---

## 📋 What's Been Set Up

✅ **Supabase Database** with 5 tables:
- `profiles` - User accounts
- `banking_credentials` - Bank/UPI/Card storage
- `financial_records` - Income/expense tracking
- `chat_history` - Conversation logs
- `document_analyses` - Simplified documents

✅ **3 Edge Functions**:
- `/chat` - AI Q&A (OpenAI GPT-3.5)
- `/scam-detect` - Fraud detection
- `/document-analyze` - Document simplification

✅ **Authentication**:
- Email/Password signup & login
- Google OAuth integration
- Row Level Security (RLS) policies

✅ **React Hooks**:
- `useAuth()` - Authentication state
- `useBankingCredentials()` - Vault management
- `useFinancialRecords()` - Financial tracking
- `useChat()` - AI features

---

## 🔑 Getting Started (5 Steps)

### Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for initialization (~2 minutes)
3. Go to **Settings → API** and copy:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon key** (the public key)

### Step 2: Add Environment Variables

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_OPENAI_API_KEY=your_openai_key_here
```

**Get these keys:**
- **VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY**: From Supabase Settings → API
- **VITE_OPENAI_API_KEY**: From [platform.openai.com](https://platform.openai.com) → API Keys

### Step 3: Configure Supabase Secrets (for Edge Functions)

In Supabase Dashboard:
1. Go to **Settings → Edge Functions → Secrets**
2. Add `OPENAI_API_KEY` with your OpenAI API key

The Edge Functions will automatically use this secret.

### Step 4: Enable Google OAuth (Optional)

To enable Google Sign-In:

1. Create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Go to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth 2.0 Client ID**
   - Select **Web application**
   - Add authorized JavaScript origins: `http://localhost:5173`, `https://your-domain.com`
   - Add authorized redirect URIs: `https://xyz.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client Secret**

2. In Supabase Dashboard:
   - Go to **Authentication → Providers → Google**
   - Paste Client ID and Client Secret
   - Enable the provider

### Step 5: Install Dependencies

```bash
npm install @supabase/supabase-js
```

---

## 📁 Project Structure

```
src/
├── lib/
│   └── supabase.ts          # Supabase client & types
├── hooks/
│   ├── useAuth.ts           # Login/signup/profile
│   ├── useBankingCredentials.ts   # Vault management
│   ├── useFinancialRecords.ts     # Income/expense tracking
│   └── useChat.ts           # AI features
└── pages/
    ├── index.tsx            # Home (already exists)
    ├── dashboard.tsx        # Dashboard (already exists)
    └── financial-manager.tsx # Financial manager (already exists)

supabase/
├── functions/
│   ├── chat/
│   │   └── index.ts         # Main AI Q&A
│   ├── scam-detect/
│   │   └── index.ts         # Fraud detection
│   └── document-analyze/
│       └── index.ts         # Document simplifier
```

---

## 🔗 Using Hooks in Components

### Example: Login

```typescript
import { useAuth } from '../hooks/useAuth'

export function LoginComponent() {
  const { signUp, signIn, signInWithGoogle, error } = useAuth()

  const handleSignUp = async () => {
    const { user, error } = await signUp('user@example.com', 'password', 'John Doe')
    if (error) console.error(error)
    else console.log('Signed up:', user)
  }

  return (
    <div>
      <button onClick={handleSignUp}>Sign Up</button>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  )
}
```

### Example: Add Financial Record

```typescript
import { useFinancialRecords } from '../hooks/useFinancialRecords'
import { useAuth } from '../hooks/useAuth'

export function AddTransactionForm() {
  const { user } = useAuth()
  const { addRecord, loading, error } = useFinancialRecords()

  const handleAdd = async () => {
    if (!user) return

    const { data } = await addRecord(user.id, {
      transaction_type: 'expense',
      category: 'groceries',
      amount: 500,
      currency: 'INR',
      description: 'Weekly groceries',
      date: new Date().toISOString().split('T')[0],
      payment_method: 'upi',
    })

    if (data) console.log('Record added:', data)
  }

  return (
    <button onClick={handleAdd} disabled={loading}>
      {loading ? 'Adding...' : 'Add Transaction'}
    </button>
  )
}
```

### Example: Chat with AI

```typescript
import { useChat } from '../hooks/useChat'

export function ChatWidget() {
  const { sendMessage, loading, error } = useChat()

  const handleAsk = async () => {
    const response = await sendMessage('What is mutual fund?', 'en')
    if (response) {
      console.log('AI Response:', response.reply)
    }
  }

  return (
    <button onClick={handleAsk} disabled={loading}>
      {loading ? 'Thinking...' : 'Ask AI'}
    </button>
  )
}
```

### Example: Scam Detection

```typescript
import { useChat } from '../hooks/useChat'

export function ScamDetector() {
  const { detectScam, loading } = useChat()

  const handleCheck = async () => {
    const result = await detectScam(
      'Congratulations! You won 1 Lakh rupees. Click here to claim: bit.ly/fake',
      'en'
    )

    if (result) {
      console.log('Is Scam?', result.isFraud)
      console.log('Confidence:', result.confidence + '%')
      console.log('Why:', result.explanation)
    }
  }

  return <button onClick={handleCheck}>Scan Message</button>
}
```

### Example: Banking Vault

```typescript
import { useBankingCredentials } from '../hooks/useBankingCredentials'
import { useAuth } from '../hooks/useAuth'

export function BankingVault() {
  const { user } = useAuth()
  const { fetchCredentials, addCredential, deleteCredential } = useBankingCredentials()

  const handleAddBank = async () => {
    if (!user) return

    const { data } = await addCredential(user.id, {
      credential_type: 'bank_account',
      bank_name: 'HDFC Bank',
      account_number: '1234567890',
      ifsc_code: 'HDFC0001234',
      nickname: 'Main Checking',
      is_primary: true,
    })

    console.log('Added:', data)
  }

  return <button onClick={handleAddBank}>Add Bank Account</button>
}
```

---

## 📊 Database Schema

### `profiles`
```
id (UUID) - PK
full_name (TEXT)
preferred_language (TEXT) - Default: 'en'
phone (TEXT) - Optional
avatar_url (TEXT) - Optional
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### `banking_credentials`
```
id (UUID) - PK
user_id (UUID) - FK to profiles
credential_type (TEXT) - 'bank_account' | 'upi' | 'card'
bank_name (TEXT)
account_number (TEXT)
ifsc_code (TEXT)
upi_id (TEXT)
card_last_four (TEXT)
card_holder_name (TEXT)
nickname (TEXT)
is_primary (BOOLEAN)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### `financial_records`
```
id (UUID) - PK
user_id (UUID) - FK to profiles
transaction_type (TEXT) - 'income' | 'expense'
category (TEXT)
amount (DECIMAL)
currency (TEXT) - Default: 'INR'
description (TEXT)
date (DATE)
payment_method (TEXT)
notes (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### `chat_history`
```
id (UUID) - PK
user_id (UUID) - FK to profiles
message (TEXT)
response (TEXT)
language (TEXT)
feature_type (TEXT) - 'general_qa' | 'scam_detection' | etc
created_at (TIMESTAMP)
```

### `document_analyses`
```
id (UUID) - PK
user_id (UUID) - FK to profiles
document_name (TEXT)
document_type (TEXT)
simplified_summary (TEXT)
key_points (JSONB) - Array of strings
language (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

---

## 🤖 Edge Function APIs

All Edge Functions require JWT authentication (Bearer token).

### 1. Chat Function

**Endpoint**: `POST /functions/v1/chat`

**Headers**:
```
Authorization: Bearer {ANON_KEY}
Content-Type: application/json
```

**Request**:
```json
{
  "message": "What is GST?",
  "language": "en"
}
```

**Response**:
```json
{
  "reply": "GST is the Goods and Services Tax...",
  "language": "en"
}
```

### 2. Scam Detection Function

**Endpoint**: `POST /functions/v1/scam-detect`

**Request**:
```json
{
  "message": "Click here to claim your prize!",
  "language": "en"
}
```

**Response**:
```json
{
  "isFraud": true,
  "confidence": 95,
  "explanation": "This is a common prize scam..."
}
```

### 3. Document Analysis Function

**Endpoint**: `POST /functions/v1/document-analyze`

**Request**:
```json
{
  "documentText": "Your bank statement text here...",
  "documentType": "bank_statement",
  "language": "en"
}
```

**Response**:
```json
{
  "summary": "Your account has a balance of ₹50,000...",
  "keyPoints": ["Balance: ₹50,000", "Interest: ₹100"],
  "language": "en",
  "documentType": "bank_statement"
}
```

---

## 🔒 Row Level Security (RLS)

All tables have RLS enabled. Users can only access their own data:

- **profiles**: Users can view/update their own profile
- **banking_credentials**: Users can CRUD their own credentials
- **financial_records**: Users can CRUD their own records
- **chat_history**: Users can view/insert/delete their own chats
- **document_analyses**: Users can view/insert/delete their own analyses

---

## ⚙️ Advanced: Adding More Edge Functions

To add a new Edge Function:

1. Create a file: `supabase/functions/my-function/index.ts`
2. Deploy it:

```bash
npm install @supabase/supabase-js
# Then use the deployment tool to deploy
```

3. Call it from React:

```typescript
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/my-function`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ /* your data */ }),
  }
)
```

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
**Solution**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local`

### Edge Functions return 401
**Solution**: Make sure you're passing the correct Bearer token (VITE_SUPABASE_ANON_KEY) in the Authorization header

### "OpenAI API key not configured"
**Solution**: Add `OPENAI_API_KEY` to Supabase Edge Function Secrets (Settings → Edge Functions)

### Database queries return empty
**Solution**: Make sure RLS policies allow your queries. Check Supabase Logs (Settings → Logs)

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Set production Supabase environment variables
- [ ] Enable Google OAuth with production domain
- [ ] Add production OpenAI API key to Supabase Secrets
- [ ] Test login flow end-to-end
- [ ] Test all Edge Functions (chat, scam detection, document analysis)
- [ ] Verify RLS policies prevent unauthorized access
- [ ] Set up email verification (optional)
- [ ] Enable 2FA for Supabase Dashboard

---

## 📞 Support

For issues:
1. Check [Supabase Docs](https://supabase.com/docs)
2. Check [OpenAI Docs](https://platform.openai.com/docs)
3. Review the error logs in Supabase Dashboard → Logs
4. Check browser DevTools → Network tab for API responses

---

## 📚 Next Steps

1. **Integrate into LoginModal.tsx**:
   - Replace `signUp` placeholder with `useAuth().signUp()`
   - Replace Google button with `useAuth().signInWithGoogle()`

2. **Integrate into Dashboard.tsx**:
   - Use `useAuth()` to get user's name
   - Use `useFinancialRecords()` to fetch stats
   - Use `useChat()` to power the chatbot

3. **Integrate into Financial Manager**:
   - Use `useFinancialRecords()` for all CRUD operations
   - Use `getCategoryStats()` for category breakdowns

4. **Test thoroughly**:
   - Sign up with email/password
   - Sign in with Google
   - Add banking credentials
   - Add transactions
   - Chat with AI
   - Test scam detection

---

**Vittiya Sahayak Backend is ready! 🎉**
