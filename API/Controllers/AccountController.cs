using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {

        private readonly DataContext _dataContext;
        private readonly IMapper _mapper;
        private readonly ITokenService _tokenService;

        public AccountController(DataContext dataContext, ITokenService tokenService, IMapper mapper)
        {
            this._dataContext = dataContext;
            this._mapper = mapper;
            this._tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto request)
        {
            if (await this.UserExists(request.UserName))
                return BadRequest("UserName is taken.");

            var newUser = this._mapper.Map<AppUser>(request);

            using var hmac = new HMACSHA512();

            newUser.UserName = request.UserName.ToLower();
            newUser.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.Password));
            newUser.PasswordSalt = hmac.Key;

            await this._dataContext.AppUsers.AddAsync(newUser);
            await this._dataContext.SaveChangesAsync();

            return new UserDto
            {
                UserName = newUser.UserName,
                Token = this._tokenService.CreateToken(newUser),
                KnownAs = newUser.KnownAs
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
                PhotoUrl = user.Photos.FirstOrDefault(p => p.IsMain)?.Url,
                KnownAs = user.KnownAs
            };
        }

        private async Task<bool> UserExists(string userName)
        {
            return await this._dataContext.AppUsers
                .AnyAsync(u => u.UserName.Equals(userName.ToLower()));
        }

    }
}