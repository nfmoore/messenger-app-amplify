# Technology Stack

## Core Framework
- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Turbopack** for fast development builds

## AWS Services & Amplify
- **AWS Amplify Gen 2** for backend infrastructure
- **Amazon Cognito** for authentication
- **AWS AppSync Events** for real-time messaging
- **AWS Amplify AI Kit** with Claude 3.5 Sonnet
- **AWS CDK** for custom infrastructure

## UI & Styling
- **shadcn/ui** component library (New York style)
- **Tailwind CSS** for styling with CSS variables
- **Radix UI** primitives for accessible components
- **Lucide React** for icons
- **tailwindcss-animate** for animations

## Development Tools
- **ESLint** with Next.js config
- **PostCSS** for CSS processing
- **tsx** for TypeScript execution

## Common Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npx ampx sandbox     # Start Amplify sandbox backend
```

### Build & Deploy
```bash
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Prerequisites
- Node.js 18+
- AWS account configured for Amplify
- Claude 3.5 Sonnet enabled in Amazon Bedrock

## Key Dependencies
- `@aws-amplify/backend` - Amplify Gen 2 backend
- `@aws-amplify/ui-react` - Amplify UI components
- `@aws-amplify/ui-react-ai` - AI chat components
- `class-variance-authority` - Component variants
- `clsx` + `tailwind-merge` - Conditional styling