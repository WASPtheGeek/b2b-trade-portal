namespace Elkaro.Server.Models.Enums;

/// <summary>
/// The unit a product is ordered/packaged in. 
/// Stored as a SMALLINT in Database.
/// </summary>
public enum PackagingUnit
{
    /// <summary>
    /// A single piece.
    /// </summary>
    Piece = 1,

    /// <summary>
    /// A box of pieces.
    /// </summary>
    Box = 2,

    /// <summary>
    /// A package of pieces.
    /// </summary>
    Package = 3,
}
