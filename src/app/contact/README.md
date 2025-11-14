# Contact Page

## Overview
The contact page allows users to submit inquiries through a form with validation.

## Features
- Contact form with fields: name, email, inquiry type, and message
- Client-side validation using Zod schema
- Form submission to API route
- Success/error feedback messages
- Character counter for message field
- Responsive design

## API Integration
- **Endpoint**: `/api/contact`
- **Method**: POST
- **Validation**: Uses `contactFormSchema` from `@/lib/validations/contact`
- **Database**: Stores submissions in `contact_submissions` table

## Supabase Edge Function
An alternative Edge Function is available at `supabase/functions/contact-form` for handling submissions directly through Supabase.

## Database Schema
The `contact_submissions` table includes:
- `id`: UUID primary key
- `name`: User's name
- `email`: User's email
- `inquiry_type`: Type of inquiry (general, order, product, shipping, returns, other)
- `message`: User's message
- `submitted_at`: Timestamp of submission
- `created_at`: Record creation timestamp

## Usage
Users can access the contact page at `/contact` and submit inquiries. The form validates input before submission and provides feedback on success or failure.
