# TravelFlow360 - Travel Agency SaaS Platform

## 🎯 Purpose
A comprehensive multi-user travel quotation and booking system where travel agencies and tour operators can manage travel inquiries, generate quotes, book packages, and issue travel vouchers.

## 🚀 Features

### 🔐 Authentication & User Management
- **Multi-role system**: Super Admin, Organization Owner, Tour Operator, Travel Agent, Customer Service, Accounts
- **Free 14-day trial** for new organizations
- **Organization onboarding** with custom setup
- **Role-based dashboards** and permissions

### 📊 Core Modules

#### 📥 Inquiry Management
- Create domestic/international travel inquiries
- Auto-generated inquiry IDs (ENQ-YYMM-XXX format)
- Client information capture (name, destination, dates, guests)
- Agent assignment and tracking

#### 📄 Quote Generation
- Convert inquiries to detailed quotes
- Hotel selection with comparison options
- Room arrangement configuration (sharing, single, etc.)
- Per-person sharing pricing model
- Transport and transfer cost integration
- Markup percentage calculation
- Client-facing preview (hides internal costs)
- PDF generation and email delivery

#### ✅ Booking & Vouchers
- Convert approved quotes to confirmed bookings
- Generate comprehensive travel voucher PDFs
- Full itinerary with hotel, transport, and guest details
- Payment tracking and confirmation

#### 📊 Accounts & Reporting
- Payment confirmation workflows
- Sales performance reports
- Markup analysis reports
- Agent performance tracking
- Revenue analytics

#### 🎧 Customer Service
- Inquiry creation and management
- Agent assignment and reassignment
- Progress tracking and status updates

#### ⚙️ System Configuration
- Destination management
- Hotel inventory setup
- Transport vendor configuration
- Markup defaults and currency settings
- Organization-specific customization

### 🌐 Public Pages
- Marketing homepage with features and pricing
- User authentication (login/signup)
- About, Careers, Blog sections
- Documentation and Help Center
- Legal pages (Terms, Privacy, GDPR)

## 🏗️ Technical Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **UI Components**: shadcn/ui
- **State Management**: TanStack Query
- **PDF Generation**: jsPDF
- **Email**: Resend API

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Installation
```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd travelflow360

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 User Roles & Permissions

### Super Admin
- System-wide management
- Organization oversight
- User role management

### Organization Owner
- Organization setup and configuration
- Team member management
- Settings and preferences

### Tour Operator
- Agent assignment and management
- Quote oversight and approval
- Inventory management

### Travel Agent
- Inquiry handling
- Quote creation
- Client communication

### Customer Service
- Inquiry creation
- Agent assignment
- Progress tracking

### Accounts
- Payment processing
- Financial reporting
- Revenue analysis

## 🔄 Workflow

1. **Inquiry Creation** → Customer Service or Agent creates travel inquiry
2. **Agent Assignment** → Tour Operator assigns agent to inquiry
3. **Quote Generation** → Agent creates detailed quote with hotels and pricing
4. **Client Review** → Client receives clean preview without internal costs
5. **Booking Confirmation** → Approved quote converts to booking
6. **Voucher Generation** → System generates travel voucher PDF
7. **Payment Processing** → Accounts team confirms payments
8. **Reporting** → Generate sales and performance reports

## 🎯 MVP Goals
- Complete inquiry-to-voucher workflow
- Role-based access control
- Markup calculation system
- Hotel room pricing logic
- Client preview functionality
- PDF generation capabilities

## 📈 Pricing & Trial
- **14-day free trial** for all new organizations
- **Role-based pricing** with team member limits
- **Scalable plans** for growing agencies

## 🛠️ Development

### Key Directories
- `/src/components` - Reusable UI components
- `/src/pages` - Main application pages
- `/src/contexts` - Authentication and state management
- `/src/hooks` - Custom React hooks
- `/supabase/migrations` - Database schema
- `/supabase/functions` - Edge functions for email/PDF

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support
- Documentation: [docs.travelflow360.com]
- Help Center: [help.travelflow360.com]
- Email: support@travelflow360.com

---

© 2025 TravelFlow360. All rights reserved.