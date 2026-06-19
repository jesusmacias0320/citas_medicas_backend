const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
    especialidad: {
        type: DataTypes.STRING,
        allowNull: false
    },
    registro_medico: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    }
});

module.exports = Doctor;