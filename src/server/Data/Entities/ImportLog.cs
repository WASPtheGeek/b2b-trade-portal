using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class ImportLog
{
    public long Id { get; set; }

    public long BatchId { get; set; }

    public string EntityType { get; set; } = null!;

    public string? ExternalId { get; set; }

    public long? InternalRecordId { get; set; }

    public short Status { get; set; }

    public string? ErrorMessage { get; set; }

    public string? Payload { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ImportBatch Batch { get; set; } = null!;
}
