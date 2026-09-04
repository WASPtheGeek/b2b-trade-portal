# C# Coding Standards & Guidelines

## 1. Control Flow & Syntax
- **Always use curly braces {} after if statements**, even if the body is only a single line.
```
  // Good
  if (user == null)
  {
      return false;
  }

  // Avoid
  if (user == null) return false;
```

## 2. Attributes
- **Place attributes on a separate line** directly above the target (class, property, method, or parameter).
```
  // Good
  [HttpPost]
  [ValidateAntiForgeryToken]
  public IActionResult Create(UserModel model)

  // Avoid
  [HttpPost] public IActionResult Create(UserModel model)
```

## 3. Constructors & Validation
- **Use Guard.Against.Null** (Ardalis.GuardClauses) for null checks in constructors.
```
  public UserService(IUserRepository userRepository, ILogger<UserService> logger)
  {
      _userRepository = Guard.Against.Null(userRepository, nameof(userRepository));
      _logger = Guard.Against.Null(logger, nameof(logger));
  }
```

## 4. Documentation Comments
- **Properties:** Always write XML doc comments. Keep them concise (1–2 sentences max). Use standard "Gets or sets the..." phrasing where applicable.
```
  /// <summary>
  /// Gets or sets the primary email address associated with the user account.
  /// </summary>
  public string Email { get; set; }
```

- **Methods:** Always write complete XML doc comments including <summary>, <param>, and <returns> tags. Use <see cref="..."/> tags for type references.
```
  /// <summary>
  /// Tries to parse a string representation of a discount type into the corresponding <see cref="DiscountType"/> enum value.
  /// </summary>
  /// <param name="raw">The raw string representation of the discount type.</param>
  /// <param name="type">When this method returns, contains the parsed <see cref="DiscountType"/> value if the parsing succeeded, or the default value if it failed.</param>
  /// <returns><c>true</c> if the parsing succeeded; otherwise, <c>false</c>.</returns>
  public bool TryParseDiscountType(string raw, out DiscountType type)
```