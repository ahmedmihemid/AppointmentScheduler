using AppointEase.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppointEase.API.Repositories
{
    public interface IProviderRepository
    {
        Task<Provider> GetByIdAsync(int id);
        Task<Provider> GetByUserIdAsync(int userId);
        Task<IEnumerable<Provider>> GetAllAsync();
        Task<IEnumerable<Provider>> GetByCategoryAsync(ServiceCategory category);
        Task<Provider> CreateAsync(Provider provider);
        Task<Provider> UpdateAsync(int id, Provider provider);
        Task<bool> VerifyProviderAsync(int id, bool isVerified);
    }
}