using System.Text.Json;

namespace Elkaro.Server.Services.Import;

/// <summary>
/// The JSON stored in <c>import_logs.payload</c>. Carries what has no dedicated column in the
/// <c>import_logs</c> table: the source file row number, whether a successful row created or
/// updated its entity, and - for a created category - its full path.
/// </summary>
/// <param name="RowNumber">The 1-based row number of the record in the source file.</param>
/// <param name="Action">
/// <see cref="CreatedAction"/> or <see cref="UpdatedAction"/> for a successful row; <c>null</c> for a failed one.
/// </param>
/// <param name="Path">For a created category, its path from the top level (e.g. "Rotaļlietas › Galda spēles").</param>
public record ImportLogPayload(int RowNumber, string? Action = null, string? Path = null)
{
    /// <summary>
    /// The <see cref="Action"/> of a row that created a new product.
    /// </summary>
    public const string CreatedAction = "created";

    /// <summary>
    /// The <see cref="Action"/> of a row that updated an existing product.
    /// </summary>
    public const string UpdatedAction = "updated";

    /// <summary>
    /// The JSON fragment matching a payload whose action is <see cref="CreatedAction"/>, for a
    /// jsonb containment (<c>@&gt;</c>) query.
    /// </summary>
    public const string CreatedActionJson = """{"action":"created"}""";

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    /// <summary>
    /// Gets the <see cref="Action"/> describing the specified row outcome.
    /// </summary>
    /// <param name="result">The <see cref="RowImportResult"/> of the row.</param>
    /// <returns><see cref="CreatedAction"/>, <see cref="UpdatedAction"/>, or <c>null</c> if the row failed.</returns>
    public static string? ActionFor(RowImportResult result)
    {
        if (!result.Success)
        {
            return null;
        }

        return result.Created ? CreatedAction : UpdatedAction;
    }

    /// <summary>
    /// Serializes this payload to the JSON string stored in <c>import_logs.payload</c>.
    /// </summary>
    /// <returns>The JSON representation of this <see cref="ImportLogPayload"/>.</returns>
    public string ToJson() => JsonSerializer.Serialize(this, JsonOptions);

    /// <summary>
    /// Reads a stored payload, tolerating missing or malformed JSON.
    /// </summary>
    /// <param name="json">The raw <c>import_logs.payload</c> value, possibly <c>null</c>.</param>
    /// <returns>The <see cref="ImportLogPayload"/>, or <c>null</c> if it can't be read.</returns>
    public static ImportLogPayload? TryRead(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<ImportLogPayload>(json, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    /// <summary>
    /// Reads the row number from a stored payload, tolerating missing or malformed JSON.
    /// </summary>
    /// <param name="json">The raw <c>import_logs.payload</c> value, possibly <c>null</c>.</param>
    /// <returns>The stored row number, or <c>0</c> if it can't be read.</returns>
    public static int ReadRowNumber(string? json) => TryRead(json)?.RowNumber ?? 0;
}
