const { Ingredient } = require('../models')

async function createIngredient(req, res) {
    try {
        const { ingredientName } = req.body;
        
        if (ingredientName) {
            // Create new product if productId is not provided
            const newIngredient = await Ingredient.create({
                ingredientName,
            });
            return res.status(201).json({ success: true , message: 'ingredient created successfully', ingredient: newIngredient });
        } else {
            return res.status(404).json({ success: false ,message: 'name of ingredient wrong' });
        }
    } catch (error) {
        console.error('Error creating ingredient:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}
async function deleteIngredient(req, res) {
    try {
        // Log the incoming request body
        console.log('Request body:', req.body);

        const { ingredients: ingredientIds } = req.body;

        // Log the extracted ingredient IDs
        console.log('Ingredient IDs to delete:', ingredientIds);

        if (!ingredientIds || !Array.isArray(ingredientIds) || ingredientIds.length === 0) {
            console.log('Validation error: Ingredient IDs are required for deletion');
            return res.status(400).json({ message: 'Ingredient IDs are required for deletion' });
        }

        // Find existing ingredients by their IDs
        const existingIngredients = await Ingredient.findAll({ where: { ingredientId: ingredientIds } });
        
        // Log the existing ingredients found
        console.log('Existing ingredients:', existingIngredients);

        if (existingIngredients.length !== ingredientIds.length) {
            console.log('Error: One or more ingredients not found');
            return res.status(404).json({ message: 'One or more ingredients not found' });
        }

        // Delete ingredients
        await Ingredient.destroy({ where: { ingredientId: ingredientIds } });

        console.log('Ingredients deleted successfully');
        return res.status(200).json({ success: true, message: 'Ingredients deleted successfully' });
    } catch (error) {
        console.error('Error deleting ingredients:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}


module.exports = {createIngredient, deleteIngredient};
