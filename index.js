const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');
const app = express();

//Middleware
// //Permiso para el frontend
app.use(cors());
app.use(express.json());

//Importar models
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Schedule = require('./models/Schedule');


const doctorRoutes = require('./routes/doctorRoutes');
app.use('/api/doctors', doctorRoutes);

const patientsRoutes = require('./routes/patientsRoutes');
app.use('/api/patients', patientsRoutes);

const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/appointments', appointmentRoutes);

const scheduleRoutes = require('./routes/scheduleRoutes');
app.use('/api/schedules', scheduleRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);



User.hasOne(Doctor, {foreignKey: 'user_id'});
Doctor.belongsTo(User, {foreignKey: 'user_id'});

User.hasMany(Appointment, {foreignKey: 'patient_id'});
Appointment.belongsTo(User, {as: 'Paciente', foreignKey: 'patient_id'});

Doctor.hasMany(Appointment, {foreignKey: 'doctor_id'});
Appointment.belongsTo(Doctor, {foreignKey: 'doctor_id'});

Doctor.hasMany(Schedule, {foreignKey: 'doctor_id'});
Schedule.belongsTo(Doctor,{foreignKey: 'doctor_id'});


const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try{
        //Autentica la conexión
        await sequelize.authenticate();
        console.log('Conexión a PostgresSQL establecida con exito');

        //Sincroniza a los modelos 
        await sequelize.sync({ alter: true });
        console.log('Modelos sincronizados.');

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    }catch (err){
        console.error('No se pudo conectar a la base de datos:', err);
    }
};

startServer();