#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Stripe Webhook Local Testing - Complete Guide         ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}Step 1: Checking Prerequisites...${NC}"
echo ""

# Check Supabase
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Supabase CLI installed${NC}"

# Check Stripe CLI
if ! command -v stripe &> /dev/null; then
    echo -e "${RED}❌ Stripe CLI not found${NC}"
    echo "   Install: brew install stripe/stripe-cli/stripe"
    exit 1
fi
echo -e "${GREEN}✅ Stripe CLI installed${NC}"

# Check if Supabase is running
if supabase status &> /dev/null; then
    echo -e "${GREEN}✅ Local Supabase is running${NC}"
else
    echo -e "${RED}❌ Local Supabase is not running${NC}"
    echo "   Start it: supabase start"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Environment Configuration${NC}"
echo ""

# Check .env.local
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
    
    # Check for required variables
    if grep -q "STRIPE_SECRET_KEY" .env.local; then
        echo -e "${GREEN}✅ STRIPE_SECRET_KEY configured${NC}"
    else
        echo -e "${RED}❌ STRIPE_SECRET_KEY missing${NC}"
        exit 1
    fi
    
    # Check if using local Supabase
    if grep -q "NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321" .env.local; then
        echo -e "${GREEN}✅ Using local Supabase URL${NC}"
    else
        echo -e "${YELLOW}⚠️  Not using local Supabase URL${NC}"
        echo "   Update .env.local to use: http://127.0.0.1:54321"
    fi
else
    echo -e "${RED}❌ .env.local not found${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All prerequisites met!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Now follow these steps in order:${NC}"
echo ""

echo -e "${BLUE}Terminal 1 (This terminal):${NC}"
echo "  Run: supabase functions serve stripe-webhook --env-file .env.local"
echo ""

echo -e "${BLUE}Terminal 2 (New terminal):${NC}"
echo "  Run: stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook"
echo "  ${YELLOW}⚠️  IMPORTANT: Copy the webhook secret (whsec_...) from the output${NC}"
echo ""

echo -e "${BLUE}Terminal 1 (Come back here):${NC}"
echo "  1. Press Ctrl+C to stop the function"
echo "  2. Add the webhook secret to .env.local:"
echo "     echo 'STRIPE_WEBHOOK_SECRET=whsec_your_secret' >> .env.local"
echo "  3. Restart: supabase functions serve stripe-webhook --env-file .env.local"
echo ""

echo -e "${BLUE}Terminal 3 (Another new terminal):${NC}"
echo "  Run: stripe trigger payment_intent.succeeded"
echo ""

echo -e "${BLUE}Check Results:${NC}"
echo "  - Terminal 1: Should show webhook processing logs"
echo "  - Terminal 2: Should show webhook received"
echo ""

echo -e "${GREEN}Ready to start? Press Enter to begin...${NC}"
read

echo ""
echo -e "${YELLOW}Starting webhook function...${NC}"
echo ""

# Start the function
supabase functions serve stripe-webhook --env-file .env.local
