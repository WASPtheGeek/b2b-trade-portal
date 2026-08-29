using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class ImportBatch
{
    public long Id { get; set; }

    public Guid BatchUuid { get; set; }

    public string SourceSystem { get; set; } = null!;

    public string EntityType { get; set; } = null!;

    public short Status { get; set; }

    public int TotalRecords { get; set; }

    public int SuccessCount { get; set; }

    public int FailureCount { get; set; }

    public long? TriggeredBy { get; set; }

    public DateTime StartedAt { get; set; }

    public DateTime? FinishedAt { get; set; }

    public string? Notes { get; set; }

    public virtual ICollection<ImportLog> ImportLogs { get; set; } = new List<ImportLog>();

    public virtual User? TriggeredByNavigation { get; set; }
}
