const User = require('../models/User');
const Doctor = require('../models/Doctor');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const registerDoctor = async (req, res) => {
    const { nombre, email, password, especialidad, registro_medico } = req.body;

    const t = await sequelize.transaction();

    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            nombre,
            email,
            password: hashedPassword, 
            rol: 'medico'
        }, {transaction: t });

        
        const newDoctor = await Doctor.create({
            user_id: newUser.id,
            especialidad,
            registro_medico
        }, {transaction: t });

        await t.commit();

        res.status(201).json({
            message: 'Medico registrado exitosamente',
            doctor : { id: newUser.id, 
                nombre: newUser.nombre, 
                email: newUser.email,
                especialidad: newDoctor.especialidad, 
                registro_medico: newDoctor.registro_medico }
        });

    }catch(err){
        await t.rollback();
        console.error('Error al registrar el medico: ', err);
        res.status(500).json({error: 'Hubo un error al registrar al médico en el sistema. '});
    }
};

const getActiveDoctors = async(req, res) => {
    try{
        const medicos = await Doctor.findAll({
            include: [
                {
                    model: User,
                    attributes: ['nombre'] 
                }
            ],
            attributes: ['id','especialidad','user_id']
        });
        res.status(200).json(medicos);
    }catch(error){
        console.error("Error al obtener la lista de médicos", error);
        res.status(500).json({error: "Hubo un error al intentar cargar los médicos."});
    }
};

module.exports = { registerDoctor, getActiveDoctors };