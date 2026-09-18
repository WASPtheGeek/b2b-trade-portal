@AGENTS.md

# Project Guidelines

## Architecture & Code Quality
Refer to architectural standards:
@docs/rules/solid.md

## Code Quality & Conventions

Include the following detailed rule definitions:

@docs/rules/general-formatting.md
@docs/rules/csharp-conventions.md

## Summary Checklist for Code Generation
1. **Control Flow:** Braces {} on every if block.
2. **File Structure:** Exactly 1 DTO/Model per file.
3. **C# Protection:** Use Guard.Against.Null in constructors.
4. **C# Docs:** Write concise property comments ("Gets or sets...") and complete method XML docs with <see cref="..."/> tags.
5. **C# Attributes:** Stack attributes on separate lines above the code element.
6. **Formatting:** Keep line lengths within limits.
7. **Quality** Follow SOLID principles

# TypeScript & React SOLID Architecture Rules

## Core Principles (SOLID)

### S - Single Responsibility Principle (SRP)
- **React Components:** Pure UI presentation only. Extract all business logic, data fetching, and state management into custom hooks (e.g., `useUserData`).
- **Files:** One major component or domain service per file.
- **Functions:** Utility functions must do one job and stay under 25 lines.

### O - Open/Closed Principle (OCP)
- **UI Extension:** Extend component behavior using composition (`children` or render props) rather than adding conditional `if/else` flags to props.
- **Polymorphism:** Use strategy maps or polymorphic lookup tables over `switch` statements for rendering variant components.

### L - Liskov Substitution Principle (LSP)
- **Props Typing:** Extend native React HTML elements (e.g., `React.ComponentPropsWithoutRef<'button'>`) so custom wrapper components can seamlessly substitute default ones.
- **Interfaces:** Derived types must never narrow base parameters or alter inherited component contracts unexpectedly.

### I - Interface Segregation Principle (ISP)
- **Small Props Interfaces:** Components must explicitly request only the props they need. Avoid passing giant, monolithic objects (e.g., pass `userId` or `avatarUrl` instead of the whole `User` object).
- **TypeScript:** Prefer small, composed interface types over large, bloated types.

### D - Dependency Inversion Principle (DIP)
- **Custom Hooks & Services:** Components must depend on custom hook abstractions or Context interfaces, never directly on external SDKs, HTTP client singletons, or global singletons.
- **Inversion via Context:** Inject heavy dependencies (e.g., Analytics, API Clients) via React Context rather than hardcoding static imports inside functional components.


Don't use the inline localized values, always pass them via props (always use default values for props in english)

---

## TypeScript & React Best Practices
- **Strict Typing:** No `any`. Explicitly type return values for custom hooks and export public interface definitions.
- **Function Style:** Use named export functional components: `export function UserProfile({ id }: UserProfileProps)`.
- **Side Effects:** Keep `useEffect` minimal. Extract side-effect triggers into hook actions or event handlers.
- **File Structure:** 
  - Components: `src/components/UserCard/UserCard.tsx`
  - Logic/Hooks: `src/components/UserCard/useUserCard.ts`
  - Types: `src/components/UserCard/UserCard.types.ts`
  