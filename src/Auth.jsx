import { SignIn, SignUp, useAuth } from '@clerk/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

// ─── Family names (sign-up constellation) ────────────────────────────────────

const FAMILY_NAMES = [
  'Sharma parivar', 'Gupta family', 'Mehta ji', 'Agarwal clan',
  'Patel family', 'Singh parivar', 'Joshi family', 'Verma ji',
  'Nair family', 'Iyer parivar', 'Rao family', 'Kumar parivar',
  'Bose family', 'Das parivar', 'Kapoor family', 'Malhotra ji',
  'Tiwari parivar', 'Reddy family', 'Pillai ji', 'Desai family',
  'Chopra family', 'Shah parivar', 'Bajaj ji', 'Trivedi family', 'Mishra clan',
]

// ─── Sign-in strips (family moments + Hindi words) ────────────────────────────

const STRIP_TOP = [
  'Family Dinner', 'Morning Chai ☕', 'Diwali Lights 🪔', 'Sunday Lunch',
  'School Pickup', 'Movie Night', 'Late Night Talks', 'Birthday Surprise 🎂',
  'Festival Prep 🎊', 'Park Walk 🌳', 'Homework Help', 'Wedding Day 💐',
]
const STRIP_MID = [
  'परिवार', 'यादें • Memories', 'घर • Home', 'रिश्ते • Bonds',
  'प्यार • Love', 'साथ • Together', 'खुशी • Joy', 'विश्वास • Trust',
  'आशा • Hope', 'स्नेह • Warmth', 'आनंद • Delight', 'शांति • Peace',
]
const STRIP_BOT = [
  'Aarti Together 🛕', "Dad's Advice", "Nani's Stories", 'WhatsApp Family 📱',
  'Old Photographs 📸', 'Temple Visit', 'Holi Colors 🎨', 'Lohri Bonfire 🔥',
  'Rainy Day ☔', 'Chai & Sutta ☕', 'Bedtime Story', 'Morning Pooja',
]

// ─── Count-up animation ───────────────────────────────────────────────────────

function CountUp({ to, duration = 2 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / (duration * 1000), 1)
      setVal(Math.floor(p * to))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [to, duration])
  return <>{val.toLocaleString('en-IN')}</>
}

// ─── Sign-up panel: floating family name constellation ────────────────────────

function SignupInfoPanel() {
  const bubbles = useMemo(() =>
    FAMILY_NAMES.map((name) => {
      // Distribute to outer ring — avoid center zone (x: 20–80%, y: 28–72%)
      const zone = Math.floor(Math.random() * 4)
      let x, y
      if (zone === 0) {        // top band
        x = 3 + Math.random() * 90
        y = 2 + Math.random() * 22
      } else if (zone === 1) { // bottom band
        x = 3 + Math.random() * 90
        y = 74 + Math.random() * 22
      } else if (zone === 2) { // left band
        x = 1 + Math.random() * 18
        y = 28 + Math.random() * 44
      } else {                 // right band
        x = 79 + Math.random() * 18
        y = 28 + Math.random() * 44
      }
      return {
        name, x, y,
        dur: 10 + Math.random() * 14,
        delay: -(Math.random() * 14),
        scale: 0.85 + Math.random() * 0.3,
      }
    }), []
  )

  return (
    <div className="auth-info signup-info">

      {/* Floating bubbles — outer ring only */}
      <div className="bubbles-layer" aria-hidden>
        {bubbles.map((b, i) => (
          <motion.span
            key={i}
            className="family-bubble"
            style={{ left: `${b.x}%`, top: `${b.y}%`, scale: b.scale }}
            animate={{ y: [0, -18, 4, -10, 0], x: [0, 8, -6, 4, 0], opacity: [0.3, 0.65, 0.35, 0.55, 0.3] }}
            transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {b.name}
          </motion.span>
        ))}
      </div>

      {/* Center content */}
      <div className="signup-center">
        <div className="auth-logo">
          <div className="logo-icon">🏠</div>
          <span>BiggFam</span>
        </div>
        <motion.div
          className="signup-counter"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="counter-number"><CountUp to={12400} />+</span>
          <span className="counter-label">families trusting BiggFam</span>
        </motion.div>
        <motion.p
          className="signup-tagline"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Your parivar deserves one home.
        </motion.p>
      </div>

    </div>
  )
}

// ─── Sign-in panel: scrolling memory strips ───────────────────────────────────

const CYCLE_WORDS = ['Wealth', 'Memories', 'Health', 'Goals', 'Stories', 'Future', 'Together']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return 'Up late?'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

function ScrollStrip({ items, reverse, speed, mid }) {
  const doubled = [...items, ...items]
  return (
    <div className={`strip-row${mid ? ' strip-row-mid' : ''}`}>
      <div
        className="strip-track"
        style={{
          animationName: 'stripScroll',
          animationDuration: `${speed}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="strip-pill">{item}</span>
        ))}
      </div>
    </div>
  )
}

function SigninInfoPanel() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % CYCLE_WORDS.length), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="auth-info signin-info">

      {/* Scrolling memory strips */}
      <div className="strips-layer" aria-hidden>
        <ScrollStrip items={STRIP_TOP} reverse={false} speed={34} />
        <ScrollStrip items={STRIP_MID} reverse={true}  speed={26} mid />
        <ScrollStrip items={STRIP_BOT} reverse={false} speed={40} />
      </div>

      {/* Gradient mask — protects text readability */}
      <div className="strips-mask" aria-hidden />

      {/* Main content */}
      <div className="signin-inner">
        <div className="auth-logo">
          <div className="logo-icon">🏠</div>
          <span>BiggFam</span>
        </div>

        <motion.p
          className="signin-greeting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {getGreeting()}
        </motion.p>

        <div className="signin-headline">
          <span className="signin-headline-static">Your family's</span>
          <div className="word-carousel-wrap">
            <AnimatePresence mode="wait">
              <motion.span
                key={idx}
                className="word-carousel-word"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {CYCLE_WORDS[idx]}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="signin-headline-static">awaits.</span>
        </div>

        <motion.p
          className="signin-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Sign in to your parivar's space.
        </motion.p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Auth({ mode = 'signin' }) {
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/family', { replace: true })
    }
  }, [isLoaded, isSignedIn, navigate])

  if (!isLoaded || isSignedIn) return null

  return (
    <div className="auth-page">
      <AnimatePresence mode="wait">
        {mode === 'signup'
          ? <SignupInfoPanel key="signup-info" />
          : <SigninInfoPanel key="signin-info" />
        }
      </AnimatePresence>

      <div className="auth-form-panel">
        <div className="auth-form-inner">
          {mode === 'signin' ? (
            <SignIn
              appearance={{ variables: { colorPrimary: '#E67E22' } }}
              forceRedirectUrl="/family"
              routing="path"
              path="/auth"
              signUpUrl="/auth/sign-up"
            />
          ) : (
            <SignUp
              appearance={{
                variables: { colorPrimary: '#E67E22' },
                elements: { phoneNumberField: { display: 'none' } },
              }}
              forceRedirectUrl="/family"
              routing="path"
              path="/auth/sign-up"
              signInUrl="/auth"
            />
          )}
        </div>
      </div>
    </div>
  )
}
