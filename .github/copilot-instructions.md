# Ahura Gold ERP Project Setup

## Project Overview
A comprehensive gold trading management system with product management, customer management, payment tracking, dashboard, and reporting features.

## Setup Checklist

- [x] Create copilot-instructions.md file
- [x] Scaffold Next.js project with TypeScript
- [x] Install dependencies (Prisma, shadcn/ui, etc.)
- [x] Setup Prisma schema and database
- [x] Setup shadcn/ui components
- [x] Create project structure
- [x] Implement product management module
- [x] Implement customer management module
- [x] Implement payment management module
- [x] Implement dashboard
- [x] Implement reports
- [x] Test and compile project

## Tech Stack
- Next.js 15+ with App Router
- TypeScript
- Tailwind CSS
- Prisma ORM with SQLite
- shadcn/ui components
- React Hook Form for forms
- date-fns for date handling

## Development Guidelines
- Use Turkish language for UI labels and messages
- All monetary calculations in gold grams (has altın gramı)
- System generates sequential transaction codes
- Support both gram and piece-based products

## Project Status
✅ **Project is complete and ready to use!**

### Available Features:
1. **Product Management** - Create products, manage buy/sell transactions, track stock
2. **Customer Management** - Add customers, track balances, manage accounts
3. **Payment Management** - Track pending/completed payments, support partial payments
4. **Dashboard** - View daily statistics and important alerts
5. **Reports** - Access various business reports

### Next Steps:
To start the development server:
```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

### Database Management:
To view/edit the database:
```bash
npx prisma studio
```

### Future Enhancements:
- Implement consignment transactions (emanet işlemleri)
- Add payment processing functionality
- Create detailed report pages with date filters
- Add customer detail pages
- Implement transaction detail views
- Add Excel/PDF export for reports
- Implement search functionality for all pages

