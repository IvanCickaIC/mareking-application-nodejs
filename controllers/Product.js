const { Product, Ingredient, ProductIngredients } = require('../models')
require('dotenv').config();
const path = require('path');


async function createProduct(req, res) {
    try {
        const { productId, productName, price, description, pictureUrl, categoryId , selectedIngredients } = req.body;
        
        
        // Handle file upload to Mega
        let pictureLink = pictureUrl; // Default to the provided URL
        if (req.file) {
            console.log('File detected, saving to local uploads folder...');
            console.log('req.file:', req.file);

            pictureLink = `/uploads/${req.file.originalname}`; // Save the file path for use in the product
            console.log('Uploaded file, link:', pictureLink);
        }

        let product;
        if (!productId) {

             // Provjera postojanja proizvoda s istim imenom
            const existingProduct = await Product.findOne({ where: { productName: productName } });
            if (existingProduct) {
                return res.status(400).json({ success: false, message: 'Proizvod s istim imenom već postoji.' });
            }

            // Create new product if productId is not provided
            const product = await Product.create({
                productName,
                price,
                description,
                pictureUrl : pictureLink,
                categoryId
            });
            
            if (selectedIngredients && selectedIngredients.length > 0) {
                // Handle ingredients
                const ingredients = await Promise.all(selectedIngredients.map(async ({name,amount}) => {
                    console.log(`Processing ingredient: ${name} with amount: ${amount}`);
                    let ingredient = await Ingredient.findOne({ where: { ingredientName :name } });
                    if (!ingredient) {
                        ingredient = await Ingredient.create({ ingredientName: name });
                    }
                    console.log(`Found or created ingredient: ${ingredient.ingredientName} with ID: ${ingredient.ingredientId}`);
                    return {ingredient, amount:amount || 0};
                }));

                 // Set associations with a default amount
                 await Promise.all(ingredients.map(async ({ingredient,amount}) => {
                    console.log(`Creating ProductIngredients with productId: ${product.productId}, ingredientId: ${ingredient.ingredientId}, amount: ${amount}`);
                    await ProductIngredients.create({
                        productId: product.productId,
                        ingredientId: ingredient.ingredientId,
                        amount: amount 
                    });
                }));

                // Set associations
                // await product.setIngredients(ingredients);
            }

            return res.status(201).json({ success: true, message: 'Product created and associated with ingredients successfully', product });

        } else {
             // Pronađi proizvod sa istim imenom
            const existingProductByName = await Product.findOne({ where: { productName } });

            if (existingProductByName && existingProductByName.productId !== parseInt(productId, 10)) {
                // Ako proizvod sa istim imenom postoji i ID se ne poklapa, vrati grešku
                return res.status(400).json({ success: false, message: 'Proizvod s istim imenom već postoji.' });
            }



             // Find and update the existing product
            const existingProduct = await Product.findByPk(productId);
            if (existingProduct) {
                await existingProduct.update({
                    productName,
                    price,
                    description,
                    pictureUrl : pictureLink,
                    categoryId
                });

                if (selectedIngredients && selectedIngredients.length > 0) {
                    // Handle ingredients
                    const ingredients = await Promise.all(selectedIngredients.map(async ({ name, amount }) => {
                        console.log(`Processing ingredient: ${name} with amount: ${amount}`);
                        let ingredient = await Ingredient.findOne({ where: { ingredientName: name } });
                        if (!ingredient) {
                            ingredient = await Ingredient.create({ ingredientName: name });
                        }
                        console.log(`Found or created ingredient: ${ingredient.ingredientName} with ID: ${ingredient.ingredientId}`);
                        return { ingredient, amount: amount || 0 };
                    }));
            
                    // Update or create ProductIngredients entries
                    await Promise.all(ingredients.map(async ({ ingredient, amount }) => {
                        console.log(`Updating ProductIngredients with productId: ${existingProduct.productId}, ingredientId: ${ingredient.ingredientId}, amount: ${amount}`);
                        
                        // Find the existing ProductIngredients entry
                        let productIngredient = await ProductIngredients.findOne({
                            where: {
                                productId: existingProduct.productId,
                                ingredientId: ingredient.ingredientId
                            }
                        });
                        if (productIngredient) {
                            // Update the existing entry
                            await productIngredient.update({ amount: amount });
                        } else {
                            // If not found, create a new entry (optional, if you want to handle missing associations)
                            await ProductIngredients.create({
                                productId: existingProduct.productId,
                                ingredientId: ingredient.ingredientId,
                                amount: amount
                            });
                        }
                    }));
                    
                }
                return res.status(200).json({success: true , message: 'Product updated successfully', product: existingProduct });
            } else {
                return res.status(404).json({ message: 'Product not found' });
            }
        }
    } catch (error) {
        console.error('Error creating product:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}


async function deleteProduct(req, res) {
    try {
        const { id: productId } = req.params;
        
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required for deletion' });
        }
        
        // Find the existing product
        const existingProduct = await Product.findByPk(productId);
        if (existingProduct) {
            const pictureUrl = existingProduct.pictureUrl;
            const imagePath = path.join(__dirname, '..', pictureUrl);

            // Delete the product record from the database
            await existingProduct.destroy();

            // Delete the image file from the filesystem
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error deleting image file:', err);
                } else {
                    console.log('Image file deleted successfully:', imagePath);
                }
            });

            return res.status(200).json({ success: true, message: 'Product and image deleted successfully' });
        } else {
            return res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}

module.exports = {createProduct,deleteProduct};
