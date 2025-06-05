using System;
using System.Collections.Generic;

namespace QRScanLunaAPI.Models;

public partial class TbUser
{
    public int Id { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string Username { get; set; } = null!;

    public string? Password { get; set; }

    public byte[]? PasswordHash { get; set; }

    public byte[]? PasswordSalt { get; set; }

    public int RoleId { get; set; }

    public int PackageId { get; set; }

    public string? PhotographerName { get; set; }

    public string? FacebookName { get; set; }

    public string? FacebookUrl { get; set; }

    public string? InstagramName { get; set; }

    public string? InstagramUrl { get; set; }

    public string? LineId { get; set; }
}
