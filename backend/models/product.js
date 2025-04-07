// backend/models/product.js
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  }, {
    timestamps: true // Adds createdAt and updatedAt
  });

  return Product;
};
