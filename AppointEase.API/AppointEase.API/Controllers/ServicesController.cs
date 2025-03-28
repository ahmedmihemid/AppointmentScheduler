using AppointEase.API.Auth;
using AppointEase.API.Models;
using AppointEase.API.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppointEase.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IProviderRepository _providerRepository;

        public ServicesController(IServiceRepository serviceRepository, IProviderRepository providerRepository)
        {
            _serviceRepository = serviceRepository;
            _providerRepository = providerRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Service>>> GetAll()
        {
            var services = await _serviceRepository.GetAllAsync();
            return Ok(services);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Service>> GetById(int id)
        {
            var service = await _serviceRepository.GetByIdAsync(id);
            if (service == null)
                return NotFound();

            return Ok(service);
        }

        [HttpGet("provider/{providerId}")]
        public async Task<ActionResult<IEnumerable<Service>>> GetByProvider(int providerId)
        {
            var services = await _serviceRepository.GetByProviderAsync(providerId);
            return Ok(services);
        }

        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<Service>>> GetByCategory(string category)
        {
            if (!System.Enum.TryParse<ServiceCategory>(category, true, out var serviceCategory))
                return BadRequest("Invalid service category");

            var services = await _serviceRepository.GetByCategoryAsync(serviceCategory);
            return Ok(services);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Service>> Create(Service service)
        {
            // Check if user has permission to create this service
            var currentUser = (User)HttpContext.Items["User"];
            var provider = await _providerRepository.GetByUserIdAsync(currentUser.Id);

            // Only provider can create services for their own account, or admin can create for any provider
            if (currentUser.Role == UserRole.Provider && (provider == null || provider.Id != service.ProviderId))
                return Forbid();
            else if (currentUser.Role != UserRole.Provider && currentUser.Role != UserRole.Admin)
                return Forbid();

            var createdService = await _serviceRepository.CreateAsync(service);
            return CreatedAtAction(nameof(GetById), new { id = createdService.Id }, createdService);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<Service>> Update(int id, Service service)
        {
            var existingService = await _serviceRepository.GetByIdAsync(id);
            if (existingService == null)
                return NotFound();

            // Check if user has permission to update this service
            var currentUser = (User)HttpContext.Items["User"];
            var provider = await _providerRepository.GetByUserIdAsync(currentUser.Id);

            // Only provider can update their own services, or admin can update any service
            if (currentUser.Role == UserRole.Provider && (provider == null || provider.Id != existingService.ProviderId))
                return Forbid();
            else if (currentUser.Role != UserRole.Provider && currentUser.Role != UserRole.Admin)
                return Forbid();

            // Ensure ProviderId can't be changed
            service.ProviderId = existingService.ProviderId;
            
            var updatedService = await _serviceRepository.UpdateAsync(id, service);
            return Ok(updatedService);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> Delete(int id)
        {
            var service = await _serviceRepository.GetByIdAsync(id);
            if (service == null)
                return NotFound();

            // Check if user has permission to delete this service
            var currentUser = (User)HttpContext.Items["User"];
            var provider = await _providerRepository.GetByUserIdAsync(currentUser.Id);

            // Only provider can delete their own services, or admin can delete any service
            if (currentUser.Role == UserRole.Provider && (provider == null || provider.Id != service.ProviderId))
                return Forbid();
            else if (currentUser.Role != UserRole.Provider && currentUser.Role != UserRole.Admin)
                return Forbid();

            await _serviceRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}