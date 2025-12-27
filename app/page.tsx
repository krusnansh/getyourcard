"use client";
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, ShieldCheck, Zap, BookOpen, Menu, X, 
  LogOut, LayoutDashboard, Lock, TrendingUp, CheckCircle, 
  AlertCircle, ChevronRight, Edit3, Trash2, Plus, 
  Loader2, User, Search, Send, ArrowRight, Eye, EyeOff, Mail, Download
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithCustomToken,
  GoogleAuthProvider, 
  signOut, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc,
  limit
} from 'firebase/firestore';

// --- Configuration & Helpers ---

const ADMIN_EMAIL = "krusnansh2003@gmail.com";

const getFirebaseConfig = () => {
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      // Fallbacks or derived values if standard env vars are missing specific bucket/sender/appId
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };
  }
  // Fallback for Canvas Preview

  return {};
};

const firebaseConfig = getFirebaseConfig();
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Mock Data ---

const MOCK_CARDS = [
  {
    id: 'kotex-edge',
    name: 'KOTEX Edge',
    issuer: 'KOTEX Bank',
    type: 'credit',
    category: 'beginner',
    annualFee: 499,
    minIncome: 20000,
    gradient: 'from-blue-600 to-purple-600',
    benefits: ['5% Amazon Cashback', '4 Lounge Visits', 'Fuel Waiver'],
    bestFor: 'Shopping',
    rewardRate: '5%'
  },
  {
    id: 'securegrow',
    name: 'SecureGrow FD',
    issuer: 'TrustBank',
    type: 'fd',
    category: 'beginner',
    annualFee: 0,
    minIncome: 0,
    gradient: 'from-emerald-500 to-teal-700',
    benefits: ['100% Approval', 'No Income Proof', 'Builds Credit'],
    bestFor: 'Credit Building',
    rewardRate: '1%'
  },
  {
    id: 'shop-max',
    name: 'ShopMax 1L',
    issuer: 'NovaBank',
    type: 'credit',
    category: 'shopping',
    annualFee: 999,
    minIncome: 30000,
    gradient: 'from-pink-600 to-rose-500',
    benefits: ['Limit: ₹1,00,000', '5% Off Online Shopping', 'No Cost EMI'],
    bestFor: 'Daily Shopping',
    rewardRate: '5%'
  },
  {
    id: 'movie-plus',
    name: 'MoviePlus 2L',
    issuer: 'CineBank',
    type: 'credit',
    category: 'entertainment',
    annualFee: 1499,
    minIncome: 50000,
    gradient: 'from-violet-600 to-indigo-600',
    benefits: ['Limit: ₹2,00,000', 'BOGO Movie Tickets', '20% Dining Discount'],
    bestFor: 'Lifestyle',
    rewardRate: '4%'
  },
  {
    id: 'hdfn-prime',
    name: 'HDFN Prime',
    issuer: 'HDFN Bank',
    type: 'credit',
    category: 'premium',
    annualFee: 999,
    minIncome: 50000,
    gradient: 'from-indigo-600 to-pink-600',
    benefits: ['10X Dining Rewards', 'Golf Access', 'Travel Insured'],
    bestFor: 'Lifestyle',
    rewardRate: '3.3%'
  }
];

const STATIC_BLOGS = [
  {
    id: 'b1',
    title: "Credit Cards 101: The Gen-Z Guide",
    summary: "Everything you need to know before swiping your first card.",
    content: "Credit cards are powerful tools. Used correctly, they build wealth. Used poorly, they build debt. The golden rule? Treat it like a debit card. Never spend money you don't have in your bank account right now.",
    createdAt: { seconds: Date.now() / 1000 }
  },
  {
    id: 'b2',
    title: "FD-Backed Cards: The Cheat Code",
    summary: "How to hack your way to a good credit score with zero history.",
    content: "Rejected by banks? An FD-backed card is your entry ticket. You deposit money (FD), and the bank gives you a card worth 90% of that value. Use it for 6 months, pay on time, and watch your CIBIL score skyrocket.",
    createdAt: { seconds: Date.now() / 1000 }
  },
  {
    id: 'b3',
    title: "Cashback vs Rewards: The Showdown",
    summary: "Points are complicated. Cash is king. Which one wins?",
    content: "If you travel often, points (miles) can give you 4-5% value. But if you want simplicity, cashback gives you 1-2% real money. For most beginners, cashback is the stress-free winner.",
    createdAt: { seconds: Date.now() / 1000 }
  },
  {
    id: 'b4',
    title: "Understanding Credit Utilization",
    summary: "The silent factor that impacts 30% of your credit score.",
    content: "Credit utilization is the ratio of your outstanding balance to your total credit limit. Keeping this below 30% signals to lenders that you are a responsible borrower. Maxing out your cards, even if you pay them off, can temporarily dip your score.",
    createdAt: { seconds: Date.now() / 1000 }
  },
  {
    id: 'b5',
    title: "No-Cost EMI: Is it Really Free?",
    summary: "Decoding the hidden costs behind zero-interest schemes.",
    content: "When you opt for No-Cost EMI, the bank often deducts the interest amount from the principal as a discount, but you still pay GST on the interest component. Always check the final repayment schedule to ensure you aren't paying more than the product's sticker price.",
    createdAt: { seconds: Date.now() / 1000 }
  }
];

// --- Shared Components ---

const GlassCard = ({ children, className = "", hoverEffect = false, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      relative overflow-hidden
      bg-white/5 backdrop-blur-xl 
      border border-white/10 
      shadow-[0_8px_32px_rgba(0,0,0,0.3)]
      rounded-2xl
      ${hoverEffect ? 'transition-all duration-300 hover:bg-white/10 hover:shadow-[0_8px_32px_rgba(79,140,255,0.2)] hover:-translate-y-1 cursor-pointer' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

const BackgroundBlob = ({ color, position, size, animationDuration }) => (
  <div 
    className={`absolute rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob ${color} ${position} ${size}`}
    style={{ animationDuration: animationDuration }}
  />
);

const Badge = ({ status }) => {
  const styles = {
    'Applied': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Under Review': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'Approved': 'bg-green-500/20 text-green-300 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]',
    'Rejected': 'bg-red-500/20 text-red-300 border-red-500/30',
    'Agent will call': 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles['Applied']}`}>
      {status}
    </span>
  );
};

// --- Animations Components ---

const CardCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % MOCK_CARDS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const getCardStyle = (index) => {
    const length = MOCK_CARDS.length;
    let dist = (index - activeIndex + length) % length;
    
    if (dist === 0) return "z-20 scale-100 opacity-100 translate-x-0 rotate-0 blur-0 shadow-[0_0_50px_rgba(79,140,255,0.4)]";
    else if (dist === 1) return "z-10 scale-90 opacity-60 translate-x-12 rotate-6 blur-[1px]";
    else if (dist === length - 1) return "z-10 scale-90 opacity-60 -translate-x-12 -rotate-6 blur-[1px]";
    else return "z-0 scale-75 opacity-0 translate-y-12 blur-xl";
  };

  return (
    <div className="relative h-64 w-full max-w-sm mx-auto perspective-1000 flex items-center justify-center mt-12 lg:mt-0">
      {MOCK_CARDS.map((card, index) => (
        <div
          key={card.id}
          className={`absolute w-80 h-48 rounded-2xl p-6 text-white transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            bg-gradient-to-br ${card.gradient} border border-white/20
            flex flex-col justify-between shadow-2xl
            ${getCardStyle(index)}
          `}
        >
          <div className="flex justify-between items-start">
            <span className="font-bold tracking-wider opacity-90">{card.issuer}</span>
            <Zap className="text-yellow-400 fill-yellow-400" size={20} />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
               <div className="w-8 h-5 bg-yellow-500/80 rounded flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-white rounded-full opacity-50"></div>
               </div>
               <div className="text-lg tracking-widest font-mono">•••• 4289</div>
            </div>
            <div className="flex justify-between items-end">
              <div className="text-xs opacity-75">
                <div className="uppercase text-[10px]">Card Holder</div>
                <div className="font-semibold text-sm">DEMO USER</div>
              </div>
              <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded backdrop-blur-md">
                 {card.category.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Page Components ---

const LandingPage = ({ navigate, blogs }) => (
  <div className="relative min-h-screen bg-[#0B0F1A] overflow-hidden text-white pt-20">
    <BackgroundBlob color="bg-blue-600" position="-top-20 -left-20" size="w-96 h-96" animationDuration="7s" />
    <BackgroundBlob color="bg-purple-600" position="top-40 -right-20" size="w-72 h-72" animationDuration="10s" />
    
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
      <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
        <div className="text-center lg:text-left">
           <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
             Get the best <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">Credit Card</span>
             <br/> for YOU.
           </h1>
           <p className="text-lg text-gray-400 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
             A hyper-modern hobby project exploring fintech UX. 
             Experience the future of eligibility checks without the spam.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
             <button
                onClick={() => navigate('form')}
                className="group relative px-8 py-4 bg-blue-600 rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.6)]"
             >
               <span className="relative z-10 flex items-center">
                 Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
               </span>
             </button>
             <button onClick={() => navigate('blog-list')} className="px-8 py-4 rounded-full font-bold text-white border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center">
               <BookOpen size={18} className="mr-2 text-gray-400" /> Learn First
             </button>
           </div>
        </div>
        <CardCarousel />
      </div>
    </div>

    {/* Blog Preview */}
    <div className="relative z-10 max-w-7xl mx-auto px-4 pb-20">
       <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-white">Latest from our Blog</h2>
          <button onClick={() => navigate('blog-list')} className="text-blue-400 text-sm hover:text-white transition-colors">View All &rarr;</button>
       </div>
       <div className="grid md:grid-cols-3 gap-6">
          {blogs.slice(0, 3).map(blog => (
             <GlassCard key={blog.id} hoverEffect={true} onClick={() => navigate('blog-detail', blog)} className="p-6 cursor-pointer">
                <div className="text-blue-400 text-xs font-bold uppercase mb-2">Guide</div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{blog.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-3 mb-4">{blog.summary}</p>
                <div className="flex items-center text-blue-400 text-xs font-bold">Read More <ArrowRight size={12} className="ml-1"/></div>
             </GlassCard>
          ))}
       </div>
    </div>
  </div>
);

const LoginPage = ({ navigate, handleGoogleLogin, handlePasswordlessLogin, authEmail, setAuthEmail, authMessage, authError, pendingFormSubmission }) => (
  <div className="min-h-screen bg-[#0B0F1A] pt-24 px-4 flex items-center justify-center relative overflow-hidden">
     <BackgroundBlob color="bg-blue-600" position="-top-20 -left-20" size="w-96 h-96" animationDuration="7s" />
     <GlassCard className="max-w-md w-full p-8 relative z-10">
       <button onClick={() => navigate('landing')} className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 transition-colors">
          <X size={20} />
       </button>
       
       <div className="text-center mb-8">
         <h2 className="text-3xl font-bold text-white mb-2">Welcome</h2>
         <p className="text-gray-400">
           {pendingFormSubmission ? "Sign in to see your results." : "Access your dashboard securely."}
         </p>
       </div>

       <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors mb-6">
         <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.15-7.23c1.95-.03 3.73.74 5.02 1.96l2.14-2.14C17.2 2.63 14.65 1.75 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c9.76 0 9.76-9.4 8.78-11.23c-.27-.5-.56-1.04-.56-1.57z"/></svg>
         Continue with Google
       </button>

       <div className="relative mb-6">
         <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
         <div className="relative flex justify-center text-sm"><span className="px-2 bg-[#161b2e] text-gray-500">Or use magic link</span></div>
       </div>

       <form onSubmit={handlePasswordlessLogin} className="space-y-4">
         <div>
           <label className="block text-xs text-gray-400 uppercase font-medium mb-1">Email Address</label>
           <div className="relative">
             <Mail className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
             <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="name@example.com"/>
           </div>
         </div>
         {authMessage && <p className="text-green-400 text-sm text-center bg-green-900/20 p-2 rounded-lg border border-green-500/20">{authMessage}</p>}
         {authError && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg border border-red-500/20">{authError}</p>}
         <button type="submit" className="w-full bg-blue-600 py-3 rounded-xl font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30">Send Magic Link</button>
       </form>
     </GlassCard>
  </div>
);

const FormPage = ({ formData, setFormData, handleFormSubmit, user, navigate }) => (
  <div className="min-h-screen bg-[#0B0F1A] pt-28 px-4 relative overflow-hidden">
    <BackgroundBlob color="bg-purple-900" position="top-20 -right-20" size="w-96 h-96" />
    <div className="max-w-md mx-auto relative z-10">
      <div className="mb-4">
        <button onClick={() => navigate('landing')} className="flex items-center text-gray-400 hover:text-white transition-colors">
          <ChevronRight className="rotate-180 mr-1" size={20}/> Back to Home
        </button>
      </div>
      <GlassCard className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Eligibility Check</h2>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Full Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="block w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Mobile</label>
                <input type="tel" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="block w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500" placeholder="9876543210"/>
             </div>
             <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="block w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500" placeholder="name@mail.com"/>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">PAN Card</label>
                <input type="text" required value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value})} className="block w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 uppercase" placeholder="ABCDE1234F"/>
             </div>
             <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Monthly Income (₹)</label>
                <input type="number" required value={formData.income} onChange={e => setFormData({...formData, income: e.target.value})} className="block w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500" placeholder="50000"/>
             </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase mb-2">Employment</label>
            <div className="grid grid-cols-2 gap-3">
              {['Salaried', 'Self-Employed'].map((type) => (
                <button key={type} type="button" onClick={() => setFormData({...formData, employment: type.toLowerCase()})} className={`py-2 px-1 text-sm font-medium rounded-lg border transition-all ${formData.employment === type.toLowerCase() ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
             <label className="block text-xs font-medium text-gray-400 uppercase mb-2">Do you own a credit card?</label>
             <div className="flex gap-4">
               <label className="flex items-center text-gray-300 cursor-pointer"><input type="radio" className="mr-2 accent-blue-500" checked={formData.creditHistory === 'yes'} onChange={() => setFormData({...formData, creditHistory: 'yes'})}/> Yes</label>
               <label className="flex items-center text-gray-300 cursor-pointer"><input type="radio" className="mr-2 accent-blue-500" checked={formData.creditHistory === 'no'} onChange={() => setFormData({...formData, creditHistory: 'no'})}/> No</label>
             </div>
          </div>
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-blue-600/30 hover:scale-[1.02] transition-all">
            Analyze & Join Now
          </button>
        </form>
      </GlassCard>
    </div>
  </div>
);

const ResultsPage = ({ matchedCards, handleApply, navigate }) => (
  <div className="min-h-screen bg-[#0B0F1A] pt-24 px-4 pb-12">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center mb-8">
         <button onClick={() => navigate('landing')} className="mr-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><ChevronRight className="rotate-180" size={20}/></button>
         <h1 className="text-3xl font-bold text-white">Matches Found ({matchedCards.length})</h1>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matchedCards.map((card) => (
          <GlassCard key={card.id} hoverEffect={true} className="flex flex-col h-full">
            <div className={`h-40 bg-gradient-to-br ${card.gradient} p-6 relative`}>
               <div className="font-bold text-white text-lg">{card.issuer}</div>
               <div className="text-white/90 font-mono mt-4 text-xl">{card.name}</div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
               <div className="space-y-3 mb-6 flex-1">
                  {card.benefits.map((b,i) => <div key={i} className="flex gap-2 text-sm text-gray-300"><CheckCircle size={16} className="text-green-400 shrink-0"/>{b}</div>)}
               </div>
               <div className="flex justify-between items-center border-t border-white/10 pt-4 mb-4">
                  <div><div className="text-xs text-gray-500 uppercase">Fee</div><div className="text-white font-bold">₹{card.annualFee}</div></div>
                  <div className="text-right"><div className="text-xs text-gray-500 uppercase">Reward</div><div className="text-green-400 font-bold">{card.rewardRate}</div></div>
               </div>
               <button onClick={() => handleApply(card)} className="w-full bg-blue-600/20 text-blue-400 border border-blue-500/50 py-2 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-all">Apply Now</button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  </div>
);

const UserDashboard = ({ userApps, navigate }) => (
  <div className="min-h-screen bg-[#0B0F1A] pt-24 px-4 pb-12">
     <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
           <button onClick={() => navigate('landing')} className="mr-4 p-2 bg-white/5 rounded-full hover:bg-white/10"><ChevronRight className="rotate-180" size={20}/></button>
           <h1 className="text-3xl font-bold text-white">My Applications</h1>
        </div>
        <div className="space-y-4">
           {userApps.length === 0 ? (
              <div className="text-gray-500 text-center py-12 bg-white/5 rounded-xl border border-white/10">No applications found. <button onClick={() => navigate('form')} className="text-blue-400 underline">Find a card</button></div>
           ) : (
              userApps.map(app => (
                 <GlassCard key={app.id} className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                       <div className="bg-blue-600/20 p-3 rounded-full text-blue-400"><CreditCard size={24}/></div>
                       <div>
                          <h3 className="text-white font-bold text-lg">{app.cardName}</h3>
                          <p className="text-gray-400 text-sm">{app.issuerName}</p>
                          <p className="text-gray-500 text-xs mt-1">Applied: {app.createdAt?.seconds ? new Date(app.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</p>
                       </div>
                    </div>
                    <Badge status={app.status} />
                 </GlassCard>
              ))
           )}
        </div>
     </div>
  </div>
);
const STATUS_OPTIONS = [
  'Applied',
  'Under Review',
  'Approved',
  'Rejected',
  'Agent will call'
];

const AdminPanel = ({
  adminTab,
  setAdminTab,
  adminLeads,
  downloadCSV,
  adminAllApps,
  handleStatusUpdate,
  navigate
}) => (
  <div className="min-h-screen bg-[#0B0F1A] pt-24 px-4 pb-12">
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('landing')}
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition"
          >
            <ChevronRight className="rotate-180" size={20} />
          </button>
          <h1 className="text-3xl font-bold text-white flex gap-3 items-center">
            <Lock className="text-purple-400" /> Admin Console
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl">
          {['leads', 'apps'].map(tab => (
            <button
              key={tab}
              onClick={() => setAdminTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all
                ${adminTab === tab
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ================= LEADS ================= */}
      {adminTab === 'leads' && (
        <GlassCard className="overflow-x-auto">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-white font-bold">Captured Leads</h3>
            <button
              onClick={() =>
                downloadCSV(
                  adminLeads,
                  `leads_${new Date().toISOString().split('T')[0]}.csv`
                )
              }
              className="flex items-center gap-2 bg-green-600/20 text-green-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600/30 transition"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>

          {adminLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No leads captured yet.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-white/5 text-xs uppercase font-bold text-gray-300">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">Income</th>
                  <th className="p-4">Matches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {adminLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-white/5 transition">
                    <td className="p-4 text-white">
                      {lead.name}
                      <div className="text-xs text-gray-500">{lead.email}</div>
                    </td>
                    <td className="p-4">{lead.mobile}</td>
                    <td className="p-4">₹{lead.income}</td>
                    <td className="p-4">{lead.matchedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </GlassCard>
      )}

      {/* ================= APPLICATIONS ================= */}
      {adminTab === 'apps' && (
        <div className="space-y-4">
          {adminAllApps.length === 0 ? (
            <div className="text-gray-500 text-center py-12 bg-white/5 rounded-xl border border-white/10">
              No applications submitted yet.
            </div>
          ) : (
            adminAllApps.map(app => (
              <GlassCard
                key={app.id}
                className="p-4 flex flex-col md:flex-row justify-between items-center gap-4"
              >
                {/* User Info */}
                <div>
                  <h4 className="font-bold text-white">{app.userName}</h4>
                  <p className="text-sm text-gray-400">{app.cardName}</p>
                  <p className="text-xs text-gray-500">
                    Applied on{' '}
                    {app.createdAt?.seconds
                      ? new Date(app.createdAt.seconds * 1000).toLocaleDateString()
                      : 'Just now'}
                  </p>
                </div>

                {/* Status Selector */}
                <select
                  value={app.status}
                  onChange={(e) =>
                    handleStatusUpdate(app.id, e.target.value)
                  }
                  className="bg-[#0B0F1A] border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  </div>
);

// --- Main Application ---

export default function GetYourCardApp() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [authEmail, setAuthEmail] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');

  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', pan: '', income: '', employment: 'salaried', creditHistory: 'no' });
  const [matchedCards, setMatchedCards] = useState([]);
  const [userApps, setUserApps] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [pendingFormSubmission, setPendingFormSubmission] = useState(false);

  const [adminLeads, setAdminLeads] = useState([]);
  const [adminAllApps, setAdminAllApps] = useState([]);
  const [adminTab, setAdminTab] = useState('leads');

  const isAdmin = user?.email === ADMIN_EMAIL;

  // --- Title Effect ---
  useEffect(() => {
    document.title = "GetYourCard";
  }, []);

// --- Auth Init + Magic Link Completion ---
useEffect(() => {
  // 🔹 Complete magic-link sign-in if returning from email
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Confirm your email');
    }

    signInWithEmailLink(auth, email!, window.location.href)
      .then(() => {
        window.localStorage.removeItem('emailForSignIn');
        window.history.replaceState({}, document.title, '/');
      })
      .catch(console.error);
  }

  // 🔹 Listen for auth state
  const unsubscribe = onAuthStateChanged(auth, (u) => {
    setUser(u);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);


  // --- Resume Flow ---
  useEffect(() => {
    if (user && pendingFormSubmission) {
      processApplication(user);
      setPendingFormSubmission(false);
    }
  }, [user, pendingFormSubmission]);

  // --- Fetch Data ---
  useEffect(() => {
    // Initialize blogs with static data immediately
    setBlogs(STATIC_BLOGS);

    // Only attempt Firestore connection if user is logged in
    // This prevents "Permission Denied" errors for guests on the landing page
    if (user) {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'blogs'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        const dbBlogs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (dbBlogs.length > 0) setBlogs([...dbBlogs, ...STATIC_BLOGS].slice(0, 50));
      }, (err) => {
        console.warn("Blog fetch failed (likely permission), using static.", err);
      });
      return () => unsub();
    }
  }, [user]);

  useEffect(() => {
    if (user && view === 'user-dashboard') {
      // FIX: Use user-specific path to guarantee permissions
      const q = query(
        collection(db, 'artifacts', appId, 'users', user.uid, 'applications'),
        orderBy('createdAt', 'desc')
      );
      const unsub = onSnapshot(q, (snap) => setUserApps(snap.docs.map(d => ({ id: d.id, ...d.data() }))), (err) => console.error("User apps error:", err));
      return () => unsub();
    }
  }, [user, view]);

  useEffect(() => {
    if (isAdmin && view === 'admin') {
      // Leads (Public)
      const leadsQ = query(collection(db, 'artifacts', appId, 'public', 'data', 'leads'), orderBy('timestamp', 'desc'), limit(50));
      
      // All Apps (Read from the duplicate public collection created for admins)
      const appsQ = query(collection(db, 'artifacts', appId, 'public', 'data', 'all_applications'), orderBy('createdAt', 'desc'), limit(50));
      
      const unsubLeads = onSnapshot(leadsQ, (snap) => setAdminLeads(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
      const unsubApps = onSnapshot(appsQ, (snap) => setAdminAllApps(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
      
      return () => { unsubLeads(); unsubApps(); };
    }
  }, [isAdmin, view]);

  // --- Logic ---

  const navigate = (target, data = null) => {
    window.scrollTo(0, 0);
    setView(target);
    setIsMenuOpen(false);
    if (target === 'blog-detail' && data) setSelectedBlog(data);
  };

  const processApplication = async (currentUser) => {
    setView('analysis');
    await new Promise(r => setTimeout(r, 2500));
    
    let matches = [];
    const income = Number(formData.income);
    const hasHistory = formData.creditHistory === 'yes';
    
    if (hasHistory) {
      // Show requested specific cards
      matches = MOCK_CARDS.filter(c => c.id === 'shop-max' || c.id === 'movie-plus');
    } else {
      // Show beginner/FD cards
      matches = MOCK_CARDS.filter(c => c.category === 'beginner' || c.type === 'fd');
    }
    
    // Fallback if empty (shouldn't happen with logic but safe guard)
    if (matches.length === 0) matches = MOCK_CARDS.filter(c => c.category === 'beginner');
    
    setMatchedCards(matches);
    
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leads'), {
        ...formData,
        timestamp: serverTimestamp(),
        matchedCount: matches.length,
        userId: currentUser?.uid || 'anon',
        userEmail: currentUser?.email || 'anon'
      });
    } catch (err) { console.error(err); }
    navigate('results');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setPendingFormSubmission(true);
      navigate('login');
      return;
    }
    processApplication(user);
  };

  const handleApply = async (card) => {
    if (!user) return navigate('login');
    
    const appData = {
      userId: user.uid,
      userName: user.email,
      cardId: card.id,
      cardName: card.name,
      issuerName: card.issuer,
      status: 'Applied',
      createdAt: serverTimestamp(),
      lastUpdatedAt: serverTimestamp()
    };

    try {
      // 1. Write to User's Private Collection (For User Dashboard)
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'applications'), appData);

      // 2. Write to Public/Admin Collection (For Admin Visibility)
      // Note: This duplicates data but solves the permission issue for the Admin Panel
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'all_applications'), appData);
      
      navigate('user-dashboard');
    } catch (e) {
      console.error("Application error:", e);
      // Even if admin write fails, user write might succeed. Proceed.
      navigate('user-dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      if (!pendingFormSubmission) navigate('landing');
    } catch (err) { console.error(err); }
  };

  const handlePasswordlessLogin = async (e) => {
    e.preventDefault();
    const actionCodeSettings = {
  url: window.location.origin,
  handleCodeInApp: true,
};

    try {
      await sendSignInLinkToEmail(auth, authEmail, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', authEmail);
      setAuthMessage('Magic link sent! Check your inbox to sign in.');
    } catch (err) { setAuthError('Failed to send link.'); }
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await signOut(auth);
    navigate('landing');
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    if (!isAdmin) return;
    // Update the public copy (Admin view)
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'all_applications', appId), {
      status: newStatus,
      lastUpdatedAt: serverTimestamp()
    });
    // Note: In a real app, a Cloud Function would sync this change to the user's private document.
    // For this MVP, the user might not see the status change immediately unless we knew their specific doc ID in their subcollection.
  };

  const downloadCSV = (data, filename) => {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(val => typeof val === 'object' ? `"${JSON.stringify(val).replace(/"/g, "'")}"` : `"${val}"`).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500 w-12 h-12"/></div>;

  return (
    <div className="font-sans antialiased text-gray-900 selection:bg-blue-500 selection:text-white">
      {view !== 'analysis' && (
        <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-[#0B0F1A]/80 backdrop-blur-lg border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center cursor-pointer" onClick={() => navigate('landing')}>
                <span className="font-bold text-xl tracking-tight text-white">
                  GetYour<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Card</span>
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <button onClick={() => navigate('landing')} className="text-gray-300 hover:text-white font-medium transition-colors">Home</button>
                <button onClick={() => navigate('blog-list')} className="text-gray-300 hover:text-white font-medium transition-colors">Blogs</button>
                {user && (
                  <button onClick={() => navigate('user-dashboard')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors flex items-center gap-1">
                     <LayoutDashboard size={14}/> Dashboard
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => navigate('admin')} className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors flex items-center gap-1">
                     <Lock size={14}/> Admin
                  </button>
                )}
                
                {user ? (
                   <button onClick={() => setShowLogoutConfirm(true)} className="text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-1">
                     <LogOut size={16}/>
                   </button>
                ) : (
                  <button 
                    onClick={() => navigate('login')}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)]"
                  >
                    Login
                  </button>
                )}
              </div>

              <div className="flex items-center md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden bg-[#0B0F1A] border-b border-white/10">
              <div className="px-4 pt-2 pb-4 space-y-2">
                <button onClick={() => navigate('landing')} className="block w-full text-left py-2 text-gray-300">Home</button>
                <button onClick={() => navigate('blog-list')} className="block w-full text-left py-2 text-gray-300">Blogs</button>
                {user && <button onClick={() => navigate('user-dashboard')} className="block w-full text-left py-2 text-blue-400">Dashboard</button>}
                {isAdmin && <button onClick={() => navigate('admin')} className="block w-full text-left py-2 text-yellow-400">Admin</button>}
                {user ? (
                   <button onClick={() => setShowLogoutConfirm(true)} className="block w-full text-left py-2 text-red-400">Logout</button>
                ) : (
                   <button onClick={() => navigate('login')} className="block w-full text-left py-2 text-white font-bold">Login</button>
                )}
              </div>
            </div>
          )}

          {showLogoutConfirm && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <GlassCard className="p-6 max-w-sm w-full text-center">
                <h3 className="text-xl font-bold text-white mb-2">Confirm Logout</h3>
                <p className="text-gray-400 mb-6">Are you sure you want to log out?</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors">Cancel</button>
                  <button onClick={handleLogout} className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20">Logout</button>
                </div>
              </GlassCard>
            </div>
          )}
        </nav>
      )}

      <main>
        {view === 'landing' && <LandingPage navigate={navigate} blogs={blogs} />}
        {view === 'login' && <LoginPage navigate={navigate} handleGoogleLogin={handleGoogleLogin} handlePasswordlessLogin={handlePasswordlessLogin} authEmail={authEmail} setAuthEmail={setAuthEmail} authMessage={authMessage} authError={authError} pendingFormSubmission={pendingFormSubmission} />}
        {view === 'form' && <FormPage formData={formData} setFormData={setFormData} handleFormSubmit={handleFormSubmit} user={user} navigate={navigate} />}
        {view === 'analysis' && (
          <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center relative overflow-hidden text-white">
            <BackgroundBlob color="bg-blue-600" position="inset-0 m-auto" size="w-64 h-64" animationDuration="3s" />
            <div className="relative z-10 flex flex-col items-center">
              <Loader2 className="animate-spin text-blue-500 mb-6 w-16 h-16" />
              <h2 className="text-2xl font-bold animate-pulse">Scanning Partners...</h2>
            </div>
          </div>
        )}
        {view === 'results' && <ResultsPage matchedCards={matchedCards} handleApply={handleApply} navigate={navigate} />}
        {view === 'user-dashboard' && <UserDashboard userApps={userApps} navigate={navigate} />}
        {view === 'admin' && <AdminPanel adminTab={adminTab} setAdminTab={setAdminTab} adminLeads={adminLeads} downloadCSV={downloadCSV} adminAllApps={adminAllApps} handleStatusUpdate={handleStatusUpdate} navigate={navigate} />}
        {view === 'blog-list' && (
           <div className="min-h-screen bg-[#0B0F1A] pt-24 px-4 pb-12">
              <div className="max-w-7xl mx-auto">
                 <div className="flex items-center mb-8">
                    <button onClick={() => navigate('landing')} className="mr-4 p-2 bg-white/5 rounded-full hover:bg-white/10"><ChevronRight className="rotate-180" size={20}/></button>
                    <h1 className="text-3xl font-bold text-white">Financial Insights</h1>
                 </div>
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map(blog => (
                       <GlassCard key={blog.id} hoverEffect={true} onClick={() => navigate('blog-detail', blog)} className="p-6 cursor-pointer">
                          <div className="text-blue-400 text-xs font-bold uppercase mb-2">Guide</div>
                          <h3 className="text-xl font-bold text-white mb-2">{blog.title}</h3>
                          <p className="text-gray-400 text-sm line-clamp-3 mb-4">{blog.summary}</p>
                          <div className="flex items-center text-blue-400 text-sm font-bold">Read More <ArrowRight size={14} className="ml-1"/></div>
                       </GlassCard>
                    ))}
                 </div>
              </div>
           </div>
        )}
        {view === 'blog-detail' && selectedBlog && (
           <div className="min-h-screen bg-[#0B0F1A] pt-24 px-4 pb-12">
              <div className="max-w-3xl mx-auto">
                 <button onClick={() => navigate('blog-list')} className="text-gray-400 hover:text-white flex items-center mb-8"><ArrowRight className="rotate-180 mr-2" size={16}/> Back</button>
                 <GlassCard className="p-8">
                    <h1 className="text-3xl font-bold text-white mb-4">{selectedBlog.title}</h1>
                    <p className="text-gray-300 whitespace-pre-line leading-relaxed">{selectedBlog.content}</p>
                 </GlassCard>
              </div>
           </div>
        )}
      </main>

      {view !== 'analysis' && (
        <footer className="bg-[#0B0F1A] border-t border-white/5 py-12 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4 text-white">
                  <span className="font-bold text-lg">GetYourCard</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  The future of credit card discovery. <br/>
                  Simulating the fintech experience.
                </p>
              </div>
              <div className="glass-card p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 col-span-2 md:col-span-1">
                 <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                   <AlertCircle size={16}/> Disclaimer
                 </h3>
                 <p className="text-xs text-gray-400">
                   This is a hobby project for educational purposes. 
                   No real credit checks are performed. No real banks are involved. 
                   Do not submit sensitive financial data.
                 </p>
              </div>
            </div>
            <div className="text-center text-xs text-gray-600 pt-8 border-t border-white/5">
              &copy; {new Date().getFullYear()} Get Your Card Project. Neo-Bank Design Demo.
            </div>
          </div>
        </footer>
      )}
      
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
      `}</style>
    </div>
  );
}