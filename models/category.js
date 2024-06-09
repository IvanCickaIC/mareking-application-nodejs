'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    categoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    categoryName: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});

  Category.associate = function(models) {
    Category.hasMany(models.Product, { foreignKey: 'categoryId', as: 'products' });
  };

  return Category;
};