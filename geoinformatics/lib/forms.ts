import { z } from 'zod';

/** Shared by the contact/advertise forms and the API, so client and server validate identically. */
export const contactTopics = {
  editorial: 'Editorial enquiry',
  'news-tip': 'News tip',
  'press-release': 'Press release',
  event: 'Submit an event',
  advertising: 'Advertising',
  other: 'Something else',
} as const;

export type ContactTopic = keyof typeof contactTopics;

export const contactSchema = z.object({
  topic: z.enum(Object.keys(contactTopics) as [ContactTopic, ...ContactTopic[]]),
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(254),
  organization: z.string().trim().max(160).optional().default(''),
  message: z.string().trim().min(10, 'Please write a short message (at least 10 characters).').max(5000),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please accept the privacy policy.' }) }),
  token: z.string().max(200),
  website: z.string().max(0).optional().default(''),
});

export const advertiseSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid work email address.').max(254),
  company: z.string().trim().min(2, 'Please enter your company.').max(160),
  role: z.string().trim().max(120).optional().default(''),
  interests: z.array(z.string().max(60)).max(20).default([]),
  budget: z.enum(['', 'under-5k', '5k-15k', '15k-50k', '50k-plus', 'unsure']).default(''),
  timing: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().max(5000).optional().default(''),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please accept the privacy policy.' }) }),
  token: z.string().max(200),
  website: z.string().max(0).optional().default(''),
});

export const budgetLabels: Record<string, string> = {
  '': 'Not specified',
  'under-5k': 'Under €5,000',
  '5k-15k': '€5,000 – €15,000',
  '15k-50k': '€15,000 – €50,000',
  '50k-plus': '€50,000+',
  unsure: 'Not sure yet',
};
