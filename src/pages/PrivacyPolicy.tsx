import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Database, Camera, Bell, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const lastUpdated = '25. Januar 2025';
  const appName = 'FitAI';
  const companyName = 'FitAI';
  const contactEmail = 'privacy@fitai.app';

  const sections = [
    {
      icon: Database,
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
      icon: Camera,
      title: 'Kamera & Fotos',
      content: [
        'Wir verwenden die Kamera ausschließlich zur Erkennung von Fitnessgeräten',
        'Fotos werden zur KI-Analyse an unsere sicheren Server gesendet',
        'Sie können die Kameraberechtigung jederzeit in den Geräteeinstellungen widerrufen',
        'Fotos werden nicht dauerhaft gespeichert, sofern Sie dies nicht wünschen',
      ],
    },
    {
      icon: Shield,
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
      icon: Lock,
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
      icon: Bell,
      title: 'Push-Benachrichtigungen',
      content: [
        'Optionale Trainings-Erinnerungen und Motivations-Nachrichten',
        'Benachrichtigungen über erreichte Ziele und Erfolge',
        'Sie können Benachrichtigungen jederzeit in den Einstellungen deaktivieren',
      ],
    },
    {
      icon: Mail,
      title: 'Ihre Rechte (DSGVO)',
      content: [
        'Recht auf Auskunft: Erfahren Sie, welche Daten wir über Sie speichern',
        'Recht auf Berichtigung: Korrigieren Sie unrichtige Daten',
        'Recht auf Löschung: Lassen Sie Ihre Daten vollständig löschen',
        'Recht auf Datenübertragbarkeit: Exportieren Sie Ihre Daten',
        'Recht auf Widerspruch: Widersprechen Sie der Datenverarbeitung',
        `Kontaktieren Sie uns unter ${contactEmail} zur Ausübung Ihrer Rechte`,
      ],
    },
  ];

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
            <h1 className="text-xl font-bold text-foreground">Datenschutzrichtlinie</h1>
            <p className="text-sm text-muted-foreground">Zuletzt aktualisiert: {lastUpdated}</p>
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
              <h2 className="font-semibold text-foreground">Ihre Privatsphäre ist uns wichtig</h2>
              <p className="text-sm text-muted-foreground">{appName} by {companyName}</p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Diese Datenschutzrichtlinie erklärt, wie {appName} Ihre persönlichen Daten sammelt, 
            verwendet und schützt. Wir verpflichten uns zur Einhaltung der DSGVO und anderer 
            geltender Datenschutzgesetze.
          </p>
        </motion.div>

        {/* Sections */}
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <section.icon className="h-5 w-5 text-primary" />
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
        ))}

        {/* Third-Party Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl bg-card p-6 shadow-card"
        >
          <h3 className="font-semibold text-foreground mb-4">Drittanbieter-Dienste</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Wir nutzen folgende vertrauenswürdige Dienste zur Bereitstellung unserer App:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1.5">•</span>
              <span><strong>Cloud-Infrastruktur:</strong> Sichere Datenspeicherung und -verarbeitung</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1.5">•</span>
              <span><strong>KI-Dienste:</strong> Zur Erkennung von Fitnessgeräten auf Fotos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1.5">•</span>
              <span><strong>Analytics:</strong> Anonymisierte Nutzungsstatistiken zur App-Verbesserung</span>
            </li>
          </ul>
        </motion.div>

        {/* Children's Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl bg-card p-6 shadow-card"
        >
          <h3 className="font-semibold text-foreground mb-4">Kinder & Jugendliche</h3>
          <p className="text-muted-foreground leading-relaxed">
            {appName} richtet sich an Personen ab 16 Jahren. Wir sammeln wissentlich keine 
            Daten von Kindern unter 16 Jahren. Wenn Sie glauben, dass ein Kind uns 
            personenbezogene Daten bereitgestellt hat, kontaktieren Sie uns bitte.
          </p>
        </motion.div>

        {/* Changes to Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-2xl bg-card p-6 shadow-card"
        >
          <h3 className="font-semibold text-foreground mb-4">Änderungen dieser Richtlinie</h3>
          <p className="text-muted-foreground leading-relaxed">
            Wir können diese Datenschutzrichtlinie von Zeit zu Zeit aktualisieren. 
            Bei wesentlichen Änderungen werden wir Sie per E-Mail oder durch eine 
            Benachrichtigung in der App informieren.
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="rounded-2xl bg-primary/5 border border-primary/20 p-6"
        >
          <h3 className="font-semibold text-foreground mb-2">Kontakt</h3>
          <p className="text-muted-foreground leading-relaxed">
            Bei Fragen zu dieser Datenschutzrichtlinie oder zur Ausübung Ihrer Rechte 
            kontaktieren Sie uns unter:
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
          {appName} v1.0.0 • Datenschutzrichtlinie v1.0
        </p>
      </div>
    </div>
  );
}
