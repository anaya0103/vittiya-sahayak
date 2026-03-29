
# Vittiya Sahayak

**Vittiya Sahayak** is a full-stack web application for managing personal finances, banking credentials, AI-powered document analysis, and scam detection.  
It includes a **React + Vite frontend** and a **Supabase backend** with Edge Functions and secure authentication.

---

## 🚀 Features

- User signup/login (Email & Google OAuth)
- Financial record management (income & expenses)
- Banking credentials vault
- Chatbot for general Q&A (OpenAI GPT)
- Fraud/scam detection
- Document simplification
- Row-Level Security (RLS) for data privacy

---

## 🛠 Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS
- **Backend:** Node.js, Supabase, Supabase Edge Functions
- **Database:** Supabase PostgreSQL
- **AI Integration:** OpenAI API

---

## 🖥 Frontend Setup

1. Go to the frontend folder:

```bash
cd vitiya-Frontend
````

2. Install dependencies:

```bash
npm install
```

3. Add your environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_OPENAI_API_KEY=your_openai_key
```

> **Important:** Do **not** commit `.env` files to GitHub.

4. Start the development server:

```bash
npm run dev
```

5. Open in browser:

```
http://localhost:5173
```

---

## ⚙ Backend Setup

Follow the [Backend Setup Guide](./vittiya-sahayak-Backend/README.md) for complete instructions on:

* Creating Supabase project
* Adding environment variables
* Deploying Edge Functions (`chat`, `scam-detect`, `document-analyze`)
* Configuring RLS policies
* Integrating hooks in frontend components

---

## 🔑 Environment Variables

You need `.env` or `.env.local` in **both frontend and backend**:

```env
# Supabase
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# OpenAI
VITE_OPENAI_API_KEY=your_openai_key_here
```

> Supabase secrets for Edge Functions:
> `OPENAI_API_KEY=your_openai_key_here`

---

## 📁 Project Structure

```
vitiya-Frontend/
├── src/
│   ├── lib/
│   ├── hooks/
│   └── pages/
├── package.json
├── tsconfig.json
└── vite.config.ts

vittiya-sahayak-Backend/
├── supabase/
│   ├── functions/
│   ├── migrations/
│   └── _shared/
├── src/
│   └── hooks/
├── package.json
└── README.md
```

---

## 💻 Usage

* Frontend: `npm run dev` → browser at `http://localhost:5173`
* Backend: Deploy Supabase Edge Functions, configure RLS & OAuth
* Example components/hooks:

  * `useAuth()` → signup/login
  * `useFinancialRecords()` → add/view transactions
  * `useChat()` → AI chat
  * `useBankingCredentials()` → manage banking vault
  * `scam-detect` → check messages for fraud
  * `document-analyze` → simplify bank statements/documents

---

## ⚡ Contributing

1. Fork the repository
2. Create your feature branch:

```bash
git checkout -b feature/YourFeature
```

3. Commit changes:

```bash
git commit -m "Add feature"
```

4. Push branch:

```bash
git push origin feature/YourFeature
```

5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 📞 Support

* Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
* OpenAI Docs: [https://platform.openai.com/docs](https://platform.openai.com/docs)

```


