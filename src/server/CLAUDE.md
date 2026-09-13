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