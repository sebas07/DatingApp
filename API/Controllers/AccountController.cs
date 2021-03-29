using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {

        private readonly DataContext _dataContext;
        private readonly ITokenService _tokenService;

        public AccountController(DataContext dataContext, ITokenService tokenService)
        {
            this._tokenService = tokenService;
            this._dataContext = dataContext;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto request)
        {
            if (await this.UserExists(request.UserName))
                return BadRequest("UserName is taken.");

            using var hmac = new HMACSHA512();

            var newUser = new AppUser
            {
                UserName = request.UserName.ToLower(),
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.Password)),
                PasswordSalt = hmac.Key
            };

            await this._dataContext.AppUsers.AddAsync(newUser);
            await this._dataContext.SaveChangesAsync();

            return new UserDto
            {
                UserName = newUser.UserName,
                Token = this._tokenService.CreateToken(newUser)
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto request)
        {
            AppUser user = await this._dataContext.AppUsers.Include(u => u.Photos)
                .FirstOrDefaultAsync(u => u.UserName.Equals(request.UserName.ToLower()));
            if (user == null)
                return Unauthorized("Invalid UserName");

            using var hmac = new HMACSHA512(user.PasswordSalt);
            byte[] compHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.Password));
            for (int i = 0; i < compHash.Length; i++)
            {
                if (compHash[i] != user.PasswordHash[i])
                    return Unauthorized("Invalid Password");
            }

            return new UserDto
            {
                UserName = user.UserName,
                Token = this._tokenService.CreateToken(user),
                PhotoUrl = user.Photos.FirstOrDefault(p => p.IsMain)?.Url
            };
        }

        private async Task<bool> UserExists(string userName)
        {
            return await this._dataContext.AppUsers
                .AnyAsync(u => u.UserName.Equals(userName.ToLower()));
        }

    }
}