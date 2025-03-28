using AppointEase.API.Auth;
using AppointEase.API.DTOs;
using AppointEase.API.Models;
using AppointEase.API.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppointEase.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProvidersController : ControllerBase
    {
        private readonly IProviderRepository _providerRepository;
        private readonly IUserRepository _userRepository;

        public ProvidersController(IProviderRepository providerRepository, IUserRepository userRepository)
        {
            _providerRepository = providerRepository;
            _userRepository = userRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Provider>>> GetAll()
        {
            var providers = await _providerRepository.GetAllAsync();
            return Ok(providers);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Provider>> GetById(int id)
        {
            var provider = await _providerRepository.GetByIdAsync(id);
            if (provider == null)
                return NotFound();

            return Ok(provider);
        }

        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<Provider>>> GetByCategory(string category)
        {
            if (!System.Enum.TryParse<ServiceCategory>(category, true, out var serviceCategory))
                return BadRequest("Invalid service category");

            var providers = await _providerRepository.GetByCategoryAsync(serviceCategory);
            return Ok(providers);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<Provider>> GetByUserId(int userId)
        {
            var provider = await _providerRepository.GetByUserIdAsync(userId);
            if (provider == null)
                return NotFound();

            return Ok(provider);
        }

        [HttpPost]
        [Authorize(UserRole.Admin)]
        public async Task<ActionResult<Provider>> Create(Provider provider)
        {
            // Verify that the user exists and is a provider
            var user = await _userRepository.GetByIdAsync(provider.UserId);
            if (user == null)
                return BadRequest("User not found");

            if (user.Role != UserRole.Provider)
                return BadRequest("User is not a provider");

            // Check if provider already exists for this user
            var existingProvider = await _providerRepository.GetByUserIdAsync(provider.UserId);
            if (existingProvider != null)
                return BadRequest("Provider already exists for this user");

            var createdProvider = await _providerRepository.CreateAsync(provider);
            return CreatedAtAction(nameof(GetById), new { id = createdProvider.Id }, createdProvider);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<Provider>> Update(int id, Provider provider)
        {
            var existingProvider = await _providerRepository.GetByIdAsync(id);
            if (existingProvider == null)
                return NotFound();

            // Check if user has permission to update this provider
            var currentUser = (User)HttpContext.Items["User"];
            var userProvider = await _providerRepository.GetByUserIdAsync(currentUser.Id);

            if (currentUser.Role != UserRole.Admin && (userProvider == null || userProvider.Id != id))
                return Forbid();

            // Only admins can update certain fields
            if (currentUser.Role != UserRole.Admin)
            {
                provider.UserId = existingProvider.UserId;
                provider.IsVerified = existingProvider.IsVerified;
            }

            var updatedProvider = await _providerRepository.UpdateAsync(id, provider);
            return Ok(updatedProvider);
        }

        [HttpPatch("{id}/verify")]
        [Authorize(UserRole.Admin)]
        public async Task<ActionResult> VerifyProvider(int id, [FromBody] bool isVerified)
        {
            var provider = await _providerRepository.GetByIdAsync(id);
            if (provider == null)
                return NotFound();

            await _providerRepository.VerifyProviderAsync(id, isVerified);
            return NoContent();
        }
    }
}