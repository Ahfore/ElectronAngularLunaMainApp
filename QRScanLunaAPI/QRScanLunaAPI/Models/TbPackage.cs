using System;
using System.Collections.Generic;

namespace QRScanLunaAPI.Models;

public partial class TbPackage
{
    public int Id { get; set; }

    public string? PackageName { get; set; }

    public float? PackagePrice { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? ExpireDate { get; set; }
}
