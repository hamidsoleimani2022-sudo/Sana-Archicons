import { z } from "zod";

/**
 * Validatieschema voor het adviesaanvraag-formulier.
 * Foutteksten zijn message-codes; de UI vertaalt ze via next-intl
 * (namespace Consult.errors) zodat NL en EN allebei kloppen.
 * Waarden van keuzevelden zijn taalneutrale codes.
 */

export const SERVICE_OPTIONS = [
  "bouwkundig-advies",
  "energieadvies",
  "ai-consultancy",
  "procesautomatisering",
  "anders",
] as const;

export const TIME_OPTIONS = ["morning", "afternoon", "evening"] as const;

// Telefoonnummer: cijfers, +, spaties, haakjes en streepjes
const phoneRegex = /^[0-9+\-\s()]{8,20}$/;

export const leadSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, { message: "name_min" })
    .max(80, { message: "name_max" }),

  phone: z
    .string()
    .trim()
    .min(1, { message: "phone_required" })
    .regex(phoneRegex, { message: "phone_invalid" }),

  email: z
    .string()
    .trim()
    .email({ message: "email_invalid" })
    .max(120)
    .optional()
    .or(z.literal("")),

  business_name: z.string().trim().max(120).optional().or(z.literal("")),

  service: z.enum(SERVICE_OPTIONS, {
    errorMap: () => ({ message: "service_required" }),
  }),

  message: z
    .string()
    .trim()
    .min(10, { message: "message_min" })
    .max(1500, { message: "message_max" }),

  preferred_time: z.enum(TIME_OPTIONS).optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;

export type LeadFieldErrors = Partial<Record<keyof LeadInput, string>>;

export type SubmitResult =
  | { ok: true }
  | { ok: false; fieldErrors?: LeadFieldErrors; formError?: string };
