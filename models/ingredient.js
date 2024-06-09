'use strict';
module.exports = (sequelize, DataTypes) => {
  const Ingredient = sequelize.define('Ingredient', {
    ingredientId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ingredientName: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});

  Ingredient.associate = function(models) {
    Ingredient.belongsToMany(models.Product, {
      through: 'ProductIngredients',
      foreignKey: 'ingredientId',
      otherKey: 'productId',
      as: 'products'
    });
  };

  return Ingredient;
};
