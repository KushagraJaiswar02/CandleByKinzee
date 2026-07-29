# Candle by Kinzee Atelier

A bespoke e-commerce platform for handcrafted candles.

## Project Structure
- \`app/\`: Next.js 14 App Router codebase.
- \`components/\`: Reusable UI components including LoadingButton and ConfirmDialog.
- \`lib/\`: Core utilities, Mongoose models, mail queuing, API handlers.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables in \`.env.local\`.

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Admin Management

To reseed the admin credentials (or add a new admin), you can use the seed script provided in the \`scripts/\` or \`scratch/\` directory.

### How to reseed admin:
1. Open your terminal.
2. Ensure you have the \`MONGODB_URI\` in your environment or \`.env.local\`.
3. Run the seed script:
   \`\`\`bash
   node scratch/seed_admin.js
   \`\`\`
   *(Note: This uses the existing seed script created in the scratch directory)*

This will reset the admin user to the default credentials provided in the script.

## Key Workflows
- **Ordering**: Catalog products use immediate checkout; Bespoke items generate a quote request.
- **Cancellation**: Users can request a cancellation from the \`/track\` page. Admins review this in the dashboard, and a result email is automatically sent to the customer upon approval/decline.

## Technologies
- Next.js 14
- MongoDB (Mongoose)
- Razorpay for payments
- Framer Motion for animations
