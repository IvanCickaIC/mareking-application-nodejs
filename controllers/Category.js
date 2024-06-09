const { Category } = require('../models')

async function createCategory(req, res) {
    try {
        const { categoryName } = req.body;
        
        if (categoryName) {
            // Create new product if productId is not provided
            const newCategory = await Category.create({
                categoryName,
            });
            return res.status(201).json({ success: true , message: 'Category created successfully', category: newCategory });
        } else {
            return res.status(404).json({ success: false ,message: 'name of category wrong' });
        }
    } catch (error) {
        console.error('Error creating category:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}

async function deleteCategory(req, res) {
    try {
        // Log the incoming request body
        console.log('Request body:', req.body);

        const { categories: categoryIds } = req.body;

        // Log the extracted category IDs
        console.log('Category IDs to delete:', categoryIds);

        if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
            console.log('Validation error: Category IDs are required for deletion');
            return res.status(400).json({ message: 'Category IDs are required for deletion' });
        }

        // Find existing categories by their IDs
        const existingCategories = await Category.findAll({ where: { categoryId: categoryIds } });
        
        // Log the existing categories found
        console.log('Existing categories:', existingCategories);

        if (existingCategories.length !== categoryIds.length) {
            console.log('Error: One or more categories not found');
            return res.status(404).json({ message: 'One or more categories not found' });
        }

        // Delete categories
        await Category.destroy({ where: { categoryId: categoryIds } });

        console.log('Categories deleted successfully');
        return res.status(200).json({ success: true, message: 'Categories deleted successfully' });
    } catch (error) {
        console.error('Error deleting categories:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}


module.exports = {createCategory,deleteCategory};
