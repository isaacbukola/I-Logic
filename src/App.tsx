import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  Home, 
  ShoppingBag, 
  Scale, 
  Stethoscope, 
  BarChart3, 
  GraduationCap, 
  Megaphone, 
  Cpu,
  Star,
  ArrowRight,
  Globe,
  Play,
  Send,
  CheckCircle2,
  Zap,
  Lightbulb,
  Code2,
  Rocket,
  MessageSquare,
  FileCode,
  Layout,
  Layers,
  Mic,
  BookOpen,
  ShieldCheck,
  Clock,
  Link
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from './firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

// --- Types ---

interface Solution {
  id: string;
  image: string;
  tag: string;
  title: string;
  rating: number;
  author: string;
  description: string;
  category: string;
}

interface SuccessStory {
  id: string;
  title: string;
  problem: string;
  solution: string;
  result: string;
  image: string;
}

interface IndustryData {
  id: string;
  name: string;
  heroTitle: string;
  challenges: { title: string; desc: string; icon: any }[];
  solutions: { title: string; desc: string; icon: any }[];
}

interface ServiceData {
  id: string;
  name: string;
  description: string;
  steps: { title: string; desc: string }[];
}

const getIndustryData = (name: string): IndustryData => {
  const data: Record<string, IndustryData> = {
    'Real Estate': {
      id: 'real-estate',
      name: 'Real Estate',
      heroTitle: 'Automate lead generation, property management, and client communication with custom AI architectures.',
      challenges: [
        { title: 'Lead Leakage', desc: 'Missing potential buyers who inquire after hours or during busy periods.', icon: MessageSquare },
        { title: 'Manual Follow-ups', desc: 'Spending hours every day sending repetitive emails and scheduling tours.', icon: Zap },
        { title: 'Data Overload', desc: 'Struggling to track property performance and market trends manually.', icon: BarChart3 }
      ],
      solutions: [
        { title: '24/7 AI Concierge', desc: 'An intelligent chatbot that qualifies leads and schedules viewings instantly.', icon: MessageSquare },
        { title: 'Automated CRM', desc: 'AI that categorizes leads and triggers personalized follow-up sequences.', icon: Layers },
        { title: 'Market Predictor', desc: 'Data-driven AI that analyzes local trends to suggest optimal pricing.', icon: BarChart3 }
      ]
    },
    'Legal': {
      id: 'legal',
      name: 'Legal',
      heroTitle: 'Streamline document review, case research, and administrative tasks with secure, private AI systems.',
      challenges: [
        { title: 'Document Fatigue', desc: 'Reviewing hundreds of pages of contracts and discovery documents manually.', icon: FileCode },
        { title: 'Research Time', desc: 'Spending billable hours searching through vast databases for relevant precedents.', icon: Search },
        { title: 'Admin Burden', desc: 'Managing complex schedules and client communications across multiple cases.', icon: Layout }
      ],
      solutions: [
        { title: 'Private Doc Brain', desc: 'A secure AI that can "read" and summarize thousands of pages in seconds.', icon: BookOpen },
        { title: 'Case Researcher', desc: 'AI-powered search that finds relevant case law and summarizes key points.', icon: Search },
        { title: 'Auto-Biller', desc: 'AI that tracks activity and generates accurate draft invoices automatically.', icon: BarChart3 }
      ]
    },
    'Healthcare': {
      id: 'healthcare',
      name: 'Healthcare',
      heroTitle: 'Enhance patient care and operational efficiency with intelligent scheduling and diagnostic support.',
      challenges: [
        { title: 'Patient Churn', desc: 'Losing patients due to long wait times or difficult booking processes.', icon: Stethoscope },
        { title: 'Paperwork Overload', desc: 'Clinicians spending more time on charts than with patients.', icon: FileCode },
        { title: 'Resource Gaps', desc: 'Inefficient staffing and equipment allocation based on guestimates.', icon: Layers }
      ],
      solutions: [
        { title: 'Smart Scheduler', desc: 'AI that optimizes appointments to reduce wait times and no-shows.', icon: Layout },
        { title: 'Voice Scribe', desc: 'AI that listens to consultations and drafts clinical notes automatically.', icon: Mic },
        { title: 'Predictive Ops', desc: 'AI that forecasts patient volume to optimize staffing and supplies.', icon: BarChart3 }
      ]
    },
    'E-commerce': {
      id: 'e-commerce',
      name: 'E-commerce',
      heroTitle: 'Scale your sales and customer satisfaction with personalized AI shopping experiences.',
      challenges: [
        { title: 'Cart Abandonment', desc: 'Losing customers at the final stage due to unanswered questions.', icon: ShoppingBag },
        { title: 'Generic Marketing', desc: 'Sending the same emails to everyone, resulting in low conversion.', icon: Megaphone },
        { title: 'Support Scaling', desc: 'Struggling to handle a surge in support tickets during peak seasons.', icon: MessageSquare }
      ],
      solutions: [
        { title: 'Shopping Assistant', desc: 'AI that provides real-time product recommendations and answers FAQs.', icon: ShoppingBag },
        { title: 'Personalized Engine', desc: 'AI that tailors the entire store experience to each individual user.', icon: Zap },
        { title: 'Auto-Support', desc: 'AI that handles 80% of routine inquiries like order tracking and returns.', icon: MessageSquare }
      ]
    }
  };
  return data[name] || data['Real Estate'];
};

// --- Components ---

const Header = ({ 
  isScrolled, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  searchQuery, 
  handleSearch, 
  setCurrentPage,
  currentPage,
  setSelectedIndustry,
  setSelectedService
}: { 
  isScrolled: boolean, 
  isMobileMenuOpen: boolean, 
  setIsMobileMenuOpen: (o: boolean) => void,
  searchQuery: string,
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void, 
  setCurrentPage: (p: 'home' | 'about' | 'process' | 'success' | 'contact' | 'industry' | 'service' | 'audit' | 'marketplace') => void,
  currentPage: string,
  setSelectedIndustry?: (data: IndustryData) => void,
  setSelectedService?: (data: ServiceData) => void
}) => {
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isMobileExploreOpen, setIsMobileExploreOpen] = useState(false);

  const megaMenuData = [
    {
      title: 'Browse by Industry',
      items: [
        { name: 'Real Estate', icon: Home, href: '#industries' },
        { name: 'Legal', icon: Scale, href: '#industries' },
        { name: 'Healthcare', icon: Stethoscope, href: '#industries' },
        { name: 'E-commerce', icon: ShoppingBag, href: '#industries' },
      ]
    },
    {
      title: 'Specialized AI Services',
      items: [
        { name: 'Custom Chatbots', icon: MessageSquare, href: '#solutions' },
        { name: 'Automation Scripts', icon: FileCode, href: '#solutions' },
        { name: 'AI Web Apps', icon: Layout, href: '#solutions' },
        { name: 'SaaS MVPs', icon: Layers, href: '#solutions' },
      ]
    },
    {
      title: 'Featured Technology',
      items: [
        { name: 'Voice AI Agents', icon: Mic, href: '#solutions' },
        { name: 'Private Document Brains', icon: BookOpen, href: '#solutions' },
        { name: 'Free AI Audit', icon: ShieldCheck, href: '#contact' },
      ]
    }
  ];

  const handleExploreClick = (href: string, type?: 'industry' | 'service', name?: string) => {
    setIsExploreOpen(false);
    setIsMobileMenuOpen(false);
    
    if (type === 'industry' && name && setSelectedIndustry) {
      const data = getIndustryData(name);
      setSelectedIndustry(data);
      setCurrentPage('industry');
      return;
    }

    if (type === 'service' && name && setSelectedService) {
      const data = getServiceData(name);
      setSelectedService(data);
      setCurrentPage('service');
      return;
    }

    if (name === 'Free AI Audit') {
      setCurrentPage('audit');
      return;
    }

    if (href === '#contact') {
      setCurrentPage('contact');
    } else if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-white py-5'
      }`}
      onMouseLeave={() => setIsExploreOpen(false)}
    >
      <div className="container-custom flex items-center justify-between">
        <div onClick={() => setCurrentPage('home')} className="cursor-pointer">
          <Logo />
        </div>

        {/* Desktop Search Bar (Only on Home, Hidden on Mobile) */}
        <div className={`hidden lg:flex flex-1 max-w-md mx-12 transition-opacity duration-300 ${currentPage === 'home' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="relative w-full group">
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search AI solutions..." 
              className="w-full pl-10 pr-4 py-2.5 bg-ilogic-gray border border-transparent focus:border-ilogic-blue focus:bg-white rounded-full text-sm transition-all outline-none"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-ilogic-blue transition-colors" size={18} />
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <div 
            className="relative"
            onMouseEnter={() => setIsExploreOpen(true)}
          >
            <button 
              className={`flex items-center gap-1 font-medium transition-colors py-2 group ${isExploreOpen ? 'text-ilogic-blue' : 'text-slate-600 hover:text-ilogic-blue'}`}
              onClick={() => setIsExploreOpen(!isExploreOpen)}
            >
              Explore
              <ChevronDown size={16} className={`mt-0.5 transition-transform duration-300 ${isExploreOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mega Menu */}
            <AnimatePresence>
              {isExploreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[800px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden p-8"
                >
                  <div className="grid grid-cols-3 gap-10">
                    {megaMenuData.map((column) => (
                      <div key={column.title}>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">{column.title}</h4>
                        <div className="flex flex-col gap-2">
                          {column.items.map((item) => (
                            <button
                              key={item.name}
                              onClick={() => handleExploreClick(
                                item.href, 
                                column.title === 'Browse by Industry' ? 'industry' : 
                                column.title === 'Specialized AI Services' ? 'service' : undefined,
                                item.name
                              )}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-ilogic-blue/5 group transition-all text-left"
                            >
                              <div className="w-10 h-10 rounded-lg bg-ilogic-gray flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                <item.icon size={20} className="text-slate-400 group-hover:text-ilogic-blue transition-colors" />
                              </div>
                              <span className="text-sm font-semibold text-slate-700 group-hover:text-ilogic-blue transition-colors">{item.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavLink href="#" onClick={() => setCurrentPage('about')}>About Us</NavLink>
          <NavLink href="#" onClick={() => setCurrentPage('process')}>Our Process</NavLink>
          <NavLink href="#" onClick={() => setCurrentPage('success')}>Success Stories</NavLink>
          <NavLink href={currentPage === 'home' ? "#solutions" : "#"} onClick={() => { if(currentPage !== 'home') setCurrentPage('home') }}>Solutions</NavLink>
          <button 
            onClick={() => setCurrentPage('contact')}
            className="bg-ilogic-blue text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-ilogic-blue/20"
          >
            Get Started
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="container-custom py-6 flex flex-col gap-4">
              {currentPage === 'home' && (
                <div className="relative w-full mb-4">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search AI solutions..." 
                    className="w-full pl-10 pr-4 py-3 bg-ilogic-gray rounded-xl text-sm outline-none focus:ring-2 focus:ring-ilogic-blue"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              )}
              
              {/* Mobile Accordion for Explore */}
              <div className="flex flex-col">
                <button 
                  className="flex items-center justify-between py-3 text-slate-600 font-medium"
                  onClick={() => setIsMobileExploreOpen(!isMobileExploreOpen)}
                >
                  Explore
                  <ChevronDown size={20} className={`transition-transform duration-300 ${isMobileExploreOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isMobileExploreOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden flex flex-col gap-2 pl-4 border-l-2 border-ilogic-gray ml-2"
                    >
                      {megaMenuData.map((column) => (
                        <div key={column.title} className="py-2">
                          <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{column.title}</h5>
                          <div className="flex flex-col gap-1">
                            {column.items.map((item) => (
                              <button
                                key={item.name}
                                onClick={() => handleExploreClick(
                                  item.href, 
                                  column.title === 'Browse by Industry' ? 'industry' : 
                                  column.title === 'Specialized AI Services' ? 'service' : undefined,
                                  item.name
                                )}
                                className="flex items-center gap-3 py-2 text-sm text-slate-600 hover:text-ilogic-blue"
                              >
                                <item.icon size={16} />
                                {item.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink href="#" onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }}>Home</NavLink>
              <NavLink href="#" onClick={() => { setCurrentPage('about'); setIsMobileMenuOpen(false); }}>About Us</NavLink>
              <NavLink href="#" onClick={() => { setCurrentPage('process'); setIsMobileMenuOpen(false); }}>Our Process</NavLink>
              <NavLink href="#" onClick={() => { setCurrentPage('success'); setIsMobileMenuOpen(false); }}>Success Stories</NavLink>
              <NavLink href="#solutions" onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }}>Solutions</NavLink>
              <button 
                onClick={() => { setCurrentPage('contact'); setIsMobileMenuOpen(false); }}
                className="w-full bg-ilogic-blue text-white py-3 rounded-xl font-bold mt-2 transform active:scale-95 transition-transform"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const Footer = ({ setCurrentPage, onLogoClick }: { setCurrentPage: (p: 'home' | 'about' | 'process' | 'success' | 'contact' | 'industry' | 'service' | 'audit') => void, onLogoClick: () => void }) => (
  <footer className="bg-slate-900 text-white py-20">
    <div className="container-custom">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div 
              className="w-8 h-8 bg-ilogic-blue rounded flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onLogoClick();
              }}
            >
              <span className="text-white font-bold">I</span>
            </div>
            <span className="text-xl font-display font-bold tracking-tight">LOGIC AI</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Leading the way in practical AI implementation for businesses of all sizes. Find the tools you need to scale.
          </p>
          <div className="flex gap-4">
            {['twitter', 'linkedin', 'github'].map(social => (
              <a key={social} href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-ilogic-blue transition-colors">
                <span className="sr-only">{social}</span>
                <div className="w-5 h-5 bg-slate-400 rounded-sm"></div>
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-display font-bold mb-6">Solutions</h4>
          <ul className="flex flex-col gap-4 text-slate-400 text-sm">
            <li><a href="#" onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">AI Sales Agents</a></li>
            <li><a href="#" onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Customer Support</a></li>
            <li><a href="#" onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Content Automation</a></li>
            <li><a href="#" onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Data Analytics</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-6">Company</h4>
          <ul className="flex flex-col gap-4 text-slate-400 text-sm">
            <li><a href="#" onClick={() => setCurrentPage('about')} className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" onClick={() => setCurrentPage('process')} className="hover:text-white transition-colors">Our Process</a></li>
            <li><a href="#" onClick={() => setCurrentPage('success')} className="hover:text-white transition-colors">Success Stories</a></li>
            <li><a href="#" onClick={() => setCurrentPage('audit')} className="hover:text-white transition-colors font-bold text-ilogic-blue">Free AI Audit</a></li>
            <li><a href="#" onClick={() => setCurrentPage('contact')} className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-6">Newsletter</h4>
          <p className="text-slate-400 text-sm mb-4">Get the latest AI insights delivered to your inbox.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-slate-800 border-none rounded-lg px-4 py-2 text-sm flex-grow outline-none focus:ring-2 focus:ring-ilogic-blue"
            />
            <button className="bg-ilogic-blue p-2 rounded-lg hover:bg-blue-600 transition-colors">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
        <p>© 2026 I-Logic AI Marketplace. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
        </div>
      </div>
    </div>
  </footer>
);

const MarketplacePage = ({ 
  filteredSolutions, 
  setSelectedSolution, 
  searchQuery, 
  handleSearch, 
  handleQuickSearch 
}: { 
  filteredSolutions: Solution[], 
  setSelectedSolution: (s: Solution) => void,
  searchQuery: string,
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void,
  handleQuickSearch: (tag: string) => void
}) => {
  const categories = ["All", "Sales", "Marketing", "Support", "Operations", "Creative", "Finance", "Legal", "Technology", "Healthcare", "Education"];
  const [activeCategory, setActiveCategory] = useState("All");

  const finalSolutions = useMemo(() => {
    let results = filteredSolutions;
    if (activeCategory !== "All") {
      results = results.filter(s => s.category === activeCategory);
    }
    return results;
  }, [filteredSolutions, activeCategory]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-12"
    >
      {/* Hero Section */}
      <section className="bg-ilogic-gray py-20 lg:py-28 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <span className="text-ilogic-blue font-bold uppercase tracking-[0.2em] text-sm mb-4 block">AI Marketplace</span>
            <h1 className="text-4xl md:text-7xl font-display font-bold text-slate-900 mb-8 leading-tight">
              Everything AI can do for your <span className="text-ilogic-blue">Business.</span>
            </h1>
            <p className="text-slate-600 text-xl mb-10 leading-relaxed">
              Browse our extensive library of ready-to-deploy AI solutions. From copywriting to complex data analysis, we have the tools to scale your operations.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-ilogic-blue transition-colors" size={24} />
              <input 
                type="text" 
                placeholder="Search for a solution (e.g. 'Email Design', 'Copywriting')..." 
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-16 pr-6 py-6 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 outline-none focus:ring-4 focus:ring-ilogic-blue/10 focus:border-ilogic-blue transition-all text-lg"
              />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-ilogic-blue/5 -skew-x-12 translate-x-1/4"></div>
      </section>

      {/* Categories & Grid */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                  activeCategory === cat 
                    ? "bg-ilogic-blue text-white shadow-lg shadow-ilogic-blue/20" 
                    : "bg-ilogic-gray text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Solutions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {finalSolutions.map((solution) => (
                <motion.div
                  key={solution.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8 }}
                >
                  <SolutionCard 
                    solution={solution} 
                    onOpenDemo={setSelectedSolution} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {finalSolutions.length === 0 && (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-ilogic-gray rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">No solutions found</h3>
              <p className="text-slate-500">Try a different search term or category.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-ilogic-blue">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-8">Don't see what you're looking for?</h2>
          <p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto">
            We build custom AI architectures tailored to your specific business needs. Let's discuss your project.
          </p>
          <button 
            onClick={() => handleQuickSearch('')}
            className="bg-white text-ilogic-blue px-12 py-5 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
          >
            Book a Custom Consultation
          </button>
        </div>
      </section>
    </motion.div>
  );
};

const HomePage = ({ 
  searchQuery, 
  handleSearch, 
  handleQuickSearch, 
  industries, 
  filteredSolutions, 
  setSelectedSolution,
  setCurrentPage,
  setSelectedIndustry,
  setSelectedService
}: { 
  searchQuery: string, 
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void,
  handleQuickSearch: (tag: string) => void,
  industries: any[],
  filteredSolutions: Solution[],
  setSelectedSolution: (s: Solution) => void,
  setCurrentPage: (p: any) => void,
  setSelectedIndustry: (data: IndustryData) => void,
  setSelectedService: (data: ServiceData) => void
}) => (
  <>
    {/* Hero Section */}
    <section className="bg-ilogic-gray py-20 lg:py-32 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-ilogic-blue/5 to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-ilogic-blue/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container-custom relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-slate-900 leading-[1.1] mb-6">
            Empower Your Business with <span className="text-ilogic-blue">Custom AI Solutions.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            The marketplace for high-performance AI apps, websites, and automations tailored to your industry needs.
          </p>
        </motion.div>

        {/* The Alison Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 border border-slate-100 group focus-within:ring-4 focus-within:ring-ilogic-blue/10 transition-all">
            <div className="flex-grow relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearch}
                placeholder="What AI solution does your business need today?" 
                className="w-full pl-12 pr-4 py-4 text-lg bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ilogic-blue" size={24} />
            </div>
            <button 
              onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-ilogic-blue text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-95"
            >
              Search
            </button>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="text-sm text-slate-500 font-medium">Popular:</span>
            {['Sales', 'Legal', 'Marketing', 'Real Estate'].map((tag) => (
              <button 
                key={tag} 
                onClick={() => handleQuickSearch(tag)}
                className="text-xs font-bold text-slate-600 hover:text-ilogic-blue hover:border-ilogic-blue bg-white px-3 py-1 rounded-full border border-slate-200 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    {/* Industry Grid Section */}
    <section id="industries" className="py-24 bg-white scroll-mt-24">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Explore AI by Industry</h2>
            <div className="h-1.5 w-24 bg-ilogic-blue rounded-full"></div>
          </div>
          <a href="#industries" className="text-ilogic-blue font-bold flex items-center gap-2 group">
            View All Industries <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry, index) => (
            <motion.div
              key={industry.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <IndustryCard 
                icon={industry.icon} 
                title={industry.title} 
                onClick={() => {
                  const data = getIndustryData(industry.title);
                  setSelectedIndustry(data);
                  setCurrentPage('industry');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Featured Solutions Section */}
    <section id="solutions" className="py-24 bg-ilogic-gray scroll-mt-24 min-h-[600px]">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Trending AI Solutions"}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {searchQuery 
              ? `Found ${filteredSolutions.length} solutions matching your search.`
              : "Discover our most popular ready-to-deploy AI agents and platforms that are transforming businesses worldwide."
            }
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredSolutions.map((solution) => (
              <motion.div
                key={solution.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                className="h-full"
              >
                <SolutionCard 
                  solution={solution} 
                  onOpenDemo={setSelectedSolution} 
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredSolutions.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Search size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 mb-2">No solutions found</h3>
            <p className="text-slate-500 mb-8">Try adjusting your search terms or browse by industry.</p>
            <button 
              onClick={() => handleQuickSearch('')}
              className="text-ilogic-blue font-bold hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        <div className="mt-16 text-center">
          <button 
            onClick={() => {
              setCurrentPage('marketplace');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 border-2 border-ilogic-blue text-ilogic-blue px-8 py-3.5 rounded-full font-bold hover:bg-ilogic-blue hover:text-white transition-all transform hover:scale-105 active:scale-95"
          >
            Explore Marketplace <Globe size={20} />
          </button>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-24 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="bg-ilogic-blue rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <path d="M0,200 Q100,100 200,200 T400,200" fill="none" stroke="white" strokeWidth="2" />
              <path d="M0,250 Q100,150 200,250 T400,250" fill="none" stroke="white" strokeWidth="2" />
              <path d="M0,300 Q100,200 200,300 T400,300" fill="none" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              Need a custom AI solution for your unique business?
            </h2>
            <p className="text-blue-100 text-lg mb-10">
              Our expert engineers can build, deploy, and scale custom AI architectures tailored specifically to your workflow.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setCurrentPage('contact')}
                className="bg-white text-ilogic-blue px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 active:scale-95"
              >
                Book a Consultation
              </button>
              <button 
                onClick={() => setCurrentPage('success')}
                className="bg-blue-600/30 text-white border border-blue-400/30 backdrop-blur-sm px-8 py-4 rounded-xl font-bold hover:bg-blue-600/50 transition-all transform hover:scale-105 active:scale-95"
              >
                View Case Studies
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </>
);

const AboutPage = ({ 
  getImg
}: { 
  getImg: (key: string, fallback: string) => string 
}) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="pt-12"
  >
    {/* Mission Section */}
    <section className="bg-ilogic-gray py-24 lg:py-32 relative overflow-hidden">
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-ilogic-blue font-bold uppercase tracking-[0.2em] text-sm mb-4 block"
          >
            Our Mission
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold text-slate-900 leading-tight mb-8"
          >
            Bridging the gap between complex AI technology and <span className="text-ilogic-blue">practical business growth.</span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="h-1.5 w-24 bg-ilogic-blue rounded-full mx-auto"
          ></motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-ilogic-blue/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-ilogic-blue/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
    </section>

    {/* Founder Section */}
    <section className="py-24 bg-white">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-ilogic-blue rounded-3xl -z-10"></div>
              <img 
                src={getImg('founder', "https://picsum.photos/seed/founder/800/1000")} 
                alt="Isaac - Founder" 
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20">
                <h3 className="text-2xl font-display font-bold text-slate-900">Isaac</h3>
                <p className="text-ilogic-blue font-semibold">Founder & Lead AI Architect</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6">The Vision Behind I-Logic AI</h2>
            <p className="text-slate-600 text-lg mb-6 leading-relaxed">
              With over a decade of experience in software architecture and machine learning, Isaac founded I-Logic AI with a singular goal: to democratize high-performance AI for businesses that need results, not just hype.
            </p>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              "We don't just build models; we build solutions that integrate seamlessly into your existing workflows, driving measurable ROI from day one."
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="block text-3xl font-display font-bold text-ilogic-blue mb-1">10+</span>
                <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">Years Experience</span>
              </div>
              <div>
                <span className="block text-3xl font-display font-bold text-ilogic-blue mb-1">50+</span>
                <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">AI Deployments</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Core Values Section */}
    <section className="py-24 bg-ilogic-gray">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Our Core Values</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">The principles that guide every solution we build and every partnership we form.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: "Innovation", 
              desc: "We stay at the bleeding edge of AI research to bring you the most advanced capabilities before your competitors.",
              icon: Zap
            },
            { 
              title: "Transparency", 
              desc: "No black boxes. We explain how our AI works, what it can do, and exactly how it will impact your bottom line.",
              icon: Globe
            },
            { 
              title: "Results", 
              desc: "We measure success by your growth. Every deployment is optimized for performance, efficiency, and ROI.",
              icon: BarChart3
            }
          ].map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-slate-100 group"
            >
              <div className="w-14 h-14 bg-ilogic-gray rounded-2xl flex items-center justify-center mb-6 group-hover:bg-ilogic-blue group-hover:text-white transition-all">
                <value.icon size={28} />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 mb-4">{value.title}</h3>
              <p className="text-slate-500 leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA Section (Reused Style) */}
    <section className="py-24 bg-white">
      <div className="container-custom text-center">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-8">Ready to start your AI journey?</h2>
        <button className="bg-ilogic-blue text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-ilogic-blue/20">
          Get Started Today
        </button>
      </div>
    </section>
  </motion.div>
);

const ProcessPage = ({ getImg }: { getImg: (k: string, f: string) => string }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="pt-12"
  >
    {/* Hero Section */}
    <section className="bg-ilogic-gray py-24 lg:py-32 relative overflow-hidden">
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-ilogic-blue font-bold uppercase tracking-[0.2em] text-sm mb-4 block"
          >
            Our Methodology
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold text-slate-900 leading-tight mb-8"
          >
            A streamlined path to <span className="text-ilogic-blue">AI excellence.</span>
          </motion.h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            We've refined our process to ensure every AI deployment is efficient, secure, and perfectly aligned with your business goals.
          </p>
        </div>
      </div>
    </section>

    {/* Timeline Section */}
    <section className="py-24 bg-white">
      <div className="container-custom">
        <div className="relative">
          {/* Vertical Line (Desktop) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-100 -translate-x-1/2 hidden lg:block"></div>

          <div className="space-y-24 relative">
            {[
              {
                phase: "Phase 1",
                title: "Discovery Audit",
                desc: "We analyze your manual tasks and identify high-impact opportunities for AI automation.",
                icon: Search,
                align: "left"
              },
              {
                phase: "Phase 2",
                title: "AI Strategy",
                desc: "We design your custom solution, selecting the right models and architecture for your needs.",
                icon: Lightbulb,
                align: "right"
              },
              {
                phase: "Phase 3",
                title: "Rapid Build",
                desc: "Using AI Studio to build your tool in days, not months. We prioritize speed without sacrificing quality.",
                icon: Code2,
                align: "left"
              },
              {
                phase: "Phase 4",
                title: "Launch & Scale",
                desc: "Seamless integration into your business workflows with ongoing support and optimization.",
                icon: Rocket,
                align: "right"
              }
            ].map((step, index) => (
              <motion.div 
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col lg:flex-row items-center gap-12 ${step.align === 'right' ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* Content */}
                <div className={`w-full lg:w-1/2 ${step.align === 'left' ? 'lg:text-right' : 'lg:text-left'}`}>
                  <span className="text-ilogic-blue font-bold text-sm uppercase tracking-widest mb-2 block">{step.phase}</span>
                  <h3 className="text-3xl font-display font-bold text-slate-900 mb-4">{step.title}</h3>
                  <p className="text-slate-600 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                    {step.desc}
                  </p>
                </div>

                {/* Icon Circle */}
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white border-4 border-ilogic-gray rounded-full flex items-center justify-center shadow-xl group hover:border-ilogic-blue transition-colors">
                    <step.icon className="text-ilogic-blue" size={32} />
                  </div>
                </div>

                {/* Spacer for desktop */}
                <div className="hidden lg:block lg:w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Why AI Studio Section */}
    <section className="py-24 bg-ilogic-gray">
      <div className="container-custom">
        <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-xl border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6">Built with AI Studio</h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                By leveraging Google's AI Studio, we bypass the traditional months-long development cycles. This allows us to prototype, test, and deploy production-ready AI tools at a fraction of the cost and time.
              </p>
              <ul className="space-y-4">
                {[
                  "Rapid prototyping in days",
                  "Enterprise-grade security",
                  "Seamless model integration",
                  "Scalable infrastructure"
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="text-ilogic-blue" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-ilogic-blue/5 rounded-3xl blur-2xl"></div>
              <img 
                src={getImg('process_tech', "https://picsum.photos/seed/tech/800/600")} 
                alt="AI Studio Workflow" 
                className="relative z-10 rounded-3xl shadow-lg w-full"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </motion.div>
);

const SuccessStoriesPage = ({ setCurrentPage, getImg }: { setCurrentPage: (p: any) => void, getImg: (k: string, f: string) => string }) => {
  const stories: SuccessStory[] = [
    {
      id: '1',
      title: 'Real Estate Automation',
      problem: 'Missing 50% of leads after hours.',
      solution: 'Custom AI Chatbot integration.',
      result: '30% increase in booked appointments.',
      image: getImg('story_1', 'https://picsum.photos/seed/realestate/800/600')
    },
    {
      id: '2',
      title: 'Legal Document Review',
      problem: 'Manual review taking 20+ hours per week.',
      solution: 'AI-powered risk assessment tool.',
      result: 'Review time reduced to under 2 hours.',
      image: getImg('story_2', 'https://picsum.photos/seed/legalstory/800/600')
    },
    {
      id: '3',
      title: 'E-commerce Support',
      problem: 'High support ticket volume during sales.',
      solution: 'Intelligent NLP support portal.',
      result: '70% reduction in manual ticket handling.',
      image: getImg('story_3', 'https://picsum.photos/seed/shopstory/800/600')
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-12"
    >
      <section className="bg-ilogic-gray py-24 lg:py-32">
        <div className="container-custom text-center">
          <span className="text-ilogic-blue font-bold uppercase tracking-[0.2em] text-sm mb-4 block">Case Studies</span>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-8">Success Stories</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            See how I-Logic AI is helping businesses across industries scale with custom AI solutions.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {stories.map((story) => (
              <motion.div 
                key={story.id}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full"
              >
                <div className="h-48 overflow-hidden">
                  <img src={story.image} alt={story.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-display font-bold text-slate-900 mb-6">{story.title}</h3>
                  
                  <div className="space-y-6 mb-8">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">The Problem</span>
                      <p className="text-slate-600 font-medium">{story.problem}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">The Solution</span>
                      <p className="text-slate-600 font-medium">{story.solution}</p>
                    </div>
                    <div className="p-4 bg-ilogic-gray rounded-xl border-l-4 border-ilogic-blue">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ilogic-blue block mb-1">The Result</span>
                      <p className="text-slate-900 font-bold">{story.result}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-8">Ready to be our next success story?</h2>
            <button 
              onClick={() => setCurrentPage('contact')}
              className="bg-ilogic-blue text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-ilogic-blue/20"
            >
              Start Your Success Story
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const ContactPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: json
      });
      const result = await response.json();
      if (result.success) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("There was an error sending your message. Please try again.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-12"
    >
      <section className="bg-ilogic-gray py-24 lg:py-32">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-8">Get in Touch</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-12">
            Ready to transform your business with AI? Let's discuss your project.
          </p>
          <div className="max-w-xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
            {!isSubmitted ? (
              <form 
                action="https://api.web3forms.com/submit" 
                method="POST"
                onSubmit={handleSubmit}
                className="flex flex-col gap-6 text-left"
              >
                <input type="hidden" name="access_key" value="74ae6f89-a5ae-4aca-8532-2e711f2df794" />
                <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                  <input required name="name" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ilogic-blue outline-none transition-all" placeholder="John Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Work Email</label>
                  <input required name="email" type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ilogic-blue outline-none transition-all" placeholder="john@company.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Message</label>
                  <textarea name="message" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ilogic-blue outline-none transition-all h-32 resize-none" placeholder="Tell us about your project..."></textarea>
                </div>
                <button type="submit" className="w-full py-4 bg-ilogic-blue text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg shadow-ilogic-blue/20">
                  Send Message
                </button>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Message Received!</h3>
                <p className="text-slate-600">
                  Isaac from I-Logic AI will contact you shortly.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const AuditPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: json
      });
      const result = await response.json();
      if (result.success) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("There was an error sending your request. Please try again.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-12 pb-24 bg-ilogic-gray min-h-screen"
    >
      <div className="container-custom max-w-3xl">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-ilogic-blue/10 text-ilogic-blue px-4 py-2 rounded-full text-sm font-bold mb-6"
          >
            <ShieldCheck size={16} />
            Free Business Efficiency Audit
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6">
            Let's Find Your <span className="text-ilogic-blue">AI Opportunity.</span>
          </h1>
          <p className="text-slate-600 text-lg">
            Answer 4 simple questions to receive a custom AI implementation roadmap for your business.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
          {!isSubmitted ? (
            <form 
              action="https://api.web3forms.com/submit" 
              method="POST"
              onSubmit={handleSubmit} 
              className="space-y-8"
            >
              <input type="hidden" name="access_key" value="74ae6f89-a5ae-4aca-8532-2e711f2df794" />
              <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">What is your Industry?</label>
                <select name="industry" className="w-full px-6 py-4 bg-ilogic-gray border border-transparent focus:border-ilogic-blue focus:bg-white rounded-2xl outline-none transition-all appearance-none cursor-pointer">
                  <option>Real Estate</option>
                  <option>Legal</option>
                  <option>Healthcare</option>
                  <option>E-commerce</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">How many hours a week does your team spend on manual tasks?</label>
                <input 
                  name="manual_hours"
                  type="text" 
                  placeholder="e.g. 20+ hours"
                  className="w-full px-6 py-4 bg-ilogic-gray border border-transparent focus:border-ilogic-blue focus:bg-white rounded-2xl outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">What is your biggest bottleneck?</label>
                <textarea 
                  name="bottleneck"
                  placeholder="Describe the task that slows you down the most..."
                  className="w-full px-6 py-4 bg-ilogic-gray border border-transparent focus:border-ilogic-blue focus:bg-white rounded-2xl outline-none transition-all min-h-[120px] resize-none"
                  required
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Your Email</label>
                <input 
                  name="email"
                  type="email" 
                  placeholder="name@company.com"
                  className="w-full px-6 py-4 bg-ilogic-gray border border-transparent focus:border-ilogic-blue focus:bg-white rounded-2xl outline-none transition-all"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-ilogic-blue text-white py-5 rounded-2xl font-bold text-xl hover:bg-blue-800 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-ilogic-blue/20 flex items-center justify-center gap-3"
              >
                Get My Free AI Audit
                <ArrowRight size={20} />
              </button>

              <p className="text-center text-slate-400 text-sm">
                No credit card required. Your data is 100% secure.
              </p>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Message Received!</h2>
              <p className="text-slate-600 mb-8">
                Isaac from I-Logic AI will contact you shortly.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="text-ilogic-blue font-bold hover:underline"
              >
                Submit another audit
              </button>
            </motion.div>
          )}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-400">
            <ShieldCheck size={20} />
            SECURE
          </div>
          <div className="flex items-center justify-center gap-2 font-bold text-slate-400">
            <Zap size={20} />
            FAST
          </div>
          <div className="flex items-center justify-center gap-2 font-bold text-slate-400">
            <BarChart3 size={20} />
            DATA-DRIVEN
          </div>
          <div className="flex items-center justify-center gap-2 font-bold text-slate-400">
            <MessageSquare size={20} />
            EXPERT-LED
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ServicePage = ({ data, setCurrentPage }: { data: ServiceData, setCurrentPage: (p: any) => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="pt-12"
  >
    {/* Hero Section */}
    <section className="bg-slate-900 py-24 lg:py-32 relative overflow-hidden text-white">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-ilogic-blue/10 skew-x-12 translate-x-1/4"></div>
      <div className="container-custom relative z-10">
        <div className="max-w-3xl">
          <span className="text-ilogic-blue font-bold uppercase tracking-[0.2em] text-sm mb-4 block">Premium AI Service</span>
          <h1 className="text-4xl md:text-7xl font-display font-bold mb-8 leading-tight">
            Enterprise-Grade <span className="text-ilogic-blue">{data.name}</span>
          </h1>
          <p className="text-slate-400 text-xl mb-10 leading-relaxed">
            {data.description}
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setCurrentPage('contact')}
              className="bg-ilogic-blue text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-ilogic-blue/20"
            >
              Get a Quote for {data.name}
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* Feature Grid */}
    <section className="py-24 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: 'Speed', desc: 'Lightning-fast processing and response times.', icon: Zap },
            { title: 'Accuracy', desc: 'Precision-tuned models for reliable outputs.', icon: CheckCircle2 },
            { title: '24/7 Availability', desc: 'Always-on systems that never sleep.', icon: Clock },
            { title: 'Seamless Integration', desc: 'Works perfectly with your existing tech stack.', icon: Link }
          ].map((feature, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-ilogic-gray border border-slate-100 text-center hover:border-ilogic-blue/30 transition-colors">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm text-ilogic-blue">
                <feature.icon size={32} />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it Works */}
    <section className="py-24 bg-ilogic-gray">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">How It Works</h2>
          <p className="text-slate-600">Our streamlined 3-step process to build your custom {data.name}.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
          
          {data.steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-ilogic-blue text-white flex items-center justify-center text-2xl font-bold mb-8 shadow-lg shadow-ilogic-blue/30">
                {idx + 1}
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing/Quote Section */}
    <section className="py-24 bg-white">
      <div className="container-custom">
        <div className="bg-ilogic-blue rounded-[3rem] p-12 lg:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-8">Ready to deploy your {data.name}?</h2>
            <p className="text-blue-100 text-xl mb-12">
              Join the elite businesses leveraging I-Logic AI to automate their growth and dominate their market.
            </p>
            <button 
              onClick={() => setCurrentPage('contact')}
              className="bg-white text-ilogic-blue px-12 py-5 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
            >
              Get a Quote for {data.name}
            </button>
          </div>
        </div>
      </div>
    </section>
  </motion.div>
);

const IndustryPage = ({ data, setCurrentPage }: { data: IndustryData, setCurrentPage: (p: any) => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="pt-12"
  >
    {/* Hero Section */}
    <section className="bg-ilogic-gray py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-ilogic-blue/5 -skew-x-12 translate-x-1/2"></div>
      <div className="container-custom relative z-10">
        <div className="max-w-3xl">
          <span className="text-ilogic-blue font-bold uppercase tracking-[0.2em] text-sm mb-4 block">Industry Solutions</span>
          <h1 className="text-4xl md:text-7xl font-display font-bold text-slate-900 mb-8 leading-tight">
            AI Solutions for <span className="text-ilogic-blue">{data.name}</span>
          </h1>
          <p className="text-slate-600 text-xl mb-10 leading-relaxed">
            {data.heroTitle}
          </p>
          <button 
            onClick={() => setCurrentPage('contact')}
            className="bg-ilogic-blue text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-ilogic-blue/20"
          >
            Book a {data.name} AI Consultation
          </button>
        </div>
      </div>
    </section>

    {/* Pain Points Section */}
    <section className="py-24 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Common Challenges</h2>
          <div className="h-1.5 w-24 bg-ilogic-blue rounded-full mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.challenges.map((challenge, idx) => (
            <div key={idx} className="p-10 rounded-3xl bg-ilogic-gray border border-slate-100 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-ilogic-blue group-hover:text-white transition-all shadow-sm">
                <challenge.icon size={28} />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 mb-4">{challenge.title}</h3>
              <p className="text-slate-500 leading-relaxed">{challenge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* AI Solution Section */}
    <section className="py-24 bg-slate-900 text-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Our AI Solutions</h2>
          <p className="text-slate-400">Tailored tools designed to solve your industry's specific bottlenecks.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {data.solutions.map((solution, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-ilogic-blue/20 flex items-center justify-center mb-8 border border-ilogic-blue/30">
                <solution.icon size={36} className="text-ilogic-blue" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">{solution.title}</h3>
              <p className="text-slate-400 leading-relaxed">{solution.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-24 bg-ilogic-blue">
      <div className="container-custom text-center">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-8">Ready to transform your {data.name} business?</h2>
        <button 
          onClick={() => setCurrentPage('contact')}
          className="bg-white text-ilogic-blue px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
        >
          Book Your AI Audit Now
        </button>
      </div>
    </section>
  </motion.div>
);

const Logo = () => (
  <a href="#" className="flex items-center gap-2 group cursor-pointer">
    <div className="relative w-10 h-10 bg-ilogic-blue rounded-lg flex items-center justify-center overflow-hidden shadow-lg shadow-ilogic-blue/20">
      <span className="text-white font-display font-bold text-2xl z-10">I</span>
      <motion.div 
        className="absolute inset-0 flex items-center justify-center opacity-30"
        animate={{ x: [-20, 20] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-full h-[2px] bg-white"></div>
      </motion.div>
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-xl font-display font-bold tracking-tight text-slate-900">LOGIC AI</span>
      <span className="text-[10px] font-sans font-semibold tracking-[0.2em] text-ilogic-blue uppercase">Marketplace</span>
    </div>
  </a>
);

const NavLink = ({ href, children, hasDropdown = false, onClick }: { href: string, children: React.ReactNode, hasDropdown?: boolean, onClick?: () => void }) => (
  <a 
    href={href} 
    onClick={onClick}
    className="flex items-center gap-1 text-slate-600 hover:text-ilogic-blue font-medium transition-colors py-2 group"
  >
    {children}
    {hasDropdown && <ChevronDown size={16} className="mt-0.5 group-hover:rotate-180 transition-transform duration-300" />}
  </a>
);

const IndustryCard = ({ icon: Icon, title, onClick }: { icon: any, title: string, onClick?: () => void }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer"
  >
    <div className="w-16 h-16 rounded-full bg-ilogic-gray flex items-center justify-center mb-6 group-hover:bg-ilogic-blue/10 transition-colors">
      <Icon className="text-ilogic-blue" size={32} />
    </div>
    <h3 className="text-lg font-display font-semibold mb-2 text-slate-900">{title}</h3>
    <span className="text-ilogic-blue font-medium text-sm flex items-center gap-1 hover:underline">
      Explore Solutions <ArrowRight size={14} />
    </span>
  </motion.div>
);

const SolutionCard = ({ solution, onOpenDemo }: { solution: Solution, onOpenDemo: (s: Solution) => void }) => (
  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
    <div className="relative h-48 overflow-hidden">
      <img 
        src={solution.image} 
        alt={solution.title} 
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-3 left-3">
        <span className="bg-white/90 backdrop-blur-sm text-ilogic-blue text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm border border-slate-100">
          {solution.tag}
        </span>
      </div>
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <h3 className="text-lg font-display font-bold text-slate-900 mb-2 line-clamp-2 min-h-[3.5rem]">
        {solution.title}
      </h3>
      <div className="flex items-center gap-1 mb-4">
        <div className="flex text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill={i < Math.floor(solution.rating) ? "currentColor" : "none"} />
          ))}
        </div>
        <span className="text-xs font-bold text-slate-700">{solution.rating.toFixed(1)}</span>
        <span className="text-xs text-slate-400 ml-auto">{solution.author}</span>
      </div>
      <button 
        onClick={() => onOpenDemo(solution)}
        className="mt-auto w-full py-3 bg-ilogic-gray hover:bg-ilogic-blue hover:text-white text-ilogic-blue font-bold rounded-lg transition-all duration-300 transform active:scale-95"
      >
        View Demo
      </button>
    </div>
  </div>
);

const DemoModal = ({ solution, onClose }: { solution: Solution, onClose: () => void }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Left: Video Placeholder */}
        <div className="w-full md:w-3/5 bg-slate-900 relative aspect-video md:aspect-auto flex items-center justify-center group">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
          <img 
            src={solution.image} 
            alt="Video preview" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="relative z-20 text-center p-8">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-20 h-20 bg-ilogic-blue text-white rounded-full flex items-center justify-center shadow-2xl shadow-ilogic-blue/40 mb-6 mx-auto"
            >
              <Play fill="currentColor" size={32} className="ml-1" />
            </motion.button>
            <h3 className="text-white text-2xl font-display font-bold mb-2">{solution.title}</h3>
            <p className="text-slate-300 text-sm">Experience the power of {solution.category} AI</p>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 z-30 md:hidden bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* Right: Contact Form */}
        <div className="w-full md:w-2/5 p-8 md:p-10 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-start mb-8">
            <h4 className="text-2xl font-display font-bold text-slate-900">Want this for your business?</h4>
            <button 
              onClick={onClose}
              className="hidden md:block text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                action="https://api.web3forms.com/submit"
                method="POST"
                onSubmit={handleSubmit} 
                className="flex flex-col gap-4"
              >
                <input type="hidden" name="access_key" value="74ae6f89-a5ae-4aca-8532-2e711f2df794" />
                <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />
                <input type="hidden" name="subject" value={`New Inquiry for ${solution.title}`} />
                
                <p className="text-slate-600 text-sm mb-2">Let's talk about how we can deploy this solution for your specific needs.</p>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                  <input required name="name" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ilogic-blue outline-none transition-all" placeholder="John Doe" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Work Email</label>
                  <input required name="email" type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ilogic-blue outline-none transition-all" placeholder="john@company.com" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Message (Optional)</label>
                  <textarea name="message" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ilogic-blue outline-none transition-all h-24 resize-none" placeholder="Tell us about your project..."></textarea>
                </div>

                <button 
                  type="submit"
                  className="mt-4 w-full py-4 bg-ilogic-blue text-white font-bold rounded-xl hover:bg-blue-800 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-ilogic-blue/20"
                >
                  Send Inquiry <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Message Received!</h2>
                <p className="text-slate-600 mb-8">
                  Isaac from I-Logic AI will contact you shortly.
                </p>
                <button 
                  onClick={onClose}
                  className="bg-ilogic-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all"
                >
                  Close
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main App ---

const getServiceData = (name: string): ServiceData => {
  const data: Record<string, ServiceData> = {
    'Custom Chatbots': {
      id: 'chatbots',
      name: 'Custom Chatbots',
      description: 'Intelligent, context-aware conversational agents trained on your specific business data to handle sales, support, and lead qualification 24/7.',
      steps: [
        { title: 'Data Ingestion', desc: 'We feed the AI your knowledge base, FAQs, and brand voice guidelines.' },
        { title: 'Logic Mapping', desc: 'We design the decision trees and integration points for your CRM and booking tools.' },
        { title: 'Deployment', desc: 'We launch the bot on your website, WhatsApp, or social channels with real-time monitoring.' }
      ]
    },
    'Automation Scripts': {
      id: 'automation',
      name: 'Automation Scripts',
      description: 'Custom-built workflows that connect your favorite tools and eliminate repetitive manual tasks, saving hundreds of hours every month.',
      steps: [
        { title: 'Workflow Audit', desc: 'We identify the bottlenecks and manual steps in your current daily operations.' },
        { title: 'Script Engineering', desc: 'We write robust Python or Node.js scripts to bridge your software ecosystem.' },
        { title: 'Stress Testing', desc: 'We run the automation in a sandbox to ensure 100% reliability before going live.' }
      ]
    },
    'AI Web Apps': {
      id: 'web-apps',
      name: 'AI Web Apps',
      description: 'Full-stack web applications with native AI capabilities, from content generators to complex data analysis dashboards.',
      steps: [
        { title: 'UI/UX Design', desc: 'We craft a high-end interface that makes complex AI features feel intuitive.' },
        { title: 'AI Integration', desc: 'We connect powerful LLMs and custom models to your application core.' },
        { title: 'Cloud Launch', desc: 'We deploy your app on scalable infrastructure with enterprise-grade security.' }
      ]
    },
    'SaaS MVPs': {
      id: 'saas-mvp',
      name: 'SaaS MVPs',
      description: 'Rapidly built, market-ready software products that allow you to validate your AI business idea and start collecting revenue in weeks.',
      steps: [
        { title: 'Core Feature Focus', desc: 'We strip away the noise to build the "Must-Have" AI feature that solves the problem.' },
        { title: 'Rapid Prototype', desc: 'Using AI Studio, we build a functional version of your product in record time.' },
        { title: 'Market Launch', desc: 'We help you launch to your first 100 users and set up your billing infrastructure.' }
      ]
    }
  };
  return data[name] || data['Custom Chatbots'];
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'process' | 'success' | 'contact' | 'industry' | 'service' | 'audit' | 'marketplace'>('home');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryData>(getIndustryData('Real Estate'));
  const [selectedService, setSelectedService] = useState<ServiceData>(getServiceData('Custom Chatbots'));
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);

  // --- Admin & Image Management ---
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [customImages, setCustomImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'app'), (doc) => {
      if (doc.exists()) {
        setCustomImages(doc.data().images || {});
      }
    });
    return () => unsub();
  }, []);

  const getImg = (key: string, fallback: string) => customImages[key] || fallback;

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount === 3) {
        setIsAdminOpen(true);
        return 0;
      }
      setTimeout(() => setLogoClickCount(0), 1000);
      return newCount;
    });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'idowubbb123') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const updateImage = async (key: string, url: string) => {
    try {
      await updateDoc(doc(db, 'config', 'app'), {
        [`images.${key}`]: url
      });
    } catch (error) {
      console.error("Error updating image:", error);
      // Fallback if document doesn't exist
      await setDoc(doc(db, 'config', 'app'), { 
        images: { [key]: url } 
      }, { merge: true });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const industries = [
    { icon: Home, title: "Real Estate" },
    { icon: ShoppingBag, title: "E-commerce" },
    { icon: Scale, title: "Legal" },
    { icon: Stethoscope, title: "Healthcare" },
    { icon: BarChart3, title: "Finance" },
    { icon: GraduationCap, title: "Education" },
    { icon: Megaphone, title: "Marketing" },
    { icon: Cpu, title: "Technology" },
  ];

  const allSolutions: Solution[] = useMemo(() => [
    {
      id: '1',
      image: getImg('solution_1', "https://picsum.photos/seed/sales/800/600"),
      tag: "Automation",
      title: "24/7 AI Sales Agent for High-Conversion Funnels",
      rating: 5.0,
      author: "Built by I-Logic AI",
      description: "Automate your entire sales process with a custom-trained LLM agent.",
      category: "Sales"
    },
    {
      id: '2',
      image: getImg('solution_2', "https://picsum.photos/seed/support/800/600"),
      tag: "Web App",
      title: "Intelligent Customer Support Portal with NLP",
      rating: 4.9,
      author: "Built by I-Logic AI",
      description: "Reduce support tickets by 70% with our self-learning support portal.",
      category: "Support"
    },
    {
      id: '3',
      image: getImg('solution_3', "https://picsum.photos/seed/content/800/600"),
      tag: "Content",
      title: "AI-Powered SEO Content Engine & Social Scheduler",
      rating: 5.0,
      author: "Built by I-Logic AI",
      description: "Generate high-ranking SEO content and schedule social posts automatically.",
      category: "Marketing"
    },
    {
      id: '4',
      image: getImg('solution_4', "https://picsum.photos/seed/data/800/600"),
      tag: "Analytics",
      title: "Predictive Business Intelligence & Revenue Forecast",
      rating: 4.8,
      author: "Built by I-Logic AI",
      description: "Turn raw data into actionable insights with predictive modeling.",
      category: "Finance"
    },
    {
      id: '5',
      image: getImg('solution_5', "https://picsum.photos/seed/legal/800/600"),
      tag: "Legal",
      title: "AI Contract Review & Risk Assessment Tool",
      rating: 4.9,
      author: "Built by I-Logic AI",
      description: "Instantly identify risks and anomalies in complex legal documents.",
      category: "Legal"
    },
    {
      id: '6',
      image: getImg('solution_6', "https://picsum.photos/seed/estate/800/600"),
      tag: "Real Estate",
      title: "Virtual Property Tour Guide & Lead Qualifier",
      rating: 4.7,
      author: "Built by I-Logic AI",
      description: "Engage potential buyers with AI-driven virtual property tours.",
      category: "Real Estate"
    },
    {
      id: '7',
      image: getImg('solution_7', "https://picsum.photos/seed/email/800/600"),
      tag: "Creative",
      title: "AI Email Designer & Template Generator",
      rating: 4.9,
      author: "Built by I-Logic AI",
      description: "Generate high-converting, responsive email templates in seconds.",
      category: "Marketing"
    },
    {
      id: '8',
      image: getImg('solution_8', "https://picsum.photos/seed/copy/800/600"),
      tag: "Marketing",
      title: "AI Copywriter for Ads & Blogs",
      rating: 5.0,
      author: "Built by I-Logic AI",
      description: "Professional-grade copy for ads, blogs, and websites that actually sells.",
      category: "Marketing"
    },
    {
      id: '9',
      image: getImg('solution_9', "https://picsum.photos/seed/video/800/600"),
      tag: "Creative",
      title: "AI Video Studio & Ad Generator",
      rating: 4.8,
      author: "Built by I-Logic AI",
      description: "Turn text into engaging marketing videos and social ads automatically.",
      category: "Creative"
    },
    {
      id: '10',
      image: getImg('solution_10', "https://picsum.photos/seed/voice/800/600"),
      tag: "Creative",
      title: "AI Voiceover Studio & Dubbing Hub",
      rating: 4.9,
      author: "Built by I-Logic AI",
      description: "Studio-quality voiceovers and video dubbing in 50+ languages.",
      category: "Creative"
    },
    {
      id: '11',
      image: getImg('solution_11', "https://picsum.photos/seed/logo/800/600"),
      tag: "Creative",
      title: "AI Logo & Brand Identity Suite",
      rating: 4.7,
      author: "Built by I-Logic AI",
      description: "Instant brand identity, logos, and style guides for new ventures.",
      category: "Creative"
    },
    {
      id: '12',
      image: getImg('solution_12', "https://picsum.photos/seed/social/800/600"),
      tag: "Marketing",
      title: "AI Social Media Manager & Growth Bot",
      rating: 4.9,
      author: "Built by I-Logic AI",
      description: "Auto-generate, schedule, and engage with viral social content.",
      category: "Marketing"
    },
    {
      id: '13',
      image: getImg('solution_13', "https://picsum.photos/seed/hr/800/600"),
      tag: "Operations",
      title: "AI HR Recruiter & Resume Screener",
      rating: 4.8,
      author: "Built by I-Logic AI",
      description: "Screen thousands of resumes and interview candidates 24/7.",
      category: "Operations"
    },
    {
      id: '14',
      image: getImg('solution_14', "https://picsum.photos/seed/inventory/800/600"),
      tag: "Operations",
      title: "AI Inventory & Demand Predictor",
      rating: 4.9,
      author: "Built by I-Logic AI",
      description: "Stop overstocking with predictive demand modeling and smart alerts.",
      category: "Operations"
    },
    {
      id: '15',
      image: getImg('solution_15', "https://picsum.photos/seed/sentiment/800/600"),
      tag: "Data",
      title: "AI Sentiment Tracker & Review Analyzer",
      rating: 4.7,
      author: "Built by I-Logic AI",
      description: "Real-time analysis of customer feedback, reviews, and social mentions.",
      category: "Data"
    },
    {
      id: '16',
      image: getImg('solution_16', "https://picsum.photos/seed/translate/800/600"),
      tag: "Operations",
      title: "AI Translation & Localization Hub",
      rating: 4.9,
      author: "Built by I-Logic AI",
      description: "Localize your entire business, website, and docs for global markets.",
      category: "Operations"
    },
    {
      id: '17',
      image: getImg('solution_17', "https://picsum.photos/seed/code/800/600"),
      tag: "Technology",
      title: "AI Code Assistant & Bug Hunter",
      rating: 5.0,
      author: "Built by I-Logic AI",
      description: "Custom coding agents that write, test, and debug your software.",
      category: "Technology"
    },
    {
      id: '18',
      image: getImg('solution_18', "https://picsum.photos/seed/assistant/800/600"),
      tag: "Operations",
      title: "AI Personal Executive Assistant",
      rating: 4.8,
      author: "Built by I-Logic AI",
      description: "Manage your calendar, emails, and daily tasks effortlessly.",
      category: "Operations"
    },
    {
      id: '19',
      image: getImg('solution_19', "https://picsum.photos/seed/audit/800/600"),
      tag: "Finance",
      title: "AI Financial Auditor & Fraud Detector",
      rating: 4.9,
      author: "Built by I-Logic AI",
      description: "Detect anomalies, errors, and fraud in your financial records in real-time.",
      category: "Finance"
    },
    {
      id: '20',
      image: getImg('solution_20', "https://picsum.photos/seed/supply/800/600"),
      tag: "Operations",
      title: "AI Supply Chain & Logistics Optimizer",
      rating: 4.7,
      author: "Built by I-Logic AI",
      description: "Streamline logistics with intelligent routing and warehouse management.",
      category: "Operations"
    },
    {
      id: '21',
      image: getImg('solution_21', "https://picsum.photos/seed/diagnose/800/600"),
      tag: "Healthcare",
      title: "AI Healthcare Diagnosis Assistant",
      rating: 4.9,
      author: "Built by I-Logic AI",
      description: "Support clinical decisions with advanced pattern recognition and data.",
      category: "Healthcare"
    },
    {
      id: '22',
      image: getImg('solution_22', "https://picsum.photos/seed/tutor/800/600"),
      tag: "Education",
      title: "AI Education Tutor & Training Bot",
      rating: 4.8,
      author: "Built by I-Logic AI",
      description: "Personalized learning paths for students and corporate employees.",
      category: "Education"
    }
  ], [customImages]);

  const filteredSolutions = useMemo(() => {
    if (!searchQuery.trim()) return allSolutions;
    const query = searchQuery.toLowerCase();
    return allSolutions.filter(s => 
      s.title.toLowerCase().includes(query) || 
      s.category.toLowerCase().includes(query) ||
      s.tag.toLowerCase().includes(query)
    );
  }, [searchQuery, allSolutions]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // If user types, scroll to solutions section to show results
    if (e.target.value && window.scrollY < 400 && currentPage === 'home') {
      document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickSearch = (tag: string) => {
    setSearchQuery(tag);
    if (currentPage === 'home') {
      document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCurrentPage('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900 selection:bg-ilogic-blue/10 selection:text-ilogic-blue">
      <Header 
        isScrolled={isScrolled}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        setSelectedIndustry={setSelectedIndustry}
        setSelectedService={setSelectedService}
      />

      <main className="flex-grow pt-20">
        <AnimatePresence mode="wait">
          {currentPage === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <HomePage 
                searchQuery={searchQuery}
                handleSearch={handleSearch}
                handleQuickSearch={handleQuickSearch}
                industries={industries}
                filteredSolutions={filteredSolutions}
                setSelectedSolution={setSelectedSolution}
                setCurrentPage={setCurrentPage}
                setSelectedIndustry={setSelectedIndustry}
                setSelectedService={setSelectedService}
              />
            </motion.div>
          ) : currentPage === 'marketplace' ? (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <MarketplacePage 
                filteredSolutions={filteredSolutions}
                setSelectedSolution={setSelectedSolution}
                searchQuery={searchQuery}
                handleSearch={handleSearch}
                handleQuickSearch={handleQuickSearch}
              />
            </motion.div>
          ) : currentPage === 'about' ? (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AboutPage getImg={getImg} />
            </motion.div>
          ) : currentPage === 'process' ? (
            <motion.div
              key="process"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProcessPage getImg={getImg} />
            </motion.div>
          ) : currentPage === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SuccessStoriesPage setCurrentPage={setCurrentPage} getImg={getImg} />
            </motion.div>
          ) : currentPage === 'industry' ? (
            <motion.div
              key="industry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <IndustryPage data={selectedIndustry} setCurrentPage={setCurrentPage} />
            </motion.div>
          ) : currentPage === 'service' ? (
            <motion.div
              key="service"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ServicePage data={selectedService} setCurrentPage={setCurrentPage} />
            </motion.div>
          ) : currentPage === 'audit' ? (
            <motion.div
              key="audit"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <AuditPage />
            </motion.div>
          ) : (
            <motion.div
              key="contact"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <ContactPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer setCurrentPage={setCurrentPage} onLogoClick={handleLogoClick} />

      {/* Admin Modal */}
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-display font-bold">Admin Image Manager</h2>
                <button onClick={() => { setIsAdminOpen(false); setIsAuthenticated(false); setAdminPassword(''); }} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              {!isAuthenticated ? (
                <form onSubmit={handleAdminLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Admin Password</label>
                    <input 
                      type="password" 
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-6 py-4 bg-ilogic-gray border border-transparent focus:border-ilogic-blue focus:bg-white rounded-2xl outline-none transition-all"
                      placeholder="Enter password..."
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-ilogic-blue text-white py-4 rounded-2xl font-bold hover:bg-blue-800 transition-all">
                    Access Manager
                  </button>
                </form>
              ) : (
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                  <p className="text-slate-600 text-sm mb-4">Update any image by pasting a new URL below. Changes save instantly to Firebase.</p>
                  
                  {/* Solution Images */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-ilogic-blue border-b pb-2">Marketplace Solutions</h3>
                    {allSolutions.map((s) => (
                      <div key={s.id} className="space-y-2 p-4 bg-ilogic-gray rounded-2xl">
                        <label className="text-xs font-bold text-slate-500 uppercase">{s.title}</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Paste image URL here..."
                            className="flex-grow px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-ilogic-blue"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateImage(`solution_${s.id}`, e.currentTarget.value);
                                e.currentTarget.blur();
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value) {
                                updateImage(`solution_${s.id}`, e.target.value);
                              }
                            }}
                          />
                          <button 
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              if (input.value) {
                                updateImage(`solution_${s.id}`, input.value);
                              }
                            }}
                            className="bg-ilogic-blue text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-blue-800 transition-colors"
                          >
                            Save
                          </button>
                          <img src={s.image} className="w-10 h-10 rounded object-cover border border-white" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Success Stories */}
                  <div className="space-y-4 mt-8">
                    <h3 className="font-bold text-ilogic-blue border-b pb-2">Success Stories</h3>
                    {[
                      { id: '1', title: 'Real Estate Automation', fallback: 'https://picsum.photos/seed/realestate/800/600' },
                      { id: '2', title: 'Legal Document Review', fallback: 'https://picsum.photos/seed/legalstory/800/600' },
                      { id: '3', title: 'E-commerce Support', fallback: 'https://picsum.photos/seed/shopstory/800/600' }
                    ].map(story => (
                      <div key={story.id} className="space-y-2 p-4 bg-ilogic-gray rounded-2xl">
                        <label className="text-xs font-bold text-slate-500 uppercase">{story.title}</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Paste image URL here..."
                            className="flex-grow px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-ilogic-blue"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateImage(`story_${story.id}`, e.currentTarget.value);
                                e.currentTarget.blur();
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value) {
                                updateImage(`story_${story.id}`, e.target.value);
                              }
                            }}
                          />
                          <button 
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              if (input.value) {
                                updateImage(`story_${story.id}`, input.value);
                              }
                            }}
                            className="bg-ilogic-blue text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-blue-800 transition-colors"
                          >
                            Save
                          </button>
                          <img src={getImg(`story_${story.id}`, story.fallback)} className="w-10 h-10 rounded object-cover border border-white" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Other Static Images */}
                  <div className="space-y-4 mt-8">
                    <h3 className="font-bold text-ilogic-blue border-b pb-2">Static Page Images</h3>
                    <div className="space-y-2 p-4 bg-ilogic-gray rounded-2xl">
                      <label className="text-xs font-bold text-slate-500 uppercase">Founder Image (About Page)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Paste image URL here..."
                          className="flex-grow px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-ilogic-blue"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateImage('founder', e.currentTarget.value);
                              e.currentTarget.blur();
                            }
                          }}
                          onBlur={(e) => {
                            if (e.target.value) {
                              updateImage('founder', e.target.value);
                            }
                          }}
                        />
                        <button 
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            if (input.value) {
                              updateImage('founder', input.value);
                            }
                          }}
                          className="bg-ilogic-blue text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-blue-800 transition-colors"
                        >
                          Save
                        </button>
                        <img src={getImg('founder', "https://picsum.photos/seed/founder/800/1000")} className="w-10 h-10 rounded object-cover border border-white" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                    <div className="space-y-2 p-4 bg-ilogic-gray rounded-2xl">
                      <label className="text-xs font-bold text-slate-500 uppercase">Tech Workflow (Process Page)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Paste image URL here..."
                          className="flex-grow px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-ilogic-blue"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateImage('process_tech', e.currentTarget.value);
                              e.currentTarget.blur();
                            }
                          }}
                          onBlur={(e) => {
                            if (e.target.value) {
                              updateImage('process_tech', e.target.value);
                            }
                          }}
                        />
                        <button 
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            if (input.value) {
                              updateImage('process_tech', input.value);
                            }
                          }}
                          className="bg-ilogic-blue text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-blue-800 transition-colors"
                        >
                          Save
                        </button>
                        <img src={getImg('process_tech', "https://picsum.photos/seed/tech/800/600")} className="w-10 h-10 rounded object-cover border border-white" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {selectedSolution && (
          <DemoModal 
            solution={selectedSolution} 
            onClose={() => setSelectedSolution(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
