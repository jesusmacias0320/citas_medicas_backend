const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Schedule = sequelize.define('Schedule', {
    dia_semana: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 6
        }
    },
    hora_inicio: { 
        type: DataTypes.TIME,
        allowNull: false
    },
    hora_fin: {
        type: DataTypes.TIME,
        allowNull: false
    }
}, {
    validate: {
        verificarTiempos() {
            if (this.hora_inicio >= this.hora_fin) {
                throw new Error('La hora de inicio debe ser estrictamente anterior a la hora de finalización');
            }
        }
    }
}
);

module.exports = Schedule;
