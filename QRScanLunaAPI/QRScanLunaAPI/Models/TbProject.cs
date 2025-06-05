using System;
using System.Collections.Generic;

namespace QRScanLunaAPI.Models;

public partial class TbProject
{
    public int ProjectId { get; set; }

    public string? ProjectName { get; set; }

    public string? ProjectPath { get; set; }
}
