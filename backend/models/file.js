module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
      originalName: { type: DataTypes.STRING, allowNull: false },
      storedName: { type: DataTypes.STRING, allowNull: false },
      filePath: { type: DataTypes.STRING, allowNull: false },
      year: { type: DataTypes.INTEGER, allowNull: false },
      companyCode: { type: DataTypes.STRING, allowNull: false },
      assemblyCode: { type: DataTypes.STRING, allowNull: false },
      extraCode: { type: DataTypes.STRING, allowNull: false }
    });
  
    return File;
  };
  