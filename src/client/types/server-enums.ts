// Generated from src/server/Models/Enums/*.cs - member names mirror the C# enums exactly.
// The backend stores these as SMALLINTs, but every controller that returns one maps it
// through `.ToString()` (OrdersController.cs, AuthController.cs, Admin/ImportController.cs)
// rather than a JSON enum converter, so the wire value is the PascalCase C# member name
// (e.g. "Pending", "Shipped") - there is no serializer-level guarantee of this, but it's
// what every current endpoint actually sends. Keep these string-valued and in sync with the
// backend enums by hand until the API exposes a shared contract (e.g. OpenAPI codegen).

// src/server/Models/Enums/UserStatus.cs - a company/user account's approval status.
export enum UserStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  Suspended = "Suspended",
}

// src/server/Models/Enums/OrderStatus.cs
export enum OrderStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Processing = "Processing",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
  Refunded = "Refunded",
}

// src/server/Models/Enums/ImportStatus.cs - an ERP import job as a whole.
export enum ImportStatus {
  Pending = "Pending",
  Running = "Running",
  Success = "Success",
  Failed = "Failed",
  Partial = "Partial",
}

// src/server/Models/Enums/ImportRecordStatus.cs - a single row within an import job.
export enum ImportRecordStatus {
  Success = "Success",
  Failed = "Failed",
  Skipped = "Skipped",
}
