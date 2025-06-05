using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRScanLunaAPI.Data;
using QRScanLunaAPI.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Processing;
using System.Security.Cryptography;

namespace QRScanLunaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AutoUploadImageController : ControllerBase
    {

        private readonly AppDbContext _context;
        private readonly string _uploadDirectory;



        public AutoUploadImageController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _uploadDirectory = configuration["UploadSettings:UploadPath"] ?? "uploads";

            if (!Directory.Exists(_uploadDirectory))
                Directory.CreateDirectory(_uploadDirectory);
        }


        



        [HttpPost("upload")]
        public IActionResult UploadImage(IFormFile file, [FromBody] TbImage ImageModel)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // สร้าง Hash จากภาพ
            string imageHash = ComputeImageHash(file);

            // ตรวจสอบว่าภาพมีอยู่แล้วหรือไม่
            if (_context.TbImages.Any(img => img.ImageHash == imageHash))
                return Conflict("Image already exists.");

            // อ่านภาพเข้า MemoryStream
            using var memoryStream = new MemoryStream();
            file.CopyTo(memoryStream);
            memoryStream.Seek(0, SeekOrigin.Begin);

            using var image = Image.Load(memoryStream);
            image.Mutate(x => x.Resize((int)(image.Width * 0.7), (int)(image.Height * 0.7)));

            // กำหนดชื่อไฟล์และบันทึก
            string fileExtension = Path.GetExtension(file.FileName).ToLower();
            string fileName = $"{Guid.NewGuid()}{fileExtension}";
            string filePath = Path.Combine(_uploadDirectory, fileName);

            using var outputStream = new FileStream(filePath, FileMode.Create);

            // ตรวจสอบประเภทไฟล์เพื่อเลือก Encoder
            if (fileExtension == ".jpg" || fileExtension == ".jpeg")
                image.Save(outputStream, new JpegEncoder { Quality = 70 });
            else
                image.Save(outputStream, new PngEncoder());

            // บันทึกข้อมูลลงฐานข้อมูล
            var newImage = new TbImage
            {
                ProjectId = ImageModel.ProjectId,
                ImageName = fileName,
                ImagePath = filePath,
                ImageHash = imageHash,
                UploadDate = DateTime.Now,
                FileSizeBytes = file.Length,
                ContentType = file.ContentType
            };

            _context.TbImages.Add(newImage);
            _context.SaveChanges();

            return Ok(new { message = "Image uploaded successfully.", fileName });
        }



        private string ComputeImageHash(IFormFile file)
        {
            using var sha256 = SHA256.Create();
            using var stream = file.OpenReadStream();
            byte[] hashBytes = sha256.ComputeHash(stream);
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        }




    }
}
