import { useState, useEffect } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import './FamilyApp.css'
import DadiAI from './sections/DadiAI.jsx'
import { 
  Modal, 
  SearchBar, 
  Toast, 
  Dropdown, 
  Tooltip, 
  ProgressRing,
  Badge,
  Switch,
  EmptyState 
} from './components.jsx'

const familyMembers = [
  { name: 'Priya', role: 'Mother · 32', mood: 'Energized', lastSync: '2 min ago' },
  { name: 'Rameshbhai', role: 'Dadaji · 67', mood: 'Happy', lastSync: '5 min ago' },
  { name: 'Arjun', role: 'Son · 14', mood: 'Neutral', lastSync: '1 hr ago' },
  { name: 'Karan', role: 'Son (Pune) · 28', mood: 'Stressed', lastSync: '3 hr ago' },
]

const wealthItems = [
  { category: 'Flat in Bengaluru (Whitefield)', value: '₹1.2 Cr', status: 'Owned', updated: '2 days ago' },
  { category: 'PPF + Mutual Funds', value: '₹38L', status: 'Growing', updated: '1 week ago' },
  { category: "Arjun's Education Fund", value: '₹12L', status: 'Active', updated: '3 days ago' },
  { category: 'Emergency Fund (FD)', value: '₹6L', status: 'Ready', updated: 'Today' },
]

const careTasks = [
  { person: 'Rameshbhai (Dadaji)', task: 'Cardiologist appointment — Apollo', due: 'Kal 3 PM', priority: 'High' },
  { person: 'Arjun', task: 'Maths board exam preparation', due: 'Friday', priority: 'Medium' },
  { person: 'Priya', task: 'Vitamin D prescription refill', due: 'Next week', priority: 'Low' },
]

const rituals = [
  { name: 'Sunday Family Lunch', frequency: 'Weekly', lastDone: '2 days ago', impact: 'High bonding' },
  { name: 'Monthly Ghar Ka Hisaab Review', frequency: 'Monthly', lastDone: '1 week ago', impact: 'Financial clarity' },
  { name: 'Morning Aarti Together', frequency: 'Daily', lastDone: 'Yesterday', impact: 'Spiritual connection' },
]

const decisions = [
  { title: 'Goa trip planning — Diwali break', status: 'In Progress', deadline: '2 weeks', stakeholders: ['All'] },
  { title: "Arjun's college stream choice (Science vs Commerce)", status: 'Research', deadline: '3 months', stakeholders: ['Priya', 'Rameshbhai', 'Arjun'] },
]

const legacyItems = [
  { title: 'Parivar Ki Kahaniyan (Family Stories)', type: 'Video + Text', locked: false, access: 'All family' },
  { title: 'Property & Legal Documents', type: 'Legal', locked: true, access: 'Elders only' },
  { title: 'Letter to Arjun — to open at age 25', type: 'Time Capsule', locked: true, access: 'Opens in 11 years' },
]

const Pill = ({ children, variant = 'default' }) => (
  <span className={`pill ${variant}`}>{children}</span>
)

const useToast = () => {
  const [toast, setToast] = useState({
    message: '',
    type: 'info',
    visible: false
  })

  const showToast = (message, type = 'info') => {
    setToast({ message, type, visible: true })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }))
  }

  return { toast, showToast, hideToast }
}

const Header = () => (
  <header className="topbar">
    <div className="nav-container">
      <NavLink to="/family/" className="brand">
        <div className="logo-circle family">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="white"/>
          </svg>
        </div>
        <div className="brand-name">FamilyOS</div>
      </NavLink>

      <nav className="nav-links">
        <NavLink to="/family" end className="nav-item">
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </NavLink>
        <NavLink to="/family/hub" className="nav-item">
          <span className="nav-icon">💬</span>
          <span>Bulletin</span>
        </NavLink>
        <NavLink to="/family/wealth" className="nav-item">
          <span className="nav-icon">💸</span>
          <span>Hisaab</span>
        </NavLink>
        <NavLink to="/family/care" className="nav-item">
          <span className="nav-icon">🏥</span>
          <span>Sehat</span>
        </NavLink>
        <NavLink to="/family/rituals" className="nav-item">
          <span className="nav-icon">📸</span>
          <span>Yaadein</span>
        </NavLink>
        <NavLink to="/family/planning" className="nav-item">
          <span className="nav-icon">🎓</span>
          <span>Padhai</span>
        </NavLink>
        <NavLink to="/family/legacy" className="nav-item">
          <span className="nav-icon">📋</span>
          <span>Kagaz</span>
        </NavLink>
      </nav>

      <div className="nav-actions">
        <NavLink to="/family/ai" className="btn-ai">
          <span className="ai-icon">✨</span>
          <span>Dadi AI</span>
        </NavLink>
      </div>
    </div>
  </header>
)

const Hero = () => (
  <section className="hero family-hero">
    <div className="hero-content">
      <div className="hero-badge">
        <span className="badge-dot"></span>
        <span>🇮🇳 Built for Indian families — joint, nuclear, and everything in between</span>
      </div>
      <h1>The Operating System for Indian Families</h1>
      <p className="hero-description">
        One platform for your entire parivar — shared calendar, joint expenses, health records,
        kids' education, memories, and Dadi AI who speaks your language.
      </p>
      <div className="hero-actions">
        <button className="btn-hero-primary">
          <span>Start Free</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="btn-hero-secondary">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.3 2.84A10 10 0 0 1 17 10c0 5.52-4.48 10-10 10S-3 15.52-3 10a10 10 0 0 1 3.3-7.42l1.42 1.42A8 8 0 1 0 15 10a8 8 0 0 0-2.58-5.88l1.42-1.42A9.96 9.96 0 0 1 17 10z"/>
            <path d="M8 10l2.5 2.5L15 7"/>
          </svg>
          <span>See How It Works</span>
        </button>
      </div>
      <div className="hero-stats">
        <div className="hero-stat">
          <div className="hero-stat-value">300M+</div>
          <div className="hero-stat-label">Indian Families</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-value">50.5%</div>
          <div className="hero-stat-label">Indians online for family</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-value">Zero</div>
          <div className="hero-stat-label">India-first competitors</div>
        </div>
      </div>
    </div>
    <div className="hero-visual">
      <div className="hero-window">
        <div className="window-header">
          <div className="window-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="window-title">Family Dashboard</div>
          <div className="window-actions">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h12M8 2v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        <div className="window-content">
          <div className="mini-stat-grid">
            <div className="mini-stat">
              <div className="mini-stat-icon">💸</div>
              <div>
                <div className="mini-stat-value">₹1.58 Cr</div>
                <div className="mini-stat-label">Family Net Worth</div>
              </div>
            </div>
            <div className="mini-stat">
              <div className="mini-stat-icon">👨‍👩‍👧‍👦</div>
              <div>
                <div className="mini-stat-value">4/4</div>
                <div className="mini-stat-label">Sadasya Active</div>
              </div>
            </div>
          </div>
          <div className="mini-members">
            {familyMembers.map((member, i) => (
              <div className="mini-member" key={member.name} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="mini-avatar">{member.name[0]}</div>
                <div className="mini-member-info">
                  <div className="mini-member-name">{member.name}</div>
                  <div className="mini-member-role">{member.role}</div>
                </div>
                <div className={`mini-status ${member.mood.toLowerCase()}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
)

const ProblemSection = () => (
  <section className="section problem-section">
    <div className="problem-content">
      <div className="problem-text">
        <p className="eyebrow">The Challenge</p>
        <h2>Indian Families Run on WhatsApp Chaos</h2>
        <p className="section-description">
          6 to 25 people sharing a kitchen, a budget, and 14 WhatsApp groups — yet no single
          platform built for how Indian families actually live. We fix that.
        </p>
        <div className="problem-stats">
          <div className="problem-stat">
            <div className="problem-stat-icon">⚠️</div>
            <div>
              <div className="problem-stat-value">50.5%</div>
              <div className="problem-stat-text">of Indian internet users go online primarily for family connection</div>
            </div>
          </div>
          <div className="problem-stat">
            <div className="problem-stat-icon">💬</div>
            <div>
              <div className="problem-stat-value">14+</div>
              <div className="problem-stat-text">WhatsApp groups the average Indian family manages — none of them organized</div>
            </div>
          </div>
          <div className="problem-stat">
            <div className="problem-stat-icon">🌐</div>
            <div>
              <div className="problem-stat-value">Zero</div>
              <div className="problem-stat-text">apps today built for joint family, vernacular-first, India from day one</div>
            </div>
          </div>
        </div>
      </div>
      <div className="problem-visual">
        <div className="problem-card">
          <div className="problem-card-header">
            <span className="problem-icon">🌍</span>
            <h4>Global Distribution</h4>
          </div>
          <p>Families spread across continents with time zone chaos and coordination nightmares</p>
        </div>
        <div className="problem-card">
          <div className="problem-card-header">
            <span className="problem-icon">💸</span>
            <h4>Wealth Fragmentation</h4>
          </div>
          <p>Assets scattered across banks, brokers, and platforms with no single view</p>
        </div>
        <div className="problem-card">
          <div className="problem-card-header">
            <span className="problem-icon">🏥</span>
            <h4>Care Coordination</h4>
          </div>
          <p>Aging parents, growing kids, and health records lost in chaos</p>
        </div>
        <div className="problem-card">
          <div className="problem-card-header">
            <span className="problem-icon">📜</span>
            <h4>Legacy Loss</h4>
          </div>
          <p>Stories, wisdom, and traditions disappearing with each generation</p>
        </div>
      </div>
    </div>
  </section>
)

const PillarsSection = () => (
  <section className="section">
    <div className="section-head center">
      <p className="eyebrow">Core pillars</p>
      <h2>Eight Pillars of the Indian Family OS</h2>
    </div>
    <div className="features-grid">
      <div className="feature-card">
        <div className="feature-icon">📅</div>
        <h3>Saath Mein</h3>
        <p>Shared family calendar with WhatsApp event detection, festival dates, EMI reminders, large-font view for elders</p>
        <Pill>Family calendar, finally</Pill>
      </div>
      <div className="feature-card">
        <div className="feature-icon">💸</div>
        <h3>Ghar Ka Hisaab</h3>
        <p>Joint expense tracking, UPI-linked (PhonePe, Paytm), monthly budget, settlement reminders — emotionally designed</p>
        <Pill>Splitwise for your parivar</Pill>
      </div>
      <div className="feature-card">
        <div className="feature-icon">📸</div>
        <h3>Yaadein</h3>
        <p>Private family photo vault, AI-organized by event and person, no WhatsApp compression, annual photobook</p>
        <Pill>Memories without compression</Pill>
      </div>
      <div className="feature-card">
        <div className="feature-icon">🔔</div>
        <h3>Bulletin</h3>
        <p>Family noticeboard — announcements, grocery lists, task assignment, pinned messages, works offline</p>
        <Pill>Family group chat, structured</Pill>
      </div>
      <div className="feature-card">
        <div className="feature-icon">🎓</div>
        <h3>Padhai Portal</h3>
        <p>School schedules, marks tracker, CBSE/ICSE/state board-aware AI, homework reminders, tuition fee tracker</p>
        <Pill>Every exam, one place</Pill>
      </div>
      <div className="feature-card">
        <div className="feature-icon">🏥</div>
        <h3>Sehat</h3>
        <p>Medical records for all family members, prescription reminders, elderly voice alerts, vaccination tracker</p>
        <Pill>India's family health OS</Pill>
      </div>
      <div className="feature-card">
        <div className="feature-icon">📋</div>
        <h3>Kagaz</h3>
        <p>Store Aadhaar, PAN, property papers, insurance, passports — with expiry reminders and emergency access</p>
        <Pill>Never lose a document</Pill>
      </div>
      <div className="feature-card highlight">
        <div className="feature-icon">🤖</div>
        <h3>Dadi — AI Advisor</h3>
        <p>Knows your family's full context. Proactive: "Arjun's exam is in 3 days — who picks him up?" Speaks Hindi, Tamil, Telugu.</p>
        <Pill variant="success">The AI elder</Pill>
      </div>
    </div>
  </section>
)

const FamilyHubPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [showNewThreadModal, setShowNewThreadModal] = useState(false)
  const [showConversationModal, setShowConversationModal] = useState(false)
  const [showMoodModal, setShowMoodModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [syncTitle, setSyncTitle] = useState('')
  const [syncTopics, setSyncTopics] = useState('')
  const [newThreadTitle, setNewThreadTitle] = useState('')
  const [newThreadContent, setNewThreadContent] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const { toast, showToast, hideToast } = useToast()

  const [conversations, setConversations] = useState([
    {
      id: '1',
      title: 'Diwali Goa Trip Planning 🏖️',
      preview: 'Priya ne Goa suggest kiya. Rameshbhai Shirdi prefer karte hain. Arjun kuch bhi chalega...',
      responses: 5,
      startedAt: '2 days ago',
      lastReply: '3h',
      participants: ['Priya', 'Rameshbhai', 'Arjun', 'Karan'],
      messages: [
        { id: '1', author: 'Priya', content: 'Is Diwali break pe Goa chalte hain? Main ne North Goa mein ek good family resort dekha hai — ₹8,000/night, sabke liye rooms hain!', timestamp: '2 days ago' },
        { id: '2', author: 'Rameshbhai', content: 'Goa mein kya dharm hai bhai? Shirdi chalte hain — sab theek rahega. Budget bhi kam.', timestamp: '2 days ago', emotion: 'concerned' },
        { id: '3', author: 'Arjun', content: 'Dadaji Shirdi toh har saal jaate hain! Kuch naya karte hain please 🙏', timestamp: '1 day ago', emotion: 'excited' },
        { id: '4', author: 'Karan', content: 'Main Pune se join karunga. Goa mera vote. Dadaji ke liye beach-side mandir bhi hai Goa mein!', timestamp: '1 day ago' },
        { id: '5', author: 'Rameshbhai', content: 'Accha theek hai, Goa chalte hain — par Ganesh mandir zaroor jaayenge wahan.', timestamp: '3h', emotion: 'happy' }
      ]
    },
    {
      id: '2',
      title: 'Novembr Ka Ghar Ka Hisaab 💸',
      preview: 'Is mahine grocery mein zyada kharch hua. EMI on track hai...',
      responses: 2,
      startedAt: 'yesterday',
      lastReply: '12h',
      participants: ['Priya', 'Rameshbhai'],
      messages: [
        { id: '1', author: 'Priya', content: 'Is mahine grocery ₹12,000 ho gayi — normal se ₹3,000 zyada. Shayad festive season ki wajah se. EMI sab time pe hai.', timestamp: 'yesterday' },
        { id: '2', author: 'Rameshbhai', content: 'Theek hai beta. Sabzi mandi se direct lene ki koshish karo — ₹2,000 bachenge. Baaki sab theek lag raha hai.', timestamp: '12h' }
      ]
    }
  ])

  const [reminders, setReminders] = useState([
    { id: '1', type: 'birthday', title: "Rameshbhai ka Janamdin 🎂", date: 'Dec 22', person: 'Rameshbhai' },
    { id: '2', type: 'appointment', title: 'Apollo — Cardiology Checkup', date: 'Kal 3 PM', person: 'Rameshbhai' },
    { id: '3', type: 'promise', title: "Arjun ka Maths Exam 📚", date: 'Friday', person: 'Arjun' },
    { id: '4', type: 'birthday', title: "Priya ka Janamdin 🎉", date: 'Jan 15', person: 'Priya' },
    { id: '5', type: 'appointment', title: 'Car Insurance Renewal (Aadhaar needed)', date: 'Dec 31', person: 'Karan' }
  ])

  const templates = [
    {
      id: 'weekly-sync',
      title: 'Weekly Sync Template',
      description: 'Auto-generated agenda with wins, concerns, and action items',
      content: `**This Week's Wins:**
- [What went well this week?]

**Current Concerns:**
- [What's on your mind?]

**Upcoming Priorities:**
- [What needs attention?]

**Action Items:**
- [ ] [Task 1]
- [ ] [Task 2]

**Gratitude Moment:**
- [One thing you're grateful for]`
    },
    {
      id: 'decision',
      title: 'Decision Framework',
      description: 'Structured way to make big family decisions together',
      content: `**Decision to Make:**
[State the decision clearly]

**Options:**
1. [Option A]
2. [Option B]
3. [Option C]

**Pros & Cons:**
[List for each option]

**Family Values to Consider:**
- [Value 1]
- [Value 2]

**Stakeholder Input:**
- Sarah: [input]
- David: [input]
- Emma: [input]
- Noah: [input]

**Final Decision:**
[To be determined]

**Action Plan:**
- [ ] [Next step]`
    },
    {
      id: 'appreciation',
      title: 'Appreciation Ritual',
      description: 'Express gratitude and recognize each other\'s efforts',
      content: `**This Week I Appreciate:**

**Sarah:** [What you appreciate about Sarah]

**David:** [What you appreciate about David]

**Emma:** [What you appreciate about Emma]

**Noah:** [What you appreciate about Noah]

**Family Moment:** [A special moment we shared]`
    },
    {
      id: 'conflict',
      title: 'Conflict Resolution',
      description: 'Navigate disagreements with empathy and clarity',
      content: `**The Situation:**
[Describe what happened objectively]

**How I Feel:**
[Express your emotions without blame]

**What I Need:**
[State your needs clearly]

**What I Hear You Saying:**
[Reflect the other person's perspective]

**Possible Solutions:**
1. [Solution A]
2. [Solution B]

**Agreement:**
[What we'll do moving forward]`
    }
  ]

  const handleCreateSync = () => {
    if (!syncTitle.trim()) {
      showToast('Please enter a sync title', 'warning')
      return
    }
    const newConversation = {
      id: Date.now().toString(),
      title: syncTitle,
      preview: syncTopics || 'Weekly family sync meeting',
      responses: 0,
      startedAt: 'just now',
      lastReply: 'just now',
      participants: familyMembers.map(m => m.name),
      messages: [{
        id: '1',
        author: 'System',
        content: `Weekly Sync: ${syncTitle}\n\nTopics:\n${syncTopics}\n\n${templates[0].content}`,
        timestamp: 'just now'
      }]
    }
    setConversations([newConversation, ...conversations])
    setShowSyncModal(false)
    setSyncTitle('')
    setSyncTopics('')
    showToast('Weekly sync created successfully!', 'success')
  }

  const handleCreateThread = () => {
    if (!newThreadTitle.trim()) {
      showToast('Please enter a thread title', 'warning')
      return
    }
    const template = selectedTemplate ? templates.find(t => t.id === selectedTemplate) : null
    const content = template ? `${newThreadContent}\n\n${template.content}` : newThreadContent
    
    const newConversation = {
      id: Date.now().toString(),
      title: newThreadTitle,
      preview: newThreadContent.substring(0, 100) + '...',
      responses: 0,
      startedAt: 'just now',
      lastReply: 'just now',
      participants: familyMembers.map(m => m.name),
      messages: [{
        id: '1',
        author: 'You',
        content: content,
        timestamp: 'just now'
      }]
    }
    setConversations([newConversation, ...conversations])
    setShowNewThreadModal(false)
    setNewThreadTitle('')
    setNewThreadContent('')
    setSelectedTemplate(null)
    showToast('New thread created!', 'success')
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return
    
    const emotion = detectEmotion(newMessage)
    const translated = emotion ? translateEmotion(newMessage, emotion) : undefined
    
    const message = {
      id: Date.now().toString(),
      author: 'You',
      content: newMessage,
      timestamp: 'just now',
      emotion,
      translated
    }
    
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
      responses: selectedConversation.responses + 1,
      lastReply: 'just now'
    }
    
    setConversations(conversations.map(c => 
      c.id === selectedConversation.id ? updatedConversation : c
    ))
    setSelectedConversation(updatedConversation)
    setNewMessage('')
    showToast('Message sent!', 'success')
  }

  const detectEmotion = (text) => {
    const lower = text.toLowerCase()
    if (lower.includes('angry') || lower.includes('frustrated') || lower.includes('mad')) return 'angry'
    if (lower.includes('sad') || lower.includes('upset') || lower.includes('disappointed')) return 'sad'
    if (lower.includes('happy') || lower.includes('excited') || lower.includes('great')) return 'happy'
    if (lower.includes('worried') || lower.includes('concerned') || lower.includes('anxious')) return 'concerned'
    return ''
  }

  const translateEmotion = (text, emotion) => {
    const translations = {
      'angry': '💭 AI Translation: This person is feeling frustrated. They may need space or understanding.',
      'sad': '💭 AI Translation: This person is feeling down. They may need support or comfort.',
      'happy': '💭 AI Translation: This person is feeling positive and energized.',
      'concerned': '💭 AI Translation: This person is worried. They may need reassurance or help.'
    }
    return translations[emotion] || ''
  }

  const handleUpdateMood = (mood) => {
    if (!selectedMember) return
    showToast(`Mood updated to ${mood}!`, 'success')
    setShowMoodModal(false)
    setSelectedMember(null)
  }

  const openConversation = (conv) => {
    setSelectedConversation(conv)
    setShowConversationModal(true)
  }

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
  <div className="page">
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={hideToast} />
      
      {/* Weekly Sync Modal */}
      <Modal 
        isOpen={showSyncModal} 
        onClose={() => setShowSyncModal(false)} 
        title="🗓️ Create Weekly Sync"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Sync Title</label>
            <input 
              type="text" 
              value={syncTitle}
              onChange={(e) => setSyncTitle(e.target.value)}
              placeholder="e.g., Family Check-in - Week of Nov 22"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Participants</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {familyMembers.map(member => (
                <Badge key={member.name} variant="info">{member.name}</Badge>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Topics to Discuss</label>
            <textarea 
              value={syncTopics}
              onChange={(e) => setSyncTopics(e.target.value)}
              placeholder="Enter topics to discuss..."
              rows={4}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          <div style={{ padding: '12px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
            <strong>✨ Auto-Generated Agenda:</strong> Weekly sync template will be automatically applied with sections for wins, concerns, priorities, and action items.
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="ghost" onClick={() => setShowSyncModal(false)}>Cancel</button>
            <button className="primary" onClick={handleCreateSync}>Create Sync</button>
          </div>
        </div>
      </Modal>

      {/* New Thread Modal */}
      <Modal 
        isOpen={showNewThreadModal} 
        onClose={() => setShowNewThreadModal(false)} 
        title="💬 Start New Conversation"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Thread Title</label>
            <input 
              type="text" 
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
              placeholder="e.g., Planning Emma's Birthday Party"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Use Template (Optional)</label>
            <select 
              value={selectedTemplate || ''}
              onChange={(e) => setSelectedTemplate(e.target.value || null)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            >
              <option value="">No template</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Message</label>
            <textarea 
              value={newThreadContent}
              onChange={(e) => setNewThreadContent(e.target.value)}
              placeholder="Start the conversation..."
              rows={6}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="ghost" onClick={() => setShowNewThreadModal(false)}>Cancel</button>
            <button className="primary" onClick={handleCreateThread}>Create Thread</button>
          </div>
        </div>
      </Modal>

      {/* Conversation Detail Modal */}
      <Modal 
        isOpen={showConversationModal} 
        onClose={() => setShowConversationModal(false)} 
        title={selectedConversation?.title || ''}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '60vh', overflow: 'auto' }}>
          {selectedConversation?.messages.map(msg => (
            <div key={msg.id} style={{ padding: '16px', background: msg.author === 'You' ? 'rgba(102, 126, 234, 0.1)' : 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: '#1e293b' }}>{msg.author}</strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{msg.timestamp}</span>
              </div>
              <p style={{ margin: '0 0 8px 0', color: '#475569', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              {msg.emotion && (
                <div style={{ padding: '8px 12px', background: 'rgba(255, 107, 157, 0.1)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: '#ff6b9d', marginTop: '8px' }}>
                  <strong>😊 Emotion Detected:</strong> {msg.emotion}
                </div>
              )}
              {msg.translated && (
                <div style={{ padding: '8px 12px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: '#667eea', marginTop: '8px' }}>
                  {msg.translated}
                </div>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            />
            <button className="primary" onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      </Modal>

      {/* Mood Update Modal */}
      <Modal 
        isOpen={showMoodModal} 
        onClose={() => setShowMoodModal(false)} 
        title={`Update ${selectedMember?.name}'s Mood`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: '#64748b' }}>How are you feeling right now?</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {['Energized', 'Happy', 'Neutral', 'Stressed', 'Tired', 'Anxious'].map(mood => (
              <button 
                key={mood}
                className="ghost"
                style={{ padding: '16px', textAlign: 'left' }}
                onClick={() => handleUpdateMood(mood)}
              >
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                  {mood === 'Energized' && '⚡'}
                  {mood === 'Happy' && '😊'}
                  {mood === 'Neutral' && '😐'}
                  {mood === 'Stressed' && '😰'}
                  {mood === 'Tired' && '😴'}
                  {mood === 'Anxious' && '😟'}
                </div>
                <div style={{ fontWeight: 600 }}>{mood}</div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

    <div className="page-head">
      <div>
        <p className="eyebrow">Bulletin — Family Noticeboard</p>
        <h2>Har Baat Ek Jagah</h2>
        <p className="lede">Family announcements, tasks, reminders, polls — structured, not buried in a WhatsApp group</p>
      </div>
        <button className="primary" onClick={() => setShowSyncModal(true)}>Create Weekly Sync</button>
    </div>
      
      <div style={{ marginBottom: '24px' }}>
        <SearchBar 
          placeholder="Search conversations, members, or topics..." 
          onSearch={(value) => console.log('Search:', value)}
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

    <div className="grid two">
        {/* Family Board */}
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">Family Board</div>
              <h3>Threaded Conversations</h3>
          </div>
            <button className="ghost" onClick={() => setShowNewThreadModal(true)}>+ New Thread</button>
        </div>
        <div className="conversation-list">
            {filteredConversations.length === 0 ? (
              <EmptyState 
                icon="💬"
                title="No conversations yet"
                description="Start a new thread to begin communicating with your family"
              />
            ) : (
              filteredConversations.map(conv => (
                <div 
                  key={conv.id}
                  className="conversation-item" 
                  role="button" 
                  tabIndex={0} 
                  onClick={() => openConversation(conv)}
                >
            <div className="conversation-header">
                    <strong>{conv.title}</strong>
                    <Badge variant={conv.responses > 3 ? 'success' : 'default'}>
                      {conv.responses} {conv.responses === 1 ? 'response' : 'responses'}
                    </Badge>
            </div>
                  <p className="conversation-preview">{conv.preview}</p>
                  <div className="conversation-meta">
                    Started {conv.startedAt} · Last reply {conv.lastReply}
          </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    {conv.participants.slice(0, 4).map(p => (
                      <div key={p} style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--family-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                        {p[0]}
            </div>
                    ))}
          </div>
        </div>
              ))
            )}
      </div>
        </div>

        {/* Mood Check-In */}
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">Mood Check-In</div>
            <h3>How Everyone's Doing</h3>
          </div>
        </div>
        <div className="mood-grid">
          {familyMembers.map((member) => (
              <div 
                className="mood-card" 
                key={member.name}
                onClick={() => {
                  setSelectedMember(member)
                  setShowMoodModal(true)
                }}
                style={{ cursor: 'pointer' }}
              >
              <div className="mood-avatar">{member.name[0]}</div>
              <div className="mood-info">
                <div className="mood-name">{member.name}</div>
                  <div className="mood-status">
                    {member.mood === 'Energized' && '⚡ Energized'}
                    {member.mood === 'Stressed' && '😰 Stressed'}
                    {member.mood === 'Happy' && '😊 Happy'}
                    {member.mood === 'Neutral' && '😐 Neutral'}
                  </div>
                <div className="mood-time">{member.lastSync}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="ai-insight">
            <strong>🤖 Dadi AI:</strong> Karan ka stress is week zyada hai. Sunday lunch pe ek video call schedule karein? Connectivity badhti hai.
        </div>
      </div>
    </div>

      {/* Reminders Section */}
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">Automated Reminders</div>
            <h3>Birthdays, Appointments & Promises</h3>
          </div>
          <button className="ghost" onClick={() => setShowReminderModal(true)}>+ Add Reminder</button>
        </div>
        <div className="reminder-grid">
          {reminders.map(reminder => (
            <div key={reminder.id} className="reminder-card">
              <div className="reminder-icon">
                {reminder.type === 'birthday' && '🎂'}
                {reminder.type === 'appointment' && '📅'}
                {reminder.type === 'promise' && '🤝'}
              </div>
              <div className="reminder-content">
                <div className="reminder-title">{reminder.title}</div>
                <div className="reminder-meta">{reminder.person} · {reminder.date}</div>
              </div>
              <Badge variant={reminder.date.includes('Tomorrow') || reminder.date.includes('Today') ? 'danger' : 'default'}>
                {reminder.date.includes('Tomorrow') || reminder.date.includes('Today') ? 'Soon' : 'Upcoming'}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Templates Section */}
    <div className="panel-card">
      <div className="card-header space-between">
        <div>
          <div className="eyebrow">Templates</div>
          <h3>Conflict-Free Communication</h3>
        </div>
      </div>
      <div className="template-grid">
          {templates.map(template => (
            <div 
              key={template.id}
              className="template-card" 
              onClick={() => {
                setSelectedTemplate(template.id)
                setShowNewThreadModal(true)
              }}
            >
              <h4>{template.title}</h4>
              <p>{template.description}</p>
        </div>
          ))}
        </div>
        </div>
        </div>
  )
}

const WealthPage = () => {
  const [showAddAssetModal, setShowAddAssetModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const { toast, showToast, hideToast } = useToast()

  const handleAddAsset = () => {
    setShowAddAssetModal(false)
    showToast('Asset added successfully!', 'success')
  }

  return (
    <div className="page">
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={hideToast} />
      
      <Modal 
        isOpen={showAddAssetModal} 
        onClose={() => setShowAddAssetModal(false)} 
        title="Add New Asset"
        size="medium"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Asset Type</label>
            <select style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <option>Select type...</option>
              <option>Real Estate</option>
              <option>Investment Account</option>
              <option>Savings Account</option>
              <option>Insurance</option>
              <option>Other</option>
            </select>
      </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Asset Name</label>
            <input 
              type="text" 
              placeholder="e.g., Vacation Home, 401(k)"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            />
    </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Current Value</label>
            <input 
              type="text" 
              placeholder="$0.00"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            />
  </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="ghost" onClick={() => setShowAddAssetModal(false)}>Cancel</button>
            <button className="primary" onClick={handleAddAsset}>Add Asset</button>
          </div>
        </div>
      </Modal>

    <div className="page-head">
      <div>
        <p className="eyebrow">Wealth & Assets HQ</p>
        <h2>Complete Financial Picture</h2>
        <p className="lede">Track assets, manage goals, plan estate, and build generational wealth</p>
      </div>
        <button className="primary" onClick={() => setShowAddAssetModal(true)}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>Add Asset</span>
      </button>
    </div>
    <div className="wealth-hero">
      <div className="wealth-overview">
        <div className="wealth-main">
          <div className="wealth-label">Total Net Worth</div>
          <div className="wealth-amount">$1,400,000</div>
          <div className="wealth-change">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 12V4M4 8l4-4 4 4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>+$112K this year (8.7%)</span>
          </div>
        </div>
        <div className="wealth-breakdown">
          <div className="wealth-segment">
            <div className="segment-bar">
              <div className="segment-fill" style={{ width: '61%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></div>
            </div>
            <div className="segment-info">
              <div className="segment-label">Real Estate</div>
              <div className="segment-value">$850K (61%)</div>
            </div>
          </div>
          <div className="wealth-segment">
            <div className="segment-bar">
              <div className="segment-fill" style={{ width: '30%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}></div>
            </div>
            <div className="segment-info">
              <div className="segment-label">Investments</div>
              <div className="segment-value">$420K (30%)</div>
            </div>
          </div>
          <div className="wealth-segment">
            <div className="segment-bar">
              <div className="segment-fill" style={{ width: '6%', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}></div>
            </div>
            <div className="segment-info">
              <div className="segment-label">Savings</div>
              <div className="segment-value">$85K (6%)</div>
            </div>
          </div>
          <div className="wealth-segment">
            <div className="segment-bar">
              <div className="segment-fill" style={{ width: '3%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}></div>
            </div>
            <div className="segment-info">
              <div className="segment-label">Emergency</div>
              <div className="segment-value">$45K (3%)</div>
            </div>
          </div>
        </div>
      </div>
      <div className="wealth-quick-stats">
        <div className="quick-stat-card">
          <div className="quick-stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>📈</div>
          <div>
            <div className="quick-stat-label">YTD Return</div>
            <div className="quick-stat-value">+8.7%</div>
          </div>
        </div>
        <div className="quick-stat-card">
          <div className="quick-stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>🎯</div>
          <div>
            <div className="quick-stat-label">Goals on Track</div>
            <div className="quick-stat-value">3 of 4</div>
          </div>
        </div>
        <div className="quick-stat-card">
          <div className="quick-stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>🛡️</div>
          <div>
            <div className="quick-stat-label">Insurance</div>
            <div className="quick-stat-value">$1.5M</div>
          </div>
        </div>
      </div>
    </div>
    <div className="grid two">
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">Assets</div>
            <h3>Wealth Map</h3>
          </div>
          <button className="ghost">Full Report</button>
        </div>
        <div className="wealth-list">
          {wealthItems.map((item) => (
            <div className="wealth-item" key={item.category}>
              <div>
                <div className="wealth-category">{item.category}</div>
                <div className="wealth-meta">{item.status} · Updated {item.updated}</div>
              </div>
              <div className="wealth-value">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">Planning</div>
            <h3>Financial Goals</h3>
          </div>
          <button className="ghost">Set New Goal</button>
        </div>
        <div className="goals-list">
          <Tooltip content="Click to view details" position="top">
            <div 
              className="goal-card" 
              onClick={() => { 
                setSelectedGoal('Emma\'s College Fund')
                showToast('Goal details opened', 'info')
              }}
              style={{ cursor: 'pointer' }}
            >
            <h4>Emma's College Fund</h4>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '65%' }}></div>
            </div>
            <div className="goal-meta">$65K of $100K target · On track for 2028</div>
          </div>
          </Tooltip>
          <Tooltip content="Click to view details" position="top">
            <div 
              className="goal-card"
              onClick={() => { 
                setSelectedGoal('Retirement Security')
                showToast('Goal details opened', 'info')
              }}
              style={{ cursor: 'pointer' }}
            >
            <h4>Retirement Security</h4>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '42%' }}></div>
            </div>
            <div className="goal-meta">$420K of $1M target · 18 years to goal</div>
          </div>
          </Tooltip>
          <Tooltip content="Click to view details" position="top">
            <div 
              className="goal-card"
              onClick={() => { 
                setSelectedGoal('Vacation Home Fund')
                showToast('Goal details opened', 'info')
              }}
              style={{ cursor: 'pointer' }}
            >
            <h4>Vacation Home Fund</h4>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '15%' }}></div>
            </div>
            <div className="goal-meta">$45K of $300K target · 10 year timeline</div>
          </div>
          </Tooltip>
        </div>
      </div>
    </div>
    <div className="panel-card">
      <div className="card-header space-between">
        <div>
          <div className="eyebrow">Estate</div>
          <h3>Contingency Protocols</h3>
        </div>
        <button className="primary">Update Estate Plan</button>
      </div>
      <div className="estate-grid">
        <div className="estate-card">
          <h4>Will & Testament</h4>
          <Pill variant="success">Up to date</Pill>
          <p>Last updated 3 months ago · Next review in 9 months</p>
        </div>
        <div className="estate-card">
          <h4>Life Insurance</h4>
          <Pill variant="success">Active</Pill>
          <p>$1.5M coverage · Beneficiaries confirmed</p>
        </div>
        <div className="estate-card">
          <h4>Power of Attorney</h4>
          <Pill variant="warning">Needs review</Pill>
          <p>Documents are 2 years old · Schedule review</p>
        </div>
        <div className="estate-card">
          <h4>Trust Setup</h4>
          <Pill variant="neutral">In progress</Pill>
          <p>Family trust being established · 60% complete</p>
        </div>
      </div>
    </div>
  </div>
)
}

const CarePage = () => {
  const { toast, showToast, hideToast } = useToast()
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)

  return (
  <div className="page">
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={hideToast} />
      
      <Modal 
        isOpen={showAddTaskModal} 
        onClose={() => setShowAddTaskModal(false)} 
        title="Add Care Task"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Person</label>
            <select style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <option>Select person...</option>
              {familyMembers.map(m => <option key={m.name}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Task</label>
            <input 
              type="text" 
              placeholder="e.g., Doctor appointment"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Priority</label>
            <select style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="ghost" onClick={() => setShowAddTaskModal(false)}>Cancel</button>
            <button className="primary" onClick={() => { setShowAddTaskModal(false); showToast('Task added!', 'success') }}>Add Task</button>
          </div>
        </div>
      </Modal>

    <div className="page-head">
      <div>
        <p className="eyebrow">CareOS</p>
        <h2>Health Operating System for Your Whole Clan</h2>
        <p className="lede">Healthcare dashboards, medication schedules, child development, safety protocols</p>
      </div>
        <button className="primary" onClick={() => setShowAddTaskModal(true)}>Add Care Task</button>
    </div>
    <div className="grid two">
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">Upcoming</div>
            <h3>Care Calendar</h3>
          </div>
        </div>
        <div className="care-list">
          {careTasks.map((task, i) => (
            <div className="care-task" key={i}>
              <div>
                <div className="care-person">{task.person}</div>
                <div className="care-task-name">{task.task}</div>
                <div className="care-due">{task.due}</div>
              </div>
              <span className={`badge ${task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'neutral'}`}>
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">Child Development</div>
            <h3>Learning & Growth</h3>
          </div>
        </div>
        <div className="development-cards">
          <div className="dev-card">
            <h4>Emma (12)</h4>
            <div className="dev-items">
              <div className="dev-item">
                <span>Math skills</span>
                <Pill variant="success">Advanced</Pill>
              </div>
              <div className="dev-item">
                <span>Social development</span>
                <Pill variant="success">Healthy</Pill>
              </div>
              <div className="dev-item">
                <span>Sleep patterns</span>
                <Pill variant="warning">Below target</Pill>
              </div>
            </div>
          </div>
          <div className="dev-card">
            <h4>Noah (8)</h4>
            <div className="dev-items">
              <div className="dev-item">
                <span>Reading level</span>
                <Pill variant="success">On track</Pill>
              </div>
              <div className="dev-item">
                <span>Physical activity</span>
                <Pill variant="success">Excellent</Pill>
              </div>
              <div className="dev-item">
                <span>Screen time</span>
                <Pill variant="success">Within limits</Pill>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="grid two">
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">Parent Care</div>
            <h3>Aging Parent Dashboard</h3>
          </div>
        </div>
        <div className="parent-care">
          <div className="parent-card">
            <div className="parent-header">
              <h4>Mom (Martha, 68)</h4>
              <Pill variant="warning">Attention needed</Pill>
            </div>
            <div className="parent-details">
              <div className="detail-row">
                <span>Next appointment</span>
                <span>Tomorrow 2 PM - Cardiology</span>
              </div>
              <div className="detail-row">
                <span>Medications</span>
                <span>3 daily · All on schedule</span>
              </div>
              <div className="detail-row">
                <span>Last check-in</span>
                <span>Today 9 AM · Feeling good</span>
              </div>
            </div>
          </div>
          <div className="parent-card">
            <div className="parent-header">
              <h4>Dad (Robert, 70)</h4>
              <Pill variant="success">All good</Pill>
            </div>
            <div className="parent-details">
              <div className="detail-row">
                <span>Next appointment</span>
                <span>Dec 5 - Annual checkup</span>
              </div>
              <div className="detail-row">
                <span>Medications</span>
                <span>2 daily · Compliant</span>
              </div>
              <div className="detail-row">
                <span>Last check-in</span>
                <span>Yesterday · Active, healthy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">Safety</div>
            <h3>Emergency Protocols</h3>
          </div>
          <button className="ghost">Test Protocol</button>
        </div>
        <div className="safety-list">
          <div className="safety-item">
            <div className="safety-icon">🚨</div>
            <div>
              <div className="safety-title">Emergency Contacts</div>
              <div className="safety-meta">5 contacts · All verified this month</div>
            </div>
          </div>
          <div className="safety-item">
            <div className="safety-icon">📍</div>
            <div>
              <div className="safety-title">Location Sharing</div>
              <div className="safety-meta">Active for 4 members · Privacy respected</div>
            </div>
          </div>
          <div className="safety-item">
            <div className="safety-icon">🏥</div>
            <div>
              <div className="safety-title">Medical Records</div>
              <div className="safety-meta">Digital access enabled · Emergency ready</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}

const RitualsPage = () => {
  const { toast, showToast, hideToast } = useToast()
  const [showRitualModal, setShowRitualModal] = useState(false)
  const [showFestivalModal, setShowFestivalModal] = useState(false)
  const [showFestivalDetailModal, setShowFestivalDetailModal] = useState(false)
  const [showValueModal, setShowValueModal] = useState(false)
  const [showMemoryModal, setShowMemoryModal] = useState(false)
  const [showImpactModal, setShowImpactModal] = useState(false)
  const [selectedRitual, setSelectedRitual] = useState(null)
  const [selectedValue, setSelectedValue] = useState(null)
  const [selectedFestival, setSelectedFestival] = useState(null)
  
  const [festivalName, setFestivalName] = useState('')
  const [festivalDate, setFestivalDate] = useState('')
  const [festivalType, setFestivalType] = useState('birthday')
  const [festivalBudget, setFestivalBudget] = useState('')
  const [festivalTraditions, setFestivalTraditions] = useState('')
  const [newChecklistTask, setNewChecklistTask] = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState('Sarah')
  
  const [ritualName, setRitualName] = useState('')
  const [ritualFrequency, setRitualFrequency] = useState('weekly')
  const [ritualDescription, setRitualDescription] = useState('')
  const [ritualParticipants, setRitualParticipants] = useState([])

  const [valueName, setValueName] = useState('')
  const [valueDescription, setValueDescription] = useState('')
  const [valueIcon, setValueIcon] = useState('⭐')

  const [memoryTitle, setMemoryTitle] = useState('')
  const [memoryDate, setMemoryDate] = useState('')
  const [memoryDescription, setMemoryDescription] = useState('')
  const [memoryCategory, setMemoryCategory] = useState('')
  const [memoryTags, setMemoryTags] = useState('')

  const [familyRituals, setFamilyRituals] = useState([
    {
      id: '1',
      name: 'Sunday Family Dinner',
      frequency: 'Weekly',
      category: 'weekly',
      lastDone: '2 days ago',
      impact: 'High bonding',
      impactScore: 95,
      streak: 47,
      description: 'Everyone cooks together, shares weekly highlights, and enjoys quality time',
      participants: ['Sarah', 'David', 'Emma', 'Noah'],
      completionHistory: [
        { date: '2 days ago', notes: 'Made pasta together. Emma shared science fair news.' },
        { date: '9 days ago', notes: 'Tried new recipe. Great conversation about summer plans.' }
      ]
    },
    {
      id: '2',
      name: 'Monthly Budget Review',
      frequency: 'Monthly',
      category: 'monthly',
      lastDone: '1 week ago',
      impact: 'Financial clarity',
      impactScore: 88,
      streak: 14,
      description: 'Review spending, adjust budgets, and align on financial goals',
      participants: ['Sarah', 'David'],
      completionHistory: [
        { date: '1 week ago', notes: 'Spending down 8%. Allocated extra to holiday fund.' }
      ]
    },
    {
      id: '3',
      name: 'Gratitude Circle',
      frequency: 'Daily',
      category: 'daily',
      lastDone: 'Yesterday',
      impact: 'Emotional wellness',
      impactScore: 92,
      streak: 156,
      description: 'Share one thing we\'re grateful for before bed',
      participants: ['Sarah', 'David', 'Emma', 'Noah'],
      completionHistory: []
    },
    {
      id: '4',
      name: 'Annual Family Retreat',
      frequency: 'Yearly',
      category: 'yearly',
      lastDone: '3 months ago',
      impact: 'Deep connection',
      impactScore: 98,
      streak: 5,
      description: 'Weekend getaway to reflect, plan, and reconnect as a family',
      participants: ['Sarah', 'David', 'Emma', 'Noah'],
      completionHistory: []
    }
  ])

  const [festivals, setFestivals] = useState([
    { 
      id: '1', 
      name: "Emma's Birthday", 
      date: 'Dec 15', 
      type: 'birthday', 
      traditions: ['Birthday breakfast in bed', 'Emma chooses dinner', 'Family game night', 'Birthday cake ritual'],
      automated: true, 
      daysUntil: 23,
      checklist: [
        { task: 'Order birthday cake from Emma\'s favorite bakery', completed: false, assignedTo: 'Sarah' },
        { task: 'Buy birthday present (she wants art supplies)', completed: false, assignedTo: 'David' },
        { task: 'Decorate living room with balloons', completed: false, assignedTo: 'Noah' },
        { task: 'Plan birthday breakfast menu', completed: false, assignedTo: 'Sarah' },
        { task: 'Invite grandparents for dinner', completed: false, assignedTo: 'David' }
      ],
      shoppingList: ['Birthday candles', 'Balloons', 'Gift wrap', 'Party decorations', 'Art supplies'],
      budget: 250,
      notifications: [
        { days: 30, sent: false },
        { days: 14, sent: false },
        { days: 7, sent: false },
        { days: 1, sent: false }
      ],
      pastCelebrations: [
        { year: '2024', notes: 'Had surprise party with friends. Emma loved the art set. Made homemade pizza.', photos: 34 },
        { year: '2023', notes: 'Went to trampoline park. Cake from Sweet Treats bakery was a hit.', photos: 28 }
      ],
      autoSuggestions: [
        '🤖 Based on last year: Order from Sweet Treats bakery',
        '🤖 Emma mentioned wanting: Professional art supplies',
        '🤖 Popular activity: Art class or museum visit',
        '🤖 Budget tip: Last year spent $220, you allocated $250'
      ]
    },
    { 
      id: '2', 
      name: 'Thanksgiving', 
      date: 'Nov 28', 
      type: 'holiday', 
      traditions: ['Gratitude sharing circle', 'Turkey dinner with family', 'Watch football', 'Family photos', 'Leftover sandwiches next day'],
      automated: true, 
      daysUntil: 6,
      checklist: [
        { task: 'Order 16lb turkey from butcher', completed: true, assignedTo: 'David' },
        { task: 'Buy groceries for sides', completed: false, assignedTo: 'Sarah' },
        { task: 'Clean dining room', completed: false, assignedTo: 'Emma' },
        { task: 'Set up extra table and chairs', completed: false, assignedTo: 'David' },
        { task: 'Prepare gratitude prompts', completed: true, assignedTo: 'Sarah' }
      ],
      shoppingList: ['Potatoes', 'Cranberries', 'Stuffing ingredients', 'Pumpkin pie', 'Wine', 'Sparkling cider'],
      budget: 180,
      notifications: [
        { days: 14, sent: true },
        { days: 7, sent: true },
        { days: 3, sent: false },
        { days: 1, sent: false }
      ],
      pastCelebrations: [
        { year: '2024', notes: 'Had 12 people. Martha\'s sweet potato casserole was amazing. Kids played outside.', photos: 45 }
      ],
      autoSuggestions: [
        '🤖 Reminder: Turkey needs 3 days to thaw',
        '🤖 Martha bringing: Sweet potato casserole (her specialty)',
        '🤖 Weather forecast: 65°F - perfect for outdoor activities',
        '🤖 Auto-sent: Calendar invites to grandparents'
      ]
    },
    { 
      id: '3', 
      name: 'Christmas', 
      date: 'Dec 25', 
      type: 'holiday', 
      traditions: ['Tree decorating party', 'Cookie baking weekend', 'Christmas Eve service', 'Morning gift exchange', 'Family brunch'],
      automated: true, 
      daysUntil: 33,
      checklist: [
        { task: 'Buy Christmas tree (week of Dec 10)', completed: false, assignedTo: 'David' },
        { task: 'Shop for gifts', completed: false, assignedTo: 'Sarah' },
        { task: 'Bake cookies (Dec 15)', completed: false, assignedTo: 'All' },
        { task: 'Send Christmas cards', completed: false, assignedTo: 'Sarah' },
        { task: 'Wrap all presents', completed: false, assignedTo: 'Sarah' }
      ],
      shoppingList: ['Christmas tree', 'Ornaments', 'Lights', 'Gift wrap', 'Cookie ingredients', 'Christmas cards'],
      budget: 800,
      notifications: [
        { days: 60, sent: true },
        { days: 30, sent: false },
        { days: 14, sent: false },
        { days: 7, sent: false }
      ],
      pastCelebrations: [
        { year: '2024', notes: 'Got 7ft tree. Kids loved the matching pajamas tradition. Brunch was ham and waffles.', photos: 89 }
      ],
      autoSuggestions: [
        '🤖 Gift ideas based on wish lists: Emma wants art supplies, Noah wants Lego set',
        '🤖 Tree recommendation: 7ft worked perfectly last year',
        '🤖 Cookie schedule: Dec 15-16 weekend is free',
        '🤖 Budget alert: On track with spending'
      ]
    },
    { 
      id: '4', 
      name: 'Wedding Anniversary', 
      date: 'Jun 12', 
      type: 'anniversary', 
      traditions: ['Date night at nice restaurant', 'Exchange cards', 'Kids make breakfast', 'Look at wedding photos'],
      automated: true, 
      daysUntil: 202,
      checklist: [
        { task: 'Make restaurant reservation', completed: false, assignedTo: 'David' },
        { task: 'Book babysitter', completed: false, assignedTo: 'Sarah' },
        { task: 'Buy anniversary card', completed: false, assignedTo: 'David' },
        { task: 'Plan special breakfast', completed: false, assignedTo: 'Emma' }
      ],
      shoppingList: ['Anniversary card', 'Flowers', 'New outfit for date'],
      budget: 300,
      notifications: [
        { days: 30, sent: false },
        { days: 14, sent: false },
        { days: 7, sent: false },
        { days: 1, sent: false }
      ],
      pastCelebrations: [
        { year: '2024', notes: 'Went to The French Room. Kids made pancakes. Beautiful evening.', photos: 12 }
      ],
      autoSuggestions: [
        '🤖 Restaurant tip: The French Room was perfect last year - book 2 weeks ahead',
        '🤖 Babysitter: Martha available to watch kids',
        '🤖 Gift idea: 18th anniversary traditional gift is porcelain',
        '🤖 Auto-reminder: Will notify you 30 days before'
      ]
    }
  ])

  const [values, setValues] = useState([
    {
      id: '1',
      title: 'Honesty & Trust',
      description: 'We communicate openly, even when it\'s hard. Truth builds trust.',
      examples: ['Weekly check-ins', 'No secrets policy', 'Transparent finances'],
      icon: '🤝'
    },
    {
      id: '2',
      title: 'Growth Mindset',
      description: 'We embrace challenges as opportunities to learn and improve together.',
      examples: ['Celebrate failures as learning', 'Try new things monthly', 'Support each other\'s goals'],
      icon: '🌱'
    },
    {
      id: '3',
      title: 'Generosity',
      description: 'We give our time, energy, and resources to help others and our community.',
      examples: ['Monthly volunteering', '10% charitable giving', 'Help neighbors'],
      icon: '💝'
    },
    {
      id: '4',
      title: 'Adventure & Curiosity',
      description: 'We explore the world with wonder and embrace new experiences.',
      examples: ['Try new foods', 'Travel together', 'Ask questions'],
      icon: '🌍'
    }
  ])

  const [memories, setMemories] = useState([
    {
      id: '1',
      title: "Emma's Science Fair Win",
      date: 'Nov 2025',
      description: 'First place in regional competition. Project on renewable energy. Whole family attended.',
      category: 'Achievement',
      photos: 12,
      tags: ['Milestone', 'Education', 'Emma'],
      participants: ['Emma', 'Sarah', 'David', 'Noah']
    },
    {
      id: '2',
      title: 'Family Trip to Yellowstone',
      date: 'Oct 2025',
      description: '5 days exploring nature. Bonded over campfires and hiking. Noah saw his first bear.',
      category: 'Travel',
      photos: 47,
      tags: ['Travel', 'Adventure', 'Nature'],
      participants: ['Sarah', 'David', 'Emma', 'Noah']
    },
    {
      id: '3',
      title: "Noah's First Soccer Goal",
      date: 'Sep 2025',
      description: 'Scored the winning goal in the championship game. Team celebration afterwards.',
      category: 'Achievement',
      photos: 8,
      tags: ['Sports', 'Milestone', 'Noah'],
      participants: ['Noah', 'David']
    }
  ])

  const handleCreateRitual = () => {
    if (!ritualName.trim()) {
      showToast('Please enter a ritual name', 'warning')
      return
    }
    const newRitual = {
      id: Date.now().toString(),
      name: ritualName,
      frequency: ritualFrequency.charAt(0).toUpperCase() + ritualFrequency.slice(1),
      category: ritualFrequency,
      lastDone: 'Never',
      impact: 'To be measured',
      impactScore: 0,
      streak: 0,
      description: ritualDescription,
      participants: ritualParticipants,
      completionHistory: []
    }
    setFamilyRituals([newRitual, ...familyRituals])
    setShowRitualModal(false)
    setRitualName('')
    setRitualDescription('')
    setRitualParticipants([])
    showToast('Ritual created successfully!', 'success')
  }

  const handleCompleteRitual = (ritual) => {
    const updatedRituals = familyRituals.map(r => 
      r.id === ritual.id 
        ? { ...r, lastDone: 'just now', streak: r.streak + 1 }
        : r
    )
    setFamilyRituals(updatedRituals)
    showToast(`${ritual.name} completed! Streak: ${ritual.streak + 1}`, 'success')
  }

  const handleCreateValue = () => {
    if (!valueName.trim()) {
      showToast('Please enter a value name', 'warning')
      return
    }
    const newValue = {
      id: Date.now().toString(),
      title: valueName,
      description: valueDescription,
      examples: [],
      icon: valueIcon
    }
    setValues([...values, newValue])
    setShowValueModal(false)
    setValueName('')
    setValueDescription('')
    setValueIcon('⭐')
    showToast('Value added successfully!', 'success')
  }

  const handleCreateMemory = () => {
    if (!memoryTitle.trim()) {
      showToast('Please enter a memory title', 'warning')
      return
    }
    const newMemory = {
      id: Date.now().toString(),
      title: memoryTitle,
      date: memoryDate || 'Recent',
      description: memoryDescription,
      category: memoryCategory || 'General',
      photos: 0,
      tags: memoryTags.split(',').map(t => t.trim()).filter(t => t),
      participants: []
    }
    setMemories([newMemory, ...memories])
    setShowMemoryModal(false)
    setMemoryTitle('')
    setMemoryDate('')
    setMemoryDescription('')
    setMemoryCategory('')
    setMemoryTags('')
    showToast('Memory added successfully!', 'success')
  }

  const handleCreateFestival = () => {
    if (!festivalName.trim()) {
      showToast('Please enter a festival name', 'warning')
      return
    }
    const newFestival = {
      id: Date.now().toString(),
      name: festivalName,
      date: festivalDate,
      type: festivalType,
      traditions: festivalTraditions.split(',').map(t => t.trim()).filter(t => t),
      automated: false,
      daysUntil: 0,
      checklist: [],
      shoppingList: [],
      budget: parseInt(festivalBudget) || 0,
      notifications: [],
      pastCelebrations: [],
      autoSuggestions: []
    }
    setFestivals([...festivals, newFestival])
    setShowFestivalModal(false)
    setFestivalName('')
    setFestivalDate('')
    setFestivalBudget('')
    setFestivalTraditions('')
    showToast('Festival added successfully!', 'success')
  }

  const handleToggleChecklistItem = (festivalId, taskIndex) => {
    setFestivals(festivals.map(f => {
      if (f.id === festivalId) {
        const newChecklist = [...f.checklist]
        newChecklist[taskIndex].completed = !newChecklist[taskIndex].completed
        return { ...f, checklist: newChecklist }
      }
      return f
    }))
    showToast('Checklist updated!', 'success')
  }

  const handleAddChecklistItem = (festivalId, task, assignedTo) => {
    setFestivals(festivals.map(f => {
      if (f.id === festivalId) {
        return {
          ...f,
          checklist: [...f.checklist, { task, completed: false, assignedTo }]
        }
      }
      return f
    }))
    showToast('Task added to checklist!', 'success')
  }

  const handleToggleAutomation = (festivalId) => {
    setFestivals(festivals.map(f => {
      if (f.id === festivalId) {
        const newAutomated = !f.automated
        if (newAutomated) {
          showToast('🤖 Automation enabled! You\'ll receive reminders and AI suggestions.', 'success')
        } else {
          showToast('Automation disabled. Manual mode activated.', 'info')
        }
        return { ...f, automated: newAutomated }
      }
      return f
    }))
  }

  return (
  <div className="page">
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={hideToast} />
      
      {/* Create Ritual Modal */}
      <Modal 
        isOpen={showRitualModal} 
        onClose={() => setShowRitualModal(false)} 
        title="🎭 Create New Ritual"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Ritual Name</label>
            <input 
              type="text" 
              value={ritualName}
              onChange={(e) => setRitualName(e.target.value)}
              placeholder="e.g., Friday Movie Night"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Frequency</label>
            <select 
              value={ritualFrequency}
              onChange={(e) => setRitualFrequency(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Description</label>
            <textarea 
              value={ritualDescription}
              onChange={(e) => setRitualDescription(e.target.value)}
              placeholder="What happens during this ritual?"
              rows={3}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Participants</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {familyMembers.map(member => (
                <Badge 
                  key={member.name} 
                  variant={ritualParticipants.includes(member.name) ? 'success' : 'default'}
                  onClick={() => {
                    if (ritualParticipants.includes(member.name)) {
                      setRitualParticipants(ritualParticipants.filter(p => p !== member.name))
                    } else {
                      setRitualParticipants([...ritualParticipants, member.name])
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {member.name}
                </Badge>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="ghost" onClick={() => setShowRitualModal(false)}>Cancel</button>
            <button className="primary" onClick={handleCreateRitual}>Create Ritual</button>
          </div>
        </div>
      </Modal>

      {/* Add Value Modal */}
      <Modal 
        isOpen={showValueModal} 
        onClose={() => setShowValueModal(false)} 
        title="⭐ Define Family Value"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Value Icon</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['⭐', '🤝', '🌱', '💝', '🌍', '💪', '🎯', '❤️', '🧠', '🎨'].map(icon => (
                <button
                  key={icon}
                  onClick={() => setValueIcon(icon)}
                  style={{
                    fontSize: '32px',
                    padding: '8px',
                    border: valueIcon === icon ? '2px solid #ff6b9d' : '2px solid transparent',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Value Name</label>
            <input 
              type="text" 
              value={valueName}
              onChange={(e) => setValueName(e.target.value)}
              placeholder="e.g., Courage & Resilience"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Description</label>
            <textarea 
              value={valueDescription}
              onChange={(e) => setValueDescription(e.target.value)}
              placeholder="What does this value mean to your family?"
              rows={4}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="ghost" onClick={() => setShowValueModal(false)}>Cancel</button>
            <button className="primary" onClick={handleCreateValue}>Add Value</button>
          </div>
        </div>
      </Modal>

      {/* Add Festival Modal */}
      <Modal 
        isOpen={showFestivalModal} 
        onClose={() => setShowFestivalModal(false)} 
        title="🎉 Add Festival/Celebration"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Festival Name</label>
            <input 
              type="text" 
              value={festivalName}
              onChange={(e) => setFestivalName(e.target.value)}
              placeholder="e.g., Noah's Birthday"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Type</label>
            <select 
              value={festivalType}
              onChange={(e) => setFestivalType(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            >
              <option value="birthday">🎂 Birthday</option>
              <option value="holiday">🎄 Holiday</option>
              <option value="anniversary">💍 Anniversary</option>
              <option value="cultural">🎊 Cultural Event</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Date</label>
            <input 
              type="text" 
              value={festivalDate}
              onChange={(e) => setFestivalDate(e.target.value)}
              placeholder="e.g., Dec 25 or 12/25/2025"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Budget (optional)</label>
            <input 
              type="number" 
              value={festivalBudget}
              onChange={(e) => setFestivalBudget(e.target.value)}
              placeholder="e.g., 250"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Traditions (comma-separated)</label>
            <textarea 
              value={festivalTraditions}
              onChange={(e) => setFestivalTraditions(e.target.value)}
              placeholder="e.g., Birthday breakfast, Choose dinner, Family game night"
              rows={3}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="ghost" onClick={() => setShowFestivalModal(false)}>Cancel</button>
            <button className="primary" onClick={handleCreateFestival}>Add Festival</button>
          </div>
        </div>
      </Modal>

      {/* Festival Detail Modal */}
      <Modal 
        isOpen={showFestivalDetailModal} 
        onClose={() => setShowFestivalDetailModal(false)} 
        title={selectedFestival ? `🎉 ${selectedFestival.name}` : 'Festival Details'}
      >
        {selectedFestival && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>{selectedFestival.date}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#ff6b9d' }}>{selectedFestival.daysUntil} days away</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', textAlign: 'right' }}>Budget</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>${selectedFestival.budget}</div>
              </div>
            </div>

            {/* Automation Toggle */}
            <div style={{ padding: '16px', background: selectedFestival.automated ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 107, 157, 0.05)', borderRadius: 'var(--radius-md)', border: '2px solid ' + (selectedFestival.automated ? '#667eea' : '#fce7f3') }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                    {selectedFestival.automated ? '🤖 Automation Enabled' : '✋ Manual Mode'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {selectedFestival.automated 
                      ? 'You\'ll receive automatic reminders, AI suggestions, and smart notifications' 
                      : 'Manage everything manually. Enable automation for smart features.'}
                  </div>
                </div>
                <Switch 
                  checked={selectedFestival.automated}
                  onChange={() => handleToggleAutomation(selectedFestival.id)}
                />
              </div>
            </div>

            {/* Traditions */}
            <div>
              <div style={{ fontWeight: 700, marginBottom: '12px', fontSize: '16px' }}>Our Traditions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedFestival.traditions.map((tradition, i) => (
                  <div key={i} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>✨</span>
                    <span style={{ fontSize: '14px', color: '#1e293b' }}>{tradition}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div>
              <div style={{ fontWeight: 700, marginBottom: '12px', fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Checklist</span>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 400 }}>
                  {selectedFestival.checklist.filter(c => c.completed).length} / {selectedFestival.checklist.length} complete
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {selectedFestival.checklist.map((item, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      padding: '12px', 
                      background: item.completed ? 'rgba(16, 185, 129, 0.1)' : '#ffffff', 
                      border: '2px solid ' + (item.completed ? '#10b981' : '#fce7f3'),
                      borderRadius: 'var(--radius-md)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleToggleChecklistItem(selectedFestival.id, i)}
                  >
                    <input 
                      type="checkbox" 
                      checked={item.completed}
                      onChange={() => {}}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', color: '#1e293b', textDecoration: item.completed ? 'line-through' : 'none' }}>
                        {item.task}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        Assigned to: {item.assignedTo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Add new task */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text"
                  value={newChecklistTask}
                  onChange={(e) => setNewChecklistTask(e.target.value)}
                  placeholder="Add new task..."
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newChecklistTask.trim()) {
                      handleAddChecklistItem(selectedFestival.id, newChecklistTask, newTaskAssignee)
                      setNewChecklistTask('')
                    }
                  }}
                />
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  style={{ padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
                >
                  {familyMembers.map(m => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
                <button 
                  className="primary"
                  onClick={() => {
                    if (newChecklistTask.trim()) {
                      handleAddChecklistItem(selectedFestival.id, newChecklistTask, newTaskAssignee)
                      setNewChecklistTask('')
                    }
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* AI Suggestions (only if automated) */}
            {selectedFestival.automated && selectedFestival.autoSuggestions.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, marginBottom: '12px', fontSize: '16px' }}>AI Suggestions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedFestival.autoSuggestions.map((suggestion, i) => (
                    <div key={i} style={{ padding: '12px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: '#475569' }}>
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Celebrations */}
            {selectedFestival.pastCelebrations.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, marginBottom: '12px', fontSize: '16px' }}>Past Celebrations</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedFestival.pastCelebrations.map((past, i) => (
                    <div key={i} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontWeight: 600, marginBottom: '8px', color: '#ff6b9d' }}>{past.year}</div>
                      <div style={{ fontSize: '14px', color: '#475569', marginBottom: '8px' }}>{past.notes}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>📷 {past.photos} photos</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Memory Modal */}
      <Modal 
        isOpen={showMemoryModal} 
        onClose={() => setShowMemoryModal(false)} 
        title="📸 Add Memory"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Memory Title</label>
            <input 
              type="text" 
              value={memoryTitle}
              onChange={(e) => setMemoryTitle(e.target.value)}
              placeholder="e.g., First Day of School"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Date</label>
            <input 
              type="text" 
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
              placeholder="e.g., Nov 2025"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Category</label>
            <select 
              value={memoryCategory}
              onChange={(e) => setMemoryCategory(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            >
              <option value="">Select category...</option>
              <option value="Achievement">Achievement</option>
              <option value="Travel">Travel</option>
              <option value="Celebration">Celebration</option>
              <option value="Milestone">Milestone</option>
              <option value="Adventure">Adventure</option>
              <option value="Family Time">Family Time</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Description</label>
            <textarea 
              value={memoryDescription}
              onChange={(e) => setMemoryDescription(e.target.value)}
              placeholder="Tell the story of this memory..."
              rows={4}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Tags (comma-separated)</label>
            <input 
              type="text" 
              value={memoryTags}
              onChange={(e) => setMemoryTags(e.target.value)}
              placeholder="e.g., Milestone, Education, Emma"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="ghost" onClick={() => setShowMemoryModal(false)}>Cancel</button>
            <button className="primary" onClick={handleCreateMemory}>Add Memory</button>
          </div>
        </div>
      </Modal>

      {/* Ritual Impact Modal */}
      <Modal 
        isOpen={showImpactModal} 
        onClose={() => setShowImpactModal(false)} 
        title={`📊 ${selectedRitual?.name} Impact`}
      >
        {selectedRitual && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', fontWeight: 800, color: '#ff6b9d', marginBottom: '8px' }}>
                {selectedRitual.impactScore}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Impact Score
              </div>
            </div>
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Consistency</span>
                <span style={{ fontSize: '14px', color: '#64748b' }}>{selectedRitual.streak} week streak</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(selectedRitual.streak * 2, 100)}%`, background: 'linear-gradient(90deg, #ff6b9d 0%, #fbbf24 100%)', transition: 'width 0.3s ease' }}></div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Recent Completions</div>
              {selectedRitual.completionHistory.length > 0 ? (
                selectedRitual.completionHistory.map((entry, i) => (
                  <div key={i} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{entry.date}</div>
                    <div style={{ fontSize: '14px', color: '#1e293b' }}>{entry.notes}</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  No completion history yet
                </div>
              )}
            </div>
            <div style={{ padding: '16px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ color: '#667eea' }}>🤖 AI Insight:</strong>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#475569' }}>
                This ritual has a {selectedRitual.impactScore}% positive impact on family bonding. Keep it up!
              </p>
            </div>
          </div>
        )}
      </Modal>

    <div className="page-head">
      <div>
        <p className="eyebrow">Rituals & Culture</p>
          <h2>Build Your Family Legacy</h2>
          <p className="lede">Track traditions, define values, celebrate festivals, and preserve memories</p>
      </div>
        <button className="primary" onClick={() => setShowRitualModal(true)}>Create New Ritual</button>
    </div>
      {/* Ritual Stats Overview */}
      <div className="ritual-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎭</div>
          <div className="stat-value">{familyRituals.length}</div>
          <div className="stat-label">Active Rituals</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{Math.max(...familyRituals.map(r => r.streak))}</div>
          <div className="stat-label">Longest Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{values.length}</div>
          <div className="stat-label">Core Values</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📸</div>
          <div className="stat-value">{memories.length}</div>
          <div className="stat-label">Memories Saved</div>
        </div>
      </div>

    <div className="grid two">
        {/* Weekly Routines Tracking */}
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
              <div className="eyebrow">Weekly Routines</div>
              <h3>Track Your Rituals</h3>
          </div>
            <Dropdown
              trigger={<button className="ghost">Filter</button>}
              items={[
                { label: 'All Rituals', onClick: () => {} },
                { label: 'Daily', onClick: () => {} },
                { label: 'Weekly', onClick: () => {} },
                { label: 'Monthly', onClick: () => {} },
                { label: 'Yearly', onClick: () => {} }
              ]}
            />
        </div>
        <div className="ritual-list">
            {familyRituals.map((ritual) => (
              <div className="ritual-card" key={ritual.id}>
                <div style={{ flex: 1 }}>
                <div className="ritual-name">{ritual.name}</div>
                  <div className="ritual-meta">
                    {ritual.frequency} · Last: {ritual.lastDone} · 🔥 {ritual.streak} streak
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                <Pill variant="success">{ritual.impact}</Pill>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {ritual.participants.length} participants
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    className="ghost small"
                    onClick={() => {
                      setSelectedRitual(ritual)
                      setShowImpactModal(true)
                    }}
                  >
                    📊 Impact
                  </button>
                  <button 
                    className="primary small"
                    onClick={() => handleCompleteRitual(ritual)}
                  >
                    ✓ Complete
                  </button>
              </div>
            </div>
          ))}
        </div>
      </div>

        {/* Festival & Celebration Automation */}
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
              <div className="eyebrow">Upcoming Celebrations</div>
              <h3>Festival Automation</h3>
          </div>
            <button className="ghost" onClick={() => setShowFestivalModal(true)}>+ Add Festival</button>
        </div>
          <div className="festival-list">
            {festivals.sort((a, b) => a.daysUntil - b.daysUntil).map((festival) => (
              <div 
                className="festival-card" 
                key={festival.id}
                onClick={() => {
                  setSelectedFestival(festival)
                  setShowFestivalDetailModal(true)
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="festival-icon">
                  {festival.type === 'birthday' && '🎂'}
                  {festival.type === 'holiday' && '🎄'}
                  {festival.type === 'anniversary' && '💍'}
                  {festival.type === 'cultural' && '🎊'}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="festival-name">{festival.name}</div>
                  <div className="festival-date">{festival.date} · {festival.daysUntil} days away</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    {festival.traditions.length} traditions · {festival.checklist.length} tasks · {festival.automated ? '🤖 Auto' : '✋ Manual'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <Badge variant={festival.daysUntil < 14 ? 'danger' : 'default'}>
                    {festival.daysUntil < 14 ? 'Soon' : 'Upcoming'}
                  </Badge>
                  {festival.checklist.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {festival.checklist.filter(c => c.completed).length}/{festival.checklist.length} done
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
    </div>
      </div>

      {/* Family Values & Principles */}
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">Family Code</div>
            <h3>Values, Principles & Beliefs</h3>
          </div>
          <button className="ghost" onClick={() => setShowValueModal(true)}>+ Add Value</button>
        </div>
        <div className="values-grid">
          {values.map((value) => (
            <div 
              className="value-card-enhanced" 
              key={value.id}
              onClick={() => {
                setSelectedValue(value)
              }}
            >
              <div className="value-icon-large">{value.icon}</div>
              <h4>{value.title}</h4>
              <p>{value.description}</p>
              {value.examples.length > 0 && (
                <div className="value-examples">
                  <strong>How we live it:</strong>
                  <ul>
                    {value.examples.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Photo & Memory Timeline */}
    <div className="panel-card">
      <div className="card-header space-between">
        <div>
          <div className="eyebrow">Memory Timeline</div>
            <h3>Our Story in Moments</h3>
        </div>
          <button className="ghost" onClick={() => setShowMemoryModal(true)}>📸 Add Memory</button>
      </div>
      <div className="memory-timeline">
          {memories.map((memory) => (
            <div className="memory-item-enhanced" key={memory.id}>
              <div className="memory-date-badge">{memory.date}</div>
              <div className="memory-content-enhanced">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h4>{memory.title}</h4>
                  <Badge>{memory.category}</Badge>
            </div>
                <p>{memory.description}</p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {memory.tags.map(tag => (
                      <Pill key={tag} variant="default">{tag}</Pill>
                    ))}
          </div>
                  {memory.photos > 0 && (
                    <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📷 {memory.photos} photos
        </div>
                  )}
            </div>
                {memory.participants.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                    {memory.participants.map(p => (
                      <div key={p} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--family-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                        {p[0]}
          </div>
                    ))}
        </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ritual Impact Measurement */}
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">Analytics</div>
            <h3>Ritual Impact Measurement</h3>
          </div>
        </div>
        <div className="impact-grid">
          {familyRituals.filter(r => r.impactScore > 0).map((ritual) => (
            <div className="impact-card" key={ritual.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{ritual.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{ritual.frequency}</div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#ff6b9d' }}>
                  {ritual.impactScore}
                </div>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${ritual.impactScore}%`, background: 'linear-gradient(90deg, #ff6b9d 0%, #fbbf24 100%)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#475569' }}>{ritual.impact}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: 'var(--radius-md)' }}>
          <strong style={{ color: '#667eea' }}>🤖 AI Insight:</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#475569' }}>
            Your family's ritual consistency is 87% higher than average. The Sunday Family Dinner has the highest impact on bonding (95 score). Consider adding a monthly adventure ritual to boost excitement.
          </p>
      </div>
    </div>
  </div>
)
}

const PlanningPage = () => {
  const { toast, showToast, hideToast } = useToast()

  return (
  <div className="page">
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={hideToast} />
      
    <div className="page-head">
      <div>
        <p className="eyebrow">Family Planning</p>
        <h2>Turn Chaos Into Clarity</h2>
        <p className="lede">Structure big decisions, plan education, simulate future scenarios</p>
      </div>
        <button className="primary" onClick={() => showToast('Plan wizard started!', 'info')}>Start New Plan</button>
    </div>
    <div className="grid two">
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">Active Decisions</div>
            <h3>What We're Deciding</h3>
          </div>
        </div>
        <div className="decision-list">
          {decisions.map((decision) => (
            <div className="decision-card" key={decision.title}>
              <div>
                <div className="decision-title">{decision.title}</div>
                <div className="decision-meta">Deadline: {decision.deadline}</div>
                <div className="decision-stakeholders">
                  {decision.stakeholders.map((s) => (
                    <Pill key={s}>{s}</Pill>
                  ))}
                </div>
              </div>
              <span className={`badge ${decision.status === 'In Progress' ? 'warning' : 'neutral'}`}>{decision.status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">10-Year Vision</div>
            <h3>Where We're Going</h3>
          </div>
          <button className="ghost">Edit Vision</button>
        </div>
        <div className="vision-content">
          <div className="vision-item">
            <h4>2028: Emma's High School Graduation</h4>
            <p>College applications complete. Scholarship secured. Strong academic foundation.</p>
          </div>
          <div className="vision-item">
            <h4>2030: Financial Independence</h4>
            <p>Debt-free. Retirement on track. Passive income established.</p>
          </div>
          <div className="vision-item">
            <h4>2035: Legacy Established</h4>
            <p>Family traditions documented. Values passed down. Next generation thriving.</p>
          </div>
        </div>
      </div>
    </div>
    <div className="panel-card">
      <div className="card-header space-between">
        <div>
          <div className="eyebrow">Education Planning</div>
          <h3>Learning Roadmap</h3>
        </div>
      </div>
      <div className="education-grid">
        <div className="education-card">
          <h4>Emma's College Path</h4>
          <div className="education-details">
            <div className="detail-row">
              <span>Target schools</span>
              <span>MIT, Stanford, Berkeley</span>
            </div>
            <div className="detail-row">
              <span>Financial plan</span>
              <span>$100K saved · Scholarships targeted</span>
            </div>
            <div className="detail-row">
              <span>Timeline</span>
              <span>Applications open in 3 years</span>
            </div>
          </div>
        </div>
        <div className="education-card">
          <h4>Noah's Development</h4>
          <div className="education-details">
            <div className="detail-row">
              <span>Focus areas</span>
              <span>STEM, Athletics, Arts</span>
            </div>
            <div className="detail-row">
              <span>Activities</span>
              <span>Soccer, Coding club, Piano</span>
            </div>
            <div className="detail-row">
              <span>Next milestone</span>
              <span>Middle school preparation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}

const LegacyPage = () => {
  const { toast, showToast, hideToast } = useToast()

  return (
  <div className="page">
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={hideToast} />
      
    <div className="page-head">
      <div>
        <p className="eyebrow">Legacy Vault</p>
        <h2>Build a Dynasty, Not Just a Moment</h2>
        <p className="lede">Letters to future generations, wisdom library, asset instructions, genealogy</p>
      </div>
        <button className="primary" onClick={() => showToast('Legacy item creator opened!', 'info')}>Create Legacy Item</button>
    </div>
    <div className="grid two">
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">Vault</div>
            <h3>Protected Legacy Items</h3>
          </div>
        </div>
        <div className="legacy-list">
          {legacyItems.map((item) => (
            <div className="legacy-card" key={item.title}>
              <div className="legacy-icon">{item.locked ? '🔒' : '📂'}</div>
              <div>
                <div className="legacy-title">{item.title}</div>
                <div className="legacy-meta">{item.type}</div>
                <div className="legacy-access">{item.access}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">Wisdom</div>
            <h3>Lessons for the Future</h3>
          </div>
          <button className="ghost">Add Lesson</button>
        </div>
        <div className="wisdom-list">
          <div className="wisdom-card">
            <h4>On Family Communication</h4>
            <p>Always assume positive intent. Listen first, respond second. Schedule dedicated time to connect.</p>
            <div className="wisdom-author">— Sarah, 2025</div>
          </div>
          <div className="wisdom-card">
            <h4>On Money Management</h4>
            <p>Live below your means. Invest early and often. Financial freedom is about time, not things.</p>
            <div className="wisdom-author">— David, 2024</div>
          </div>
        </div>
      </div>
    </div>
    <div className="panel-card">
      <div className="card-header space-between">
        <div>
          <div className="eyebrow">Genealogy</div>
          <h3>Our Family Tree</h3>
        </div>
        <button className="ghost">Expand Tree</button>
      </div>
      <div className="genealogy-preview">
        <div className="tree-node">
          <div className="tree-generation-label">👴 Grandparents</div>
          <div className="tree-generation">
            <div className="tree-member">
              <div className="tree-avatar">
                <span>M</span>
                <div className="tree-avatar-ring"></div>
              </div>
              <div>Martha (68)</div>
              <div className="tree-member-role">Grandmother</div>
            </div>
            <div className="tree-member">
              <div className="tree-avatar">
                <span>R</span>
                <div className="tree-avatar-ring"></div>
              </div>
              <div>Robert (70)</div>
              <div className="tree-member-role">Grandfather</div>
            </div>
          </div>
          <div className="tree-connector">
            <div className="tree-connector-line"></div>
            <span>↓</span>
            <div className="tree-connector-line"></div>
          </div>
          <div className="tree-generation-label">👨‍👩 Parents</div>
          <div className="tree-generation">
            <div className="tree-member">
              <div className="tree-avatar">
                <span>S</span>
                <div className="tree-avatar-ring"></div>
              </div>
              <div>Sarah (42)</div>
              <div className="tree-member-role">Mother</div>
            </div>
            <div className="tree-member">
              <div className="tree-avatar">
                <span>D</span>
                <div className="tree-avatar-ring"></div>
              </div>
              <div>David (44)</div>
              <div className="tree-member-role">Father</div>
            </div>
          </div>
          <div className="tree-connector">
            <div className="tree-connector-line"></div>
            <span>↓</span>
            <div className="tree-connector-line"></div>
          </div>
          <div className="tree-generation-label">👧👦 Children</div>
          <div className="tree-generation">
            <div className="tree-member">
              <div className="tree-avatar">
                <span>E</span>
                <div className="tree-avatar-ring"></div>
              </div>
              <div>Emma (12)</div>
              <div className="tree-member-role">Daughter</div>
            </div>
            <div className="tree-member">
              <div className="tree-avatar">
                <span>N</span>
                <div className="tree-avatar-ring"></div>
              </div>
              <div>Noah (8)</div>
              <div className="tree-member-role">Son</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}

const AIPage = () => {
  const { toast, showToast, hideToast } = useToast()
  const [aiInput, setAiInput] = useState('')
  const [aiMessages, setAiMessages] = useState([
    { role: 'user', content: 'How should we approach Emma\'s high school decision?' },
    { 
      role: 'assistant', 
      content: 'Based on Emma\'s interests (STEM, science fair wins), your family values (growth mindset), and your financial goals (college fund tracking), I recommend:\n\n1. Visit 3 schools together (MIT prep, local STEM magnet, well-rounded option)\n2. Create decision matrix with Emma\'s input (academics 40%, social 30%, location 20%, cost 10%)\n3. Set deadline: 2 months for visits, 1 month for decision\n\nYour family typically makes best decisions when all stakeholders are involved early. Would you like me to generate a visit schedule?'
    }
  ])

  const handleSendMessage = () => {
    if (!aiInput.trim()) return
    
    const userMessage = aiInput
    setAiMessages([...aiMessages, { role: 'user', content: userMessage }])
    setAiInput('')
    
    setTimeout(() => {
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: `I understand your question about "${userMessage.substring(0, 50)}...". Based on your family's history and patterns, here's my recommendation...\n\nThis is a demo response. The AI would provide personalized insights based on your family data.`
      }])
      showToast('AI response generated', 'success')
    }, 1000)
  }

  return (
  <div className="page">
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={hideToast} />
      
    <div className="page-head">
      <div>
        <p className="eyebrow">AI Family Mind</p>
        <h2>Your AI Chief Family Officer</h2>
        <p className="lede">Intelligence that learns your family's patterns and helps you thrive</p>
      </div>
        <button className="primary" onClick={() => showToast('AI is ready to help!', 'info')}>Ask AI Anything</button>
    </div>
    <div className="ai-hero">
      <div className="ai-stats-grid">
        <div className="ai-stat-card">
          <div className="ai-stat-icon">🧠</div>
          <div className="ai-stat-value">1,247</div>
          <div className="ai-stat-label">Insights generated</div>
        </div>
        <div className="ai-stat-card">
          <div className="ai-stat-icon">💡</div>
          <div className="ai-stat-value">89</div>
          <div className="ai-stat-label">Conflicts resolved</div>
        </div>
        <div className="ai-stat-card">
          <div className="ai-stat-icon">📊</div>
          <div className="ai-stat-value">94%</div>
          <div className="ai-stat-label">Prediction accuracy</div>
        </div>
        <div className="ai-stat-card">
          <div className="ai-stat-icon">⚡</div>
          <div className="ai-stat-value">{"< 2s"}</div>
          <div className="ai-stat-label">Response time</div>
        </div>
      </div>
    </div>
    <div className="grid two">
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">Recent Insights</div>
            <h3>What AI Discovered</h3>
          </div>
        </div>
        <div className="ai-insights-list">
          <div className="ai-insight-card">
            <div className="insight-icon">📈</div>
            <div>
              <div className="insight-title">Spending Pattern Shift</div>
              <div className="insight-detail">Grocery expenses up 18% this month. Suggest reviewing weekly meal planning.</div>
              <div className="insight-actions">
                <button className="ghost small">Review Details</button>
                <button className="ghost small">Create Budget Plan</button>
              </div>
            </div>
          </div>
          <div className="ai-insight-card">
            <div className="insight-icon">❤️</div>
            <div>
              <div className="insight-title">Relationship Health Alert</div>
              <div className="insight-detail">Emma's stress levels elevated. Last quality 1:1 time was 12 days ago.</div>
              <div className="insight-actions">
                <button className="ghost small">Schedule Time</button>
                <button className="ghost small">View Patterns</button>
              </div>
            </div>
          </div>
          <div className="ai-insight-card">
            <div className="insight-icon">🎯</div>
            <div>
              <div className="insight-title">Goal Progress Update</div>
              <div className="insight-detail">College fund on track. Current pace will exceed target by 8%.</div>
              <div className="insight-actions">
                <button className="ghost small">View Forecast</button>
                <button className="ghost small">Adjust Plan</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="panel-card">
        <div className="card-header space-between">
          <div>
            <div className="eyebrow">AI Capabilities</div>
            <h3>What Your AI Can Do</h3>
          </div>
        </div>
        <div className="capabilities-grid">
          <div className="capability-card">
            <div className="capability-icon">🗣️</div>
            <h4>Emotional Translation</h4>
            <p>Reframe difficult conversations with empathy and clarity</p>
          </div>
          <div className="capability-card">
            <div className="capability-icon">🤝</div>
            <h4>Conflict Mediation</h4>
            <p>Suggest fair compromises based on family values</p>
          </div>
          <div className="capability-card">
            <div className="capability-icon">📅</div>
            <h4>Smart Planning</h4>
            <p>Optimize schedules, predict conflicts, suggest timing</p>
          </div>
          <div className="capability-card">
            <div className="capability-icon">💰</div>
            <h4>Financial Advisor</h4>
            <p>Track spending, predict needs, optimize goals</p>
          </div>
          <div className="capability-card">
            <div className="capability-icon">🎓</div>
            <h4>Education Coach</h4>
            <p>Personalized learning paths for each child</p>
          </div>
          <div className="capability-card">
            <div className="capability-icon">📝</div>
            <h4>Memory Keeper</h4>
            <p>Auto-generate timelines, summaries, milestones</p>
          </div>
        </div>
      </div>
    </div>
    <div className="panel-card">
      <div className="card-header space-between">
        <div>
          <div className="eyebrow">AI Console</div>
          <h3>Chat With Your Family AI</h3>
        </div>
      </div>
      <div className="ai-console">
        <div className="console-messages">
          {aiMessages.map((msg, idx) => (
            <div key={idx} className={`ai-message ${msg.role}`}>
              <div className="message-content">{msg.content}</div>
              {msg.role === 'assistant' && (
            <div className="message-actions">
                  <button className="ghost small" onClick={() => showToast('Schedule generated!', 'success')}>Generate Schedule</button>
                  <button className="ghost small" onClick={() => showToast('Framework opened!', 'info')}>View Decision Framework</button>
                  <button className="ghost small" onClick={() => showToast('Shared with family!', 'success')}>Share with Family</button>
            </div>
              )}
          </div>
          ))}
        </div>
        <div className="console-input">
          <input 
            type="text" 
            placeholder="Ask your AI anything about your family..." 
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button className="primary" onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
    <div className="panel-card ai-learning">
      <div className="card-header space-between">
        <div>
          <div className="eyebrow">What AI Learns</div>
          <h3>Your Family's Intelligence Graph</h3>
        </div>
      </div>
      <div className="learning-categories">
        <div className="learning-card">
          <h4>Communication Patterns</h4>
          <ul>
            <li>Best times for family discussions (Sunday evenings)</li>
            <li>Conflict triggers and resolution styles</li>
            <li>Emotional vocabulary preferences</li>
            <li>Decision-making processes that work</li>
          </ul>
        </div>
        <div className="learning-card">
          <h4>Financial Behavior</h4>
          <ul>
            <li>Spending patterns and seasonal trends</li>
            <li>Goal-setting tendencies and success rates</li>
            <li>Risk tolerance and investment preferences</li>
            <li>Emergency fund usage patterns</li>
          </ul>
        </div>
        <div className="learning-card">
          <h4>Emotional Rhythms</h4>
          <ul>
            <li>Stress indicators per family member</li>
            <li>Mood patterns and triggers</li>
            <li>Energy levels throughout week</li>
            <li>Connection needs and fulfillment</li>
          </ul>
        </div>
        <div className="learning-card">
          <h4>Care Cycles</h4>
          <ul>
            <li>Health appointment adherence</li>
            <li>Medication compliance patterns</li>
            <li>Child development milestones</li>
            <li>Parent care attention needs</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)
}

const HomePage = () => {
  const { toast, showToast, hideToast } = useToast()
  const navigate = useNavigate()

  const totalWealth = wealthItems.reduce((sum, item) => {
    const value = parseFloat(item.value.replace(/[^0-9.]/g, '')) * (item.value.includes('K') ? 1000 : item.value.includes('M') ? 1000000 : 1)
    return sum + value
  }, 0)

  const activeCareTasks = careTasks.filter(task => task.priority === 'High').length
  const upcomingRituals = rituals.filter(r => r.frequency === 'Weekly' || r.frequency === 'Daily').length

  return (
    <div className="page dashboard-page">
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={hideToast} />
      
      <div className="dashboard-header">
        <div>
          <h1>Family Dashboard</h1>
          <p>Welcome back! Here's what's happening with your family.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn-secondary" onClick={() => navigate('/family/hub')}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L2 7L10 12L18 7L10 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L10 22L18 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L10 17L18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            New Conversation
          </button>
      </div>
      </div>

      <div className="dashboard-stats-grid">
        <div className="stat-card-large" onClick={() => navigate('/family/wealth')}>
          <div className="stat-icon-large">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Wealth</div>
            <div className="stat-value-large">${(totalWealth / 1000).toFixed(1)}K</div>
            <div className="stat-change positive">+2.3% this month</div>
          </div>
        </div>

        <div className="stat-card-large" onClick={() => navigate('/family/hub')}>
          <div className="stat-icon-large">💬</div>
          <div className="stat-content">
            <div className="stat-label">Active Conversations</div>
            <div className="stat-value-large">12</div>
            <div className="stat-change">3 new today</div>
          </div>
        </div>

        <div className="stat-card-large" onClick={() => navigate('/family/care')}>
          <div className="stat-icon-large">🏥</div>
          <div className="stat-content">
            <div className="stat-label">Care Tasks</div>
            <div className="stat-value-large">{activeCareTasks}</div>
            <div className="stat-change warning">High priority</div>
          </div>
        </div>

        <div className="stat-card-large" onClick={() => navigate('/family/rituals')}>
          <div className="stat-icon-large">🎭</div>
          <div className="stat-content">
            <div className="stat-label">Active Rituals</div>
            <div className="stat-value-large">{upcomingRituals}</div>
            <div className="stat-change">This week</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Family Members</h3>
            <button className="btn-ghost-small" onClick={() => showToast('Add member feature coming soon!', 'info')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="members-list">
            {familyMembers.map((member) => (
              <div key={member.name} className="member-row" onClick={() => navigate('/family/hub')}>
                <div className="member-avatar">{member.name[0]}</div>
                <div className="member-info">
                  <div className="member-name">{member.name}</div>
                  <div className="member-role">{member.role}</div>
                </div>
                <div className="member-status">
                  <span className={`status-dot ${member.mood.toLowerCase()}`}></span>
                  <span className="member-mood">{member.mood}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <button className="btn-ghost-small" onClick={() => navigate('/family/hub')}>View All</button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">💬</div>
              <div className="activity-content">
                <div className="activity-text"><strong>Sarah</strong> started a conversation about summer vacation</div>
                <div className="activity-time">2 hours ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">💰</div>
              <div className="activity-content">
                <div className="activity-text">Wealth updated: Retirement account grew by $12K</div>
                <div className="activity-time">1 day ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🎭</div>
              <div className="activity-content">
                <div className="activity-text">Sunday Family Dinner completed</div>
                <div className="activity-time">2 days ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🏥</div>
              <div className="activity-content">
                <div className="activity-text"><strong>Emma</strong> has a school project review due Friday</div>
                <div className="activity-time">3 days ago</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions-grid">
            <button className="quick-action-btn" onClick={() => navigate('/family/hub')}>
              <div className="quick-action-icon">💬</div>
              <span>Start Conversation</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/family/wealth')}>
              <div className="quick-action-icon">💰</div>
              <span>Add Asset</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/family/care')}>
              <div className="quick-action-icon">🏥</div>
              <span>Add Care Task</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/family/rituals')}>
              <div className="quick-action-icon">🎭</div>
              <span>Create Ritual</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/family/planning')}>
              <div className="quick-action-icon">🎯</div>
              <span>New Decision</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/family/legacy')}>
              <div className="quick-action-icon">🏛️</div>
              <span>Add Memory</span>
            </button>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Upcoming</h3>
            <button className="btn-ghost-small" onClick={() => navigate('/family/planning')}>View Calendar</button>
          </div>
          <div className="upcoming-list">
            <div className="upcoming-item">
              <div className="upcoming-date">
                <div className="date-day">15</div>
                <div className="date-month">Dec</div>
              </div>
              <div className="upcoming-content">
                <div className="upcoming-title">Emma's School Project Review</div>
                <div className="upcoming-meta">Care · High Priority</div>
              </div>
            </div>
            <div className="upcoming-item">
              <div className="upcoming-date">
                <div className="date-day">20</div>
                <div className="date-month">Dec</div>
              </div>
              <div className="upcoming-content">
                <div className="upcoming-title">Sunday Family Dinner</div>
                <div className="upcoming-meta">Ritual · Weekly</div>
              </div>
            </div>
            <div className="upcoming-item">
              <div className="upcoming-date">
                <div className="date-day">25</div>
                <div className="date-month">Dec</div>
              </div>
              <div className="upcoming-content">
                <div className="upcoming-title">Christmas Celebration</div>
                <div className="upcoming-meta">Festival · Cultural</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
)
}

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('biggfam_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    } else {
      navigate('/auth')
    }
  }, [navigate])

  if (!isAuthenticated) {
    return null
  }

  return children
}

function FamilyApp() {
  return (
    <ProtectedRoute>
    <div className="app-shell family-shell">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
          <Route path="hub" element={<FamilyHubPage />} />
          <Route path="wealth" element={<WealthPage />} />
          <Route path="care" element={<CarePage />} />
          <Route path="rituals" element={<RitualsPage />} />
          <Route path="planning" element={<PlanningPage />} />
          <Route path="legacy" element={<LegacyPage />} />
          <Route path="ai" element={<DadiAI />} />
      </Routes>
    </div>
    </ProtectedRoute>
  )
}

export default FamilyApp


