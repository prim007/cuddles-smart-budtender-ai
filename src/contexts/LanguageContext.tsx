import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type SupportedLanguage = "en" | "es" | "fr" | "de" | "pt" | "af" | "zu";

interface LanguageStrings {
  // Chat
  chatTitle: string;
  chatPlaceholder: string;
  sendButton: string;
  newChat: string;
  messages: string;
  
  // Quick prompts
  helpMeSleep: string;
  boostCreativity: string;
  painRelief: string;
  socialEnergy: string;
  stressRelief: string;
  morningEnergy: string;
  
  // Profile
  profile: string;
  experienceLevel: string;
  beginner: string;
  intermediate: string;
  experienced: string;
  tolerance: string;
  low: string;
  medium: string;
  high: string;
  consumptionMethod: string;
  smoke: string;
  vape: string;
  edible: string;
  tincture: string;
  preferredEffects: string;
  flavorPreferences: string;
  saveProfile: string;
  resetProfile: string;
  
  // Dosage
  dosageCalculator: string;
  recommendedDose: string;
  startLow: string;
  
  // Voice
  voiceInput: string;
  listening: string;
  tapToSpeak: string;
  
  // General
  loading: string;
  error: string;
  tryAgain: string;
  language: string;
  
  // Initial message
  initialMessage: string;
}

const translations: Record<SupportedLanguage, LanguageStrings> = {
  en: {
    chatTitle: "Try It Yourself",
    chatPlaceholder: "Describe what you're looking for...",
    sendButton: "Send",
    newChat: "New Chat",
    messages: "messages",
    helpMeSleep: "Help me sleep",
    boostCreativity: "Boost creativity",
    painRelief: "Pain relief",
    socialEnergy: "Social energy",
    stressRelief: "Stress relief",
    morningEnergy: "Morning energy",
    profile: "Profile",
    experienceLevel: "Experience Level",
    beginner: "Beginner",
    intermediate: "Intermediate",
    experienced: "Experienced",
    tolerance: "Tolerance",
    low: "Low",
    medium: "Medium",
    high: "High",
    consumptionMethod: "Consumption Method",
    smoke: "Smoke",
    vape: "Vape",
    edible: "Edible",
    tincture: "Tincture",
    preferredEffects: "Preferred Effects",
    flavorPreferences: "Flavor Preferences",
    saveProfile: "Save Profile",
    resetProfile: "Reset Profile",
    dosageCalculator: "Dosage Calculator",
    recommendedDose: "Recommended Dose",
    startLow: "Start low and go slow",
    voiceInput: "Voice Input",
    listening: "Listening...",
    tapToSpeak: "Tap to speak",
    loading: "Loading...",
    error: "Error",
    tryAgain: "Try Again",
    language: "Language",
    initialMessage: "Hi! I'm Cuddles. Tell me what effects you're looking for (like relaxation, creativity, or pain relief), your experience level, and any flavor preferences. I'll recommend the perfect products for you!",
  },
  es: {
    chatTitle: "Pruébalo Tú Mismo",
    chatPlaceholder: "Describe lo que buscas...",
    sendButton: "Enviar",
    newChat: "Nuevo Chat",
    messages: "mensajes",
    helpMeSleep: "Ayúdame a dormir",
    boostCreativity: "Aumentar creatividad",
    painRelief: "Alivio del dolor",
    socialEnergy: "Energía social",
    stressRelief: "Alivio del estrés",
    morningEnergy: "Energía matutina",
    profile: "Perfil",
    experienceLevel: "Nivel de Experiencia",
    beginner: "Principiante",
    intermediate: "Intermedio",
    experienced: "Experimentado",
    tolerance: "Tolerancia",
    low: "Baja",
    medium: "Media",
    high: "Alta",
    consumptionMethod: "Método de Consumo",
    smoke: "Fumar",
    vape: "Vapear",
    edible: "Comestible",
    tincture: "Tintura",
    preferredEffects: "Efectos Preferidos",
    flavorPreferences: "Preferencias de Sabor",
    saveProfile: "Guardar Perfil",
    resetProfile: "Restablecer Perfil",
    dosageCalculator: "Calculadora de Dosis",
    recommendedDose: "Dosis Recomendada",
    startLow: "Empieza bajo y ve despacio",
    voiceInput: "Entrada de Voz",
    listening: "Escuchando...",
    tapToSpeak: "Toca para hablar",
    loading: "Cargando...",
    error: "Error",
    tryAgain: "Intentar de Nuevo",
    language: "Idioma",
    initialMessage: "¡Hola! Soy Cuddles. Cuéntame qué efectos buscas (como relajación, creatividad o alivio del dolor), tu nivel de experiencia y tus preferencias de sabor. ¡Te recomendaré los productos perfectos!",
  },
  fr: {
    chatTitle: "Essayez Vous-Même",
    chatPlaceholder: "Décrivez ce que vous recherchez...",
    sendButton: "Envoyer",
    newChat: "Nouveau Chat",
    messages: "messages",
    helpMeSleep: "Aide-moi à dormir",
    boostCreativity: "Stimuler la créativité",
    painRelief: "Soulagement de la douleur",
    socialEnergy: "Énergie sociale",
    stressRelief: "Soulagement du stress",
    morningEnergy: "Énergie matinale",
    profile: "Profil",
    experienceLevel: "Niveau d'Expérience",
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    experienced: "Expérimenté",
    tolerance: "Tolérance",
    low: "Faible",
    medium: "Moyenne",
    high: "Élevée",
    consumptionMethod: "Méthode de Consommation",
    smoke: "Fumer",
    vape: "Vapoter",
    edible: "Comestible",
    tincture: "Teinture",
    preferredEffects: "Effets Préférés",
    flavorPreferences: "Préférences de Saveur",
    saveProfile: "Sauvegarder le Profil",
    resetProfile: "Réinitialiser le Profil",
    dosageCalculator: "Calculateur de Dosage",
    recommendedDose: "Dose Recommandée",
    startLow: "Commencez bas et allez lentement",
    voiceInput: "Entrée Vocale",
    listening: "Écoute...",
    tapToSpeak: "Appuyez pour parler",
    loading: "Chargement...",
    error: "Erreur",
    tryAgain: "Réessayer",
    language: "Langue",
    initialMessage: "Salut! Je suis Cuddles. Dites-moi quels effets vous recherchez (comme la relaxation, la créativité ou le soulagement de la douleur), votre niveau d'expérience et vos préférences de saveur. Je vous recommanderai les produits parfaits!",
  },
  de: {
    chatTitle: "Probieren Sie es Selbst",
    chatPlaceholder: "Beschreiben Sie, was Sie suchen...",
    sendButton: "Senden",
    newChat: "Neuer Chat",
    messages: "Nachrichten",
    helpMeSleep: "Hilf mir beim Schlafen",
    boostCreativity: "Kreativität steigern",
    painRelief: "Schmerzlinderung",
    socialEnergy: "Soziale Energie",
    stressRelief: "Stressabbau",
    morningEnergy: "Morgenenergie",
    profile: "Profil",
    experienceLevel: "Erfahrungsstufe",
    beginner: "Anfänger",
    intermediate: "Fortgeschritten",
    experienced: "Erfahren",
    tolerance: "Toleranz",
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
    consumptionMethod: "Konsummethode",
    smoke: "Rauchen",
    vape: "Dampfen",
    edible: "Essbar",
    tincture: "Tinktur",
    preferredEffects: "Bevorzugte Effekte",
    flavorPreferences: "Geschmackspräferenzen",
    saveProfile: "Profil Speichern",
    resetProfile: "Profil Zurücksetzen",
    dosageCalculator: "Dosierungsrechner",
    recommendedDose: "Empfohlene Dosis",
    startLow: "Beginnen Sie niedrig und gehen Sie langsam",
    voiceInput: "Spracheingabe",
    listening: "Höre zu...",
    tapToSpeak: "Tippen zum Sprechen",
    loading: "Laden...",
    error: "Fehler",
    tryAgain: "Erneut Versuchen",
    language: "Sprache",
    initialMessage: "Hallo! Ich bin Cuddles. Erzählen Sie mir, welche Wirkungen Sie suchen (wie Entspannung, Kreativität oder Schmerzlinderung), Ihr Erfahrungsniveau und Ihre Geschmackspräferenzen. Ich werde Ihnen die perfekten Produkte empfehlen!",
  },
  pt: {
    chatTitle: "Experimente Você Mesmo",
    chatPlaceholder: "Descreva o que você procura...",
    sendButton: "Enviar",
    newChat: "Novo Chat",
    messages: "mensagens",
    helpMeSleep: "Me ajude a dormir",
    boostCreativity: "Aumentar criatividade",
    painRelief: "Alívio da dor",
    socialEnergy: "Energia social",
    stressRelief: "Alívio do estresse",
    morningEnergy: "Energia matinal",
    profile: "Perfil",
    experienceLevel: "Nível de Experiência",
    beginner: "Iniciante",
    intermediate: "Intermediário",
    experienced: "Experiente",
    tolerance: "Tolerância",
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    consumptionMethod: "Método de Consumo",
    smoke: "Fumar",
    vape: "Vaporizar",
    edible: "Comestível",
    tincture: "Tintura",
    preferredEffects: "Efeitos Preferidos",
    flavorPreferences: "Preferências de Sabor",
    saveProfile: "Salvar Perfil",
    resetProfile: "Redefinir Perfil",
    dosageCalculator: "Calculadora de Dosagem",
    recommendedDose: "Dose Recomendada",
    startLow: "Comece baixo e vá devagar",
    voiceInput: "Entrada de Voz",
    listening: "Ouvindo...",
    tapToSpeak: "Toque para falar",
    loading: "Carregando...",
    error: "Erro",
    tryAgain: "Tentar Novamente",
    language: "Idioma",
    initialMessage: "Oi! Eu sou o Cuddles. Me conte quais efeitos você procura (como relaxamento, criatividade ou alívio da dor), seu nível de experiência e suas preferências de sabor. Vou recomendar os produtos perfeitos para você!",
  },
  af: {
    chatTitle: "Probeer Dit Self",
    chatPlaceholder: "Beskryf waarna jy soek...",
    sendButton: "Stuur",
    newChat: "Nuwe Gesels",
    messages: "boodskappe",
    helpMeSleep: "Help my slaap",
    boostCreativity: "Verhoog kreatiwiteit",
    painRelief: "Pynverligting",
    socialEnergy: "Sosiale energie",
    stressRelief: "Stresverligting",
    morningEnergy: "Oggend energie",
    profile: "Profiel",
    experienceLevel: "Ervaringsvlak",
    beginner: "Beginner",
    intermediate: "Intermediêr",
    experienced: "Ervare",
    tolerance: "Toleransie",
    low: "Laag",
    medium: "Medium",
    high: "Hoog",
    consumptionMethod: "Verbruikmetode",
    smoke: "Rook",
    vape: "Vape",
    edible: "Eetbaar",
    tincture: "Tinktuur",
    preferredEffects: "Verkose Effekte",
    flavorPreferences: "Geurvoorkeure",
    saveProfile: "Stoor Profiel",
    resetProfile: "Herstel Profiel",
    dosageCalculator: "Dosis Sakrekenaar",
    recommendedDose: "Aanbevole Dosis",
    startLow: "Begin laag en gaan stadig",
    voiceInput: "Stem Invoer",
    listening: "Luister...",
    tapToSpeak: "Tik om te praat",
    loading: "Laai...",
    error: "Fout",
    tryAgain: "Probeer Weer",
    language: "Taal",
    initialMessage: "Hi! Ek is Cuddles. Vertel my watter effekte jy soek (soos ontspanning, kreatiwiteit of pynverligting), jou ervaringsvlak en enige geurvoorkeure. Ek sal die perfekte produkte vir jou aanbeveel!",
  },
  zu: {
    chatTitle: "Zama Ngokwakho",
    chatPlaceholder: "Chaza okufunayo...",
    sendButton: "Thumela",
    newChat: "Ingxoxo Entsha",
    messages: "imiyalezo",
    helpMeSleep: "Ngisize ngilale",
    boostCreativity: "Khulisa ubuciko",
    painRelief: "Ukudambisa ubuhlungu",
    socialEnergy: "Amandla omphakathi",
    stressRelief: "Ukudambisa ukukhathazeka",
    morningEnergy: "Amandla asekuseni",
    profile: "Iphrofayela",
    experienceLevel: "Izinga Lokuhlangenwe Nakho",
    beginner: "Oqalayo",
    intermediate: "Ophakathi",
    experienced: "Onesipiliyoni",
    tolerance: "Ukubekezela",
    low: "Phansi",
    medium: "Maphakathi",
    high: "Phezulu",
    consumptionMethod: "Indlela Yokudla",
    smoke: "Bhema",
    vape: "Vape",
    edible: "Okudliwayo",
    tincture: "I-Tincture",
    preferredEffects: "Imiphumela Oyithandayo",
    flavorPreferences: "Ukunambitheka Okuthandayo",
    saveProfile: "Gcina Iphrofayela",
    resetProfile: "Setha Kabusha Iphrofayela",
    dosageCalculator: "Isibali Somthamo",
    recommendedDose: "Umthamo Onconyiwe",
    startLow: "Qala phansi uhambe kancane",
    voiceInput: "Ukungena Kwezwi",
    listening: "Ilalele...",
    tapToSpeak: "Thepha ukukhuluma",
    loading: "Iyalayisha...",
    error: "Iphutha",
    tryAgain: "Zama Futhi",
    language: "Ulimi",
    initialMessage: "Sawubona! NginguCuddles. Ngitshele imiphumela oyifunayo (njengokuphumula, ubuciko, noma ukudambisa ubuhlungu), izinga lakho lokuhlangenwe nakho, kanye nokunambitheka okuthandayo. Ngizokuncoma imikhiqizo ekahle kuwe!",
  },
};

const languageNames: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  af: "Afrikaans",
  zu: "isiZulu",
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: LanguageStrings;
  languageNames: Record<SupportedLanguage, string>;
  supportedLanguages: SupportedLanguage[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem("cuddles-language");
      return (stored as SupportedLanguage) || "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("cuddles-language", lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        languageNames,
        supportedLanguages: Object.keys(translations) as SupportedLanguage[],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
