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
    /// The VAT number of the business, if it has one.
    /// </summary>
    [
        MaxLength(50, ErrorMessage = "PVN maksātāja numurs nedrīkst pārsniegt 50 rakstzīmes.")
    ]
    public string? VatNumber { get; init; }

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
    DateTimeOffset CreatedAt,
    string? RejectionReason);

/// <summary>
/// The request body for rejecting a user registration.
/// This DTO is used in the <see cref="AuthController.RejectUser"/> endpoint.
/// </summary>
/// <param name="Reason">The reason for rejecting the user registration.</param>
public record RejectUserRequest([Required(ErrorMessage = "Iemesls ir obligāts."), MaxLength(500, ErrorMessage = "Iemesls nedrīkst pārsniegt 500 rakstzīmes.")] string Reason);

/// <summary>
/// The request body for a signed-in user updating their own profile.
/// This DTO is used in the <see cref="AuthController.UpdateProfile"/> endpoint. Deliberately
/// excludes Email and Password - those are separate, more sensitive flows (identity/login
/// credential changes) that this self-service form doesn't cover.
/// </summary>
public record UpdateProfileRequest : IValidatableObject
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
    /// The VAT number of the business, if it has one.
    /// </summary>
    [MaxLength(50, ErrorMessage = "PVN maksātāja numurs nedrīkst pārsniegt 50 rakstzīmes.")]
    public string? VatNumber { get; init; }

    /// <summary>
    /// The phone number of the user.
    /// </summary>
    [MaxLength(30, ErrorMessage = "Tālruņa numurs nedrīkst pārsniegt 30 rakstzīmes.")]
    public string? Phone { get; init; }

    /// <summary>
    /// Catches what [Required] can't: a whitespace-only string. See RegisterRequest.Validate
    /// for the same rationale.
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
    }
}

/// <summary>
/// The request body for confirming a user's email address.
/// This DTO is used in the <see cref="AuthController.ConfirmEmail"/> endpoint.
/// </summary>
/// <param name="Token">The email-confirmation token from the link sent to the user.</param>
public record ConfirmEmailRequest([Required(ErrorMessage = "Marķieris ir obligāts.")] string Token);

/// <summary>
/// The response body for a successful email confirmation.
/// This DTO is returned by the <see cref="AuthController.ConfirmEmail"/> endpoint.
/// </summary>
/// <param name="Message">The success message.</param>
public record ConfirmEmailResponse(string Message);

/// <summary>
/// The request body for resending the email-confirmation link.
/// This DTO is used in the <see cref="AuthController.ResendConfirmation"/> endpoint.
/// </summary>
/// <param name="Email">The email address to resend the confirmation link to.</param>
public record ResendConfirmationRequest([Required(ErrorMessage = "E-pasta adrese ir obligāta."), EmailAddress(ErrorMessage = "E-pasta adrese nav derīga.")] string Email);

/// <summary>
/// The response body for a resend-confirmation request.
/// This DTO is returned by the <see cref="AuthController.ResendConfirmation"/> endpoint. It
/// always carries the same generic message regardless of whether the account exists or is
/// already confirmed, so the endpoint can't be used to enumerate registered email addresses.
/// </summary>
/// <param name="Message">The generic confirmation message.</param>
public record ResendConfirmationResponse(string Message);
