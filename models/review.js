'use strict';
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    reviewId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    text: DataTypes.STRING,
    rating: DataTypes.INTEGER
  }, {});
  
  Review.associate = function(models) {
    // associations can be defined here
    Review.belongsTo(models.User, { foreignKey: 'UserId', as: 'user' });
    Review.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
  };
  
  return Review;
};