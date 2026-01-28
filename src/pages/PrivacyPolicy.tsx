import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Database, Camera, Bell, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

const translations = {
  de: {
    title: 'Datenschutzrichtlinie',
    lastUpdated: 'Zuletzt aktualisiert',
    date: '25. Januar 2025',
    intro: {
      title: 'Ihre Privatsphäre ist uns wichtig',
      description: 'Diese Datenschutzrichtlinie erklärt, wie {appName} Ihre persönlichen Daten sammelt, verwendet und schützt. Wir verpflichten uns zur Einhaltung der DSGVO und anderer geltender Datenschutzgesetze.',
    },
    sections: [
      {
        icon: 'Database',
        title: 'Welche Daten wir sammeln',
        content: [
          'Kontoinformationen: E-Mail-Adresse, Name (optional)',
          'Gesundheitsdaten: Gewicht, Größe, Alter, Geschlecht (freiwillig)',
          'Fitnessdaten: Trainingshistorie, Übungen, Fortschritte',
          'Gerätedaten: Fotos von Fitnessgeräten (nur mit Ihrer Erlaubnis)',
          'Nutzungsdaten: App-Interaktionen zur Verbesserung unserer Dienste',
        ],
      },
      {
        icon: 'Camera',
        title: 'Kamera & Fotos',
        content: [
          'Wir verwenden die Kamera ausschließlich zur Erkennung von Fitnessgeräten',
          'Fotos werden zur KI-Analyse an unsere sicheren Server gesendet',
          'Sie können die Kameraberechtigung jederzeit in den Geräteeinstellungen widerrufen',
          'Fotos werden nicht dauerhaft gespeichert, sofern Sie dies nicht wünschen',
        ],
      },
      {
        icon: 'Shield',
        title: 'Wie wir Ihre Daten verwenden',
        content: [
          'Personalisierung Ihrer Trainingspläne basierend auf Ihren Zielen',
          'Verfolgung Ihres Fortschritts und Bereitstellung von Einblicken',
          'Verbesserung unserer KI-Algorithmen zur Geräteerkennung',
          'Versand von Trainings-Erinnerungen (nur mit Ihrer Zustimmung)',
          'Wir verkaufen Ihre Daten niemals an Dritte',
        ],
      },
      {
        icon: 'Lock',
        title: 'Datensicherheit',
        content: [
          'Alle Daten werden verschlüsselt übertragen (TLS/SSL)',
          'Passwörter werden sicher gehasht und niemals im Klartext gespeichert',
          'Regelmäßige Sicherheitsüberprüfungen unserer Systeme',
          'Zugriff auf Ihre Daten nur durch autorisiertes Personal',
          'Datenspeicherung auf sicheren Servern in der EU',
        ],
      },
      {
        icon: 'Bell',
        title: 'Push-Benachrichtigungen',
        content: [
          'Optionale Trainings-Erinnerungen und Motivations-Nachrichten',
          'Benachrichtigungen über erreichte Ziele und Erfolge',
          'Sie können Benachrichtigungen jederzeit in den Einstellungen deaktivieren',
        ],
      },
      {
        icon: 'Mail',
        title: 'Ihre Rechte (DSGVO)',
        content: [
          'Recht auf Auskunft: Erfahren Sie, welche Daten wir über Sie speichern',
          'Recht auf Berichtigung: Korrigieren Sie unrichtige Daten',
          'Recht auf Löschung: Lassen Sie Ihre Daten vollständig löschen',
          'Recht auf Datenübertragbarkeit: Exportieren Sie Ihre Daten',
          'Recht auf Widerspruch: Widersprechen Sie der Datenverarbeitung',
          'Kontaktieren Sie uns unter {email} zur Ausübung Ihrer Rechte',
        ],
      },
    ],
    thirdParty: {
      title: 'Drittanbieter-Dienste',
      description: 'Wir nutzen folgende vertrauenswürdige Dienste zur Bereitstellung unserer App:',
      items: [
        { label: 'Cloud-Infrastruktur', description: 'Sichere Datenspeicherung und -verarbeitung' },
        { label: 'KI-Dienste', description: 'Zur Erkennung von Fitnessgeräten auf Fotos' },
        { label: 'Analytics', description: 'Anonymisierte Nutzungsstatistiken zur App-Verbesserung' },
      ],
    },
    children: {
      title: 'Kinder & Jugendliche',
      description: '{appName} richtet sich an Personen ab 16 Jahren. Wir sammeln wissentlich keine Daten von Kindern unter 16 Jahren. Wenn Sie glauben, dass ein Kind uns personenbezogene Daten bereitgestellt hat, kontaktieren Sie uns bitte.',
    },
    changes: {
      title: 'Änderungen dieser Richtlinie',
      description: 'Wir können diese Datenschutzrichtlinie von Zeit zu Zeit aktualisieren. Bei wesentlichen Änderungen werden wir Sie per E-Mail oder durch eine Benachrichtigung in der App informieren.',
    },
    contact: {
      title: 'Kontakt',
      description: 'Bei Fragen zu dieser Datenschutzrichtlinie oder zur Ausübung Ihrer Rechte kontaktieren Sie uns unter:',
    },
  },
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated',
    date: 'January 25, 2025',
    intro: {
      title: 'Your Privacy Matters to Us',
      description: 'This Privacy Policy explains how {appName} collects, uses, and protects your personal data. We are committed to complying with GDPR and other applicable privacy laws.',
    },
    sections: [
      {
        icon: 'Database',
        title: 'Data We Collect',
        content: [
          'Account information: Email address, name (optional)',
          'Health data: Weight, height, age, gender (voluntary)',
          'Fitness data: Workout history, exercises, progress',
          'Device data: Photos of fitness equipment (only with your permission)',
          'Usage data: App interactions to improve our services',
        ],
      },
      {
        icon: 'Camera',
        title: 'Camera & Photos',
        content: [
          'We use the camera exclusively for fitness equipment recognition',
          'Photos are sent to our secure servers for AI analysis',
          'You can revoke camera permission at any time in device settings',
          'Photos are not permanently stored unless you request it',
        ],
      },
      {
        icon: 'Shield',
        title: 'How We Use Your Data',
        content: [
          'Personalizing your workout plans based on your goals',
          'Tracking your progress and providing insights',
          'Improving our AI algorithms for equipment recognition',
          'Sending workout reminders (only with your consent)',
          'We never sell your data to third parties',
        ],
      },
      {
        icon: 'Lock',
        title: 'Data Security',
        content: [
          'All data is encrypted in transit (TLS/SSL)',
          'Passwords are securely hashed and never stored in plain text',
          'Regular security audits of our systems',
          'Access to your data only by authorized personnel',
          'Data storage on secure servers in the EU',
        ],
      },
      {
        icon: 'Bell',
        title: 'Push Notifications',
        content: [
          'Optional workout reminders and motivational messages',
          'Notifications about achieved goals and achievements',
          'You can disable notifications at any time in settings',
        ],
      },
      {
        icon: 'Mail',
        title: 'Your Rights (GDPR)',
        content: [
          'Right to access: Find out what data we store about you',
          'Right to rectification: Correct inaccurate data',
          'Right to erasure: Have your data completely deleted',
          'Right to data portability: Export your data',
          'Right to object: Object to data processing',
          'Contact us at {email} to exercise your rights',
        ],
      },
    ],
    thirdParty: {
      title: 'Third-Party Services',
      description: 'We use the following trusted services to provide our app:',
      items: [
        { label: 'Cloud Infrastructure', description: 'Secure data storage and processing' },
        { label: 'AI Services', description: 'For recognizing fitness equipment in photos' },
        { label: 'Analytics', description: 'Anonymized usage statistics to improve the app' },
      ],
    },
    children: {
      title: 'Children & Minors',
      description: '{appName} is intended for users aged 16 and older. We do not knowingly collect data from children under 16. If you believe a child has provided us with personal data, please contact us.',
    },
    changes: {
      title: 'Changes to This Policy',
      description: 'We may update this Privacy Policy from time to time. For significant changes, we will notify you by email or through an in-app notification.',
    },
    contact: {
      title: 'Contact',
      description: 'For questions about this Privacy Policy or to exercise your rights, contact us at:',
    },
  },
};

const iconMap = {
  Database,
  Camera,
  Shield,
  Lock,
  Bell,
  Mail,
};

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const appName = 'FitAI';
  const contactEmail = 'privacy@fitai.app';

  // Use English for 'en', German for all others (de, es, fr, it, pt)
  const lang = language === 'en' ? 'en' : 'de';
  const t = translations[lang];

  const replaceVars = (text: string) => {
    return text.replace('{appName}', appName).replace('{email}', contactEmail);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border"
      >
        <div className="flex items-center gap-3 px-4 py-4 safe-area-top">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.lastUpdated}: {t.date}</p>
          </div>
        </div>
      </motion.header>

      <div className="px-4 py-6 pb-24 space-y-6 max-w-2xl mx-auto">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card p-6 shadow-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{t.intro.title}</h2>
              <p className="text-sm text-muted-foreground">{appName}</p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {replaceVars(t.intro.description)}
          </p>
        </motion.div>

        {/* Sections */}
        {t.sections.map((section, index) => {
          const IconComponent = iconMap[section.icon as keyof typeof iconMap];
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className="rounded-2xl bg-card p-6 shadow-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{section.title}</h3>
              </div>
              <ul className="space-y-2">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary mt-1.5">•</span>
                    <span className="leading-relaxed">{replaceVars(item)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}

        {/* Third-Party Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl bg-card p-6 shadow-card"
        >
          <h3 className="font-semibold text-foreground mb-4">{t.thirdParty.title}</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t.thirdParty.description}
          </p>
          <ul className="space-y-2 text-muted-foreground">
            {t.thirdParty.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary mt-1.5">•</span>
                <span><strong>{item.label}:</strong> {item.description}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Children's Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl bg-card p-6 shadow-card"
        >
          <h3 className="font-semibold text-foreground mb-4">{t.children.title}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {replaceVars(t.children.description)}
          </p>
        </motion.div>

        {/* Changes to Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-2xl bg-card p-6 shadow-card"
        >
          <h3 className="font-semibold text-foreground mb-4">{t.changes.title}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {t.changes.description}
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="rounded-2xl bg-primary/5 border border-primary/20 p-6"
        >
          <h3 className="font-semibold text-foreground mb-2">{t.contact.title}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {t.contact.description}
          </p>
          <a 
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center gap-2 mt-3 text-primary font-medium hover:underline"
          >
            <Mail className="h-4 w-4" />
            {contactEmail}
          </a>
        </motion.div>

        {/* Version info */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          {appName} v1.0.0 • {t.title} v1.0
        </p>
      </div>
    </div>
  );
}
