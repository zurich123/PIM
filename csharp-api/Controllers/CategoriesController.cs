using Microsoft.AspNetCore.Mvc;
using ProductFlow.Api.DTOs;
using ProductFlow.Api.Services;

namespace ProductFlow.Api.Controllers
{
    [ApiController]
    [Route("api/external/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        /// <summary>
        /// Get all categories
        /// </summary>
        /// <returns>List of categories</returns>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<CategoryDto>>>> GetCategories()
        {
            try
            {
                var categories = await _categoryService.GetCategoriesAsync();
                var categoryList = categories.ToList();

                return Ok(new ApiResponse<IEnumerable<CategoryDto>>
                {
                    Success = true,
                    Data = categoryList,
                    Count = categoryList.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<IEnumerable<CategoryDto>>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Get a category by ID
        /// </summary>
        /// <param name="id">Category ID</param>
        /// <returns>Category details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategory(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(id);
                if (category == null)
                {
                    return NotFound(new ApiResponse<CategoryDto>
                    {
                        Success = false,
                        Message = "Category not found"
                    });
                }

                return Ok(new ApiResponse<CategoryDto>
                {
                    Success = true,
                    Data = category
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<CategoryDto>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Create a new category
        /// </summary>
        /// <param name="createDto">Category creation data</param>
        /// <returns>Created category</returns>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory([FromBody] CreateCategoryDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<CategoryDto>
                    {
                        Success = false,
                        Message = "Invalid input data"
                    });
                }

                var category = await _categoryService.CreateCategoryAsync(createDto);

                return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, new ApiResponse<CategoryDto>
                {
                    Success = true,
                    Data = category,
                    Message = "Category created successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<CategoryDto>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Update an existing category
        /// </summary>
        /// <param name="id">Category ID</param>
        /// <param name="updateDto">Category update data</param>
        /// <returns>Updated category</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> UpdateCategory(int id, [FromBody] UpdateCategoryDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<CategoryDto>
                    {
                        Success = false,
                        Message = "Invalid input data"
                    });
                }

                var category = await _categoryService.UpdateCategoryAsync(id, updateDto);
                if (category == null)
                {
                    return NotFound(new ApiResponse<CategoryDto>
                    {
                        Success = false,
                        Message = "Category not found"
                    });
                }

                return Ok(new ApiResponse<CategoryDto>
                {
                    Success = true,
                    Data = category,
                    Message = "Category updated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<CategoryDto>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Delete a category
        /// </summary>
        /// <param name="id">Category ID</param>
        /// <returns>Deletion result</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteCategory(int id)
        {
            try
        {
                var deleted = await _categoryService.DeleteCategoryAsync(id);
                if (!deleted)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Category not found"
                    });
                }

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Category deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }
    }
}