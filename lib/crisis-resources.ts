/**
 * Verified Crisis & Support Resources for India.
 * Surface only where contextually appropriate (e.g. self-harm, accidental poisoning, or distress).
 */

export interface CrisisResource {
  name: string;
  category: "poison" | "mental_health" | "emergency";
  phone: string;
  hours: string;
  description: string;
  website?: string;
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: "National Poison Information Centre (AIIMS New Delhi)",
    category: "poison",
    phone: "1800-116-117",
    hours: "24/7 (Toll Free)",
    description: "Emergency medical advice for accidental poisonings, overdoses, and drug toxicities.",
    website: "https://www.aiims.edu",
  },
  {
    name: "Tele-MANAS (Govt. of India Mental Health Helpline)",
    category: "mental_health",
    phone: "14416",
    hours: "24/7 (Toll Free)",
    description: "Free, confidential psychological support and crisis counseling in multiple Indian languages.",
  },
  {
    name: "Vandrevala Foundation Helpline",
    category: "mental_health",
    phone: "+91-9999-666-555",
    hours: "24/7",
    description: "Free mental health support, emotional counseling, and crisis intervention.",
    website: "https://www.vandrevalafoundation.com",
  },
  {
    name: "KIRAN Helpline (Dept. of Empowerment of Persons with Disabilities)",
    category: "mental_health",
    phone: "1800-599-0019",
    hours: "24/7 (Toll Free)",
    description: "Mental health rehabilitation and crisis support helpline operated by the Government of India.",
  },
];
