import { useState, useEffect, useRef } from 'react'
import { useAuth, useClerk } from '@clerk/react'
import { NavLink, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { motion, useInView, animate, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'
import './Website.css'

/* ── Shared animation variants ──────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const fadeUpDelay = (d) => ({
  hidden:  { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: d, ease: [0.25, 0.46, 0.45, 0.94] } },
})
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
}
const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}
const scaleIn = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const slideLeft = {
  hidden:  { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const slideRight = {
  hidden:  { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
}

/* ── Animated counter ────────────────────────────────────── */
const AnimatedCounter = ({ target, suffix = '', decimals = 0 }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, target, {
      duration: 2.2,
      ease: 'easeOut',
      onUpdate: (v) => setVal(decimals ? v.toFixed(decimals) : Math.round(v)),
    })
    return controls.stop
  }, [inView, target, decimals])

  return <span ref={ref}>{val}{suffix}</span>
}

/* ── Scroll-aware header ─────────────────────────────────── */
const WebsiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isSignedIn } = useAuth()
  const { signOut } = useClerk()

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const heroH = window.innerHeight * 0.85
      // On homepage, header goes dark when scrolling into pain-stats section
      if (location.pathname === '/') {
        setDark(y > heroH)
      } else {
        setDark(false)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  // Reset dark on route change
  useEffect(() => { setDark(false); setMenuOpen(false) }, [location.pathname])

  return (
    <header className={`ws-header${dark ? ' dark' : ''}`}>
      <NavLink to="/" className="header-logo">
        <div className="logo-mark">F</div>
        FamilyOS
      </NavLink>

      <nav className={`header-nav${menuOpen ? ' open' : ''}`}>
        {['/', '/product', '/about', '/pricing', '/contact'].map((path, i) => {
          const labels = ['Home', 'Product', 'About', 'Pricing', 'Contact']
          return (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {labels[i]}
            </NavLink>
          )
        })}
      </nav>

      <div className="header-actions">
        {isSignedIn ? (
          <>
            <button className="btn-ghost" onClick={() => signOut(() => navigate('/'))}>Sign Out</button>
            <button className="btn-primary" onClick={() => navigate('/family')}>Go to App →</button>
          </>
        ) : (
          <>
            <button className="btn-ghost" onClick={() => navigate('/auth')}>Sign In</button>
            <button className="btn-primary" onClick={() => navigate('/auth/sign-up')}>Get Started →</button>
          </>
        )}
        <button
          className="mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}

/* ── Chaos Bubbles ───────────────────────────────────────── */
const BUBBLES = [
  { cls: 'b1 bubble-wa',    emoji: '💬', text: 'Family Group (23 unread)' },
  { cls: 'b2 bubble-red',   emoji: '⚠️', text: 'Electricity bill — kaun dega?' },
  { cls: 'b3 bubble-amber', emoji: '📅', text: "When is Arjun's exam?" },
  { cls: 'b4',              emoji: '📁', text: "Where's the passport scan?" },
  { cls: 'b5 bubble-blue',  emoji: '💊', text: "Mom's medicine has run out" },
  { cls: 'b6 bubble-red',   emoji: '📸', text: 'Photos in 14 different groups' },
  { cls: 'b7 bubble-amber', emoji: '🤔', text: 'Who was supposed to book the train?' },
  { cls: 'b8',              emoji: '🎉', text: 'Diwali plan — still pending' },
  { cls: 'b9 bubble-wa',    emoji: '💸', text: 'Papa sent ₹3,400 — but when?' },
  { cls: 'b10 bubble-blue', emoji: '🏥', text: 'Doctor appt — who books?' },
]

const ChaosBubbles = () => (
  <>
    {BUBBLES.map((b, i) => (
      <motion.div
        key={i}
        className={`bubble ${b.cls}`}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: 'backOut' }}
      >
        {b.emoji} {b.text}
      </motion.div>
    ))}
  </>
)

/* ── Family Silhouette (CSS art) ─────────────────────────── */
const FamilySilhouette = () => {
  const people = [
    { hw: [22,22], bw: [18,28], ho: 0.7 },   // grandpa
    { hw: [26,26], bw: [22,34], ho: 0.8 },   // mom
    { hw: [32,32], bw: [28,44], ho: 1 },     // dad (tallest)
    { hw: [24,24], bw: [20,30], ho: 0.75 },  // teen
    { hw: [18,18], bw: [15,22], ho: 0.6 },   // kid
  ]
  return (
    <motion.div
      className="family-silhouette"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.1, ease: 'backOut' }}
    >
      {people.map((p, i) => (
        <div key={i} className="person">
          <div
            className="person-head"
            style={{ width: p.hw[0], height: p.hw[1], opacity: p.ho }}
          />
          <div
            className="person-body"
            style={{ width: p.bw[0], height: p.bw[1], opacity: p.ho * 0.55 }}
          />
        </div>
      ))}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════ */
const HomePage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleJoin = (e) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-chaos-zone">
          {/* SVG connector dashes */}
          <svg className="chaos-svg" viewBox="0 0 880 380" preserveAspectRatio="none">
            {[
              [80,50,440,190],[780,45,440,190],[30,170,420,200],
              [840,145,460,200],[50,270,420,220],[820,240,460,220],
              [100,330,430,230],[760,320,450,230],[10,200,400,210],[870,225,470,215]
            ].map(([x1,y1,x2,y2],i) => (
              <motion.line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#EDD0B0"
                strokeWidth="1"
                strokeDasharray="5 5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 1, delay: 0.6 + i * 0.06 }}
              />
            ))}
          </svg>

          <FamilySilhouette />
          <ChaosBubbles />
        </div>

        <div className="hero-text">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            🇮🇳 Built in India, for India · Early Access Free
          </motion.div>

          <motion.h1
            className="hero-h1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Your family runs on <em>chaos.</em>
          </motion.h1>

          <motion.p
            className="hero-pivot"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.5 }}
          >
            FamilyOS fixes that.
          </motion.p>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.7 }}
          >
            One app for your whole family — joint calendar, shared expenses, health records, memories, and Maahi AI who speaks your family's language.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.9 }}
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  className="hero-form"
                  onSubmit={handleJoin}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <input
                    type="email"
                    className="hero-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <motion.button
                    type="submit"
                    className="btn-hero"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Join Free ✨
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  style={{ textAlign:'center', padding:'16px', color:'var(--orange)', fontWeight:700, fontSize:17 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  🎉 You're on the waitlist! We'll be in touch soon.
                </motion.div>
              )}
            </AnimatePresence>

            <div className="hero-social">
              <div className="hero-avatars">
                {['👩','👨','👴','👧','👦'].map((e,i) => (
                  <div key={i} className="hero-avatar" style={{ zIndex: 5-i }}>{e}</div>
                ))}
              </div>
              <span>2,400+ families already joined · No credit card · Works on any phone</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PAIN STATS ───────────────────────────────────────── */}
      <section className="pain-stats">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.p className="pain-eyebrow" variants={fadeUp}>The Reality</motion.p>
          <motion.h2 className="pain-heading" variants={fadeUp}>
            Here's the data. <em>It's not pretty.</em>
          </motion.h2>

          <motion.div className="pain-grid" variants={stagger}>
            {[
              {
                num: 50.5, suffix:'%', decimals: 1,
                label: 'Indians go online for family',
                desc: 'Staying connected with family is the #1 reason Indians use the internet — yet no app is built for it'
              },
              {
                num: 0, suffix:'', decimals: 0,
                label: 'Indian-first family apps exist',
                desc: 'BiggFam, Cozi, FamilyWall — all US-built, nuclear-family-first, English-only, India-blind'
              },
              {
                num: 14, suffix:'+', decimals: 0,
                label: 'WhatsApp groups per family',
                desc: 'Joint families share kitchens, budgets, and WhatsApp chaos — but no shared digital infrastructure'
              },
            ].map((s, i) => (
              <motion.div key={i} className="pain-stat" variants={scaleIn}>
                <div className="pain-stat-num">
                  <AnimatedCounter target={s.num} suffix={s.suffix} decimals={s.decimals} />
                </div>
                <div className="pain-stat-label">{s.label}</div>
                <div className="pain-stat-desc">{s.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── DAY IN THE LIFE ───────────────────────────────────── */}
      <section className="day-life">
        <motion.div
          className="day-life-grid"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {[
            {
              emoji:'💬',
              quote:'"23 unread. Still no answer."',
              context:'The family WhatsApp group has 23 unread messages. No one knows who booked the train. No one knows who paid the electricity bill. Everyone assumes someone else did.'
            },
            {
              emoji:'💸',
              quote:'"Who\'s paying this time?"',
              context: 'Papa paid the house rent, didi paid the electricity, bhaiya got groceries. Three weeks later, no one knows who owes whom what. Awkward silence at dinner.'
            },
            {
              emoji:'💊',
              quote:'"Mom\'s medicine ran out."',
              context:'Mom\'s blood pressure medication ran out on Saturday. Her prescription is in bhaiya\'s car. Bhaiya is in Pune. The pharmacy needs the paper. It\'s a Sunday.'
            },
            {
              emoji:'📸',
              quote:'"Where did that photo go?"',
              context: 'Diwali family photos are in three different WhatsApp groups, two phones, and one hard drive that no one can find. The grandchildren\'s first steps exist only in compressed form.'
            },
          ].map((c, i) => (
            <motion.div key={i} className="life-card" variants={scaleIn}>
              <span className="life-card-emoji">{c.emoji}</span>
              <div className="life-card-quote">{c.quote}</div>
              <div className="life-card-context">{c.context}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── THE CLEARING ─────────────────────────────────────── */}
      <section className="clearing">
        <div className="clearing-burst" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <motion.div className="clearing-line" variants={fadeIn} />
          <motion.h2 className="clearing-h2" variants={fadeUp}>
            There's a <span>better way.</span>
          </motion.h2>
          <motion.p className="clearing-sub" variants={fadeUpDelay(0.15)}>
            Every piece of your family's life — coordinated, remembered, and made effortless.
          </motion.p>
          <motion.div
            className="clearing-circle"
            variants={scaleIn}
            whileInView={{ scale: [1, 1.15, 1], transition: { duration: 1.2, delay: 0.3, repeat: Infinity, repeatDelay: 2 } }}
          >
            🏠
          </motion.div>
        </motion.div>
      </section>

      {/* ── MAAHI AI ─────────────────────────────────────────── */}
      <section className="maahi">
        <div className="maahi-inner">
          <motion.div
            className="maahi-text"
            variants={slideLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <div className="maahi-badge">🤖 AI Family Advisor</div>
            <h2 className="maahi-name">Meet <em>Maahi.</em></h2>
            <p className="maahi-tagline">The AI elder everyone wishes they had.</p>
            <div className="maahi-features">
              {[
                { icon:'🧠', title:'Knows your family', desc:'Maahi understands your complete family context — schedules, budgets, health, goals, relationships.' },
                { icon:'🔔', title:'Proactive insights', desc:'"Arjun\'s maths exam is in 3 days — who picks him up from tuition?" before you think to ask.' },
                { icon:'🌐', title:'Your language', desc:'Hindi, Tamil, Telugu, Bengali, Gujarati, Marathi — genuine cultural intelligence, not translation.' },
                { icon:'💡', title:'Budget & health advisor', desc:'Festival budget planning, medicine reminders, savings suggestions — all from one AI.' },
              ].map((f, i) => (
                <div key={i} className="maahi-feat">
                  <div className="maahi-feat-icon">{f.icon}</div>
                  <div className="maahi-feat-text">
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={slideRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <MaahiChat />
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="testimonials">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.p className="section-eyebrow" variants={fadeUp}>Early Access Families</motion.p>
          <motion.h2 className="section-heading" variants={fadeUp}>
            What Indian families <em>say.</em>
          </motion.h2>

          <motion.div className="testi-grid" variants={stagger} style={{ marginTop: 56 }}>
            {[
              {
                stars:'★★★★★',
                text:'"Finally an app that understands how our joint family actually works. Ghar Ka Hisaab saved us from so many awkward money conversations at dinner."',
                name:'Priya S.', location:'Working Mother, Bengaluru'
              },
              {
                stars:'★★★★★',
                text:'"I have the whole family\'s finances right in my hand. Festival planning with Saath Mein is so much easier. Maahi is simply brilliant."',
                name:'Rameshbhai P.', location:'Family Head, Ahmedabad'
              },
              {
                stars:'★★★★★',
                text:'"Yaadein is so beautiful. Our family photos are finally organized — not buried in 14 WhatsApp groups. The grandparents love the big-font view."',
                name:'Kavya M.', location:'NRI Family, Dubai'
              },
            ].map((t, i) => (
              <motion.div key={i} className="testi-card" variants={scaleIn}>
                <div className="testi-stars">{t.stars}</div>
                <p className="testi-text">{t.text}</p>
                <div className="testi-author">
                  <strong>{t.name}</strong>
                  <span>{t.location}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <HomeCTA navigate={navigate} />
    </div>
  )
}

/* ── Maahi Chat UI ───────────────────────────────────────── */
const MaahiChat = () => {
  const [step, setStep] = useState(0)
  const messages = [
    { type:'user', text:"What's Arjun's schedule for tomorrow?" },
    { type:'ai', text:<>Arjun has <strong>Maths exam at 9am</strong> tomorrow. His tuition ends at 6pm. <strong>Papa usually picks him up</strong> — but Papa has a client call at 5:30pm. Should I remind Didi?</> },
    { type:'user', text:'Yes, and also check the electricity bill.' },
    { type:'ai', text:<>Electricity bill <strong>₹2,340 due on the 15th</strong> (3 days). Last month Papa paid. This month's turn is <strong>Bhaiya's</strong> — I'll send him a gentle reminder tonight.</> },
  ]

  useEffect(() => {
    if (step >= messages.length) return
    const t = setTimeout(() => setStep(s => s + 1), step === 0 ? 800 : 1800)
    return () => clearTimeout(t)
  }, [step, messages.length])

  return (
    <div className="maahi-chat">
      <div className="maahi-chat-header">
        <div className="maahi-avatar">🤖</div>
        <div>
          <div className="maahi-chat-name">Maahi</div>
          <div className="maahi-chat-status">
            <div className="status-dot" />
            Your AI Family Advisor · Online
          </div>
        </div>
      </div>
      <div className="chat-messages">
        <AnimatePresence>
          {messages.slice(0, step).map((m, i) => (
            <motion.div
              key={i}
              className={`chat-msg ${m.type}`}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {m.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {step < messages.length && (
          <motion.div
            className="chat-typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </motion.div>
        )}
      </div>
    </div>
  )
}

/* ── Apple-style Pillar Section ──────────────────────────── */
const PillarAppleSection = ({ pillar, index }) => {
  const isDark = index % 2 !== 0
  const isFlip = index % 2 !== 0
  const isMaahi = index === 7
  const textAnim = isFlip ? slideRight : slideLeft
  const visualAnim = isFlip ? slideLeft : slideRight

  return (
    <section className={`pillar-apple${isDark ? ' pillar-dark' : ''}${isFlip ? ' pillar-flip' : ''}`}>
      <div className="pillar-apple-inner">
        <motion.div className="pillar-apple-text" variants={textAnim} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-80px' }}>
          <div className="pillar-apple-eyebrow">
            <span className="pillar-apple-num">0{index + 1}</span>
            <span className="pillar-apple-sep">—</span>
            <span className="pillar-apple-hindi">{pillar.name}</span>
          </div>
          <h2 className="pillar-apple-h2">{pillar.title}</h2>
          <p className="pillar-apple-tagline">{pillar.tagline}</p>
          <p className="pillar-apple-desc">{pillar.desc}</p>
          <ul className="pillar-apple-bullets">
            {pillar.bullets.map((b, i) => (
              <li key={i}>
                <span className="pillar-bullet-dash" />
                {b}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="pillar-apple-visual" variants={visualAnim} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-80px' }}>
          {isMaahi ? (
            <MaahiChat />
          ) : (
            <div className={`pillar-ui-panel${isDark ? ' pillar-ui-dark' : ''}`}>
              <div className="pillar-ui-header">
                <span className="pillar-ui-title">{pillar.name}</span>
                <span className="pillar-ui-live">● Live</span>
              </div>
              {pillar.phoneRows.map((row, j) => (
                <motion.div
                  key={j}
                  className="pillar-ui-row"
                  initial={{ opacity:0, x:-12 }}
                  whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }}
                  transition={{ duration:0.4, delay:0.1 * j + 0.3 }}
                >
                  <span className="pillar-ui-dot-sm" style={{ background: row.color }} />
                  <span className="pillar-ui-text">{row.text}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

/* ── Home CTA ────────────────────────────────────────────── */
const HomeCTA = ({ navigate }) => {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  return (
    <section className="home-cta">
      <div className="cta-inner">
        <motion.h2
          className="cta-h2"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Your family deserves better than a WhatsApp group.
        </motion.h2>
        <motion.p
          className="cta-sub"
          variants={fadeUpDelay(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Early access is free. Join thousands of Indian families already on the waitlist.
        </motion.p>
        <motion.div
          variants={fadeUpDelay(0.2)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {done ? (
            <p style={{ color:'white', fontWeight:700, fontSize:18, marginBottom:20 }}>
              🎉 You're on the waitlist!
            </p>
          ) : (
            <form
              className="cta-form"
              onSubmit={(e) => { e.preventDefault(); if(email) setDone(true) }}
            >
              <input
                type="email"
                className="cta-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <motion.button
                type="submit"
                className="btn-cta"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Join Free →
              </motion.button>
            </form>
          )}
          <div className="cta-notes">
            <span>No credit card needed</span>
            <span>Android &amp; iOS · Works for all ages</span>
            <span>DPDP-compliant privacy</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Pillar Data ─────────────────────────────────────────── */
const PILLARS = [
  {
    icon:'📅', name:'Saath Mein',
    title: 'Family Calendar',
    tagline: 'The family timetable, finally shared.',
    desc: 'Shared calendar synced across every family member — from grandparents to the youngest. Smart event detection from WhatsApp messages.',
    bullets: ['Shared calendar across all members (no invite chaos)', 'Auto-detects events from WhatsApp messages', 'Reminders: exams, doctor visits, festival dates, EMIs', 'Grandparent-friendly large-font view in vernacular'],
    phoneRows: [
      { color:'#C0622A', text:'📅 Diwali puja — Friday 7pm' },
      { color:'#4ADE80', text:"Arjun's maths exam — Tomorrow" },
      { color:'#F59E0B', text:'EMI due — 15th (3 days)' },
      { color:'#818CF8', text:'Doctor: Maa — Sat 11am' },
    ]
  },
  {
    icon:'💸', name:'Ghar Ka Hisaab',
    title: 'Family Wallet',
    tagline: 'Splitwise for the whole family.',
    desc: 'The joint expense tracker designed for Indian families, where money is shared, emotionally charged, and complicated.',
    bullets: ['Joint tracking: who paid what, who owes whom', 'Monthly budget with category split', 'UPI-linked (Paytm, PhonePe, BHIM, Google Pay)', 'Settlement reminders without awkwardness'],
    phoneRows: [
      { color:'#EF4444', text:'Electricity — Papa paid ₹2,340' },
      { color:'#4ADE80', text:"Groceries — Didi's turn" },
      { color:'#F59E0B', text:'Bhaiya owes ₹780' },
      { color:'#C0622A', text:'Goa trip savings: ₹24,500' },
    ]
  },
  {
    icon:'📸', name:'Yaadein',
    title: 'Memory Vault',
    tagline: 'Memories without WhatsApp compression.',
    desc: 'Private family photo and video album, AI-organized by event, person, and year. The emotional anchor of the platform — once memories are here, no family leaves.',
    bullets: ['AI-organized by event, person, and year', 'No cloud fees on base plan', 'Full quality — no WhatsApp compression', 'Auto-creates annual family photobook'],
    phoneRows: [
      { color:'#818CF8', text:"📸 Diwali 2025 — 84 photos" },
      { color:'#4ADE80', text:"Arjun's 1st steps — Video" },
      { color:'#F59E0B', text:'Dadaji wedding — scanned' },
      { color:'#C0622A', text:"This month's reel — ready" },
    ]
  },
  {
    icon:'🔔', name:'Bulletin',
    title: 'Family Noticeboard',
    tagline: 'The family group chat, but structured.',
    desc: 'Family-wide announcements, polls, grocery lists, tasks, and reminders. Everything the family WhatsApp group should have been.',
    bullets: ['Announcements, polls, task assignment', 'Pin important messages permanently', 'Role-based visibility (parents-only, etc.)', 'Works offline — syncs when back online'],
    phoneRows: [
      { color:'#C0622A', text:'📌 PINNED: Train booking — Bhaiya' },
      { color:'#4ADE80', text:'Grocery list: milk, atta, dal' },
      { color:'#818CF8', text:'Poll: Goa dates — 3 votes' },
      { color:'#F59E0B', text:'Maa: Bring methi from market' },
    ]
  },
  {
    icon:'🏥', name:'Sehat',
    title: 'Family Health Vault',
    tagline: "India's first true family health OS.",
    desc: 'Centralized medical records for all members — from newborns to 80-year-old grandparents — with voice alerts for elders.',
    bullets: ['Centralized medical records for all members', 'Prescription and medication reminders', 'Vaccination tracker for kids', 'Emergency contact card with blood type'],
    phoneRows: [
      { color:'#EF4444', text:'Maa: BP medicine — 2pm daily' },
      { color:'#4ADE80', text:"Arjun's vaccines — up to date" },
      { color:'#818CF8', text:'Papa: Cholesterol report — stored' },
      { color:'#F59E0B', text:'Next: Dadaji checkup — Mon' },
    ]
  },
  {
    icon:'🎓', name:'Padhai Portal',
    title: "Kids' Education Hub",
    tagline: 'Every exam, every mark, one dashboard.',
    desc: 'School schedule, exam timetable, marks tracker, and parent-teacher logs — India board aware (CBSE, ICSE, state boards).',
    bullets: ['School schedule and exam timetable', 'Marks tracker and homework reminders', 'Parent-teacher communication log', 'Indian board-aware AI (CBSE, ICSE, state boards)'],
    phoneRows: [
      { color:'#C0622A', text:"Arjun: Maths — Tomorrow 9am" },
      { color:'#4ADE80', text:'Science: 85/100 ✨' },
      { color:'#818CF8', text:'Homework: History chapter 4' },
      { color:'#F59E0B', text:'Tuition fee: ₹2,500 due' },
    ]
  },
  {
    icon:'📋', name:'Kagaz',
    title: 'Family Documents',
    tagline: 'Never lose an important document again.',
    desc: 'Store Aadhaar, PAN, passports, property papers, insurance, and vehicle documents — with AI-powered expiry reminders.',
    bullets: ['Store Aadhaar, PAN, passports, property papers', 'Insurance and vehicle documents', 'AI-powered expiry reminders', 'End-to-end encrypted, DPDP-compliant'],
    phoneRows: [
      { color:'#C0622A', text:'Passport: Papa — expires 2027' },
      { color:'#EF4444', text:"Maa's Aadhaar — stored ✓" },
      { color:'#4ADE80', text:'Car insurance — due in 14 days' },
      { color:'#818CF8', text:'PAN cards: 5 members ✓' },
    ]
  },
  {
    icon:'🤖', name:'Maahi AI',
    title: 'AI Family Advisor',
    tagline: 'The AI elder everyone wishes they had.',
    desc: 'Maahi knows your family\'s complete context across all modules and proactively surfaces insights before you think to ask.',
    bullets: ["Knows your family's full context across all modules", 'Speaks Hindi, Tamil, Telugu, Bengali + English', 'Budget analysis and savings suggestions', 'Available 24/7 — no appointment needed'],
    phoneRows: [
      { color:'#C0622A', text:"Maahi: Arjun's exam tmrw — ⚠️" },
      { color:'#4ADE80', text:'Maahi: Electricity due Fri' },
      { color:'#818CF8', text:'Maahi: Maa medicine in 2hrs' },
      { color:'#F59E0B', text:'Maahi: Goa budget analysis ready' },
    ]
  },
]

/* ══════════════════════════════════════════════════════════
   PRODUCT PAGE
══════════════════════════════════════════════════════════ */
const ProductPage = () => {
  const navigate = useNavigate()
  return (
    <div>
      {/* ── DARK CINEMATIC HERO ───────────────────────────── */}
      <section className="prod-hero">
        <div className="prod-hero-bg" />
        <div className="prod-hero-inner">
          <motion.p className="prod-eyebrow"
            initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5, delay:0.8 }}
          >The Platform</motion.p>
          <motion.h1 className="prod-h1"
            initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.8, delay:1.0, ease:[0.25,0.46,0.45,0.94] }}
          >Eight pillars.<br /><em>One family.</em></motion.h1>
          <motion.p className="prod-desc"
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            transition={{ duration:0.7, delay:1.3 }}
          >Every corner of family life — coordinated, remembered, and made effortless. Built for joint families. Built for India.</motion.p>
          <motion.div className="prod-pills"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6, delay:1.5 }}
          >
            {['📅 Calendar','💸 Finances','📸 Memories','🔔 Bulletin','🏥 Health','🎓 Education','📋 Documents','🤖 Maahi AI'].map((tag, i) => (
              <span key={i} className="prod-pill">{tag}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MANIFESTO STRIP — dark ───────────────────────── */}
      <section className="prod-manifesto">
        <motion.div className="prod-manifesto-inner" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-80px' }}>
          <motion.p className="prod-manifesto-quote" variants={fadeUp}>
            "Built for a country where 6 generations share one home, one kitchen, one budget —
            and 14 WhatsApp groups that never sleep."
          </motion.p>
          <motion.div className="prod-manifesto-stats" variants={stagger}>
            {[
              { num:'0',    label:'Indian-first\nfamily apps before us' },
              { num:'300M+',label:'Indian families\nwe\'re building for' },
              { num:'1',    label:'App to replace\nyour 14 WhatsApp groups' },
            ].map((s, i) => (
              <motion.div key={i} className="prod-manifesto-stat" variants={scaleIn}>
                <div className="prod-manifesto-num">{s.num}</div>
                <div className="prod-manifesto-label" style={{ whiteSpace:'pre-line' }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── 8 FULL-SCREEN PILLAR SECTIONS ─────────────────── */}
      {PILLARS.map((p, i) => (
        <PillarAppleSection key={i} pillar={p} index={i} />
      ))}

      <HomeCTA navigate={navigate} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   ABOUT PAGE
══════════════════════════════════════════════════════════ */
const AboutPage = () => (
  <div>
    {/* ── DARK CINEMATIC HERO ───────────────────────────── */}
    <section className="about-hero">
      <div className="about-hero-bg" />
      <div className="about-hero-inner">
        <motion.p className="about-eyebrow"
          initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5, delay:0.7 }}
        >Our Mission</motion.p>
        <motion.h1 className="about-h1"
          initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.9, delay:0.9, ease:[0.25,0.46,0.45,0.94] }}
        >The operating system<br />for <em>300 million</em><br />Indian families.</motion.h1>
        <motion.p className="about-hero-desc"
          initial={{ opacity:0 }} animate={{ opacity:1 }}
          transition={{ duration:0.7, delay:1.3 }}
        >We are not building an app. We are building digital infrastructure.</motion.p>
      </div>
    </section>

    {/* ── STATS ─────────────────────────────────────────── */}
    <section className="about-stats">
      <motion.div className="about-stats-inner" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-80px' }}>
        {[
          { num:300, suffix:'M+', label:'Indian families', desc:'The addressable market — joint, multi-gen, WhatsApp-native' },
          { num:14, suffix:'+', label:'WhatsApp groups per family', desc:'The chaos we replace with one organized home' },
          { num:0, suffix:'', label:'Indian-first family apps before us', desc:'Zero apps truly understood how Indian families work' },
        ].map((s, i) => (
          <motion.div key={i} className="about-stat-card" variants={scaleIn}>
            <div className="about-stat-num"><AnimatedCounter target={s.num} suffix={s.suffix} /></div>
            <div className="about-stat-label">{s.label}</div>
            <div className="about-stat-desc">{s.desc}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>

    {/* ── THE INDIA GAP — dark ──────────────────────────── */}
    <section className="about-gap">
      <motion.div className="about-gap-inner" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-80px' }}>
        <motion.p className="about-gap-eyebrow" variants={fadeUp}>The Gap We're Filling</motion.p>
        <motion.h2 className="about-gap-h2" variants={fadeUp}>
          The app they couldn't build<br />because they don't understand<br /><em>what an Indian family is.</em>
        </motion.h2>
        <motion.div className="about-gap-grid" variants={stagger}>
          {[
            { col:'What others assume', items:['Nuclear family of 4', 'Individual subscriptions', 'English-only interface', 'Western parenting norms', 'Separate finances'] },
            { col:'The Indian reality', items:['6–25 people, multi-gen', 'One plan for the whole family', 'Hindi, Tamil, Telugu + 5 more', 'Joint decision-making', 'Shared kitchen, budget, WhatsApp'] },
          ].map((col, i) => (
            <motion.div key={i} className={`about-gap-col${i === 1 ? ' highlight' : ''}`} variants={scaleIn}>
              <div className="about-gap-col-title">{col.col}</div>
              {col.items.map((item, j) => (
                <div key={j} className="about-gap-item">
                  <span className={i === 1 ? 'gap-check' : 'gap-x'}>{i === 1 ? '✓' : '✕'}</span>
                  {item}
                </div>
              ))}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>

    {/* ── VALUES ────────────────────────────────────────── */}
    <motion.section className="about-values" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-80px' }}>
      <motion.p className="section-eyebrow" variants={fadeUp}>What We Stand For</motion.p>
      <motion.h2 className="section-heading" variants={fadeUp}>Four principles. <em>Non-negotiable.</em></motion.h2>
      <motion.div className="about-values-grid" variants={stagger}>
        {[
          { icon:'🇮🇳', title:'India First, Always', desc:'Every decision is filtered through: does this work for a 67-year-old grandparent in Ahmedabad who speaks only Gujarati? If not, we rethink.' },
          { icon:'🔒', title:'Privacy by Default', desc:'DPDP Act 2023 compliant. End-to-end encrypted. Your family data never trains our models. What happens in your family, stays in your family.' },
          { icon:'❤️', title:'Emotion-First Design', desc:'The Indian family is not a scheduling problem. It is an emotional institution where money, health, and love are inseparably entangled. Every screen reflects this.' },
          { icon:'🌐', title:'Genuinely Multilingual', desc:'Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam — not translation layers bolted on, but genuine cultural intelligence built in from day one.' },
        ].map((v, i) => (
          <motion.div key={i} className="about-value-card" variants={scaleIn}>
            <span className="about-value-icon">{v.icon}</span>
            <h3>{v.title}</h3>
            <p>{v.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>

    {/* ── MANIFESTO QUOTE — dark ────────────────────────── */}
    <section className="about-manifesto">
      <motion.div className="about-manifesto-inner" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-80px' }}>
        <motion.p className="about-manifesto-eyebrow" variants={fadeUp}>The Vision</motion.p>
        <motion.blockquote className="about-manifesto-quote" variants={fadeUp}>
          "To own the digital layer of the Indian family the way Zepto owns quick commerce and Zerodha owns retail investing."
        </motion.blockquote>
        <motion.p className="about-manifesto-sub" variants={fadeUpDelay(0.15)}>
          FamilyOS is what every family app would be if it were designed in Mumbai, for India, from day one — not a Western product with Hindi added as an afterthought.
        </motion.p>
      </motion.div>
    </section>
  </div>
)

/* ── 3D tilt plan card ───────────────────────────────────── */
const PlanCard = ({ plan, annual, navigate, index }) => {
  const cardRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotX = useSpring(useTransform(y, [-120, 120], [7, -7]), { stiffness:300, damping:30 })
  const rotY = useSpring(useTransform(x, [-120, 120], [-7, 7]), { stiffness:300, damping:30 })
  const glowX = useTransform(x, [-120, 120], [0, 100])
  const glowY = useTransform(y, [-120, 120], [0, 100])
  const glowBg = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(192,98,42,0.45) 0%, transparent 65%)`

  const onMove = (e) => {
    const r = cardRef.current?.getBoundingClientRect()
    if (!r) return
    x.set(e.clientX - r.left - r.width / 2)
    y.set(e.clientY - r.top - r.height / 2)
  }
  const onLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={cardRef}
      className={`pc3d${plan.featured ? ' pc3d-featured' : ''}`}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1100 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity:0, y:64 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ duration:0.65, delay: index * 0.1, ease:[0.22,1,0.36,1] }}
    >
      {plan.featured && (
        <motion.div
          className="pc3d-glow"
          style={{ background: glowBg }}
        />
      )}
      {plan.featured && <div className="pc3d-badge">Most Popular</div>}

      <div className="pc3d-top">
        <div className="pc3d-name">{plan.name}</div>
        <div className="pc3d-desc">{plan.desc}</div>
      </div>

      <div className="pc3d-price-row">
        <div className="pc3d-price">
          <AnimatePresence mode="wait">
            <motion.span
              key={annual ? 'a' : 'm'}
              className={`pc3d-amount${plan.featured ? ' orange' : ''}`}
              initial={{ y:18, opacity:0 }}
              animate={{ y:0, opacity:1 }}
              exit={{ y:-18, opacity:0 }}
              transition={{ duration:0.22, ease:'easeInOut' }}
            >
              {annual ? plan.annual : plan.monthly}
            </motion.span>
          </AnimatePresence>
          <span className="pc3d-per">/mo</span>
        </div>
        {annual && plan.monthly !== plan.annual && (
          <motion.div className="pc3d-was" initial={{ opacity:0 }} animate={{ opacity:1 }}>
            was {plan.monthly}
          </motion.div>
        )}
      </div>

      <ul className="pc3d-features">
        {plan.features.map((f, j) => (
          <motion.li
            key={j}
            initial={{ opacity:0, x:-10 }}
            whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.3, delay: 0.05 * j + index * 0.1 }}
          >
            <span className="pc3d-check">✓</span>{f}
          </motion.li>
        ))}
      </ul>

      <motion.button
        className={`pc3d-btn${plan.featured ? ' pc3d-btn-featured' : ''}`}
        onClick={() => navigate('/auth')}
        whileHover={{ scale:1.03, y:-2 }}
        whileTap={{ scale:0.97 }}
      >
        {plan.cta}
      </motion.button>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════
   PRICING PAGE — APPLE ONE STYLE (light, no cards)
══════════════════════════════════════════════════════════ */
const PricingPage = () => {
  const navigate = useNavigate()
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const plans = [
    {
      name: 'Free',
      monthly: '₹0', annual: '₹0',
      desc: 'Try before you commit',
      features: ['Up to 6 family members', 'Shared calendar', 'Memory Vault (5 GB)', 'Bulletin board', 'Basic expense tracking'],
      cta: 'Start Free — No Card',
      featured: false,
    },
    {
      name: 'Parivar',
      monthly: '₹199', annual: '₹149',
      desc: 'The full Indian family experience',
      features: ['Up to 20 family members', 'All 8 modules unlocked', 'Maahi AI — 200 queries/month', 'Health vault + Education hub', 'Documents (50 GB encrypted)', 'UPI-linked expense sync', 'Priority support in 8 languages'],
      cta: 'Start 14-Day Free Trial',
      featured: true,
    },
    {
      name: 'Vansh',
      monthly: '₹499', annual: '₹374',
      desc: 'For large joint families and NRI networks',
      features: ['Unlimited family members', 'Everything in Parivar', 'Unlimited Maahi AI', 'Annual printed family photobook', 'Society & colony network layer', '200 GB encrypted storage', 'Concierge onboarding call', 'Multi-country NRI family sharing'],
      cta: 'Start 14-Day Free Trial',
      featured: false,
    },
  ]

  const included = [
    { icon: '🔒', title: 'Bank-grade encryption', desc: 'AES-256 + zero-knowledge architecture. DPDP Act 2023 compliant. Your family\'s data is illegible to everyone — including us.' },
    { icon: '🌐', title: '8 Indian languages', desc: 'Built for how Indian families actually communicate. Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam.' },
    { icon: '📴', title: 'Fully offline-capable', desc: 'Plan trips, track expenses, view documents without a signal. Syncs automatically the moment you\'re connected again.' },
    { icon: '📱', title: 'Every device, everyone', desc: 'iOS, Android, Web. Works seamlessly whether you\'re 14 or 74. No "it doesn\'t support my phone" excuses.' },
    { icon: '💾', title: 'Your data, always yours', desc: 'Full export, any time, no friction. We earn through subscriptions — your family\'s life is never a product we sell.' },
    { icon: '🛡️', title: 'Zero ads. Zero tracking.', desc: 'No advertising. No third-party profiling. No data brokering. Your family\'s conversations are not inventory.' },
  ]

  const faqs = [
    { q: 'What exactly counts as a family member?', a: 'Anyone you invite into your family space — parents, grandparents, children, siblings, in-laws, live-in extended family. On Parivar you get up to 20 members; on Vansh, unlimited.' },
    { q: 'Is 14 days actually free? No card required?', a: 'Genuinely free — no credit card, no debit card, no UPI linked until you choose to continue. We remind you 3 days before the trial ends. If you don\'t upgrade, you move to the Free plan automatically.' },
    { q: 'What happens to our data if we cancel?', a: 'Your data stays accessible for 30 days after cancellation. You can export everything — photos, documents, expenses, health records — in a single download. After 30 days, it\'s permanently deleted.' },
    { q: 'Does Maahi AI actually speak regional languages?', a: 'Yes — with genuine cultural intelligence, not just translation. Maahi understands context in Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, and Malayalam. She knows what a "joint family expense split" means without needing it explained.' },
    { q: 'We\'re an NRI family spread across countries. Does this work?', a: 'Exactly what Vansh is built for. Family members in the US, UK, UAE, or anywhere else join the same family space. Documents, expenses, and calendars sync across time zones in real time.' },
    { q: 'Can we switch plans later?', a: 'Anytime. Upgrade instantly, downgrade at the end of your billing period. No locked-in contracts, no penalties, no phone calls to cancel.' },
  ]

  return (
    <div>
      {/* ── DARK PARALLAX HERO ───────────────────────────── */}
      <section ref={heroRef} className="pricing-hero">
        <motion.div className="pricing-hero-bg" style={{ y: heroY }} />
        <motion.div className="pricing-hero-inner" style={{ opacity: heroOpacity }}>
          <motion.p className="pricing-hero-eyebrow"
            initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5, delay:0.8 }}
          >Pricing</motion.p>
          <motion.h1 className="pricing-hero-h1"
            initial={{ opacity:0, y:44 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.9, delay:1.0, ease:[0.22,1,0.36,1] }}
          >One family.<br /><em>One price.</em><br />No asterisks.</motion.h1>
          <motion.p className="pricing-hero-sub"
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            transition={{ duration:0.7, delay:1.4 }}
          >Everything unlocked. Everyone included. No per-member fees, no hidden tiers.</motion.p>
          <motion.div className="pricing-hero-badges"
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6, delay:1.6 }}
          >
            {['₹199 for the whole family — not per person', 'Less than a monthly Netflix plan', '₹10 per member per month on 20 members'].map((b, i) => (
              <span key={i} className="pricing-hero-badge">✓ {b}</span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── LIGHT PLAN COLUMNS — no cards ─────────────────── */}
      <section className="pricing-plans-section">
        <div className="pricing-light-toggle">
          <span className={`ptoggle-label${!annual ? ' active' : ''}`}>Monthly</span>
          <button className={`ptoggle-btn${annual ? ' on' : ''}`} onClick={() => setAnnual(a => !a)}>
            <motion.span className="toggle-thumb" layout transition={{ type:'spring', stiffness:600, damping:35 }} />
          </button>
          <span className={`ptoggle-label${annual ? ' active' : ''}`}>
            Annual <span className="ptoggle-save">Save 25%</span>
          </span>
        </div>

        <motion.div className="pricing-plans-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true }}>
          {plans.map((plan, i) => (
            <motion.div key={plan.name} className={`plan-col${plan.featured ? ' plan-col-featured' : ''}`} variants={fadeUp}>
              {plan.featured && <div className="plan-col-top-line" />}
              <div className="plan-col-name">{plan.name}</div>
              <div className="plan-col-tagline">{plan.desc}</div>
              <div className="plan-col-price">
                <AnimatePresence mode="wait">
                  <motion.span key={annual ? 'a' : 'm'} className="plan-col-amount"
                    initial={{ y:14, opacity:0 }} animate={{ y:0, opacity:1 }}
                    exit={{ y:-14, opacity:0 }} transition={{ duration:0.22 }}
                  >{annual ? plan.annual : plan.monthly}</motion.span>
                </AnimatePresence>
                <span className="plan-col-per">/mo</span>
              </div>
              {annual && plan.monthly !== plan.annual && (
                <div className="plan-col-was">was {plan.monthly}</div>
              )}
              <div className="plan-col-divider" />
              <ul className="plan-col-features">
                {plan.features.map((f, j) => (
                  <li key={j}><span className="plan-feat-check">✓</span>{f}</li>
                ))}
              </ul>
              <motion.button className="plan-col-btn" onClick={() => navigate('/auth')}
                whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              >{plan.cta}</motion.button>
            </motion.div>
          ))}
        </motion.div>
        <p className="pricing-plans-note">All plans include a 14-day free trial · Cancel anytime · No credit card required</p>
      </section>

      {/* ── VALUE BAND ────────────────────────────────────── */}
      <motion.section className="pricing-value-band"
        initial={{ opacity:0 }} whileInView={{ opacity:1 }}
        viewport={{ once:true }} transition={{ duration:0.6 }}
      >
        <div className="pvb-inner">
          <div className="pvb-line" />
          <p className="pvb-text">
            The Parivar plan costs <strong>₹199/month</strong> — less than Spotify for two people, less than a round of chai, roughly <strong>₹10 per family member</strong> per month.
          </p>
          <div className="pvb-line" />
        </div>
      </motion.section>

      {/* ── INCLUDES — rows, no cards ─────────────────────── */}
      <section className="pricing-includes-section">
        <motion.div className="pricing-includes-inner"
          variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-80px' }}
        >
          <motion.h2 className="pricing-includes-heading" variants={fadeUp}>
            Non-negotiable.<br /><em>Built in from day one.</em>
          </motion.h2>
          {included.map((f, i) => (
            <motion.div key={i} className="pricing-include-row" variants={fadeUp}>
              <span className="pricing-include-emoji">{f.icon}</span>
              <div className="pricing-include-content">
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
              <div className="pricing-include-check">✓</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── QUOTE ─────────────────────────────────────────── */}
      <motion.section className="pricing-quote-section"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-80px' }}
      >
        <div className="pricing-quote-inner">
          <div className="pricing-quote-mark">"</div>
          <blockquote className="pricing-quote-text">
            It replaced four apps — Splitwise, Google Photos, a shared calendar, and three WhatsApp groups. For ₹199. Our family hasn't looked back.
          </blockquote>
          <div className="pricing-quote-author">
            <strong>Rekha K.</strong>
            <span>Family Head · Pune</span>
          </div>
        </div>
      </motion.section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="pricing-faq">
        <motion.div className="pricing-faq-inner"
          variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-80px' }}
        >
          <motion.p className="section-eyebrow" variants={fadeUp}>FAQ</motion.p>
          <motion.h2 className="section-heading" variants={fadeUp}>Questions families <em>actually ask.</em></motion.h2>
          <motion.div className="faq-list" variants={stagger}>
            {faqs.map((faq, i) => (
              <motion.div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`} variants={fadeUp}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.q}
                  <motion.span className="faq-arrow" animate={{ rotate: openFaq === i ? 45 : 0 }} transition={{ duration:0.2 }}>+</motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div className="faq-a"
                      initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                      exit={{ height:0, opacity:0 }} transition={{ duration:0.28, ease:'easeInOut' }}
                    ><p>{faq.a}</p></motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── GUARANTEE STRIP ───────────────────────────────── */}
      <motion.section className="pricing-guarantee"
        initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true }} transition={{ duration:0.5 }}
      >
        <div className="pricing-guarantee-inner">
          <motion.div className="guarantee-shield"
            initial={{ scale:0.6, opacity:0 }} whileInView={{ scale:1, opacity:1 }}
            viewport={{ once:true }} transition={{ type:'spring', stiffness:300, delay:0.2 }}
          >🛡️</motion.div>
          <div>
            <h3>14-day free trial. No credit card. No catch.</h3>
            <p>If it doesn't become the most useful app your family uses — cancel in two clicks. No retention calls, no fees, no drama.</p>
          </div>
        </div>
      </motion.section>

      <HomeCTA navigate={navigate} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   CONTACT PAGE
══════════════════════════════════════════════════════════ */
const ContactPage = () => {
  const [form, setForm] = useState({ name:'', email:'', reason:'', message:'' })
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="page-hero">
        <div className="page-hero-inner">
          <motion.p className="page-eyebrow" variants={fadeUp} initial="hidden" animate="visible">Contact</motion.p>
          <motion.h1 className="page-h1" variants={fadeUpDelay(0.1)} initial="hidden" animate="visible">
            We're a small team.<br /><em>We actually respond.</em>
          </motion.h1>
          <motion.p className="page-desc" variants={fadeUpDelay(0.2)} initial="hidden" animate="visible">
            Every message is read by a founder or senior team member. Typically within 24 hours, Mon–Sat.
          </motion.p>
        </div>
      </section>

      {/* ── 4 CONTACT METHOD TILES ────────────────────────── */}
      <motion.section className="contact-methods" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-80px' }}>
        {[
          { icon:'📧', title:'Email Us', sub:'hello@familyos.in', desc:'For product questions, partnership inquiries, press, or general feedback.', action:'Send Email', href:'mailto:hello@familyos.in' },
          { icon:'💬', title:'WhatsApp Support', sub:'Mon–Sat · 9am–8pm IST', desc:'Fastest response for technical issues or onboarding help. Real humans, no bots.', action:'Open WhatsApp', href:'#' },
          { icon:'💼', title:'Investor Relations', sub:'invest@familyos.in', desc:'Deck, metrics, and partnership discussions. We respond to all serious inquiries.', action:'Email Investors', href:'mailto:invest@familyos.in' },
          { icon:'📍', title:'Find Us', sub:'Bengaluru, Karnataka', desc:'We are remote-first. Physical visits by appointment — reach out via email to arrange.', action:'Get in Touch', href:'mailto:hello@familyos.in' },
        ].map((m, i) => (
          <motion.a key={i} className="contact-method-card" href={m.href} variants={scaleIn}>
            <div className="contact-method-icon">{m.icon}</div>
            <h3>{m.title}</h3>
            <p className="contact-method-sub">{m.sub}</p>
            <p className="contact-method-desc">{m.desc}</p>
            <span className="contact-method-action">{m.action} →</span>
          </motion.a>
        ))}
      </motion.section>

      {/* ── WIDE FORM ─────────────────────────────────────── */}
      <section className="contact-form-section">
        <motion.div className="contact-form-inner" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-80px' }}>
          <motion.div className="contact-form-head" variants={fadeUp}>
            <p className="section-eyebrow">Send a Message</p>
            <h2 className="section-heading">Tell us what's on <em>your mind.</em></h2>
          </motion.div>
          <motion.div className="contact-form-wrap" variants={scaleIn}>
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="success" className="form-success" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}>
                  <div className="success-circle" style={{ color:'white' }}>✓</div>
                  <h3>Message sent!</h3>
                  <p>We'll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <motion.form key="form" className="contact-form-grid" onSubmit={submit} exit={{ opacity:0 }}>
                  <div className="form-field">
                    <label>Your Name</label>
                    <input type="text" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name:e.target.value })} required />
                  </div>
                  <div className="form-field">
                    <label>Email</label>
                    <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email:e.target.value })} required />
                  </div>
                  <div className="form-field form-field-full">
                    <label>What's this about?</label>
                    <select value={form.reason} onChange={e => setForm({ ...form, reason:e.target.value })} required>
                      <option value="" disabled>Select a topic</option>
                      <option>Product question</option>
                      <option>Technical support</option>
                      <option>Partnership / Business</option>
                      <option>Press / Media</option>
                      <option>Investor inquiry</option>
                      <option>Something else</option>
                    </select>
                  </div>
                  <div className="form-field form-field-full">
                    <label>Message</label>
                    <textarea placeholder="Tell us more..." value={form.message} onChange={e => setForm({ ...form, message:e.target.value })} required />
                  </div>
                  <div className="form-submit-row">
                    <motion.button type="submit" className="btn-submit" style={{ maxWidth:240 }} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}>
                      Send Message →
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════ */
const WebsiteFooter = () => (
  <footer className="ws-footer">
    <div className="footer-inner">
      <div className="footer-top">
        <div className="footer-brand">
          <NavLink to="/" className="footer-logo">
            <div className="logo-mark">F</div>
            FamilyOS
          </NavLink>
          <p>The operating system for 300 million Indian families. Built in Bengaluru, for Bharat.</p>
        </div>
        {[
          { title:'Product', links:[['Features','/product'],['Pricing','/pricing'],['Privacy & Security','#']] },
          { title:'Company', links:[['About','/about'],['Contact','/contact'],['Careers','#']] },
          { title:'Support', links:[['Help Center','#'],['Community','#'],['WhatsApp Support','#']] },
        ].map((col, i) => (
          <div key={i} className="footer-col">
            <h4>{col.title}</h4>
            {col.links.map(([label, href]) => (
              href.startsWith('/') ?
                <NavLink key={label} to={href}>{label}</NavLink> :
                <a key={label} href={href}>{label}</a>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <p>© 2026 FamilyOS India. All rights reserved.</p>
        <div className="footer-legal">
          {[['Privacy','#'],['Terms','#'],['DPDP Compliance','#']].map(([l,h]) => (
            <a key={l} href={h}>{l}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
)

/* ══════════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════════ */
function Website() {
  return (
    <div className="website">
      <WebsiteHeader />
      <Routes>
        <Route path="/"        element={<HomePage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/about"   element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <WebsiteFooter />
    </div>
  )
}

export default Website
