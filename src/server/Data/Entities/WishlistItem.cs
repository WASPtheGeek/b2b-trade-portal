using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class WishlistItem
{
    public long Id { get; set; }

    public long UserId { get; set; }

    public long ProductId { get; set; }

    public DateTime AddedAt { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
