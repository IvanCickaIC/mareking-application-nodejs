'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductIngredients extends Model {
    static associate(models) {
      
      ProductIngredients.belongsTo(models.Product, {
        foreignKey: 'productId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      ProductIngredients.belongsTo(models.Ingredient, {
        foreignKey: 'ingredientId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  ProductIngredients.init({
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Product',
        key: 'productId'
      }
    },
    ingredientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Ingredient',
        key: 'ingredientId'
      }
    },
    amount: {
      type: DataTypes.STRING, 
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ProductIngredients',
    timestamps: true
  });
  return ProductIngredients;
};
