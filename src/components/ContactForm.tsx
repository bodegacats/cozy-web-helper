import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address").max(255, "Email is too long"),
  projectDescription: z
    .string()
    .min(1, "Please tell us about your work or project")
    .max(500, "Description is too long"),
  websiteUrl: z
    .string()
    .optional()
    .transform((val) => {
      // Allow empty strings
      if (!val || val.trim() === "") return "";
      
      // Add https:// if no protocol is present
      const trimmed = val.trim();
      if (!/^https?:\/\//i.test(trimmed)) {
        return `https://${trimmed}`;
      }
      return trimmed;
    })
    .pipe(
      z.string().url("Please enter a valid URL").or(z.literal(""))
    ),
  wish: z
    .string()
    .min(1, "Please share what you wish your website did better")
    .max(1000, "Message is too long"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      // Save to database
      const { error: dbError } = await supabase
        .from("contact_submissions")
        .insert({
          name: data.name,
          email: data.email,
          project_description: data.projectDescription,
          website_url: data.websiteUrl || null,
          wish: data.wish,
          submission_type: "contact",
        });

      if (dbError) throw dbError;

      // Send email notification (will fail silently if not configured)
      try {
        await supabase.functions.invoke("send-contact-notification", {
          body: {
            name: data.name,
            email: data.email,
            projectDescription: data.projectDescription,
            websiteUrl: data.websiteUrl,
            wish: data.wish,
          },
        });
      } catch (emailError) {
        console.log("Email notification not sent:", emailError);
        // Don't show error to user - the form submission was successful
      }

      toast.success("Thanks — I'll reach out soon.");
      reset();
    } catch (error: any) {
      toast.error("Failed to submit. Please try again or email me directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-soft-xl border-2">
      <CardContent className="p-10">
        <div className="space-y-3 mb-8 text-center">
          <h2 className="text-3xl font-semibold">Want to talk it through?</h2>
          <p className="text-base text-muted-foreground max-w-lg mx-auto">
            Tell me about your work or project. I will read this and get back to you within one or two days.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Your name"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="your@email.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDescription">What you do or what your project is</Label>
            <Input
              id="projectDescription"
              {...register("projectDescription")}
              placeholder="e.g., I run a small landscaping business"
              disabled={isSubmitting}
            />
            {errors.projectDescription && (
              <p className="text-sm text-destructive">{errors.projectDescription.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Current website URL (if you have one)</Label>
            <Input
              id="websiteUrl"
              type="url"
              {...register("websiteUrl")}
              placeholder="https://example.com (optional)"
              disabled={isSubmitting}
            />
            {errors.websiteUrl && (
              <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wish">What do you wish your website did better?</Label>
            <Textarea
              id="wish"
              {...register("wish")}
              placeholder="Tell me what's not working, what you're missing, or what you're worried about..."
              rows={5}
              disabled={isSubmitting}
            />
            {errors.wish && (
              <p className="text-sm text-destructive">{errors.wish.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full mt-6 h-12 text-base" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send this to me"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
