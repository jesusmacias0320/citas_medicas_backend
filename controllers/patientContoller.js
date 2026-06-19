const User = require('../models/User');


const registerPatient = async (req, res) => {
    const { nombre, email, password,} = req.body;
    
    try{
        const newPatient = await User.create({
            nombre,
            email,
            password,
            rol: 'paciente'
        });

        res.status(201).json({
            message: 'Paciente registrado exitosamente',
            user: { id: newPatient.id, nombre: newPatient.nombre, email: newPatient.email }
        });

    }catch(err){
        console.error('Error al registrar el paciente: ', err);
        res.status(500).json({error: 'Hubo un error al registrar al paciente en el sistema. '});
    }
};

module.exports = { registerPatient };