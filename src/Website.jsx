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
          <span>BiggFam</span>
        </NavLink>
        
        <nav className={`website-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink 
            to="/" 
            end 
            className={({ isActive }) => `website-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink 
            to="/product" 
            className={({ isActive }) => `website-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Product
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => `website-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </NavLink>
          <NavLink 
            to="/pricing" 
            className={({ isActive }) => `website-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </NavLink>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => `website-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </NavLink>
        </nav>
        
        <div className="website-actions">
          <button className="btn-secondary" onClick={() => navigate('/auth')}>Sign In</button>
          <button className="btn-primary" onClick={() => navigate('/auth')}>Get Started</button>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  )
}

const WebsiteFooter = () => {
  return (
    <footer className="website-footer">
      <div className="website-container">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">F</div>
              <span>BiggFam</span>
            </div>
            <p>The operating system for legendary families</p>
          </div>
          
          <div className="footer-links-grid">
            <div className="footer-links-col">
            <h4>Product</h4>
              <NavLink to="/product">Features</NavLink>
              <NavLink to="/pricing">Pricing</NavLink>
              <a href="#security">Security</a>
          </div>
            <div className="footer-links-col">
            <h4>Company</h4>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/contact">Contact</NavLink>
              <a href="#careers">Careers</a>
          </div>
            <div className="footer-links-col">
            <h4>Resources</h4>
              <a href="#docs">Documentation</a>
              <a href="#help">Help Center</a>
              <a href="#community">Community</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 BiggFam. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

const HomePage = () => {
  const navigate = useNavigate()
  
  return (
    <div className="website-page">
      <section className="hero-new">
        <div className="hero-bg-pattern"></div>
        <div className="website-container">
          <div className="hero-content-new">
            <div className="hero-badge-new">
              <span>✨</span>
              <span>Launching in 2027 - Join the waitlist</span>
            </div>
            <h1 className="hero-title-new">
              Build a <span className="highlight">Legendary Family</span><br/>
              That Lasts Generations
            </h1>
            <p className="hero-desc-new">
              The only platform designed to help families communicate better, build generational wealth, and preserve their legacy for 100+ years.
            </p>
            <div className="hero-cta-new">
              <button className="btn-hero-primary" onClick={() => navigate('/auth')}>
                Start Free Today
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="btn-hero-secondary" onClick={() => navigate('/product')}>
                See How It Works
              </button>
            </div>
            <div className="hero-stats-new">
              <div className="stat-item">
                <div className="stat-value">2027</div>
                <div className="stat-label">Launch Year</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">7</div>
                <div className="stat-label">Core Modules</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">100+</div>
                <div className="stat-label">Years Legacy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="problem-section-new">
        <div className="website-container">
          <div className="section-intro-new">
            <h2>The Problem</h2>
            <p>Families are falling apart. Here's why:</p>
                  </div>
          <div className="problem-cards-new">
            <div className="problem-card-new">
              <div className="problem-number-new">70%</div>
              <h3>Wealth Lost</h3>
              <p>Generational wealth disappears by the 2nd generation</p>
                </div>
            <div className="problem-card-new">
              <div className="problem-number-new">67%</div>
              <h3>Communication Breakdown</h3>
              <p>Poor communication is the #1 family issue</p>
                  </div>
            <div className="problem-card-new">
              <div className="problem-number-new">90%</div>
              <h3>Wisdom Lost</h3>
              <p>Family wisdom dies with elders—never documented</p>
            </div>
          </div>
        </div>
      </section>

      <section className="solution-section-new">
        <div className="website-container">
          <div className="section-intro-new">
            <h2>The Complete Platform</h2>
            <p>Seven powerful modules working together to transform your family</p>
          </div>
          <div className="solution-grid-new">
            <div className="solution-card-new">
              <div className="solution-icon-new">💬</div>
              <h3>FamilyHub</h3>
              <p className="solution-tagline">Communication That Actually Works</p>
              <p className="solution-description">Shared family board with threaded conversations. AI-powered emotional translation. Weekly sync auto-generation. Conflict-free templates. Mood check-ins with AI analysis. Automated reminders for birthdays, appointments, and promises.</p>
            </div>
            <div className="solution-card-new">
              <div className="solution-icon-new">💰</div>
              <h3>Wealth HQ</h3>
              <p className="solution-tagline">Complete Financial Picture</p>
              <p className="solution-description">Track real estate, investments, insurance. Estate planning dashboard. Generational wealth playbooks. Goal tracking & optimization. "What if" contingency protocols. Save $50K+ in financial advisor fees.</p>
            </div>
            <div className="solution-card-new">
              <div className="solution-icon-new">🏥</div>
              <h3>CareOS</h3>
              <p className="solution-tagline">Health Coordination Made Easy</p>
              <p className="solution-description">Aging parent healthcare dashboard. Medication schedules & adherence tracking. Child development milestones. Emergency protocols & safety network. Mental health signals monitoring. Reduce missed appointments by 90%.</p>
            </div>
            <div className="solution-card-new">
              <div className="solution-icon-new">🎭</div>
              <h3>Rituals & Culture</h3>
              <p className="solution-tagline">Build Family Identity</p>
              <p className="solution-description">Weekly routines tracking with streak counters. Festival and celebration automation. Family traditions documentation. Values, principles, codes definition. Photo & memory timeline. Ritual impact measurement.</p>
            </div>
            <div className="solution-card-new">
              <div className="solution-icon-new">📋</div>
              <h3>Planning</h3>
              <p className="solution-tagline">Structured Decision Making</p>
              <p className="solution-description">Decision frameworks for big family choices. Marriage, home, career planning tools. Education roadmaps. Retirement simulation. 10-year family vision planning. Reduce decision fatigue by 85%.</p>
            </div>
            <div className="solution-card-new">
              <div className="solution-icon-new">🏛️</div>
              <h3>Legacy Vault</h3>
              <p className="solution-tagline">Preserve for Generations</p>
              <p className="solution-description">Time-locked letters to future generations. Wisdom library and family stories archive. Asset instructions and genealogy tracking. Health history vault. Interactive family tree. Ensure legacy survives 100+ years.</p>
            </div>
            <div className="solution-card-new featured">
              <div className="solution-icon-new">🤖</div>
              <h3>AI Family Mind</h3>
              <p className="solution-tagline">Your Chief Family Officer</p>
              <p className="solution-description">Learns communication patterns & triggers. Financial decision history analysis. Emotional rhythms tracking. Predictive planning and optimization. Conflict mediation and translation. Save 15 hours/week on coordination.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section-new">
        <div className="website-container">
          <div className="section-intro-new">
            <h2>What Families Say</h2>
          </div>
          <div className="testimonials-new">
            <div className="testimonial-new">
              <div className="testimonial-rating-new">★★★★★</div>
              <p>"BiggFam saved our family. We went from fighting every week to actually understanding each other."</p>
              <div className="testimonial-author-new">
                <strong>Sarah M.</strong>
                <span>Mother of 2</span>
              </div>
            </div>
            <div className="testimonial-new">
              <div className="testimonial-rating-new">★★★★★</div>
              <p>"We've documented 50 years of family stories. My kids will know their great-grandparents."</p>
              <div className="testimonial-author-new">
                <strong>David L.</strong>
                <span>Father of 3</span>
              </div>
            </div>
            <div className="testimonial-new">
              <div className="testimonial-rating-new">★★★★★</div>
              <p>"Tracking our wealth went from spreadsheet chaos to crystal clarity."</p>
              <div className="testimonial-author-new">
                <strong>Jennifer K.</strong>
                <span>Entrepreneur</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section-new">
        <div className="website-container">
          <div className="cta-content-new">
            <h2>Start Building Your Legendary Family Today</h2>
            <p>Launching in 2027. Join the waitlist now. Free forever plan. No credit card required.</p>
            <button className="btn-cta-primary" onClick={() => navigate('/auth')}>
              Get Started Free
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="cta-benefits-new">
              <span>✓ 2 minute setup</span>
              <span>✓ Cancel anytime</span>
              <span>✓ Your data stays yours</span>
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
      icon: '💬',
      title: 'FamilyHub',
      tagline: 'Communication That Actually Works',
      description: 'Stop miscommunication before it starts. AI-powered emotional translation, weekly syncs, and conflict-free templates.',
      bullets: [
        'Shared family board with threaded conversations',
        'Weekly sync auto-generation',
        'Conflict-free conversation templates',
        'Mood check-ins with AI emotional analysis',
        'AI translator for emotional language',
        'Automated reminders for birthdays, appointments, promises'
      ]
    },
    {
      icon: '💰',
      title: 'Wealth HQ',
      tagline: 'Complete Financial Picture',
      description: 'Track everything. Plan proactively. Break the generational wealth loss cycle.',
      bullets: [
        'Real estate, investments, insurance tracking',
        'Estate planning dashboard',
        'Generational wealth playbooks',
        'Goal tracking & optimization',
        '"What if" contingency protocols',
        'Save $50K+ in financial advisor fees'
      ]
    },
    {
      icon: '🏥',
      title: 'CareOS',
      tagline: 'Health Coordination Made Easy',
      description: 'Never miss an appointment. Track medications. Coordinate care for aging parents and kids.',
      bullets: [
        'Aging parent healthcare dashboard',
        'Medication schedules & adherence',
        'Child development tracking',
        'Emergency protocols & safety network',
        'Mental health signals',
        'Reduce missed appointments by 90%'
      ]
    },
    {
      icon: '🎭',
      title: 'Rituals & Culture',
      tagline: 'Build Family Identity',
      description: 'Document traditions. Track routines. Measure impact. Build a family culture that lasts.',
      bullets: [
        'Weekly routines tracking with streak counters',
        'Festival and celebration automation',
        'Family traditions documentation',
        'Values, principles, codes definition',
        'Photo & memory timeline',
        'Ritual impact measurement'
      ]
    },
    {
      icon: '📋',
      title: 'Planning',
      tagline: 'Structured Decision Making',
      description: 'Make big family decisions with confidence. Use frameworks. Reduce decision fatigue.',
      bullets: [
        'Decision frameworks for big family choices',
        'Marriage, home, career planning',
        'Education roadmaps',
        'Retirement simulation',
        '10-year family vision',
        'Reduce decision fatigue by 85%'
      ]
    },
    {
      icon: '🏛️',
      title: 'Legacy Vault',
      tagline: 'Preserve for Generations',
      description: 'Your family stories, wisdom, and values—preserved forever. Time-locked for future generations.',
      bullets: [
        'Time-locked letters to future generations',
        'Wisdom library and family stories',
        'Asset instructions and genealogy',
        'Health history vault',
        'Interactive family tree',
        'Ensure legacy survives 100+ years'
      ]
    },
    {
      icon: '🤖',
      title: 'AI Family Mind',
      tagline: 'Your Chief Family Officer',
      description: 'AI that learns your family patterns. Prevents conflicts. Optimizes decisions. Saves 15 hours/week.',
      bullets: [
        'Learns communication patterns & triggers',
        'Financial decision history analysis',
        'Emotional rhythms tracking',
        'Predictive planning and optimization',
        'Conflict mediation and translation',
        'Save 15 hours/week on coordination'
      ]
    }
  ]
  
  return (
    <div className="website-page">
      <section className="page-header-new">
        <div className="website-container">
          <h1>Seven Pillars of Family Excellence</h1>
          <p>A complete operating system designed specifically for modern families</p>
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
            <h2>Ready to Transform Your Family?</h2>
            <p>Launching in 2027. Join the waitlist now. Start free, upgrade when ready.</p>
            <div className="cta-buttons-new">
              <button className="btn-cta-primary" onClick={() => navigate('/auth')}>
                Get Started Free
              </button>
              <button className="btn-cta-secondary" onClick={() => navigate('/pricing')}>
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const AboutPage = () => {
  return (
    <div className="website-page">
      <section className="page-header-new">
        <div className="website-container">
          <h1>Building the Future of Family</h1>
          <p>We believe every family deserves an operating system</p>
        </div>
      </section>

      <section className="about-content-new">
        <div className="website-container">
          <div className="mission-block-new">
            <h2>Our Mission</h2>
            <p className="mission-text">
              To build the infrastructure for 50 million legendary families. We're not just building software—we're building the foundation for human flourishing across generations.
            </p>
          </div>

          <div className="why-block-new">
            <h2>Why We Exist</h2>
            <p>
              Families are the foundation of society, yet they have no tools built specifically for them. Companies have Slack, Salesforce, and Google Workspace. Individuals have smartphones and social media. But families? They're stuck with scattered WhatsApp groups and forgotten promises.
            </p>
            <p>
              We watched as 70% of generational wealth was lost. We saw families break down from poor communication. We witnessed elders take their wisdom to the grave. We knew there had to be a better way.
            </p>
          </div>

          <div className="values-block-new">
            <h2>Our Values</h2>
            <div className="values-grid-new">
              <div className="value-box-new">
                <div className="value-icon-box">🤝</div>
                <h3>Family First</h3>
                <p>Every decision we make is through the lens of: "Does this help families thrive?"</p>
              </div>
              <div className="value-box-new">
                <div className="value-icon-box">🔒</div>
                <h3>Privacy Always</h3>
                <p>Your family data is sacred. End-to-end encryption. You own and control everything.</p>
              </div>
              <div className="value-box-new">
                <div className="value-icon-box">🌱</div>
                <h3>Long-term Thinking</h3>
                <p>We are building for generations, not quarters. Your family legacy matters.</p>
              </div>
              <div className="value-box-new">
                <div className="value-icon-box">✨</div>
                <h3>Excellence</h3>
                <p>Apple-grade design. Shopify-level dashboards. Calm-quality experience.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const PricingPage = () => {
  const navigate = useNavigate()
  
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        'Up to 4 family members',
        'Basic FamilyHub',
        'Simple wealth tracking',
        '5GB storage',
        'Core features'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Family Plan',
      price: '$29',
      period: '/month',
      description: 'Most Popular',
      features: [
        'Unlimited family members',
        'All core features unlocked',
        'AI insights (100 queries/month)',
        '100GB storage',
        'Priority support',
        'Advanced analytics'
      ],
      cta: 'Start 14-Day Trial',
      popular: true
    },
    {
      name: 'Legacy Plan',
      price: '$79',
      period: '/month',
      description: 'For multi-generational families',
      features: [
        'Everything in Family Plan',
        'Unlimited AI queries',
        'Full Legacy Vault with time locks',
        'Advanced estate planning',
        '1TB storage',
        'Concierge onboarding',
        'White-glove support'
      ],
      cta: 'Start 14-Day Trial',
      popular: false
    }
  ]
  
  return (
    <div className="website-page">
      <section className="page-header-new">
        <div className="website-container">
          <h1>Simple, Transparent Pricing</h1>
          <p>Start free. Upgrade when you're ready. Cancel anytime.</p>
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
                <button 
                  className={`btn-pricing-${plan.popular ? 'primary' : 'secondary'}`}
                  onClick={() => navigate('/auth')}
                >
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
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
          <p>We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
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
                <div>
                  <h4>Email</h4>
                    <p>hello@biggfam.com</p>
                  </div>
                </div>
                <div className="contact-item-new">
                  <div className="contact-icon-new">💬</div>
                <div>
                  <h4>Live Chat</h4>
                  <p>Available Mon-Fri, 9am-6pm PST</p>
                </div>
              </div>
                <div className="contact-item-new">
                  <div className="contact-icon-new">📍</div>
                <div>
                  <h4>Office</h4>
                  <p>San Francisco, CA</p>
                  </div>
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
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Your name"
                    />
                  </div>
                  <div className="form-row-new">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="form-row-new">
                    <label>Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      placeholder="What's this about?"
                    />
                  </div>
                  <div className="form-row-new">
                    <label>Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      required
                      placeholder="Tell us more..."
                    />
                  </div>
                  <button type="submit" className="btn-form-submit">
                    Send Message
                  </button>
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
