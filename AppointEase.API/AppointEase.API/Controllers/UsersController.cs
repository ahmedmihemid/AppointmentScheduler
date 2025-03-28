using AppointEase.API.Auth;
using AppointEase.API.Models;
using AppointEase.API.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace AppointEase.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UsersController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetById(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return NotFound();

            // Don't return the password hash
            user.Password = "";
            
            return Ok(user);
        }

        [HttpGet("me")]
        public ActionResult<User> GetCurrentUser()
        {
            // The user is attached to the context in the JwtMiddleware
            var user = (User)HttpContext.Items["User"];
            if (user == null)
                return NotFound();

            // Don't return the password hash
            user.Password = "";
            
            return Ok(user);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<User>> Update(int id, [FromBody] User userUpdate)
        {
            // Get current user from JWT
            var currentUser = (User)HttpContext.Items["User"];
            
            // Only allow users to update their own profile or admins to update any profile
            if (currentUser.Id != id && currentUser.Role != UserRole.Admin)
                return Forbid();

            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return NotFound();

            // Update allowed fields only
            user.FirstName = userUpdate.FirstName;
            user.LastName = userUpdate.LastName;
            user.Email = userUpdate.Email;
            user.Phone = userUpdate.Phone;
            user.City = userUpdate.City;

            // Only admin can change user's active status
            if (currentUser.Role == UserRole.Admin)
            {
                user.IsActive = userUpdate.IsActive;
            }

            var updatedUser = await _userRepository.UpdateAsync(id, user);
            
            // Don't return the password hash
            updatedUser.Password = "";
            
            return Ok(updatedUser);
        }
    }
}