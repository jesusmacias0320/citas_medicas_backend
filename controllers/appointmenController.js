const { Op } = require("sequelize");
const Appointment = require("../models/Appointment");
const Schedule = require("../models/Schedule");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const nodemailer = require("nodemailer");


const createAppointment = async (req, res) => {
  const { doctor_id, fecha, hora } = req.body;

  const patient_id = req.user.id;

  try {
    const diaSemana = new Date(fecha + "T00:00:00").getDay();


    const workingSchedule = await Schedule.findOne({
      where: {
        doctor_id,
        dia_semana: diaSemana,
        hora_inicio: { [Op.lte]: hora },
        hora_fin: { [Op.gt]: hora },
      },
    });
    if (!workingSchedule) {
      return res.status(400).json({
        error:
          "El médico no tiene turnos disponibles en el horario o día seleccionado.",
      });
    }
    const existingAppointment = await Appointment.findOne({
      where: { doctor_id, fecha, hora },
    });

    if (existingAppointment) {
      return res
        .status(400)
        .json({ error: "El médico ya tiene una cita en ese horario." });
    }

    const newAppointment = await Appointment.create({
      patient_id,
      doctor_id,
      fecha,
      hora,
    });

    res.status(201).json({
      message: "Cita agendada con éxito",
      appointment: newAppointment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hubo al agendar la cita. " });
  }
};

const getDoctorAgenda = async (req, res) => {

  const { doctorId } = req.params;

  try {
    const agenda = await Appointment.findAll({
      where: { doctor_id: doctorId },
      
      include: [
        {
          model: User,
          as: "Paciente",
          attributes: ["nombre", "email"],
        },
      ],
      order: [
        ["fecha", "ASC"], //Ordenados Cronologicamente
        ["hora", "ASC"],
      ],
    });

    res.status(200).json(agenda);
  } catch (err) {
    console.error("Error al obtener la agenda: ", err);
    res
      .status(500)
      .json({ error: "Hubo un error al consultar la agenda del médico." });
  }
};


const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;

  
  const { estado } = req.body;

  
  const estadosPermitidos = [
    "pendiente",
    "confirmada",
    "completada",
    "cancelada",
  ];
  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({
      error:
        "Estado no valido. Los estados permitidos son: pendiente, confirmada, completada o cancelada. ",
    });
  }
  try {

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: "Paciente", attributes: ["nombre", "email"] },
      ],
    });


    if (!appointment) {
      return res
        .status(404)
        .json({ error: "Cita médica no encontrada en el sistema." });
    }

    appointment.estado = estado;
    await appointment.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "constance.hoeger66@ethereal.email",
        pass: "nwP11fhgfQE833DGgQ",
      },
    });

    const mailOptions = {
      from: '"Sistema de Citas Médicas" <notificaciones@clinicamvp.com>',
      to: appointment.Paciente.email,
      subject: `Actualización de tu cita médica: ${estado.toUpperCase()}`,
      text: `Hola ${appointment.Paciente.nombre},\n\nTe informamos que el estado de tu cita médica para el ${appointment.fecha} a las ${appointment.hora} ha cambiado a: ${estado.toUpperCase()}.\n\nSaludos,\nEl equipo de la Clínica.`,
    };

    transporter.sendMail(mailOptions)
      .then(info => {
        console.log("¡Correo enviado! Puedes verlo aquí: ", nodemailer.getTestMessageUrl(info));
      })
      .catch(errorCorreo => {
        console.error("Error al enviar el correo en segundo plano:", errorCorreo.message);
      }); 
    res.status(200).json({ 
      message: "El estado de la cita se ha actualizado correctamente",
      appointment,
      });

  } catch (err) {
    console.error("Error al actualizar el estado:", err);
    res
      .status(500)
      .json({ error: "Hubo un error interno al intentar actualizar la cita." });
  }
};


const getAvailableSlots = async (req, res) => {
  
  const { doctorId, fecha } = req.params;

  try {

    const diaSemana = new Date(fecha + "T00:00:00").getDay();

    
    const schedules = await Schedule.findAll({
      where: { doctor_id: doctorId, dia_semana: diaSemana },
    });

    
    if (schedules.length === 0) {
      return res.status(200).json({
        message: "El médico no tiene turnos asignados para este día.",
        getAvailableSlots: [],
      });
    }
    
    const boockedApointments = await Appointment.findAll({
      where: { doctor_id: doctorId, fecha: fecha },
    });

    
    const occupiedHours = boockedApointments.map((app) => app.hora);

    
    let availableSlots = [];
    const duracionCita = 30; 

    const now = new Date();

    const fechaHoyStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    
    let minutosActuales = 0;
    if(fecha === fechaHoyStr){
      minutosActuales = now.getHours() * 60 + now.getMinutes();
    }
    
    const timeToMinutes = (timeStr) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    
    const minutesToTime = (mins) => {
      const h = String(Math.floor(mins / 60)).padStart(2, "0");
      const m = String(mins % 60).padStart(2, "0");
      return `${h}:${m}:00`;
    };


    schedules.forEach((schedule) => {
      let startMins = timeToMinutes(schedule.hora_inicio);
      let endMins = timeToMinutes(schedule.hora_fin);


      for (
        let time = startMins;
        time + duracionCita <= endMins;
        time += duracionCita
      ) {
        const slot = minutesToTime(time);


        if (!occupiedHours.includes(slot) && time > minutosActuales) {
        availableSlots.push(slot);
    }
      }
    });

    res.status(200).json({
      fecha,
      doctorId,
      total_slots: availableSlots.length,
      availableSlots,
    });
  } catch (err) {
    console.error("Error al calcular disponibilidad: ", err);
    res
      .status(500)
      .json({ error: "Hubo un error interno al calcular los horarios. " });
  }
};


const getMyAppointments = async (req, res) => {
  try {
   
    const patient_id = req.user.id;

    const MyAppointments = await Appointment.findAll({
      where: { patient_id },
      order: [
        ["fecha", "DESC"], 
        ["hora", "DESC"],
      ],
    });


    if (MyAppointments.length === 0) {
      return res.status(200).json({
        message: "No tienes citas agendadas aún.",
        appointments: [],
      });
    }


    res.status(200).json({
      total_citas: MyAppointments.length,
      appointments: MyAppointments,
    });
  } catch (err) {
    console.error("Error al obtener historial del paciente:", err);
    res
      .status(500)
      .json({ error: "Hubo un error al consultar tu historial de citas." });
  }
};


const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });

    if (!doctor) {
      return res
        .status(404)
        .json({ error: "Perfil de médico no encontrado en el sistema." });
    }
    
    const appointments = await Appointment.findAll({
      where: { doctor_id: doctor.id },
      include: [
        {
          model: User,
          as: "Paciente",
          attributes: ["nombre", "email"],
        },
      ],
      order: [["fecha", "ASC"],
      ["hora", "ASC"]],
    });

    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error al obtener las citas del médico: ", error);
    res
      .status(500)
      .json({ error: "Hubo un error al cargar las citas del panel." });
  }
};


const cancelAppointment = async (req, res) => {
  try {
    const citaId = req.params.id;
    const userId = req.user.id; //ID del paciente viene del token


    const appointment = await Appointment.findOne({
      where: { id: citaId, patient_id: userId },
    });

    if (!appointment) {
      return res.status(404).json({ error: "Cita no encontrada." });
    }
    if (appointment.estado !== "pendiente") {
      return res
        .status(400)
        .json({ error: "Solo puedes cancelar citas que esten pendientes " });
    }

    
    appointment.estado = "cancelada";
    await appointment.save();

    res.json({ message: "Cita cancelada con éxito." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor al cancelar la cita" });
  }
};

module.exports = {
  createAppointment,
  getDoctorAgenda,
  updateAppointmentStatus,
  getAvailableSlots,
  getMyAppointments,
  cancelAppointment,
  getDoctorAppointments,
};
