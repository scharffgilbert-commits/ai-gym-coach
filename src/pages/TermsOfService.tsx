import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Shield, AlertTriangle, Scale, CreditCard, XCircle, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

const translations = {
  de: {
    title: 'Nutzungsbedingungen',
    lastUpdated: 'Zuletzt aktualisiert',
    date: '25. Januar 2025',
    intro: {
      title: 'Willkommen bei FitAI',
      description: 'Durch die Nutzung unserer App stimmen Sie diesen Nutzungsbedingungen zu. Bitte lesen Sie diese sorgfältig durch, bevor Sie unsere Dienste nutzen.',
    },
    sections: [
      {
        icon: 'FileText',
        title: 'Akzeptanz der Bedingungen',
        content: [
          'Durch Registrierung oder Nutzung der App akzeptieren Sie diese Bedingungen',
          'Sie müssen mindestens 16 Jahre alt sein, um die App zu nutzen',
          'Sie sind verantwortlich für die Sicherheit Ihres Kontos und Passworts',
          'Sie stimmen zu, genaue und aktuelle Informationen bereitzustellen',
        ],
      },
      {
        icon: 'Shield',
        title: 'Nutzung der App',
        content: [
          'Die App dient nur zu Informations- und Fitnesszwecken',
          'Unsere Empfehlungen ersetzen keine professionelle medizinische Beratung',
          'Konsultieren Sie vor Beginn eines Trainingsprogramms einen Arzt',
          'Sie nutzen die App auf eigenes Risiko',
        ],
      },
      {
        icon: 'AlertTriangle',
        title: 'Verbotene Aktivitäten',
        content: [
          'Keine Verletzung von Gesetzen oder Rechten Dritter',
          'Kein Hochladen von schädlichen, beleidigenden oder illegalen Inhalten',
          'Keine Versuche, die App zu hacken oder zu manipulieren',
          'Keine kommerzielle Nutzung ohne unsere schriftliche Zustimmung',
          'Kein Teilen Ihres Kontos mit anderen Personen',
        ],
      },
      {
        icon: 'Scale',
        title: 'Geistiges Eigentum',
        content: [
          'Alle Inhalte, Designs und Software sind unser geistiges Eigentum',
          'Sie erhalten eine begrenzte, nicht-exklusive Lizenz zur App-Nutzung',
          'Das Kopieren, Modifizieren oder Verbreiten unserer Inhalte ist untersagt',
          'Von Ihnen hochgeladene Inhalte bleiben Ihr Eigentum',
        ],
      },
      {
        icon: 'CreditCard',
        title: 'Abonnements & Zahlungen',
        content: [
          'Kostenlose Testversionen werden automatisch in kostenpflichtige Abos umgewandelt',
          'Abonnements verlängern sich automatisch bis zur Kündigung',
          'Preise können sich ändern, werden aber vor Verlängerung mitgeteilt',
          'Rückerstattungen erfolgen gemäß den Richtlinien des App Stores',
        ],
      },
      {
        icon: 'XCircle',
        title: 'Kündigung',
        content: [
          'Sie können Ihr Konto jederzeit in den Einstellungen löschen',
          'Wir können Konten bei Verstoß gegen diese Bedingungen sperren',
          'Bei Kündigung verlieren Sie Zugang zu Premium-Funktionen',
          'Bestimmte Daten können gemäß gesetzlicher Vorgaben aufbewahrt werden',
        ],
      },
      {
        icon: 'RefreshCw',
        title: 'Änderungen der Bedingungen',
        content: [
          'Wir können diese Bedingungen jederzeit aktualisieren',
          'Wesentliche Änderungen werden 30 Tage im Voraus angekündigt',
          'Die fortgesetzte Nutzung gilt als Zustimmung zu den Änderungen',
        ],
      },
    ],
    liability: {
      title: 'Haftungsbeschränkung',
      description: 'Die App wird "wie besehen" bereitgestellt. Wir übernehmen keine Garantie für die Verfügbarkeit, Genauigkeit oder Eignung für bestimmte Zwecke. Wir haften nicht für indirekte Schäden, entgangenen Gewinn oder Datenverlust. Unsere Haftung ist auf den von Ihnen gezahlten Betrag in den letzten 12 Monaten beschränkt.',
    },
    governing: {
      title: 'Anwendbares Recht',
      description: 'Diese Bedingungen unterliegen dem Recht der Bundesrepublik Deutschland. Streitigkeiten werden vor den zuständigen Gerichten in Deutschland verhandelt. EU-Verbraucher können auch die Online-Streitbeilegungsplattform der EU nutzen.',
    },
    contact: {
      title: 'Kontakt',
      description: 'Bei Fragen zu diesen Nutzungsbedingungen kontaktieren Sie uns unter:',
    },
  },
  en: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated',
    date: 'January 25, 2025',
    intro: {
      title: 'Welcome to FitAI',
      description: 'By using our app, you agree to these Terms of Service. Please read them carefully before using our services.',
    },
    sections: [
      {
        icon: 'FileText',
        title: 'Acceptance of Terms',
        content: [
          'By registering or using the app, you accept these terms',
          'You must be at least 16 years old to use the app',
          'You are responsible for the security of your account and password',
          'You agree to provide accurate and current information',
        ],
      },
      {
        icon: 'Shield',
        title: 'Use of the App',
        content: [
          'The app is for informational and fitness purposes only',
          'Our recommendations do not replace professional medical advice',
          'Consult a doctor before starting any exercise program',
          'You use the app at your own risk',
        ],
      },
      {
        icon: 'AlertTriangle',
        title: 'Prohibited Activities',
        content: [
          'No violation of laws or third-party rights',
          'No uploading of harmful, offensive, or illegal content',
          'No attempts to hack or manipulate the app',
          'No commercial use without our written consent',
          'No sharing your account with others',
        ],
      },
      {
        icon: 'Scale',
        title: 'Intellectual Property',
        content: [
          'All content, designs, and software are our intellectual property',
          'You receive a limited, non-exclusive license to use the app',
          'Copying, modifying, or distributing our content is prohibited',
          'Content you upload remains your property',
        ],
      },
      {
        icon: 'CreditCard',
        title: 'Subscriptions & Payments',
        content: [
          'Free trials automatically convert to paid subscriptions',
          'Subscriptions renew automatically until canceled',
          'Prices may change but will be communicated before renewal',
          'Refunds are processed according to App Store policies',
        ],
      },
      {
        icon: 'XCircle',
        title: 'Termination',
        content: [
          'You can delete your account at any time in settings',
          'We may suspend accounts for violation of these terms',
          'Upon termination, you lose access to premium features',
          'Certain data may be retained as required by law',
        ],
      },
      {
        icon: 'RefreshCw',
        title: 'Changes to Terms',
        content: [
          'We may update these terms at any time',
          'Significant changes will be announced 30 days in advance',
          'Continued use constitutes acceptance of the changes',
        ],
      },
    ],
    liability: {
      title: 'Limitation of Liability',
      description: 'The app is provided "as is." We make no guarantees regarding availability, accuracy, or fitness for particular purposes. We are not liable for indirect damages, lost profits, or data loss. Our liability is limited to the amount you paid in the last 12 months.',
    },
    governing: {
      title: 'Governing Law',
      description: 'These terms are governed by the laws of Germany. Disputes will be resolved in the competent courts of Germany. EU consumers may also use the EU Online Dispute Resolution platform.',
    },
    contact: {
      title: 'Contact',
      description: 'For questions about these Terms of Service, contact us at:',
    },
  },
};

const iconMap = {
  FileText,
  Shield,
  AlertTriangle,
  Scale,
  CreditCard,
  XCircle,
  RefreshCw,
};

export default function TermsOfService() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const appName = 'FitAI';
  const contactEmail = 'legal@fitai.app';

  const lang = language === 'en' ? 'en' : 'de';
  const t = translations[lang];

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
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{t.intro.title}</h2>
              <p className="text-sm text-muted-foreground">{appName}</p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {t.intro.description}
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
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}

        {/* Liability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl bg-destructive/5 border border-destructive/20 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold text-foreground">{t.liability.title}</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {t.liability.description}
          </p>
        </motion.div>

        {/* Governing Law */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-2xl bg-card p-6 shadow-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t.governing.title}</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {t.governing.description}
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
