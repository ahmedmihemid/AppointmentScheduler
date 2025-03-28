using AppointEase.API.DTOs;
using AppointEase.API.Models;
using AppointEase.API.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace AppointEase.API.Auth
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IProviderRepository _providerRepository;
        private readonly IConfiguration _configuration;

        public AuthService(
            IUserRepository userRepository,
            IProviderRepository providerRepository,
            IConfiguration configuration)
        {
            _userRepository = userRepository;
            _providerRepository = providerRepository;
            _configuration = configuration;
        }

        public async Task<AuthResponseDTO> Register(RegisterDTO registerDto)
        {
            // Check if username already exists
            if (await _userRepository.GetByUsernameAsync(registerDto.Username) != null)
            {
                throw new Exception("Username already exists");
            }

            // Hash the password
            string passwordHash = HashPassword(registerDto.Password);

            // Create new user
            var newUser = new User
            {
                Username = registerDto.Username,
                Password = passwordHash,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                Phone = registerDto.Phone,
                City = registerDto.City,
                Role = (UserRole)Enum.Parse(typeof(UserRole), registerDto.Role),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var createdUser = await _userRepository.CreateAsync(newUser);
            
            // If the user is a provider, create a provider profile
            if (createdUser.Role == UserRole.Provider)
            {
                await _providerRepository.CreateAsync(new Provider
                {
                    UserId = createdUser.Id,
                    CompanyName = $"{createdUser.FirstName}'s Company", // Default name, they can update later
                    Category = ServiceCategory.Healthcare, // Default category, they can update later
                    IsVerified = false
                });
            }

            // Generate JWT token
            string token = GenerateJwtToken(createdUser);

            // Return response
            return new AuthResponseDTO
            {
                Id = createdUser.Id,
                Username = createdUser.Username,
                FirstName = createdUser.FirstName,
                LastName = createdUser.LastName,
                Email = createdUser.Email,
                Role = createdUser.Role.ToString(),
                Token = token
            };
        }

        public async Task<AuthResponseDTO> Login(LoginDTO loginDto)
        {
            // Get user by username
            var user = await _userRepository.GetByUsernameAsync(loginDto.Username);
            if (user == null)
            {
                throw new Exception("Invalid username or password");
            }

            // Verify password
            if (!VerifyPassword(loginDto.Password, user.Password))
            {
                throw new Exception("Invalid username or password");
            }

            // Generate JWT token
            string token = GenerateJwtToken(user);

            // Return response
            return new AuthResponseDTO
            {
                Id = user.Id,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role.ToString(),
                Token = token
            };
        }

        public string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Name, user.Username),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7), // Token valid for 7 days
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string HashPassword(string password)
        {
            byte[] salt;
            new RNGCryptoServiceProvider().GetBytes(salt = new byte[16]);

            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000);
            byte[] hash = pbkdf2.GetBytes(20);

            byte[] hashBytes = new byte[36];
            Array.Copy(salt, 0, hashBytes, 0, 16);
            Array.Copy(hash, 0, hashBytes, 16, 20);

            return Convert.ToBase64String(hashBytes);
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            byte[] hashBytes = Convert.FromBase64String(hashedPassword);
            
            byte[] salt = new byte[16];
            Array.Copy(hashBytes, 0, salt, 0, 16);
            
            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000);
            byte[] hash = pbkdf2.GetBytes(20);
            
            for (int i = 0; i < 20; i++)
            {
                if (hashBytes[i + 16] != hash[i])
                {
                    return false;
                }
            }
            
            return true;
        }
    }
}