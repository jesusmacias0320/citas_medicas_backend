const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false

    },
    hora:{
        type: DataTypes.TIME,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'confirmada','completada', 'cancelada'),
        defaultValue: 'pendiente'
    }
});

module.exports = Appointment;