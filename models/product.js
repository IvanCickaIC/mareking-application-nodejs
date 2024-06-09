'use strict';
module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
      productId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      productName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false
      },
      pictureUrl: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {});
  
    Product.associate = function(models) {
      Product.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' }); 
      Product.hasMany(models.Review, { foreignKey: 'productId', as: 'reviews' });
      Product.belongsToMany(models.Ingredient, {
        through: 'ProductIngredients',
        foreignKey: 'productId',
        otherKey: 'ingredientId',
        as: 'ingredients'
      });
    };
  
    return Product;
  };