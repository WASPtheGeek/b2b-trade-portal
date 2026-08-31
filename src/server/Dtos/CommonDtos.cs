namespace Elkaro.Server.Dtos;

/// <summary>
/// Common query params for any paged list endpoint.
/// </summary>
public class PagingQuery
{
    /// <summary>
    /// The maximum page size allowed for any paged list endpoint.
    /// </summary>
    private const int MaxPageSize = 200;

    /// <summary>
    /// The page number for the paged list query. The default value is 1.
    /// </summary>
    private int _page = 1;

    /// <summary>
    /// The page size for the paged list query. 
    /// The default value is 50, and it cannot exceed the maximum page size of 200.
    /// </summary>
    private int _pageSize = 50;

    /// <summary>
    /// Gets or sets the page number for the paged list query. The default value is 1.
    /// </summary>
    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    /// <summary>
    /// Gets or sets the page size for the paged list query. The default value is 50, and it cannot exceed the maximum page size of 200.
    /// </summary>
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value switch
        {
            < 1 => 50,
            > MaxPageSize => MaxPageSize,
            _ => value,
        };
    }
}
