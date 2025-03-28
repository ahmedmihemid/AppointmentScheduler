using AppointEase.API.DTOs;
using AppointEase.API.Models;
using System.Threading.Tasks;

namespace AppointEase.API.Auth
{
    public interface IAuthService
    {
        Task<AuthResponseDTO> Register(RegisterDTO registerDto);
        Task<AuthResponseDTO> Login(LoginDTO loginDto);
        string GenerateJwtToken(User user);
        bool VerifyPassword(string password, string hashedPassword);
        string HashPassword(string password);
    }
}