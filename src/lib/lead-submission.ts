import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PROJECT_INTAKES_TABLE } from "@/constants/tables";
import type { Database } from "@/integrations/supabase/types";

type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
type IntakeInsert = Database["public"]["Tables"]["project_intakes"]["Insert"];

type LeadType = "quote" | "checkup" | "contact" | "ai_intake";

type LeadPayloadMap = {
  quote: {
    name: string;
    email: string;
    pageCount: number;
    contentShaping: boolean;
    rushDelivery: boolean;
    estimatedPriceCents: number;
    notes?: string;
  };
  checkup: {
    name: string;
    email: string;
    website_url: string;
    wish: string;
  };
  contact: {
    name: string;
    email: string;
    projectDescription: string;
    websiteUrl?: string;
    wish: string;
  };
  ai_intake: {
    name: string;
    email: string;
    business_name?: string | null;
    website_url?: string | null;
    business_description?: string | null;
    project_description?: string | null;
    goals?: string | null;
    pages_estimate?: number | null;
    content_readiness?: string | null;
    timeline?: string | null;
    budget_range?: string | null;
    design_examples?: string | null;
    inspiration_sites?: string | null;
    color_preferences?: string | null;
    special_needs?: string | null;
    tech_comfort?: string | null;
    fit_status?: "good" | "borderline" | "not_fit" | string;
    suggested_tier?: "500" | "1000" | "1500" | string | null;
    raw_summary?: string | null;
    raw_conversation?: IntakeInsert["raw_conversation"];
    lovable_build_prompt?: string | null;
    vibe?: string | null;
    discount_offered?: boolean;
    discount_amount?: number;
  };
};

export type AiIntakePayload = LeadPayloadMap["ai_intake"];

interface SubmitLeadOptions<T extends LeadType> {
  type: T;
  payload: LeadPayloadMap[T];
}

const NOTIFICATION_FUNCTIONS: Record<LeadType, string> = {
  quote: "send-lead-notification",
  checkup: "send-lead-notification",
  contact: "send-lead-notification",
  ai_intake: "send-intake-notification",
};

const buildLeadInsert = (type: LeadType, payload: LeadPayloadMap[LeadType]): LeadInsert => {
  if (type === "quote") {
    const quotePayload = payload as LeadPayloadMap["quote"];
    return {
      name: quotePayload.name.trim(),
      email: quotePayload.email.trim(),
      source: "quote",
      page_count: quotePayload.pageCount,
      content_shaping: quotePayload.contentShaping,
      rush: quotePayload.rushDelivery,
      estimated_price: quotePayload.estimatedPriceCents,
      project_notes: quotePayload.notes?.trim() || null,
      status: "new",
    };
  }

  if (type === "checkup") {
    const checkupPayload = payload as LeadPayloadMap["checkup"];
    return {
      name: checkupPayload.name.trim(),
      email: checkupPayload.email.trim(),
      source: "checkup",
      website_url: checkupPayload.website_url.trim(),
      wish: checkupPayload.wish,
      estimated_price: 5000,
      status: "new",
    };
  }

  if (type === "contact") {
    const contactPayload = payload as LeadPayloadMap["contact"];
    return {
      name: contactPayload.name.trim(),
      email: contactPayload.email.trim(),
      source: "contact",
      business_description: contactPayload.projectDescription,
      website_url: contactPayload.websiteUrl?.trim() || null,
      wish: contactPayload.wish,
      status: "new",
    };
  }

  const intakePayload = payload as LeadPayloadMap["ai_intake"];
  const basePrice =
    intakePayload.suggested_tier === "500"
      ? 50000
      : intakePayload.suggested_tier === "1500"
        ? 150000
        : 100000;
  const discountDollars = intakePayload.discount_amount || 0;
  const estimatedPrice = Math.max(basePrice - discountDollars * 100, 0);

  return {
    name: intakePayload.name.trim(),
    email: intakePayload.email.trim(),
    source: "ai_intake",
    business_name: intakePayload.business_name || null,
    business_description: intakePayload.project_description || intakePayload.business_description || null,
    website_url: intakePayload.website_url || null,
    goals: intakePayload.goals || null,
    page_count: intakePayload.pages_estimate || null,
    content_readiness: intakePayload.content_readiness || null,
    timeline: intakePayload.timeline || null,
    budget_range: intakePayload.budget_range || null,
    special_needs: intakePayload.special_needs || null,
    tech_comfort: intakePayload.tech_comfort || null,
    fit_status: (intakePayload.fit_status as LeadInsert["fit_status"]) || "good",
    suggested_tier: intakePayload.suggested_tier as LeadInsert["suggested_tier"],
    raw_summary: intakePayload.raw_summary || null,
    raw_conversation: intakePayload.raw_conversation || null,
    design_prompt: intakePayload.lovable_build_prompt || null,
    vibe_description: intakePayload.vibe || null,
    inspiration_sites: intakePayload.inspiration_sites || null,
    color_preferences: intakePayload.color_preferences || null,
    discount_offered: Boolean(intakePayload.discount_offered),
    discount_amount: discountDollars,
    estimated_price: estimatedPrice,
    status: "new",
  };
};

const buildIntakeInsert = (payload: LeadPayloadMap["ai_intake"]): IntakeInsert => ({
  name: payload.name.trim(),
  email: payload.email.trim(),
  source: "ai_intake",
  business_name: payload.business_name || null,
  project_description: payload.project_description || payload.business_description || null,
  goals: payload.goals || null,
  pages_estimate: payload.pages_estimate || null,
  content_readiness: payload.content_readiness || null,
  timeline: payload.timeline || null,
  budget_range: payload.budget_range || null,
  design_examples: payload.design_examples || null,
  special_needs: payload.special_needs || null,
  tech_comfort: payload.tech_comfort || null,
  fit_status: (payload.fit_status as IntakeInsert["fit_status"]) || "good",
  suggested_tier: payload.suggested_tier as IntakeInsert["suggested_tier"],
  raw_summary: payload.raw_summary || null,
  raw_conversation: (payload.raw_conversation || null) as IntakeInsert["raw_conversation"],
  lovable_build_prompt: payload.lovable_build_prompt || null,
  kanban_stage: "new",
  discount_offered: Boolean(payload.discount_offered),
  discount_amount: payload.discount_amount ?? 0,
});

export async function submitLead<T extends LeadType>({
  type,
  payload,
}: SubmitLeadOptions<T>) {
  try {
    console.log("=== LEAD SUBMISSION START ===");
    console.log("Type:", type);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    const leadInsert = buildLeadInsert(type, payload);
    console.log("Lead insert object:", JSON.stringify(leadInsert, null, 2));
    
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert(leadInsert)
      .select()
      .single();

    if (leadError) {
      console.error("Lead insert failed:", leadError);
      throw leadError;
    }
    
    console.log("Lead inserted successfully:", lead);

    let intake = null;
    if (type === "ai_intake") {
      console.log("Creating project intake...");
      const intakeInsert = buildIntakeInsert(payload as LeadPayloadMap["ai_intake"]);
      console.log("Intake insert object:", JSON.stringify(intakeInsert, null, 2));
      
      const { data: intakeData, error: intakeError } = await supabase
        .from(PROJECT_INTAKES_TABLE)
        .insert(intakeInsert)
        .select()
        .single();

      if (intakeError) {
        console.error("Intake insert failed:", intakeError);
        throw intakeError;
      }
      
      console.log("Intake inserted successfully:", intakeData);
      intake = intakeData;
    }

    // Send notification
    const notification = NOTIFICATION_FUNCTIONS[type];
    if (notification) {
      console.log("Invoking notification:", notification);
      const { data: response, error: notificationError } = await supabase.functions.invoke(notification, {
        body: { lead },
      });
      
      if (notificationError) {
        console.error("Failed to send notification:", notificationError);
      } else {
        console.log("Notification sent successfully:", response);
      }
    }

    console.log("=== LEAD SUBMISSION COMPLETE ===");
    toast.success("Thanks! I'll reach out soon.");
    return { lead, intake };
  } catch (error) {
    console.error("=== LEAD SUBMISSION FAILED ===");
    console.error("Error details:", error);
    toast.error("Something went wrong submitting your intake. Please try again.");
    throw error;
  }
}
