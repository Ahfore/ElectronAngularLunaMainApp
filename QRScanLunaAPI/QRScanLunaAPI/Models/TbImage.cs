using System;
using System.Collections.Generic;

namespace QRScanLunaAPI.Models;

public partial class TbImage
{
    public int ImageId { get; set; }

    public int? ProjectId { get; set; }

    public string? ImageName { get; set; }

    public string? ImagePath { get; set; }

    public string? ImageHash { get; set; }

    public DateTime? UploadDate { get; set; }

    public long? FileSizeBytes { get; set; }

    public string? ContentType { get; set; }
}
