namespace Elkaro.Server.Services.Import;

/// <summary>
/// The <c>entity_type</c> values of import batches and import log rows.
/// </summary>
public static class ImportEntityTypes
{
    /// <summary>
    /// A product row of the import file.
    /// </summary>
    public const string Products = "products";

    /// <summary>
    /// A category the import created while resolving a row's Katalogs/Grupa/apakšgrupa.
    /// </summary>
    public const string Categories = "categories";
}
