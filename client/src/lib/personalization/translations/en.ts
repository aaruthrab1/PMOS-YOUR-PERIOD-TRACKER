/** Translation keys — type-safe i18n for Cyra */
export type TranslationKey =
  | 'nav.home'
  | 'nav.tracker'
  | 'nav.care'
  | 'nav.chat'
  | 'nav.reports'
  | 'nav.settings'
  | 'nav.more'
  | 'nav.androgen'
  | 'nav.more.reports'
  | 'nav.more.reportsDesc'
  | 'nav.more.androgenDesc'
  | 'nav.more.settingsDesc'
  | 'common.loading'
  | 'common.error'
  | 'common.retry'
  | 'common.save'
  | 'common.cancel'
  | 'common.back'
  | 'common.continue'
  | 'common.done'
  | 'common.today'
  | 'common.generate'
  | 'common.download'
  | 'common.share'
  | 'common.copy'
  | 'common.copied'
  | 'common.delete'
  | 'common.close'
  | 'common.openMaps'
  | 'common.useLocation'
  | 'common.there'
  | 'common.dismiss'
  | 'common.skipToContent'
  | 'settings.title'
  | 'settings.subtitle'
  | 'settings.language'
  | 'settings.languageDesc'
  | 'settings.languageChanged'
  | 'settings.simpleLanguage'
  | 'settings.simpleLanguageDesc'
  | 'settings.region'
  | 'settings.regionDesc'
  | 'settings.appearance'
  | 'settings.cyclePrefs'
  | 'settings.cycleLength'
  | 'settings.periodLength'
  | 'settings.save'
  | 'settings.saved'
  | 'settings.healthTools'
  | 'settings.privacy'
  | 'settings.signOut'
  | 'page.dashboard'
  | 'page.tracker'
  | 'page.care'
  | 'page.chat'
  | 'page.reports'
  | 'page.settings'
  | 'page.androgen'
  | 'dashboard.greeting.morning'
  | 'dashboard.greeting.afternoon'
  | 'dashboard.greeting.evening'
  | 'dashboard.snapshot'
  | 'dashboard.healthSummary'
  | 'dashboard.dailyCheckIn'
  | 'dashboard.smartInsights'
  | 'dashboard.weeklyScore'
  | 'dashboard.upcoming'
  | 'dashboard.quickActions'
  | 'dashboard.cycleDay'
  | 'dashboard.nextPeriod'
  | 'dashboard.patternLevel'
  | 'dashboard.welcome'
  | 'dashboard.weeklyInsight'
  | 'dashboard.regionalTip'
  | 'dashboard.quickLog'
  | 'dashboard.analyzing'
  | 'dashboard.overall'
  | 'dashboard.basedOnLogs'
  | 'dashboard.doctorReportBtn'
  | 'dashboard.latestSymptoms'
  | 'dashboard.noSymptomsYet'
  | 'dashboard.lastQuiz'
  | 'dashboard.notTakenYet'
  | 'dashboard.takeQuiz'
  | 'dashboard.logPeriodUnlock'
  | 'dashboard.logPeriod'
  | 'dashboard.predict'
  | 'dashboard.confidence'
  | 'dashboard.there'
  | 'dashboard.lastAssessed'
  | 'checkin.mood'
  | 'checkin.sleep'
  | 'checkin.energy'
  | 'checkin.symptoms'
  | 'checkin.water'
  | 'checkin.stress'
  | 'checkin.tapToLog'
  | 'checkin.todayProgress'
  | 'checkin.moodSaved'
  | 'checkin.sleepSaved'
  | 'checkin.energySaved'
  | 'checkin.stressSaved'
  | 'checkin.symptomsUpdated'
  | 'checkin.waterSaved'
  | 'checkin.selected'
  | 'checkin.glasses'
  | 'checkin.logged'
  | 'quickAction.logPeriod'
  | 'quickAction.takeQuiz'
  | 'quickAction.talkSakhi'
  | 'quickAction.generateReport'
  | 'care.title'
  | 'care.subtitle'
  | 'care.recommendedNext'
  | 'care.doctorPrep'
  | 'care.journey'
  | 'care.clinicFinder'
  | 'care.library'
  | 'care.browseArticles'
  | 'reports.title'
  | 'reports.subtitle'
  | 'reports.generate'
  | 'reports.downloadPdf'
  | 'reports.clinicalReport'
  | 'reports.preparedFor'
  | 'reports.healthSummary'
  | 'reports.profileSummary'
  | 'reports.cycleAnalysis'
  | 'reports.sleepAnalysis'
  | 'reports.moodAnalysis'
  | 'reports.androgenAnalysis'
  | 'reports.symptomHistory'
  | 'reports.riskPatterns'
  | 'reports.questionsForDoctor'
  | 'reports.recommendedTests'
  | 'reports.timeline'
  | 'reports.charts'
  | 'reports.disclaimer'
  | 'reports.noReports'
  | 'reports.generating'
  | 'reports.preparingDesc'
  | 'reports.professionalReport'
  | 'reports.coverageHint'
  | 'reports.periodLabel'
  | 'reports.yourReports'
  | 'reports.selectPreview'
  | 'reports.deleteTitle'
  | 'reports.deleteDesc'
  | 'reports.deleteConfirm'
  | 'reports.deleteCancel'
  | 'reports.step.gathering'
  | 'reports.step.analyzing'
  | 'reports.step.androgen'
  | 'reports.step.formatting'
  | 'reports.loadFailed'
  | 'reports.patient'
  | 'reports.generated'
  | 'reports.regenerateHint'
  | 'reports.footerNote'
  | 'reports.coverSubtitle'
  | 'reports.doctorVisitReport'
  | 'reports.reportingPeriod'
  | 'reports.confidential'
  | 'reports.pdfFooter'
  | 'chat.title'
  | 'chat.subtitle'
  | 'chat.placeholder'
  | 'chat.mythMode'
  | 'chat.send'
  | 'chat.emptyTitle'
  | 'chat.emptyDesc'
  | 'chat.mythPlaceholder'
  | 'chat.modeChat'
  | 'chat.modeMyth'
  | 'chat.dismiss'
  | 'chat.supportiveOnly'
  | 'chat.footerDisclaimer'
  | 'chat.checkingClaim'
  | 'chat.greetingWithName'
  | 'chat.greetingDefault'
  | 'chat.mythEmptyTitle'
  | 'chat.mythEmptyDesc'
  | 'chat.offline'
  | 'chat.offlineRetry'
  | 'chat.contextHint'
  | 'dashboard.nextSteps'
  | 'dashboard.nextStepTrack'
  | 'dashboard.nextStepChat'
  | 'dashboard.nextStepReport'
  | 'common.offlineCached'
  | 'reports.statusDraft'
  | 'reports.statusShared'
  | 'tracker.title'
  | 'tracker.subtitle'
  | 'androgen.title'
  | 'androgen.subtitle'
  | 'error.loadFailed'
  | 'error.saveFailed'
  | 'error.network'
  | 'error.notFound'
  | 'error.tryAgain'
  | 'error.generic'
  | 'error.reportIncomplete'
  | 'insights.streak'
  | 'insights.luteal'
  | 'insights.sleepLow'
  | 'insights.sleepGood'
  | 'insights.goal'
  | 'insights.default'
  | 'insight.sleepBeforePeriod'
  | 'insight.fatigueLongCycle'
  | 'insight.moodImproved'
  | 'insight.moodChallenging'
  | 'insight.darkPatchesFatigue'
  | 'insight.keepLogging'
  | 'insight.hairCyclesUp'
  | 'insight.jawlineLongCycle'
  | 'insight.category.cycle'
  | 'insight.category.sleep'
  | 'insight.category.mood'
  | 'insight.category.energy'
  | 'insight.category.androgen'
  | 'education.regionalFoods'
  | 'clinic.selectCity'
  | 'clinic.regionHint'
  | 'clinic.findNearYou'
  | 'clinic.useMyLocation'
  | 'personalization.simpleOn'
  | 'personalization.simpleOff'
  | 'disclaimer.medical'
  | 'common.there'
  | 'common.dismiss'
  | 'common.skipToContent'
  | 'nav.more.reports'
  | 'nav.more.reportsDesc'
  | 'nav.more.androgenDesc'
  | 'nav.more.settingsDesc'
  | 'chat.modeChat'
  | 'chat.modeMyth'
  | 'chat.dismiss'
  | 'chat.supportiveOnly'
  | 'chat.footerDisclaimer'
  | 'chat.checkingClaim'
  | 'chat.greetingWithName'
  | 'chat.greetingDefault'
  | 'chat.mythEmptyTitle'
  | 'chat.mythEmptyDesc'
  | 'dashboard.analyzing'
  | 'dashboard.overall'
  | 'dashboard.basedOnLogs'
  | 'dashboard.doctorReportBtn'
  | 'dashboard.latestSymptoms'
  | 'dashboard.noSymptomsYet'
  | 'dashboard.lastQuiz'
  | 'dashboard.notTakenYet'
  | 'dashboard.takeQuiz'
  | 'dashboard.logPeriodUnlock'
  | 'dashboard.logPeriod'
  | 'dashboard.predict'
  | 'dashboard.confidence'
  | 'dashboard.there'
  | 'dashboard.lastAssessed'
  | 'checkin.mood'
  | 'checkin.sleep'
  | 'checkin.energy'
  | 'checkin.symptoms'
  | 'checkin.water'
  | 'checkin.stress'
  | 'checkin.tapToLog'
  | 'checkin.todayProgress'
  | 'checkin.moodSaved'
  | 'checkin.sleepSaved'
  | 'checkin.energySaved'
  | 'checkin.stressSaved'
  | 'checkin.symptomsUpdated'
  | 'checkin.waterSaved'
  | 'checkin.selected'
  | 'checkin.glasses'
  | 'checkin.logged'
  | 'quickAction.logPeriod'
  | 'quickAction.takeQuiz'
  | 'quickAction.talkSakhi'
  | 'quickAction.generateReport'
  | 'reports.professionalReport'
  | 'reports.coverageHint'
  | 'reports.periodLabel'
  | 'reports.yourReports'
  | 'reports.selectPreview'
  | 'reports.deleteTitle'
  | 'reports.deleteDesc'
  | 'reports.deleteConfirm'
  | 'reports.deleteCancel'
  | 'reports.step.gathering'
  | 'reports.step.analyzing'
  | 'reports.step.androgen'
  | 'reports.step.formatting'
  | 'reports.loadFailed'
  | 'reports.patient'
  | 'reports.generated'
  | 'reports.regenerateHint'
  | 'reports.footerNote'
  | 'reports.coverSubtitle'
  | 'reports.doctorVisitReport'
  | 'reports.reportingPeriod'
  | 'reports.confidential'
  | 'reports.pdfFooter'
  | 'reports.hospitalPdf'
  | 'reports.hospitalPdfDesc'
  | 'androgen.aiInsights'
  | 'androgen.insightDisclaimer';

export type TranslationBundle = Record<TranslationKey, string>;

export const EN_BUNDLE: TranslationBundle = {
  'nav.home': 'Today',
  'nav.tracker': 'Track',
  'nav.care': 'Journey',
  'nav.chat': 'Sakhi',
  'nav.reports': 'Reports',
  'nav.settings': 'Settings',
  'nav.more': 'More',
  'nav.androgen': 'Androgen',
  'nav.more.reports': 'Doctor reports',
  'nav.more.reportsDesc': 'AI visit summaries & PDF',
  'nav.more.androgenDesc': 'Cycle-linked symptom analytics',
  'nav.more.settingsDesc': 'Profile & preferences',
  'common.loading': 'Loading…',
  'common.error': 'Something went wrong',
  'common.retry': 'Retry',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.back': 'Back',
  'common.continue': 'Continue',
  'common.done': 'Done',
  'common.today': 'Today',
  'common.generate': 'Generate',
  'common.download': 'Download',
  'common.share': 'Share',
  'common.copy': 'Copy',
  'common.copied': 'Copied!',
  'common.delete': 'Delete',
  'common.close': 'Close',
  'common.openMaps': 'Open in Maps',
  'common.useLocation': 'Use my location',
  'common.there': 'there',
  'common.dismiss': 'Dismiss',
  'common.skipToContent': 'Skip to content',
  'settings.title': 'Settings',
  'settings.subtitle': 'Manage your account & preferences',
  'settings.language': 'Language',
  'settings.languageDesc': 'Changes apply instantly across Cyra and Sakhi',
  'settings.languageChanged': 'Language updated',
  'settings.simpleLanguage': 'Simple language mode',
  'settings.simpleLanguageDesc': 'Replace medical terms with plain, everyday language',
  'settings.region': 'Region',
  'settings.regionDesc': 'Personalizes food examples, tips, and clinic suggestions',
  'settings.appearance': 'Appearance',
  'settings.cyclePrefs': 'Cycle preferences',
  'settings.cycleLength': 'Cycle length',
  'settings.periodLength': 'Period length',
  'settings.save': 'Save changes',
  'settings.saved': 'Saved',
  'settings.healthTools': 'Health tools',
  'settings.privacy': 'Privacy & security',
  'settings.signOut': 'Sign out',
  'page.dashboard': 'Home',
  'page.tracker': 'Tracker',
  'page.care': 'Care',
  'page.chat': 'Sakhi',
  'page.reports': 'Doctor Report',
  'page.settings': 'Settings',
  'page.androgen': 'Androgen Intelligence',
  'dashboard.greeting.morning': 'Good morning',
  'dashboard.greeting.afternoon': 'Good afternoon',
  'dashboard.greeting.evening': 'Good evening',
  'dashboard.snapshot': 'Daily snapshot',
  'dashboard.healthSummary': 'Health summary',
  'dashboard.dailyCheckIn': 'Daily check-in',
  'dashboard.smartInsights': 'Smart insights',
  'dashboard.weeklyScore': 'Weekly health score',
  'dashboard.upcoming': 'Upcoming',
  'dashboard.quickActions': 'Quick actions',
  'dashboard.cycleDay': 'Cycle day',
  'dashboard.nextPeriod': 'Next period',
  'dashboard.patternLevel': 'Pattern level',
  'dashboard.welcome': 'Welcome back',
  'dashboard.weeklyInsight': 'Weekly insight',
  'dashboard.regionalTip': 'Tip for your region',
  'dashboard.quickLog': 'Quick log',
  'dashboard.analyzing': 'Analyzing your patterns…',
  'dashboard.overall': 'Overall',
  'dashboard.basedOnLogs': 'Based on your last 2 weeks of logs',
  'dashboard.doctorReportBtn': 'Doctor report',
  'dashboard.latestSymptoms': 'Latest symptoms',
  'dashboard.noSymptomsYet': 'No symptom trends yet — log in today\'s check-in below.',
  'dashboard.lastQuiz': 'Last quiz',
  'dashboard.notTakenYet': 'Not taken yet',
  'dashboard.takeQuiz': 'Take quiz',
  'dashboard.logPeriodUnlock': 'Log your last period to unlock predictions',
  'dashboard.logPeriod': 'Log period',
  'dashboard.predict': 'Predict',
  'dashboard.confidence': '{percent}% conf.',
  'dashboard.there': 'there',
  'dashboard.lastAssessed': 'Last assessed {date}',
  'checkin.mood': 'Mood',
  'checkin.sleep': 'Sleep',
  'checkin.energy': 'Energy',
  'checkin.symptoms': 'Symptoms',
  'checkin.water': 'Water',
  'checkin.stress': 'Stress',
  'checkin.tapToLog': 'Tap to log',
  'checkin.todayProgress': '{done}/{total} today',
  'checkin.moodSaved': 'Mood saved',
  'checkin.sleepSaved': 'Sleep saved',
  'checkin.energySaved': 'Energy saved',
  'checkin.stressSaved': 'Stress level saved',
  'checkin.symptomsUpdated': 'Symptoms updated',
  'checkin.waterSaved': 'Water intake saved',
  'checkin.selected': '{count} selected',
  'checkin.glasses': '{count} glasses',
  'checkin.logged': 'Logged',
  'quickAction.logPeriod': 'Log period',
  'quickAction.takeQuiz': 'Take quiz',
  'quickAction.talkSakhi': 'Talk to Sakhi',
  'quickAction.generateReport': 'Generate report',
  'care.title': 'My Health Journey',
  'care.subtitle': 'Guided steps for understanding your body, preparing for care, and building confidence.',
  'care.recommendedNext': 'Recommended next step',
  'care.doctorPrep': 'Doctor preparation toolkit',
  'care.journey': 'Diagnosis journey',
  'care.clinicFinder': 'Clinic finder',
  'care.library': 'Knowledge library',
  'care.browseArticles': 'Browse all articles',
  'reports.title': 'Clinical Health Report',
  'reports.subtitle': 'Hospital-ready summary from your Cyra tracking data',
  'reports.generate': 'Generate report',
  'reports.downloadPdf': 'Download PDF',
  'reports.clinicalReport': 'Cyra Clinical Report',
  'reports.preparedFor': 'Prepared for healthcare provider review',
  'reports.healthSummary': 'Health summary',
  'reports.profileSummary': 'Profile summary',
  'reports.cycleAnalysis': 'Cycle analysis',
  'reports.sleepAnalysis': 'Sleep analysis',
  'reports.moodAnalysis': 'Mood analysis',
  'reports.androgenAnalysis': 'Androgen analysis',
  'reports.symptomHistory': 'Symptom history',
  'reports.riskPatterns': 'Risk pattern summary',
  'reports.questionsForDoctor': 'Questions for doctor',
  'reports.recommendedTests': 'Recommended tests',
  'reports.timeline': 'Timeline visualization',
  'reports.charts': 'Trend charts',
  'reports.disclaimer': 'This report is generated from self-reported data. It supports clinical conversations and is not a diagnosis. Seek immediate care for severe symptoms.',
  'reports.noReports': 'No clinical reports yet',
  'reports.generating': 'Preparing your health summary…',
  'reports.preparingDesc': 'Reviewing your logs, patterns, and cycle data',
  'reports.professionalReport': 'Professional doctor report',
  'reports.coverageHint': 'Profile · Cycle · Sleep · Mood · Androgen · Timeline · Charts · PDF export',
  'reports.periodLabel': 'Period:',
  'reports.yourReports': 'Your reports',
  'reports.selectPreview': 'Select a report to preview',
  'reports.deleteTitle': 'Delete this report?',
  'reports.deleteDesc': 'Your tracked data stays safe — only this generated report will be removed.',
  'reports.deleteConfirm': 'Delete report',
  'reports.deleteCancel': 'Keep report',
  'reports.step.gathering': 'Gathering health logs',
  'reports.step.analyzing': 'Analyzing cycle, sleep & mood',
  'reports.step.androgen': 'Building androgen & symptom history',
  'reports.step.formatting': 'Formatting clinical report',
  'reports.loadFailed': 'Could not load reports',
  'reports.statusDraft': 'Draft',
  'reports.statusShared': 'Shared with doctor',
  'reports.patient': 'Patient',
  'reports.generated': 'Generated',
  'reports.regenerateHint': 'Report data could not be loaded. Try regenerating.',
  'reports.footerNote': 'Cyra clinical reports are educational summaries — not a diagnosis. Always consult a qualified healthcare provider.',
  'reports.coverSubtitle': 'Clinical Health Summary',
  'reports.doctorVisitReport': 'Doctor Visit Report',
  'reports.reportingPeriod': 'Reporting period:',
  'reports.confidential': 'CONFIDENTIAL — PATIENT HEALTH INFORMATION',
  'reports.pdfFooter': 'Cyra Health Report — For clinical discussion only. Not a medical diagnosis.',
  'chat.title': 'Sakhi',
  'chat.subtitle': 'Ask in any language — I\'ll reply in yours.',
  'chat.placeholder': 'Message Sakhi',
  'chat.mythMode': 'Myth check',
  'chat.send': 'Send',
  'chat.emptyTitle': 'Start a conversation',
  'chat.emptyDesc': 'Your supportive companion for PCOS and menstrual health. I use your logs to give personalized guidance.',
  'chat.mythPlaceholder': 'Paste a health claim to fact-check',
  'chat.modeChat': 'Chat',
  'chat.modeMyth': 'Myth detector',
  'chat.dismiss': 'Dismiss',
  'chat.supportiveOnly': 'Supportive guidance only',
  'chat.footerDisclaimer': 'Sakhi never diagnoses or tells you to stop medication. For medical decisions, consult your clinician.',
  'chat.checkingClaim': 'Checking this claim…',
  'chat.greetingWithName': 'Namaste, {name} — I\'m Sakhi',
  'chat.greetingDefault': 'Namaste, I\'m Sakhi',
  'chat.mythEmptyTitle': 'Myth detector',
  'chat.mythEmptyDesc': 'Paste a WhatsApp forward or social media health tip. I\'ll help you understand what\'s accurate — without diagnosing.',
  'chat.offline': 'Sakhi is temporarily unavailable. Check your connection and try again.',
  'chat.offlineRetry': 'Retry',
  'chat.contextHint': 'Ask me anything about your cycle, symptoms, or wellbeing.',
  'dashboard.nextSteps': 'Get started with Cyra',
  'dashboard.nextStepTrack': 'Log your period or daily check-in',
  'dashboard.nextStepChat': 'Ask Sakhi a health question',
  'dashboard.nextStepReport': 'Generate a doctor visit summary',
  'common.offlineCached': 'Offline — showing saved data',
  'tracker.title': 'Track',
  'tracker.subtitle': 'Visual trends and patterns — understand your data in seconds',
  'androgen.title': 'Androgen Intelligence Center',
  'androgen.subtitle': 'Cycle-correlated analytics across hair, skin, and scalp',
  'error.loadFailed': 'Could not load data',
  'error.saveFailed': 'Could not save — please try again',
  'error.network': 'Network error — check your connection',
  'error.notFound': 'Not found',
  'error.tryAgain': 'Please try again',
  'error.generic': 'Something went wrong. Please try again.',
  'error.reportIncomplete': 'Report data is incomplete — regenerate and try again',
  'insights.streak': "You've logged {days} days in a row — that consistency makes your insights sharper.",
  'insights.luteal': "You're in your {phase} phase (day {day}). Many people notice shifts in energy and mood now.",
  'insights.sleepLow': 'Your average sleep is {hours}h. Even 30 minutes more can ease cycle-related fatigue.',
  'insights.sleepGood': 'Your average sleep is {hours}h. Solid rest supports hormonal balance and mood.',
  'insights.goal': 'Based on your goal to "{goal}", try a quick log today.',
  'insights.default': 'A two-minute check-in today helps Cyra personalize your cycle insights.',
  'insight.sleepBeforePeriod': 'Your sleep tends to drop before your cycle starts — log nightly this week to confirm.',
  'insight.fatigueLongCycle': 'Fatigue appears most often during longer cycles — energy dips may align with extended luteal phases.',
  'insight.moodImproved': 'Your mood has improved compared with last month — keep noting what supports you.',
  'insight.moodChallenging': 'Mood has been more challenging this month — sleep and cycle phase may be contributing.',
  'insight.darkPatchesFatigue': 'Dark patches and fatigue often occur together in your logs.',
  'insight.keepLogging': 'Log mood and sleep for a few more days — Cyra will surface personalized insights.',
  'insight.hairCyclesUp': 'Hair fall has increased during the last two cycles — note stress, sleep, and nutrition alongside your logs.',
  'insight.jawlineLongCycle': 'Jawline acne appears repeatedly before longer cycles — a pattern often linked to hormonal shifts.',
  'insight.category.cycle': 'Cycle',
  'insight.category.sleep': 'Sleep',
  'insight.category.mood': 'Mood',
  'insight.category.energy': 'Energy',
  'insight.category.androgen': 'Androgen',
  'education.regionalFoods': 'In your region, people often eat {foods}. Notice how meals affect your energy.',
  'clinic.selectCity': 'Select city',
  'clinic.regionHint': 'Showing clinics near your region — verify before visiting.',
  'clinic.findNearYou': 'Find care near you',
  'clinic.useMyLocation': 'Use my location',
  'personalization.simpleOn': 'Simple language on',
  'personalization.simpleOff': 'Medical terms shown',
  'disclaimer.medical': 'For education only — not medical advice. Discuss with a qualified clinician.',
  'reports.hospitalPdf': 'Hospital-ready PDF',
  'reports.hospitalPdfDesc': 'Includes all sections, charts & disclaimer',
  'androgen.aiInsights': 'AI pattern analysis',
  'androgen.insightDisclaimer': 'Pattern detection for awareness — not diagnostic. Share findings with your clinician.',
};
