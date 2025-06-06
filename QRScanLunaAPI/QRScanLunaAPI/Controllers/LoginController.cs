using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QRScanLunaAPI.Data;
using QRScanLunaAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;

namespace QRScanLunaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LoginController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] TbLogin model)
        {
            try
            {
                // Retrieve the user by username
                var user = await _context.TbUsers.FirstOrDefaultAsync(u => u.Username == model.Username);

                if (user == null)
                {
                    return Unauthorized("Invalid username or password.");
                }

                // Verify the password
                if (!VerifyPasswordHash(model.Password, user.PasswordHash, user.PasswordSalt))
                {
                    return Unauthorized("Invalid username or password.");
                }

                // Check if username is not null or empty
                if (string.IsNullOrEmpty(user.Username))
                {
                    return BadRequest("Username cannot be null or empty.");
                }

                var signinKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("jaodjpioaujd90ujoaijscl;kzmvlkxcnvlxcknvoiahdf9ahdioawhjdaoigd98yhd8902qhd890ayhf0oashnfoiashdojamfklnaiodhapogjqaopdhaoidjosdphgnsdiufgbidofghsdiugfaoijfhsoif"));
                var credentials = new SigningCredentials(signinKey, SecurityAlgorithms.HmacSha256);



                var token = new JwtSecurityToken(
                        issuer: "localhost:7214",
                        audience: "localhost:7214",
                        expires: DateTime.Now.AddMinutes(500),
                        signingCredentials: credentials
                        );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
                return Ok(new { Token = tokenString, LoginID = user.Id, TokenExpireDate = DateTime.Now.AddDays(30) });



            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        private bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            using (var hmac = new System.Security.Cryptography.HMACSHA512(storedSalt))
            {
                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));

                // Step 2: Compare the computed hash with the stored hash
                // Ensure both arrays have the same length and content
                if (computedHash.Length != storedHash.Length)
                {
                    return false;
                }

                for (int i = 0; i < computedHash.Length; i++)
                {
                    if (computedHash[i] != storedHash[i])
                    {
                        return false;
                    }
                }
            }

            // Step 3: If all bytes match, return true
            return true;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] TbUser model)
        {
            // Check if the username is already taken
            if (await _context.TbUsers.AnyAsync(u => u.Username == model.Username))
            {
                return Conflict("Username is already taken.");
            }

            // Hash the password
            using var hmac = new HMACSHA512();
            var user = new TbUser // Assuming TbUser is your user entity
            {
                FirstName = model.FirstName,
                LastName = model.LastName,
                Phone = model.Phone,
                PackageId = model.PackageId,
                RoleId = model.RoleId,
                Username = model.Username,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(model.Password)),
                PasswordSalt = hmac.Key,
                Email = model.Email // Optional
            };

            // Save the user to the database
            _context.TbUsers.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Register), new { username = user.Username }, user); // Return 201 Created
        }

    }
}
