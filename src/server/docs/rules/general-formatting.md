# General Code Structure & Formatting Standards

## 1. One Type / DTO Per File
- **Never put multiple DTOs, models, interfaces, or classes in a single file.**
- Every DTO, model, contract, or type definition must reside in its own standalone file named after the type (e.g., UserDto.cs or UserDto.ts).

## 2. Line Length Limits
- Ensure line lengths do not exceed the configured maximum length (typically 120 characters).
- Break down long method signatures, LINQ chains, or ternary expressions across multiple lines to maintain readability.