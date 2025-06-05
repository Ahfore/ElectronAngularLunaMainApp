using System;
using System.Collections.Generic;

namespace QRScanLunaAPI.Models;

public partial class TbExtendedPackage
{
    public int Id { get; set; }

    public string? ExtendedPackageName { get; set; }

    public float? ExtendedPackagePrice { get; set; }

    public int PackageId { get; set; }

    public int? UserId { get; set; }
}
