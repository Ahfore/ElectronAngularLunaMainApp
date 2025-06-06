using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting.Internal;
using QRScanLunaAPI.Data;
using QRScanLunaAPI.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Processing;
using System.IO;
using System.Security.Cryptography;

namespace QRScanLunaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AutoUploadImageController : ControllerBase
    {

        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly IConfiguration _config;
        private readonly IHubContext<ImageHub> _hubContext;
        private static readonly SemaphoreSlim _semaphore = new SemaphoreSlim(Environment.ProcessorCount * 2);

        public AutoUploadImageController(AppDbContext context, IWebHostEnvironment hostingEnvironment, IConfiguration config, IHubContext<ImageHub> hubContext)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _config = config;
            _hubContext = hubContext;

        }



        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage([FromBody] TbImage ImageModel)
        {
            await _semaphore.WaitAsync();
            try
            {
                if (string.IsNullOrEmpty(ImageModel.ImageJsonstring))
                    return BadRequest("Invalid image data");

                string base64Data = ImageModel.ImageJsonstring.Split(",")[1];
                byte[] imgByte = Convert.FromBase64String(base64Data);

                imgByte = ResizeImage(imgByte, 2); // 2 คือ 2 ล้าน pixel

                // สร้าง Image Hash
                string imageHash = ComputeImageHash(imgByte);

                // ตรวจสอบว่ามีภาพนี้อยู่ในฐานข้อมูลหรือไม่
                bool isDuplicate = await _context.TbImages.AnyAsync(img => img.ImageHash == imageHash && img.ProjectId == ImageModel.ProjectId);
                if (isDuplicate)
                    return Conflict(new { message = "Duplicate image detected" });

                string fileName = Guid.NewGuid().ToString("N").Substring(0, 16) + ".jpg";
                string path = Path.Combine(_config["UploadPath"], "LUNAQRSCAN", ImageModel.ProjectId.ToString());

                if (!Directory.Exists(path))
                {
                    Directory.CreateDirectory(path);
                }

                string imgPath = Path.Combine(path, fileName);
                using (var imageFile = new FileStream(imgPath, FileMode.Create))
                {
                    imageFile.Write(imgByte, 0, imgByte.Length);
                    imageFile.Flush();
                }

                ImageModel.ImageHash = imageHash;
                ImageModel.ImagePath = path;
                ImageModel.ContentType = ExtractContentType(ImageModel.ImageJsonstring);
                ImageModel.ImageName = fileName;
                ImageModel.UploadDate = DateTime.Now;
                ImageModel.ImageJsonstring = null;

                await _context.TbImages.AddAsync(ImageModel);
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.SendAsync("ImageAdded", ImageModel);
                return Ok(new { message = "OK" });

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            finally
            {
                _semaphore.Release();
            }
        }

        private byte[] ResizeImage(byte[] imageData, int targetMegapixels = 2)
        {
            using (var ms = new MemoryStream(imageData))
            {
                using (var image = Image.Load(ms))
                {
                    // คำนวณขนาดใหม่โดยรักษาอัตราส่วนให้ได้ ~2 ล้านพิกเซล
                    double currentPixels = image.Width * image.Height;
                    double scaleFactor = Math.Sqrt((targetMegapixels * 1000000) / currentPixels);

                    // ถ้าภาพต้นฉบับเล็กกว่าก็ไม่ต้องขยายขนาด
                    if (scaleFactor >= 1.0)
                        return imageData;

                    var newWidth = (int)(image.Width * scaleFactor);
                    var newHeight = (int)(image.Height * scaleFactor);

                    // Resize รูปภาพ
                    image.Mutate(x => x.Resize(newWidth, newHeight));

                    // บันทึกลง MemoryStream และคืนค่าเป็น byte array
                    using (var outputMs = new MemoryStream())
                    {
                        image.Save(outputMs, new JpegEncoder { Quality = 80 });
                        return outputMs.ToArray();
                    }
                }
            }
        }

        // ฟังก์ชันสร้าง SHA-256 Image Hash
        private string ComputeImageHash(byte[] imageBytes)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] hashBytes = sha256.ComputeHash(imageBytes);
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            }
        }

        public static string? ExtractContentType(string? base64)
        {
            if (string.IsNullOrEmpty(base64))
                return null;

            var match = System.Text.RegularExpressions.Regex.Match(base64, @"^data:(?<type>.+?);base64,");
            return match.Success ? match.Groups["type"].Value : null;
        }

    }







}
