import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations/contact";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const result = contactFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: result.error.issues },
        { status: 400 }
      );
    }

    const { name, email, inquiryType, message } = result.data;

    // Create Supabase client
    const supabase = await createClient();

    // Store the contact form submission in the database
    const { error: dbError } = await supabase.from("contact_submissions").insert({
      name,
      email,
      inquiry_type: inquiryType,
      message,
      submitted_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Database error:", dbError);
      // Don't fail the request if database insert fails
      // We can still log it or send an email
    }

    // TODO: Send email notification to support team
    // This would typically use a service like Resend, SendGrid, or a Supabase Edge Function

    return NextResponse.json(
      { success: true, message: "Contact form submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to process contact form submission" },
      { status: 500 }
    );
  }
}
