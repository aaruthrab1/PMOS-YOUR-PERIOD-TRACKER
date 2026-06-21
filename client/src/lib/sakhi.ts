import { api } from '@/api/client';
import type {
  SakhiLanguage,
  SakhiStreamEvent,
  MythCheckResult,
  ApiChatOptions,
} from '@/api/chat';

export type { SakhiLanguage, SakhiStreamEvent, MythCheckResult };

export interface SakhiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  streaming?: boolean;
  mythResult?: MythCheckResult;
  isMythCheck?: boolean;
}

export interface SakhiConversation {
  id: string;
  title: string;
  updatedAt: string;
  preferredLanguage?: SakhiLanguage;
}

export interface StreamSakhiOptions extends ApiChatOptions {}

export async function streamSakhiChat(options: StreamSakhiOptions): Promise<void> {
  return api.chat(options);
}

export async function checkSakhiMyth(
  text: string,
  token: string,
  language?: SakhiLanguage,
): Promise<{ language: SakhiLanguage; result: MythCheckResult }> {
  return api.chat.mythCheck(text, token, language);
}

export async function fetchSakhiConversations(token: string): Promise<SakhiConversation[]> {
  return api.chat.listConversations(token);
}

export async function fetchSakhiMessages(
  conversationId: string,
  token: string,
): Promise<SakhiMessage[]> {
  const rows = await api.chat.fetchMessages(conversationId, token);
  return rows.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    created_at: m.created_at,
  }));
}

export async function createSakhiConversation(token: string): Promise<{ id: string }> {
  return api.chat.createConversation(token);
}

/** Quick action prompts shown in chat */
export const SAKHI_QUICK_ACTIONS = [
  'What is PMOS?',
  'Can I get pregnant?',
  'What tests should I ask about?',
  'Is my cycle normal?',
  'Why am I tired?',
  'Why am I losing hair?',
] as const;

export const SAKHI_STARTER_PROMPTS: Record<SakhiLanguage, string[]> = {
  English: [...SAKHI_QUICK_ACTIONS],
  Hindi: [
    'PMOS kya hai?',
    'Kya main pregnant ho sakti hoon?',
    'Doctor se kaun se tests poochun?',
    'Kya mera cycle normal hai?',
    'Mujhe thakaan kyun mehsoos hoti hai?',
    'Baal jhadne ka kya reason ho sakta hai?',
  ],
  Tamil: [
    'PMOS என்றால் என்ன?',
    'நான் கர்ப்பம் அடைய முடியுமா?',
    'Doctor-கிட்ட என்ன tests கேட்கலாம்?',
    'என் cycle normal-aa?',
    'ஏன் tired-aa feel பண்றேன்?',
    'முடி கொட்டறது ஏன்?',
  ],
  Telugu: [
    'PMOS అంటే ఏమిటి?',
    'నేను గర్భం దాల్చగలనా?',
    'Doctor ని ఏ tests అడగాలి?',
    'నా cycle normal-aa?',
    'నాకు tiredness ఎందుకు?',
    'జుట్టు రాలడం ఎందుకు?',
  ],
  Kannada: [
    'PMOS ಎಂದರೇನು?',
    'ನಾನು ಗರ್ಭಿಣಿಯಾಗಬಹುದೇ?',
    'Doctor ಬಳಿ ಯಾವ tests ಕೇಳಬೇಕು?',
    'ನನ್ನ cycle normal-aa?',
    'ನನಗೆ tiredness ಏಕೆ?',
    'ಕೂದಲು ಏಕೆ ಬೀಳುತ್ತದೆ?',
  ],
  Malayalam: [
    'PMOS എന്താണ്?',
    'എനിക്ക് ഗർഭം ഉണ്ടാകുമോ?',
    'Doctor-നോട് ഏത് tests ചോദിക്കണം?',
    'എന്റെ cycle normal-aa?',
    'എനിക്ക് tiredness എന്തുകൊണ്ട്?',
    'മുടി വീഴുന്നത് എന്തുകൊണ്ട്?',
  ],
  Bengali: [
    'PMOS কী?',
    'আমি কি গর্ভবতী হতে পারি?',
    'ডাক্তারকে কোন tests জিজ্ঞাসা করব?',
    'আমার cycle normal কি?',
    'আমার ক্লান্তি কেন?',
    'চুল পড়া কেন?',
  ],
  Marathi: [
    'PMOS म्हणजे काय?',
    'मी गर्भवती होऊ शकते का?',
    'Doctor ला कोणते tests विचारावे?',
    'माझा cycle normal आहे का?',
    'मला थकवा का येतो?',
    'केस गळण्याचे कारण?',
  ],
  Gujarati: [
    'PMOS શું છે?',
    'શું હું ગર્ભવતી થઈ શકું?',
    'Doctor ને કયા tests પૂછવા?',
    'મારો cycle normal છે?',
    'મને thakav કેમ લાગે છે?',
    'વાળ ખરવા શા માટે?',
  ],
  Punjabi: [
    'PMOS kya hai?',
    'Kya main pregnant ho sakdi haan?',
    'Doctor ton kinne tests puchhan?',
    'Mera cycle normal hai?',
    'Mujhe thakaan kyun lagdi hai?',
    'Baal kyun jhadde ne?',
  ],
};

export const LANGUAGE_LABELS: Record<SakhiLanguage, string> = {
  English: 'English',
  Hindi: 'हिन्दी',
  Tamil: 'தமிழ்',
  Telugu: 'తెలుగు',
  Kannada: 'ಕನ್ನಡ',
  Malayalam: 'മലയാളം',
  Bengali: 'বাংলা',
  Marathi: 'मराठी',
  Gujarati: 'ગુજરાતી',
  Punjabi: 'ਪੰਜਾਬੀ',
};
