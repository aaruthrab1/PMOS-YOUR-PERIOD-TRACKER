import { Link } from 'react-router-dom';
import {
  Heart,
  BarChart3,
  BookOpen,
  MessageCircle,
  FileText,
  Shield,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: Heart,
    title: 'Symptom Tracking',
    description: 'Log daily symptoms with severity ratings and discover patterns across your cycle.',
  },
  {
    icon: BarChart3,
    title: 'Cycle Insights',
    description: 'Visualize trends in mood, energy, and symptoms to understand your body better.',
  },
  {
    icon: BookOpen,
    title: 'PMOS Education',
    description: 'Evidence-based articles on premenstrual health, nutrition, and mental wellbeing.',
  },
  {
    icon: MessageCircle,
    title: 'AI Companion',
    description: 'Get compassionate, educational support from Cyra AI — available anytime.',
  },
  {
    icon: FileText,
    title: 'Doctor Prep',
    description: 'Generate data-driven visit summaries to advocate for yourself in healthcare.',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    description: 'Your health data is encrypted, never sold, and always under your control.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyra-50 via-white to-sage-50 dark:from-gray-900 dark:via-surface-dark dark:to-gray-900" />
        <div className="relative mx-auto max-w-6xl px-4 py-6">
          <nav className="flex items-center justify-between" aria-label="Main">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyra-400 to-cyra-600">
                <span className="font-display text-lg font-bold text-white">C</span>
              </div>
              <span className="font-display text-xl font-bold text-cyra-700 dark:text-cyra-300">Cyra</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-cyra-600 dark:text-gray-300">
                Sign in
              </Link>
              <Link to="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </nav>

          <div className="py-20 text-center lg:py-32">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-cyra-100 px-4 py-1.5 text-sm font-medium text-cyra-700 dark:bg-cyra-950 dark:text-cyra-300">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              AI-Powered Women's Health
            </div>
            <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              Understand your body.{' '}
              <span className="bg-gradient-to-r from-cyra-500 to-cyra-700 bg-clip-text text-transparent">
                Advocate for your health.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Cyra is your intelligent companion for PMOS awareness — track symptoms, learn from
              evidence-based content, and walk into every doctor visit prepared.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/signup">
                <Button size="lg">
                  Start tracking free
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <a href="#features" className="btn-secondary">
                Learn more
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-center font-display text-3xl font-bold text-gray-900 dark:text-white">
          Everything you need for cycle health
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600 dark:text-gray-400">
          Built by understanding what women actually need — not what generic health apps offer.
        </p>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <article key={title} className="card group transition-shadow hover:shadow-soft">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyra-100 text-cyra-600 transition-colors group-hover:bg-cyra-200 dark:bg-cyra-950 dark:text-cyra-400">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-cyra-500 to-cyra-700 p-8 text-center text-white sm:p-12">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Your health story deserves to be heard
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-cyra-100">
            Join Cyra and turn daily tracking into powerful healthcare conversations.
          </p>
          <Link to="/signup" className="mt-8 inline-block">
            <Button variant="secondary" size="lg" className="border-0 bg-white text-cyra-700 hover:bg-cyra-50">
              Create your free account
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-cyra-100 py-8 dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Cyra Health. Not a substitute for professional medical advice.</p>
        </div>
      </footer>
    </div>
  );
}
