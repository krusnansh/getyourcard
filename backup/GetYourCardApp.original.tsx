import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  limit
} from 'firebase/firestore';
import { 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  ArrowRight, 
  Search, 
  Filter, 
  Menu, 
  X,
  Info,
  Clock,
  TrendingUp,
  AlertCircle,
  Lock,
  Star,
  Activity,
  User
} from 'lucide-react';

// --- Configuration & Design Tokens ---

// Neo-Bank Palette
// bgPrimary: #0B0F1A (Slate-950/Black mix)
// bgSecondary: #111827 (Gray-900)
// Neon Blue: #4F8CFF
// Neon Green: #34F5C5
// Neon Pink: #FF5EDF
// Neon Purple: #7B5CFF

const MOCK_CARDS = [
  {
    id: 'kotex-edge',
    name: 'KOTEX Edge',
    bank: 'KOTEX Bank',
    type: 'credit',
    category: 'rewards',
    annualFee: 499,
    minIncome: 25000,
    gradient: 'from-blue-600 to-purple-600',
    benefits: ['5% Amazon Cashback', '4 Lounge Visits', 'Fuel Waiver'],
    bestFor: 'Shopping',
    rewardRate: '5%'
  },
  {
    id: 'securegrow',
    name: 'SecureGrow FD',
    bank: 'TrustBank',
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
    id: 'hdfn-prime',
    name: 'HDFN Prime',
    bank: 'HDFN Bank',
    type: 'credit',
    category: 'premium',
    annualFee: 999,
    minIncome: 50000,
    gradient: 'from-indigo-600 to-pink-600',
    benefits: ['10X Dining Rewards', 'Golf Access', 'Travel Insured'],
    bestFor: 'Lifestyle',
    rewardRate: '3.3%'
  },
  {
    id: 'axisone-travel',
    name: 'AxisOne Travel',
    bank: 'AxisOne',
    type: 'credit',
    category: 'travel',
    annualFee: 2999,
    minIncome: 80000,
    gradient: 'from-slate-700 to-black',
    benefits: ['Unlimited Lounge', '1:1 Mile Transfer', '0% Forex'],
    bestFor: 'Global Travel',
    rewardRate: '4%'
  },
  {
    id: 'icia-cashback',
    name: 'ICIA Plus',
    bank: 'ICIA Bank',
    type: 'credit',
    category: 'cashback',
    annualFee: 0,
    minIncome: 20000,
    gradient: 'from-orange-500 to-red-600',
    benefits: ['Lifetime Free', '1% Flat Offline', '2% Online'],
    bestFor: 'Daily Spends',
    rewardRate: '2%'
  }
];

const BLOGS = [
  {
    id: 1,
    title: "Credit Cards 101: The Gen-Z Guide",
    summary: "Everything you need to know before swiping your first card.",
    readTime: "5 min read",
    content: "Credit cards are powerful tools. Used correctly, they build wealth. Used poorly, they build debt. The golden rule? Treat it like a debit card. Never spend money you don't have in your bank account right now."
  },
  {
    id: 2,
    title: "FD-Backed Cards: The Cheat Code",
    summary: "How to hack your way to a good credit score with zero history.",
    readTime: "4 min read",
    content: "Rejected by banks? An FD-backed card is your entry ticket. You deposit money (FD), and the bank gives you a card worth 90% of that value. Use it for 6 months, pay on time, and watch your CIBIL score skyrocket."
  },
  {
    id: 3,
    title: "Cashback vs Rewards: The Showdown",
    summary: "Points are complicated. Cash is king. Which one wins?",
    readTime: "6 min read",
    content: "If you travel often, points (miles) can give you 4-5% value. But if you want simplicity, cashback gives you 1-2% real money. For most beginners, cashback is the stress-free winner."
  }
];

const FAQS = [
  { q: "What is a credit card?", a: "Borrow money instantly for 45 days. Pay it back on time = Free money (Rewards). Pay late = High interest." },
  { q: "Will this check hurt my credit score?", a: "Nope. This is a simulation. No hard inquiries, no banks involved." },
  { q: "Do I need a PAN card?", a: "For this demo? Optional. In real life? Yes, absolutely mandatory." }
];

// --- Firebase Init ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Shared Components ---

// Glass Card Wrapper
const GlassCard = ({ children, className = "", hoverEffect = false }) => (
  <div className={`
    relative overflow-hidden
    bg-white/5 backdrop-blur-xl 
    border border-white/10 
    shadow-[0_8px_32px_rgba(0,0,0,0.3)]
    rounded-2xl
    ${hoverEffect ? 'transition-all duration-300 hover:bg-white/10 hover:shadow-[0_8px_32px_rgba(79,140,255,0.2)] hover:-translate-y-1' : ''}
    ${className}
  `}>
    {children}
  </div>
);

// Animated Background Blob
const BackgroundBlob = ({ color, position, size, animationDuration }) => (
  <div 
    className={`absolute rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob ${color} ${position} ${size}`}
    style={{ animationDuration: animationDuration }}
  />
);

// --- Main Application ---

export default function GetYourCardApp() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); // landing, form, analysis, results, blog-list, blog-detail, admin
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State for App Logic
  const [formData, setFormData] = useState({});
  const [matchedCards, setMatchedCards] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);

  // Auth
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const navigate = (newView, data = null) => {
    window.scrollTo(0, 0);
    setView(newView);
    setIsMenuOpen(false);
    if (newView === 'blog-detail' && data) setSelectedBlog(data);
  };

  // --- Views ---

  const Header = () => (
    <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-[#0B0F1A]/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('landing')}>
            <div className="bg-gradient-to-tr from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <CreditCard size={20} className="text-white" />
            </div>
            <span className="ml-3 font-bold text-xl tracking-tight text-white">
              GetYour<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Card</span>
            </span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => navigate('landing')} className="text-gray-300 hover:text-white font-medium transition-colors">Home</button>
            <button onClick={() => navigate('blog-list')} className="text-gray-300 hover:text-white font-medium transition-colors">Education</button>
            <button onClick={() => navigate('admin')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors flex items-center gap-1">
               <Lock size={14}/> Admin
            </button>
            <button 
              onClick={() => navigate('form')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)]"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0B0F1A] border-b border-white/10">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <button onClick={() => navigate('landing')} className="block w-full text-left py-2 text-gray-300">Home</button>
            <button onClick={() => navigate('blog-list')} className="block w-full text-left py-2 text-gray-300">Education</button>
            <button onClick={() => navigate('admin')} className="block w-full text-left py-2 text-gray-300">Admin</button>
            <button onClick={() => navigate('form')} className="block w-full text-left py-2 text-blue-400 font-bold">Get My Card</button>
          </div>
        </div>
      )}
    </nav>
  );

  const Footer = () => (
    <footer className="bg-[#0B0F1A] border-t border-white/5 py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-white">
              <div className="bg-blue-600/20 p-1.5 rounded text-blue-400"><CreditCard size={18} /></div>
              <span className="font-bold text-lg">GetYourCard</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The future of credit card discovery. <br/>
              Simulating the fintech experience.
            </p>
          </div>
          
          <div className="glass-card p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
             <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
               <AlertCircle size={16}/> Disclaimer
             </h3>
             <p className="text-xs text-gray-400">
               This is a hobby project. No real credit checks. No real banks. All data is for demonstration purposes only.
             </p>
          </div>
        </div>
        <div className="text-center text-xs text-gray-600 pt-8 border-t border-white/5">
          &copy; {new Date().getFullYear()} Get Your Card Project. Neo-Bank Design Demo.
        </div>
      </div>
    </footer>
  );

  const CardCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto Swipe
    useEffect(() => {
      const timer = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % MOCK_CARDS.length);
      }, 3500);
      return () => clearInterval(timer);
    }, []);

    // Helper to determine card position styles
    const getCardStyle = (index) => {
      // Logic to find relative position in circular array
      const length = MOCK_CARDS.length;
      // Normalized distance (handling wrap-around)
      let dist = (index - activeIndex + length) % length;
      
      // We want to show: prev (dist = length-1), current (dist = 0), next (dist = 1)
      
      if (dist === 0) {
        // Active Center
        return "z-20 scale-100 opacity-100 translate-x-0 rotate-0 blur-0 shadow-[0_0_50px_rgba(79,140,255,0.4)]";
      } else if (dist === 1) {
        // Next (Right)
        return "z-10 scale-90 opacity-60 translate-x-12 rotate-6 blur-[2px]";
      } else if (dist === length - 1) {
        // Prev (Left)
        return "z-10 scale-90 opacity-60 -translate-x-12 -rotate-6 blur-[2px]";
      } else {
        // Hidden/Back
        return "z-0 scale-75 opacity-0 translate-y-10 blur-xl";
      }
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
            {/* Card Content */}
            <div className="flex justify-between items-start">
              <span className="font-bold tracking-wider opacity-90">{card.bank}</span>
              <Zap className="text-yellow-400 fill-yellow-400" size={20} />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-5 bg-yellow-500/80 rounded flex items-center justify-center">
                    <div className="w-3 h-3 border-2 border-white rounded-full opacity-50"></div>
                 </div>
                 <div className="text-lg tracking-widest font-mono">
                    •••• 4289
                 </div>
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

            {/* Shine Effect */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
          </div>
        ))}
      </div>
    );
  };

  const LandingPage = () => (
    <div className="relative min-h-screen bg-[#0B0F1A] overflow-hidden text-white pt-16">
      {/* Abstract Backgrounds */}
      <BackgroundBlob color="bg-blue-600" position="-top-20 -left-20" size="w-96 h-96" animationDuration="7s" />
      <BackgroundBlob color="bg-purple-600" position="top-40 -right-20" size="w-72 h-72" animationDuration="10s" />
      <BackgroundBlob color="bg-emerald-600" position="bottom-20 left-1/3" size="w-64 h-64" animationDuration="8s" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          
          {/* Left Content */}
          <div className="text-center lg:text-left">
             <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-medium text-blue-300 mb-6 animate-pulse">
               <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
               Live Demo v1.0
             </div>

             <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
               Get the best <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                 Credit Card
               </span>
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
                   Get My Card <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                 </span>
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               </button>
               
               <button 
                  onClick={() => navigate('blog-list')}
                  className="px-8 py-4 rounded-full font-bold text-white border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center"
               >
                 <BookOpen size={18} className="mr-2 text-gray-400" /> Learn First
               </button>
             </div>
          </div>

          {/* Right Content - Carousel */}
          <CardCarousel />
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <ShieldCheck size={24} className="text-emerald-400"/>, title: "100% Secure", desc: "No data leaves this demo environment." },
            { icon: <Zap size={24} className="text-yellow-400"/>, title: "Instant Match", desc: "Logic-based filtering in milliseconds." },
            { icon: <TrendingUp size={24} className="text-blue-400"/>, title: "Smart Score", desc: "Calculated based on your mock income." },
            { icon: <User size={24} className="text-purple-400"/>, title: "Gen-Z First", desc: "Designed for the digital native generation." },
          ].map((feature, idx) => (
             <GlassCard key={idx} className="p-6 hover:border-white/20 text-center sm:text-left">
                <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto sm:mx-0 backdrop-blur-md">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
             </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );

  const AdminPage = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Fetch leads
      if (!user) return;
      const q = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'leads'),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const leadsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLeads(leadsData);
        setLoading(false);
      });

      return () => unsubscribe();
    }, [user]);

    return (
      <div className="min-h-screen bg-[#0B0F1A] pt-24 px-4 sm:px-6 lg:px-8 text-white relative">
         <BackgroundBlob color="bg-blue-900" position="top-0 left-0" size="w-full h-96" />
         
         <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex justify-between items-center mb-8">
               <h1 className="text-3xl font-bold flex items-center gap-3">
                 <div className="p-2 bg-blue-500/20 rounded-lg"><Lock size={24} className="text-blue-400"/></div>
                 Admin Dashboard
               </h1>
               <div className="text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                 {loading ? 'Syncing...' : `${leads.length} Recent Leads`}
               </div>
            </div>

            <GlassCard className="overflow-x-auto">
               <table className="min-w-full divide-y divide-white/10">
                 <thead className="bg-white/5">
                   <tr>
                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Income</th>
                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Employment</th>
                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Matches</th>
                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {leads.map((lead) => (
                     <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm font-medium text-white">{lead.fullName}</div>
                         <div className="text-xs text-gray-500">{lead.email}</div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                         ₹{(lead.income/1000).toFixed(0)}k
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                         {lead.employment}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/50 text-green-300 border border-green-500/20">
                           {lead.matchedCount} Cards
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {lead.timestamp ? new Date(lead.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}
                       </td>
                     </tr>
                   ))}
                   {leads.length === 0 && !loading && (
                     <tr>
                       <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                         No leads found yet. Go submit the form!
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
            </GlassCard>
         </div>
      </div>
    );
  };

  const FormPage = () => {
    const [localData, setLocalData] = useState({
      fullName: '',
      email: '',
      phone: '',
      employment: 'salaried',
      income: 50000,
      creditHistory: 'no', 
      pan: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      setFormData(localData);
      navigate('analysis');

      // Logic
      let matches = [];
      const isNewUser = localData.creditHistory === 'no';
      const income = parseInt(localData.income);

      if (isNewUser) {
        matches = MOCK_CARDS.filter(c => 
          c.category === 'beginner' || c.type === 'fd' || (c.category === 'cashback' && c.minIncome <= income)
        );
      } else {
        matches = MOCK_CARDS.filter(c => c.minIncome <= income);
        matches.sort((a, b) => b.minIncome - a.minIncome);
      }
      if (matches.length < 2 && !matches.find(m => m.id === 'securegrow')) {
        const fdCard = MOCK_CARDS.find(m => m.id === 'securegrow');
        if (fdCard) matches.push(fdCard);
      }
      setMatchedCards(matches);

      if (user) {
        try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leads'), {
            ...localData,
            userId: user.uid,
            timestamp: serverTimestamp(),
            matchedCount: matches.length
          });
        } catch (error) {
          console.error("Error saving lead:", error);
        }
      }
    };

    return (
      <div className="min-h-screen bg-[#0B0F1A] pt-28 px-4 relative overflow-hidden">
        <BackgroundBlob color="bg-purple-900" position="top-20 -right-20" size="w-96 h-96" />
        
        <div className="max-w-md mx-auto relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Find Your Match</h2>
            <p className="text-gray-400 mt-2">AI-driven card recommendations in 30 seconds.</p>
          </div>

          <GlassCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="block w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="e.g. Rahul Sharma"
                  value={localData.fullName}
                  onChange={e => setLocalData({...localData, fullName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Email</label>
                  <input 
                    required
                    type="email" 
                    className="block w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="name@mail.com"
                    value={localData.email}
                    onChange={e => setLocalData({...localData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Phone</label>
                  <input 
                    required
                    type="tel" 
                    className="block w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="9876543210"
                    value={localData.phone}
                    onChange={e => setLocalData({...localData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Employment</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Salaried', 'Self-Employed', 'Student'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLocalData({...localData, employment: type.toLowerCase()})}
                      className={`py-2 px-1 text-sm font-medium rounded-lg border transition-all ${
                        localData.employment === type.toLowerCase()
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                  Monthly Income: <span className="text-white">₹{localData.income.toLocaleString()}</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="200000" 
                  step="5000" 
                  value={localData.income}
                  onChange={e => setLocalData({...localData, income: e.target.value})}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Previous Credit History?</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 transition-colors ${localData.creditHistory === 'yes' ? 'border-blue-500' : 'border-gray-500'}`}>
                      {localData.creditHistory === 'yes' && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                    </div>
                    <input type="radio" className="hidden" name="history" value="yes" checked={localData.creditHistory === 'yes'} onChange={() => setLocalData({...localData, creditHistory: 'yes'})}/>
                    <span className="text-gray-300 group-hover:text-white">Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 transition-colors ${localData.creditHistory === 'no' ? 'border-blue-500' : 'border-gray-500'}`}>
                      {localData.creditHistory === 'no' && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                    </div>
                    <input type="radio" className="hidden" name="history" value="no" checked={localData.creditHistory === 'no'} onChange={() => setLocalData({...localData, creditHistory: 'no'})}/>
                    <span className="text-gray-300 group-hover:text-white">No (First Time)</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] transition-all"
              >
                Analyze Profile
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    );
  };

  const AnalysisLoader = () => {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center relative overflow-hidden text-white">
        <BackgroundBlob color="bg-blue-600" position="inset-0 m-auto" size="w-64 h-64" animationDuration="3s" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-32 h-32 relative">
             <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
               <CreditCard className="text-blue-400 animate-pulse" size={40} />
             </div>
          </div>
          
          <div className="mt-8 space-y-2 text-center">
             <h2 className="text-2xl font-bold animate-pulse">Analyzing Profile</h2>
             <div className="flex gap-2 text-sm text-gray-400">
                <span className="animate-bounce" style={{animationDelay: '0ms'}}>Connecting to bureaus...</span>
             </div>
          </div>
        </div>
        
        {/* Auto navigate effect */}
        {useEffect(() => {
           const timer = setTimeout(() => navigate('results'), 3500);
           return () => clearTimeout(timer);
        }, [])}
      </div>
    );
  };

  const ResultsPage = () => {
    return (
      <div className="min-h-screen bg-[#0B0F1A] pt-28 pb-12 px-4 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl font-bold">Matches Found</h1>
            <p className="text-gray-400 mt-2">Based on your {formData.income > 50000 ? 'premium' : 'standard'} profile, we found {matchedCards.length} cards.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {matchedCards.map((card, idx) => (
              <GlassCard key={card.id} hoverEffect={true} className="flex flex-col h-full">
                {/* Visual Card */}
                <div className={`h-48 bg-gradient-to-br ${card.gradient} p-6 relative flex flex-col justify-between`}>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mt-10 -mr-10"></div>
                   <div className="flex justify-between items-start z-10">
                      <span className="font-bold tracking-wider">{card.bank}</span>
                      {idx === 0 && <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs font-bold border border-white/20">BEST MATCH</span>}
                   </div>
                   <div className="z-10">
                      <h3 className="text-xl font-mono tracking-wide shadow-black drop-shadow-md">{card.name}</h3>
                      <div className="flex gap-2 mt-2">
                         <span className="text-[10px] bg-black/20 px-2 py-1 rounded">{card.type.toUpperCase()}</span>
                      </div>
                   </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col">
                   <div className="flex justify-between items-center mb-6 text-sm">
                      <div>
                         <p className="text-gray-400 text-xs uppercase">Fee</p>
                         <p className="font-bold text-lg">{card.annualFee === 0 ? 'Free' : `₹${card.annualFee}`}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-gray-400 text-xs uppercase">Rewards</p>
                         <p className="font-bold text-lg text-emerald-400">{card.rewardRate}</p>
                      </div>
                   </div>

                   <div className="space-y-3 mb-8 flex-1">
                      {card.benefits.map((b, i) => (
                        <div key={i} className="flex items-start text-sm text-gray-300">
                           <CheckCircle size={16} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0"/>
                           {b}
                        </div>
                      ))}
                   </div>

                   <button className="w-full py-3 rounded-lg border border-blue-500 text-blue-400 font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                      View Details
                   </button>
                </div>
              </GlassCard>
            ))}
          </div>
          
          <div className="mt-12 text-center">
             <button onClick={() => navigate('form')} className="text-gray-500 hover:text-white transition-colors underline">
                Wrong info? Retake quiz
             </button>
          </div>
        </div>
      </div>
    );
  };

  const BlogListPage = () => (
     <div className="min-h-screen bg-[#0B0F1A] pt-28 px-4 pb-12 text-white relative">
        <BackgroundBlob color="bg-emerald-900" position="top-40 right-0" size="w-96 h-96" />
        
        <div className="max-w-7xl mx-auto relative z-10">
           <div className="text-center mb-16">
              <h1 className="text-4xl font-bold mb-4">Financial <span className="text-blue-500">Wiki</span></h1>
              <p className="text-gray-400 max-w-2xl mx-auto">Mastering money isn't taught in school. We're fixing that.</p>
           </div>

           <div className="grid gap-8 md:grid-cols-3">
              {BLOGS.map((blog) => (
                 <GlassCard 
                    key={blog.id} 
                    hoverEffect={true} 
                    className="p-8 cursor-pointer group"
                 >
                    <div onClick={() => navigate('blog-detail', blog)}>
                       <div className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-wider">Guide</div>
                       <h3 className="text-xl font-bold mb-3 group-hover:text-blue-300 transition-colors">{blog.title}</h3>
                       <p className="text-gray-400 text-sm line-clamp-3 mb-6">{blog.summary}</p>
                       <div className="flex items-center text-sm font-medium text-white">
                          Read Now <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform"/>
                       </div>
                    </div>
                 </GlassCard>
              ))}
           </div>
        </div>
     </div>
  );

  const BlogDetail = () => {
    if (!selectedBlog) return null;
    return (
       <div className="min-h-screen bg-[#0B0F1A] pt-28 px-4 pb-12 text-white">
          <div className="max-w-3xl mx-auto">
             <button onClick={() => navigate('blog-list')} className="flex items-center text-gray-500 hover:text-white mb-8">
                <ArrowRight className="rotate-180 mr-2" size={20}/> Back
             </button>
             
             <GlassCard className="p-8 sm:p-12">
                <h1 className="text-3xl sm:text-4xl font-bold mb-6">{selectedBlog.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-white/10">
                   <span className="flex items-center"><Clock size={14} className="mr-1"/> {selectedBlog.readTime}</span>
                   <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                   <span>By GYC Team</span>
                </div>
                
                <div className="prose prose-invert prose-lg max-w-none">
                   <p className="text-xl text-blue-200 mb-8 font-light">{selectedBlog.summary}</p>
                   <p className="text-gray-300 leading-relaxed whitespace-pre-line">{selectedBlog.content}</p>
                </div>

                <div className="mt-12 p-6 bg-blue-900/20 border border-blue-500/20 rounded-xl">
                   <h4 className="font-bold text-blue-400 mb-2">Ready to apply?</h4>
                   <p className="text-sm text-gray-400 mb-4">Check which cards you are eligible for today.</p>
                   <button onClick={() => navigate('form')} className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors">Find My Card</button>
                </div>
             </GlassCard>
          </div>
       </div>
    );
  };

  // --- Main Render ---

  return (
    <div className="font-sans antialiased selection:bg-blue-500 selection:text-white">
      {view !== 'analysis' && <Header />}
      
      <main className="min-h-screen">
        {view === 'landing' && <LandingPage />}
        {view === 'form' && <FormPage />}
        {view === 'analysis' && <AnalysisLoader />}
        {view === 'results' && <ResultsPage />}
        {view === 'blog-list' && <BlogListPage />}
        {view === 'blog-detail' && <BlogDetail />}
        {view === 'admin' && <AdminPage />}
      </main>

      {view !== 'analysis' && <Footer />}
      
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob infinite;
        }
      `}</style>
    </div>
  );
}