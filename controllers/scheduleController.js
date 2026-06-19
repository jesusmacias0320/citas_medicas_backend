const {Op} = require('sequelize');
const Schedule = require('../models/Schedule');

const createSchedule = async (req, res) => {
    const { doctor_id, dia_semana, hora_inicio, hora_fin } = req.body;

    try{
        const overlappingSchedule = await Schedule.findOne({
            where: {
                doctor_id,
                dia_semana,
                hora_inicio: { [Op.lt]: hora_inicio },
                hora_fin: { [Op.lt]: hora_fin }
            }
        });

        if(overlappingSchedule){
            return res.status(400).json({
                error: 'El médico ya tiene un turno laboral registrado que choca con este horario.' 
            });
        }

        const newSchedule = await Schedule.create({
            doctor_id,
            dia_semana,
            hora_inicio,
            hora_fin
        });

        res.status(201).json({
            message: 'Horario laboral registrado exitosamente',
            schedule: newSchedule
        });
    }catch(error){
        console.error('Error al registrar horario: ', error);

        if(error.name === 'SequelizeValidationError') {
            return res.status(400).json({error: error.errors[0].message});
        }

        res.status(500).json({error: 'Hubo un error interno al guardar el horario'});
    }
};

module.exports = { createSchedule };