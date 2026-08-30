using System.ComponentModel.DataAnnotations;

namespace Elkaro.Server.Dtos;

/// <summary>
/// The request body for registering a new user.
/// This DTO is used in the <see cref="AuthController.Register"/> endpoint.
/// </summary>
public record RegisterRequest : IValidatableObject
{
    /// <summary>
    /// The first name of the user.
    /// </summary>
    [
        Required(ErrorMessage = "Vārds ir obligāts."),
        MaxLength(100, ErrorMessage = "Vārds nedrīkst pārsniegt 100 rakstzīmes.")
    ]
    public string FirstName { get; init; } = null!;

    /// <summary>
    /// The last name of the user.
    /// </summary>
    [
        Required(ErrorMessage = "Uzvārds ir obligāts."),
        MaxLength(100, ErrorMessage = "Uzvārds nedrīkst pārsniegt 100 rakstzīmes.")
    ]
    public string LastName { get; init; } = null!;

    /// <summary>
    /// The email address of the user.
    /// </summary>
    [
        Required(ErrorMessage = "E-pasta adrese ir obligāta."),
        EmailAddress(ErrorMessage = "E-pasta adrese nav derīga."),
        MaxLength(255, ErrorMessage = "E-pasta adrese nedrīkst pārsniegt 255 rakstzīmes.")
    ]
    public string Email { get; init; } = null!;

    /// <summary>
    /// The password of the user.
    /// </summary>
    [
        Required(ErrorMessage = "Parole ir obligāta."),
        MinLength(8, ErrorMessage = "Parolei jābūt vismaz 8 rakstzīmes garai.")
    ]
    public string Password { get; init; } = null!;

    /// <summary>
    /// The business name of the user.
    /// </summary>
    [
        Required(ErrorMessage = "Uzņēmuma nosaukums ir obligāts."),
        MaxLength(255, ErrorMessage = "Uzņēmuma nosaukums nedrīkst pārsniegt 255 rakstzīmes.")
    ]
    public string BusinessName { get; init; } = null!;

    /// <summary>
    /// The registration number of the business.
    /// </summary>
    [
        Required(ErrorMessage = "Reģistrācijas numurs ir obligāts."),
        MaxLength(50, ErrorMessage = "Reģistrācijas numurs nedrīkst pārsniegt 50 rakstzīmes.")
    ]
    public string RegistrationNumber { get; init; } = null!;

    /// <summary>
    /// The VAT number of the business.
    /// </summary>
    [
        Required(ErrorMessage = "PVN maksātāja numurs ir obligāts."),
        MaxLength(50, ErrorMessage = "PVN maksātāja numurs nedrīkst pārsniegt 50 rakstzīmes.")
    ]
    public string VatNumber { get; init; } = null!;

    /// <summary>
    /// The phone number of the user.
    /// </summary>
    [
        MaxLength(30, ErrorMessage = "Tālruņa numurs nedrīkst pārsniegt 30 rakstzīmes.")
    ]
    public string? Phone { get; init; }

    /// <summary>
    /// Catches what the attributes above can't: [Required] accepts a
    /// whitespace-only string (it only rejects ""), but the controller then
    /// trims these fields before saving, which would otherwise persist an
    /// empty BusinessName/RegistrationNumber/etc.
    ///
    /// Also enforces password complexity beyond the bare [MinLength(8)].
    /// </summary>
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(FirstName))
            yield return new ValidationResult("Vārds nedrīkst būt tukšs.", [nameof(FirstName)]);
        if (string.IsNullOrWhiteSpace(LastName))
            yield return new ValidationResult("Uzvārds nedrīkst būt tukšs.", [nameof(LastName)]);
        if (string.IsNullOrWhiteSpace(BusinessName))
            yield return new ValidationResult("Uzņēmuma nosaukums nedrīkst būt tukšs.", [nameof(BusinessName)]);
        if (string.IsNullOrWhiteSpace(RegistrationNumber))
            yield return new ValidationResult("Reģistrācijas numurs nedrīkst būt tukšs.", [nameof(RegistrationNumber)]);
        if (string.IsNullOrWhiteSpace(VatNumber))
            yield return new ValidationResult("PVN maksātāja numurs nedrīkst būt tukšs.", [nameof(VatNumber)]);

        if (Password is not null && (!Password.Any(char.IsDigit) || !Password.Any(char.IsLetter)))
            yield return new ValidationResult("Parolei jāsatur vismaz viens burts un viens cipars.", [nameof(Password)]);
    }
}

/// <summary>
/// The response body for a successful registration.
/// This DTO is returned by the <see cref="AuthController.Register"/> endpoint.
/// </summary>
/// <param name="Message">The success message.</param>
/// <param name="UserId">The ID of the newly registered user.</param>
/// <param name="Status">The status of the registration.</param>
public record RegisterResponse(string Message, long UserId, string Status);

/// <summary>
/// The request body for logging in a user.
/// This DTO is used in the <see cref="AuthController.Login"/> endpoint.
/// </summary>
public record LoginRequest
{
    /// <summary>
    /// The email address of the user.
    /// </summary>
    [Required(ErrorMessage = "E-pasta adrese ir obligāta."), EmailAddress(ErrorMessage = "E-pasta adrese nav derīga.")]
    public string Email { get; init; } = null!;

    /// <summary>
    /// The password of the user.
    /// </summary>
    [Required(ErrorMessage = "Parole ir obligāta.")]
    public string Password { get; init; } = null!;
}

/// <summary>
/// The response body for a successful login.
/// This DTO is returned by the <see cref="AuthController.Login"/> endpoint.
/// </summary>
/// <param name="Token">The authentication token.</param>
/// <param name="User">The details of the logged-in user.</param>
public record LoginResponse(string Token, UserDto User);

/// <summary>
/// The details of a user.
/// This DTO is used in the <see cref="AuthController.Login"/> endpoint.
/// </summary>
public record UserDto(
    long Id,
    string FirstName,
    string LastName,
    string Email,
    string? BusinessName,
    string? RegistrationNumber,
    string? VatNumber,
    string? Phone,
    bool IsVatExempt,
    string Role,
    string Status,
    DateTimeOffset CreatedAt);

/// <summary>
/// The request body for rejecting a user registration.
/// This DTO is used in the <see cref="AuthController.RejectUser"/> endpoint.
/// </summary>
/// <param name="Reason">The reason for rejecting the user registration.</param>
public record RejectUserRequest([Required(ErrorMessage = "Iemesls ir obligāts."), MaxLength(500, ErrorMessage = "Iemesls nedrīkst pārsniegt 500 rakstzīmes.")] string Reason);
