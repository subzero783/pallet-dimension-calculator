# Technical Specification & Implementation Plan: Pallet Dimension Calculator

## 1. Project Overview & Objective
Build a unified Next.js App Router full-stack application for a manufacturing shipping department. Shipping employees enter CAD product dimensions (Length, Width, Height, Weight) from work orders to instantly generate an itemized wood cut list (stringers, deckboards, fasteners, board feet, tare weight) with automated clearance allowances, secure role-based authentication, and persistent work order history.

---

## 2. Pinned Tech Stack & Architecture Constraints

| Component | Selected Technology | Notes |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Unified SSR, Server Actions, API Routes |
| **UI Library & Language** | React 19 + TypeScript | Full type-safety across client & server |
| **State Management** | Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) + React Context | Redux for global calculator & order state; Context for UI toasts & theme |
| **Styling** | Vanilla CSS (Modern CSS Design System & Variables) | Sleek industrial warehouse palette, responsive glassmorphism, micro-animations |
| **Database** | MongoDB via Mongoose | Serverless cached connection pattern (`lib/database.ts`), Mongoose schemas |
| **Security & Auth** | Argon2 + `jose` (JWT) | HTTP-only cookies, Next.js Edge-compatible middleware validation |
| **Testing** | Vitest 4 + React Testing Library + JSDOM | Mocked Mongoose client for isolated unit/integration tests |
| **CI/CD** | GitHub Actions (`.github/workflows/ci.yml`) | Type check (`tsc --noEmit`), linting, and Vitest suite |
| **Deployment Target** | Vercel | Single full-stack deployment; zero Docker/container files |

---

## 3. Pallet Calculation Engine Specification

### Inputs
- **Work Order ID** (e.g. `WO-84920`)
- **Product Name & Customer** (e.g. `CNC Spindle Assembly - Boeing`)
- **CAD Dimensions**:
  - Length ($L$), Width ($W$), Height ($H$) in inches
  - Weight ($Wt$) in lbs
- **Pallet Configuration**:
  - **Pallet Style**: 2-Way Stringer (Flush / Overhang), 4-Way Notched Stringer, or Heavy-Duty Skid
  - **Clearance Allowances**: Length Allowance (default $2.0"$), Width Allowance (default $2.0"$)
  - **Deckboard Specs**: Nominal 1x4 ($0.75" \times 3.5"$) or 1x6 ($0.75" \times 5.5"$)
  - **Stringer Specs**: Nominal 2x4 ($1.5" \times 3.5"$) or 4x4 ($3.5" \times 3.5"$)
  - **Target Max Gap**: $2.5"$ to $3.5"$ between deckboards

### Core Engineering Algorithms
1. **Pallet Dimensions**:
   $$PL = L + \text{Clearance}_L$$
   $$PW = W + \text{Clearance}_W$$
2. **Stringer Sizing & Count**:
   - Stringer Length $= PL$
   - Minimum count $= 3$ (Left, Center, Right). If $PW > 48"$ or $Wt > 1500\text{ lbs}$, increase to $4$ or $5$ stringers to prevent deckboard deflection.
3. **Deckboard Layout**:
   - Lead edge top deckboards: 2 boards (front & back) of nominal 1x6 for maximum fork impact resistance.
   - Interior top deckboards: calculated to distribute load with uniform spacing $\le \text{MaxGap}$.
   - Bottom deckboards: 2 lead boards + 2-3 interior boards for stable conveyor/floor resting.
4. **Itemized Cut List**:
   - Component name, Quantity, Actual Dimensions ($T \times W \times L$), Nominal Dimensions, Board Feet ($\frac{T_{nom} \times W_{nom} \times L}{144} \times \text{Qty}$).
   - Fastener count: 3 spiral/screw shank nails per deckboard-stringer junction.
   - Estimated Tare Weight and Max Safe Distributed Load calculation.

---

## 4. Layer-by-Layer Implementation Roadmap

### **Layer 1: Project Initialization & Configuration**
- Generate unified Next.js project with App Router, TypeScript, and React 19.
- Install exact dependencies:
  - `mongoose`, `argon2`, `jose`, `@reduxjs/toolkit`, `react-redux`, `lucide-react`
  - Dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@types/node`, `@types/react`, `@types/react-dom`
- Configure `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, and `.env.local` / `.env.example`.
- Setup `.github/workflows/ci.yml`.
- **Review & Test Checkpoint 1**: Run `npm run type-check` to verify zero configuration errors.

### **Layer 2: Database Connection & Mongoose Schemas**
- Create [lib/database.ts](file:///c:/Users/warehouse/Documents/pallet-dimension-calculator/lib/database.ts) implementing global cached connection pattern to avoid serverless connection pool exhaustion.
- Create [models/User.ts](file:///c:/Users/warehouse/Documents/pallet-dimension-calculator/models/User.ts) with password hashing support and roles (`shipping_clerk`, `supervisor`, `admin`).
- Create [models/WorkOrder.ts](file:///c:/Users/warehouse/Documents/pallet-dimension-calculator/models/WorkOrder.ts) storing CAD product dimensions, calculated cut lists, pallet tare weight, and status.
- Create [lib/auth.ts](file:///c:/Users/warehouse/Documents/pallet-dimension-calculator/lib/auth.ts) with `jose` JWT signing, verification, and cookie utilities.
- **Review & Test Checkpoint 2**: Type check and unit test Mongoose model schemas and cached connection logic using Vitest.

### **Layer 3: Pallet Calculation Engine & Core Lib**
- Create [lib/palletEngine.ts](file:///c:/Users/warehouse/Documents/pallet-dimension-calculator/lib/palletEngine.ts):
  - Pure calculation functions with complete type definitions.
  - Generates cut lists, board foot totals, tare weights, load ratings, and fastener counts.
- **Review & Test Checkpoint 3**: Comprehensive unit tests covering various CAD dimension edge cases (narrow, standard 48x40, oversized 96x60, heavy industrial 3500 lbs).

### **Layer 4: Next.js API Routes & Server Actions**
- Implement API Route Handlers:
  - `app/api/auth/register/route.ts`
  - `app/api/auth/login/route.ts`
  - `app/api/auth/me/route.ts`
  - `app/api/auth/logout/route.ts`
  - `app/api/calculate/route.ts` (instant calculations)
  - `app/api/work-orders/route.ts` (list & create work orders)
  - `app/api/work-orders/[id]/route.ts` (get, update, delete work orders)
- Implement Next.js Middleware in [middleware.ts](file:///c:/Users/warehouse/Documents/pallet-dimension-calculator/middleware.ts) for route protection.
- **Review & Test Checkpoint 4**: Integration tests for API routes with mocked Mongoose client.

### **Layer 5: Client State Management (Redux Toolkit & Context)**
- Configure Redux Store in [store/index.ts](file:///c:/Users/warehouse/Documents/pallet-dimension-calculator/store/index.ts):
  - `calculatorSlice.ts`: Live input parameters, active cut list, calculation mode.
  - `workOrderSlice.ts`: History list, selected order, filters.
  - `authSlice.ts`: Session state, authenticated user.
- Configure [context/ToastContext.tsx](file:///c:/Users/warehouse/Documents/pallet-dimension-calculator/context/ToastContext.tsx) for notifications.
- Wrap application with [store/StoreProvider.tsx](file:///c:/Users/warehouse/Documents/pallet-dimension-calculator/store/StoreProvider.tsx).
- **Review & Test Checkpoint 5**: Type check Redux slices and verify actions/reducers.

### **Layer 6: UI Components & Next.js Pages**
- Design System: [app/globals.css](file:///c:/Users/warehouse/Documents/pallet-dimension-calculator/app/globals.css) with industrial warehouse theme (slate/amber/cyan accents, glassmorphic panels, monospace dimension badges).
- Pages & Components:
  - `app/layout.tsx`: Root layout with navigation header, user status, toast container.
  - `app/page.tsx`: Landing and feature overview with quick demo launcher.
  - `app/login/page.tsx`: Authentication screen with demo login one-click presets.
  - `app/calculator/page.tsx`:
    - CAD Dimension Input Panel (Length, Width, Height, Weight, Clearances).
    - Pallet Style & Lumber selector.
    - **Interactive Visual Pallet Diagram** (SVG/Canvas rendering top-view and 3D isometric representation of product atop custom pallet).
    - Itemized Cut List Table with copy, printable cut-sheet view, and CSV export.
    - "Save to Work Order History" action.
  - `app/history/page.tsx`:
    - Searchable table of past work orders.
    - Filter by customer, work order #, date.
    - "Load into Calculator" button to duplicate or adjust previous builds.
- **Review & Test Checkpoint 6**: UI component tests and end-to-end type check.

### **Layer 7: Automated Quality Gates & Verification**
- Run `npm run type-check` (`tsc --noEmit`).
- Run `npm test` (full Vitest suite).
- Verify absence of Docker or Render files.
- Validate Vercel compatibility.
