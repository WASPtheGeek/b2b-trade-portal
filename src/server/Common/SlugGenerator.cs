using System.Globalization;
using System.Text;

namespace Elkaro.Server.Common;

/// <summary>
/// Builds URL-friendly slugs: lowercase ASCII letters and digits separated by single hyphens.
/// Diacritics are stripped (ā→a, č→c, ģ→g, ķ→k, ļ→l, ņ→n, š→s, ž→z, …). Mirrors the client's
/// category form slugify so imported and manually created categories get identical slugs.
/// </summary>
public static class SlugGenerator
{
    /// <summary>
    /// Creates a slug from the specified text.
    /// </summary>
    /// <param name="text">The text to slugify, e.g. a category name.</param>
    /// <returns>The slug; empty if <paramref name="text"/> has no letters or digits.</returns>
    public static string Create(string text)
    {
        var decomposed = text.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormKD);
        var builder = new StringBuilder(decomposed.Length);
        var pendingHyphen = false;

        foreach (var c in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) == UnicodeCategory.NonSpacingMark)
            {
                continue; // the accent split off by FormKD, e.g. the macron of ā
            }

            if (c is (>= 'a' and <= 'z') or (>= '0' and <= '9'))
            {
                if (pendingHyphen && builder.Length > 0)
                {
                    builder.Append('-');
                }

                builder.Append(c);
                pendingHyphen = false;
            }
            else
            {
                pendingHyphen = true;
            }
        }

        return builder.ToString();
    }
}
