import { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import './Website.css'

const WebsiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="website-header">
      <div className="website-container">
        <NavLink to="/" className="website-logo">
          <div className="logo-icon">F</div>
          <span>FamilyOS</span>
        </NavLink>

        <nav className={`website-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => `website-nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
          <NavLink to="/product" className={({ isActive }) => `website-nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Product</NavLink>
          <NavLink to="/about" className={({ isActive }) => `website-nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>About</NavLink>
          <NavLink to="/pricing" className={({ isActive }) => `website-nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Pricing</NavLink>
          <NavLink to="/contact" className={({ isActive }) => `website-nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Contact</NavLink>
        </nav>

        <div className="website-actions">
          <button className="btn-secondary" onClick={() => navigate('/auth')}>Sign In</button>
          <button className="btn-primary" onClick={() => navigate('/auth')}>Get Started</button>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  )
}

const WebsiteFooter = () => (
  <footer className="website-footer">
    <div className="website-container">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="logo-icon">F</div>
            <span>FamilyOS</span>
          </div>
          <p>The operating system for 300 million Indian families</p>
        </div>
        <div className="footer-links-grid">
          <div className="footer-links-col">
            <h4>Product</h4>
            <NavLink to="/product">Features</NavLink>
            <NavLink to="/pricing">Pricing</NavLink>
            <a href="#security">Privacy & Security</a>
          </div>
          <div className="footer-links-col">
            <h4>Company</h4>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            <a href="#careers">Careers</a>
          </div>
          <div className="footer-links-col">
            <h4>Support</h4>
            <a href="#help">Help Center</a>
            <a href="#community">Community</a>
            <a href="#whatsapp">WhatsApp Support</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 FamilyOS India. All rights reserved.</p>
        <div className="footer-legal">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#dpdp">DPDP Compliance</a>
        </div>
      </div>
    </div>
  </footer>
)

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="website-page">
      <section className="hero-new">
        <div className="hero-bg-pattern"></div>
        <div className="website-container">
          <div className="hero-content-new">
            <div className="hero-badge-new">
              <span>🇮🇳</span>
              <span>Built in India, for India — Join the Early Access</span>
            </div>
            <h1 className="hero-title-new">
              The Operating System for <span className="highlight">Indian Families</span>
            </h1>
            <p className="hero-desc-new">
              One app for your entire family — joint calendar, shared expenses, health records, kids' education, memories, and an AI advisor who speaks your language. Built for the joint family, the WhatsApp group, and every generation in between.
            </p>
            <div className="hero-cta-new">
              <button className="btn-hero-primary" onClick={() => navigate('/auth')}>
                Join Early Access — Free
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="btn-hero-secondary" onClick={() => navigate('/product')}>
                See All Features
              </button>
            </div>
            <div className="hero-stats-new">
              <div className="stat-item">
                <div className="stat-value">300M+</div>
                <div className="stat-label">Indian Families</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">₹2.1T</div>
                <div className="stat-label">Addressable Market</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">Zero</div>
                <div className="stat-label">Real Competitors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="problem-section-new">
        <div className="website-container">
          <div className="section-intro-new">
            <h2>The Problem</h2>
            <p>Every Indian family runs on chaos. Here's the data:</p>
          </div>
          <div className="problem-cards-new">
            <div className="problem-card-new">
              <div className="problem-number-new">50.5%</div>
              <h3>Family is Why Indians Go Online</h3>
              <p>Staying connected with family is the #1 reason Indians use the internet — yet no app is built for it</p>
            </div>
            <div className="problem-card-new">
              <div className="problem-number-new">6–25</div>
              <h3>People in One Indian Family</h3>
              <p>Joint families share kitchens, budgets, and WhatsApp chaos — but no shared digital infrastructure</p>
            </div>
            <div className="problem-card-new">
              <div className="problem-number-new">0</div>
              <h3>Indian-First Family Apps</h3>
              <p>BiggFam, Cozi, FamilyWall — all US-built, nuclear-family-first, English-only, India-blind</p>
            </div>
          </div>
        </div>
      </section>

      <section className="solution-section-new">
        <div className="website-container">
          <div className="section-intro-new">
            <h2>The Complete FamilyOS Platform</h2>
            <p>Seven layers, each independently valuable, compounding as a system</p>
          </div>
          <div className="solution-grid-new">
            <div className="solution-card-new">
              <div className="solution-icon-new">📅</div>
              <h3>Saath Mein — Family Calendar</h3>
              <p className="solution-tagline">The family timetable, finally shared</p>
              <p className="solution-description">Shared calendar for all members. Smart event detection from WhatsApp. Auto-reminders for school exams, doctor visits, festival dates, EMI due dates. Grandparent-friendly large-font view in their language.</p>
            </div>
            <div className="solution-card-new">
              <div className="solution-icon-new">💸</div>
              <h3>Ghar Ka Hisaab — Family Wallet</h3>
              <p className="solution-tagline">Splitwise for the whole family</p>
              <p className="solution-description">Joint expense tracking — who paid what, who owes whom. Monthly family budget with category split. UPI-linked (Paytm, PhonePe, BHIM). Settlement reminders. Emotionally designed, not just transactional.</p>
            </div>
            <div className="solution-card-new">
              <div className="solution-icon-new">📸</div>
              <h3>Yaadein — Memory Vault</h3>
              <p className="solution-tagline">Memories without WhatsApp compression</p>
              <p className="solution-description">Private family photo and video album. AI-organized by event, person, and year. Auto-creates annual family photobook. The emotional anchor — once memories are here, no family leaves.</p>
            </div>
            <div className="solution-card-new">
              <div className="solution-icon-new">🔔</div>
              <h3>Bulletin — Family Noticeboard</h3>
              <p className="solution-tagline">The family group chat, but structured</p>
              <p className="solution-description">Family-wide announcements, polls, grocery lists, tasks, and reminders. Pin important messages. Assign tasks with deadlines. No more "who was supposed to book the train?"</p>
            </div>
            <div className="solution-card-new">
              <div className="solution-icon-new">🎓</div>
              <h3>Padhai Portal — Kids' Education</h3>
              <p className="solution-tagline">Every exam, every mark, one place</p>
              <p className="solution-description">School schedule, exam timetable, marks tracker, homework reminders. Parent-teacher communication log. Syllabus-aligned AI (CBSE, ICSE, state boards). Links to Byju's and Unacademy for gap areas.</p>
            </div>
            <div className="solution-card-new">
              <div className="solution-icon-new">🏥</div>
              <h3>Sehat — Family Health Vault</h3>
              <p className="solution-tagline">India's first true family health OS</p>
              <p className="solution-description">Centralized medical records for all members. Prescription reminders. Vaccination tracker. Elderly medication schedule with voice alerts. Doctor appointment booking. Lab report storage.</p>
            </div>
            <div className="solution-card-new featured">
              <div className="solution-icon-new">🤖</div>
              <h3>"Dadi" — AI Family Advisor</h3>
              <p className="solution-tagline">The AI elder everyone wishes they had</p>
              <p className="solution-description">A family-trained AI that knows your entire context — schedules, budgets, health, goals. Proactively surfaces insights: "Arjun's maths exam is in 3 days — who picks him up?" Speaks in your family's language.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section-new">
        <div className="website-container">
          <div className="section-intro-new">
            <h2>What Indian Families Say</h2>
          </div>
          <div className="testimonials-new">
            <div className="testimonial-new">
              <div className="testimonial-rating-new">★★★★★</div>
              <p>"Finally an app that understands how our joint family actually works. Ghar Ka Hisaab saved us from so many awkward money conversations."</p>
              <div className="testimonial-author-new">
                <strong>Priya S.</strong>
                <span>Working Mother, Bengaluru</span>
              </div>
            </div>
            <div className="testimonial-new">
              <div className="testimonial-rating-new">★★★★★</div>
              <p>"Mere haath mein poore ghar ka hisaab. Saath Mein calendar se festival planning bahut aasaan ho gayi."</p>
              <div className="testimonial-author-new">
                <strong>Rameshbhai P.</strong>
                <span>Family Head, Ahmedabad</span>
              </div>
            </div>
            <div className="testimonial-new">
              <div className="testimonial-rating-new">★★★★★</div>
              <p>"Yaadein is so beautiful. Our family photos are finally organized — not buried in 14 WhatsApp groups."</p>
              <div className="testimonial-author-new">
                <strong>Kavya M.</strong>
                <span>NRI, Dubai</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section-new">
        <div className="website-container">
          <div className="cta-content-new">
            <h2>Your Family Deserves Better Than a WhatsApp Group</h2>
            <p>Early access is free. Join thousands of Indian families already on the waitlist.</p>
            <button className="btn-cta-primary" onClick={() => navigate('/auth')}>
              Get Early Access — Free
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="cta-benefits-new">
              <span>✓ No credit card needed</span>
              <span>✓ Works on ₹5K Android phones</span>
              <span>✓ DPDP-compliant privacy</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const ProductPage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: '📅',
      title: 'Saath Mein — Family Calendar',
      tagline: 'The family timetable, finally shared',
      description: 'Shared calendar synced across all family members — from Dadi to the youngest. Smart event detection from WhatsApp messages.',
      bullets: [
        'Shared calendar across all members (no invite chaos)',
        'Auto-detects events from WhatsApp messages',
        'Reminders: school exams, doctor visits, festival dates, EMIs',
        'Grandparent-friendly large-font view',
        'Vernacular support: Hindi, Tamil, Telugu, Bengali',
        'Festival calendar pre-loaded (Diwali, Eid, Christmas, etc.)'
      ]
    },
    {
      icon: '💸',
      title: 'Ghar Ka Hisaab — Family Wallet',
      tagline: 'Joint expense tracking, emotionally designed',
      description: 'The Splitwise for families — but designed for the Indian joint family, where money is a shared, emotional topic.',
      bullets: [
        'Joint expense tracking: who paid what, who owes whom',
        'Monthly family budget with category split',
        'UPI-linked (Paytm, PhonePe, BHIM, Google Pay)',
        'Settlement reminders without awkwardness',
        'Shared savings goals (Goa trip, daughter\'s wedding, new home)',
        'Progress visualization with monthly family meeting nudge'
      ]
    },
    {
      icon: '📸',
      title: 'Yaadein — Memory Vault',
      tagline: 'Family memories without WhatsApp compression',
      description: 'Private family photo and video album — organized, beautiful, and permanent. The emotional anchor of the platform.',
      bullets: [
        'AI-organized by event, person, and year',
        'No cloud storage fees on base plan',
        'Share moments without WhatsApp compression loss',
        'Auto-creates annual family photobook (paid add-on)',
        'Family tree linked to photos',
        'Once memories are here, families never leave'
      ]
    },
    {
      icon: '🔔',
      title: 'Bulletin — Family Noticeboard',
      tagline: 'The family group chat, but structured',
      description: 'Family-wide announcements, polls, grocery lists, tasks, and reminders. Everything the family WhatsApp group should have been.',
      bullets: [
        'Family-wide announcements and polls',
        'Grocery lists and task assignment with deadlines',
        'Pin important messages (no more scrolling)',
        'No more "who was supposed to book the train?"',
        'Role-based visibility (some things only parents see)',
        'Works offline — syncs when back online'
      ]
    },
    {
      icon: '🎓',
      title: 'Padhai Portal — Kids\' Education Hub',
      tagline: 'Every exam, every mark, one dashboard',
      description: 'School schedule, exam timetable, marks tracker, and parent-teacher logs — India board aware.',
      bullets: [
        'School schedule and exam timetable',
        'Marks tracker and homework reminders',
        'Parent-teacher communication log',
        'Tuition fee tracker',
        'Indian board-aware AI (CBSE, ICSE, state boards)',
        'Links to Byju\'s, Unacademy for gap areas'
      ]
    },
    {
      icon: '🏥',
      title: 'Sehat — Family Health Vault',
      tagline: 'India\'s first true family health OS',
      description: 'Centralized medical records for all members — from newborns to 80-year-old grandparents — with voice alerts for elders.',
      bullets: [
        'Centralized medical records for all family members',
        'Prescription and medication reminders',
        'Vaccination tracker for kids',
        'Elderly medication schedule with voice alerts',
        'Emergency contact card with blood type',
        'Doctor appointment booking and lab report storage'
      ]
    },
    {
      icon: '📋',
      title: 'Kagaz — Family Documents',
      tagline: 'Never lose an important document again',
      description: 'Store Aadhaar, PAN, passports, property papers, insurance, and vehicle documents — with AI-powered expiry reminders.',
      bullets: [
        'Store Aadhaar, PAN, passports, property papers',
        'Insurance policies and vehicle documents',
        'AI-powered expiry reminders',
        'Share specific documents with specific members',
        'Emergency access feature',
        'End-to-end encrypted, DPDP-compliant'
      ]
    },
    {
      icon: '🤖',
      title: '"Dadi" — FamilyOS AI Advisor',
      tagline: 'The AI elder everyone wishes they had',
      description: 'A family-trained AI that knows your complete family context — schedules, budgets, health, goals. Speaks in your language.',
      bullets: [
        'Knows your family\'s complete context across all modules',
        'Proactive insights: "Arjun\'s exam is in 3 days — who picks him up?"',
        'Speaks Hindi, Tamil, Telugu, Bengali + English',
        'Budget analysis and savings suggestions',
        'Festival reminders with gift budget guidance',
        'Available 24/7 — no appointment needed'
      ]
    }
  ]

  return (
    <div className="website-page">
      <section className="page-header-new">
        <div className="website-container">
          <h1>Eight Pillars of the Indian Family OS</h1>
          <p>Built for joint families, vernacular-first, WhatsApp-native, India from day one</p>
        </div>
      </section>

      <section className="features-section-new">
        <div className="website-container">
          {features.map((feature, index) => (
            <div key={index} className="feature-block-new">
              <div className="feature-header-block">
                <div className="feature-icon-block">{feature.icon}</div>
                <div>
                  <h2>{feature.title}</h2>
                  <p className="feature-tagline">{feature.tagline}</p>
                </div>
              </div>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-bullets">
                {feature.bullets.map((bullet, i) => (
                  <div key={i} className="bullet-item">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.5 14.1667L3.33334 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section-new">
        <div className="website-container">
          <div className="cta-content-new">
            <h2>Ready to Bring Your Family Together?</h2>
            <p>Early access is free. No credit card. Works on any Android or iPhone.</p>
            <div className="cta-buttons-new">
              <button className="btn-cta-primary" onClick={() => navigate('/auth')}>Get Early Access Free</button>
              <button className="btn-cta-secondary" onClick={() => navigate('/pricing')}>View Pricing</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const AboutPage = () => (
  <div className="website-page">
    <section className="page-header-new">
      <div className="website-container">
        <h1>Building the Digital Infrastructure of the Indian Family</h1>
        <p>We are not building an app. We are building the operating system for 300 million Indian families.</p>
      </div>
    </section>

    <section className="about-content-new">
      <div className="website-container">
        <div className="mission-block-new">
          <h2>Our Mission</h2>
          <p className="mission-text">
            To own the digital layer of the Indian family the way Zepto owns quick commerce and Zerodha owns retail investing. We intend to be the infrastructure — not the feature.
          </p>
        </div>

        <div className="why-block-new">
          <h2>Why We Exist</h2>
          <p>
            BiggFam, the US-based "Family OS," calls itself the operating system for legendary families. It is well-designed, thoughtfully built, and completely irrelevant to India. It assumes nuclear families, individual subscriptions, Western parenting norms, and English-first interfaces. India is the opposite of all four.
          </p>
          <p>
            FamilyOS is the version BiggFam cannot build because it doesn't understand what an Indian family actually is: a multi-generational, emotionally dense, financially entangled, deeply WhatsApp-native unit of 6 to 25 people who share everything from a kitchen to a god shelf.
          </p>
          <p>
            We are not building "Cozi for India." We are building what Cozi, FamilyWall, Splitwise, Google Family Link, and a family health app would be if they were designed in Mumbai, for India, from day one.
          </p>
        </div>

        <div className="values-block-new">
          <h2>Our Values</h2>
          <div className="values-grid-new">
            <div className="value-box-new">
              <div className="value-icon-box">🇮🇳</div>
              <h3>India First, Always</h3>
              <p>Every decision is filtered through: does this work for a 67-year-old grandparent in Ahmedabad who speaks only Gujarati?</p>
            </div>
            <div className="value-box-new">
              <div className="value-icon-box">🔒</div>
              <h3>Privacy by Default</h3>
              <p>DPDP Act 2023 compliant. End-to-end encrypted. Your family data never trains our models.</p>
            </div>
            <div className="value-box-new">
              <div className="value-icon-box">❤️</div>
              <h3>Emotion-First Design</h3>
              <p>The Indian family is not a scheduling problem. It is an emotional institution. Every screen reflects this.</p>
            </div>
            <div className="value-box-new">
              <div className="value-icon-box">🌐</div>
              <h3>Bharat Languages</h3>
              <p>Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati — not translation, but genuine cultural intelligence.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
)

const PricingPage = () => {
  const navigate = useNavigate()

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: '/month',
      description: 'For small families getting started',
      features: [
        'Up to 6 family members',
        'Saath Mein Calendar',
        'Yaadein Memory Vault (5 GB)',
        'Bulletin Noticeboard',
        'Basic Ghar Ka Hisaab',
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Parivar Plan',
      price: '₹199',
      period: '/month',
      description: 'Most Popular — Full Indian family',
      features: [
        'Up to 20 family members',
        'All 8 modules unlocked',
        'Dadi AI (100 queries/month)',
        'Padhai Portal + Sehat Vault',
        'Kagaz Document Store (50 GB)',
        'UPI-linked expense sync',
        'Priority support in Hindi & English'
      ],
      cta: 'Start 14-Day Free Trial',
      popular: true
    },
    {
      name: 'Vansh Plan',
      price: '₹499',
      period: '/month',
      description: 'For joint families & extended networks',
      features: [
        'Unlimited family members',
        'Everything in Parivar Plan',
        'Unlimited Dadi AI queries',
        'Annual family photobook (1 free/year)',
        'Mohalla / Society network features',
        '200 GB storage',
        'Concierge onboarding in your language',
        'NRI family sharing across countries'
      ],
      cta: 'Start 14-Day Free Trial',
      popular: false
    }
  ]

  return (
    <div className="website-page">
      <section className="page-header-new">
        <div className="website-container">
          <h1>Simple Pricing for Indian Families</h1>
          <p>Start free. Upgrade your whole family for less than a restaurant meal.</p>
        </div>
      </section>

      <section className="pricing-section-new">
        <div className="website-container">
          <div className="pricing-grid-new">
            {plans.map((plan, index) => (
              <div key={index} className={`pricing-box-new ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge-new">Most Popular</div>}
                <h3>{plan.name}</h3>
                <p className="plan-desc-new">{plan.description}</p>
                <div className="price-new">
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period">{plan.period}</span>
                </div>
                <ul className="features-list-new">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M16.6667 5L7.5 14.1667L3.33334 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`btn-pricing-${plan.popular ? 'primary' : 'secondary'}`} onClick={() => navigate('/auth')}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="website-page">
      <section className="page-header-new">
        <div className="website-container">
          <h1>Get in Touch</h1>
          <p>We respond within 24 hours — or message us on WhatsApp for faster support.</p>
        </div>
      </section>

      <section className="contact-section-new">
        <div className="website-container">
          <div className="contact-layout-new">
            <div className="contact-info-new">
              <h2>Contact Information</h2>
              <div className="contact-items-new">
                <div className="contact-item-new">
                  <div className="contact-icon-new">📧</div>
                  <div><h4>Email</h4><p>hello@familyos.in</p></div>
                </div>
                <div className="contact-item-new">
                  <div className="contact-icon-new">💬</div>
                  <div><h4>WhatsApp Support</h4><p>Available Mon–Sat, 9am–8pm IST</p></div>
                </div>
                <div className="contact-item-new">
                  <div className="contact-icon-new">📍</div>
                  <div><h4>Office</h4><p>Bengaluru, India</p></div>
                </div>
              </div>
            </div>

            <div className="contact-form-new">
              {submitted ? (
                <div className="success-new">
                  <div className="success-icon-new">✓</div>
                  <h3>Message Sent!</h3>
                  <p>We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-row-new">
                    <label>Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Aapka naam" />
                  </div>
                  <div className="form-row-new">
                    <label>Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="your@email.com" />
                  </div>
                  <div className="form-row-new">
                    <label>Subject</label>
                    <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required placeholder="Kya baat hai?" />
                  </div>
                  <div className="form-row-new">
                    <label>Message</label>
                    <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={6} required placeholder="Tell us more..." />
                  </div>
                  <button type="submit" className="btn-form-submit">Send Message</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Website() {
  return (
    <div className="website">
      <WebsiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <WebsiteFooter />
    </div>
  )
}

export default Website
