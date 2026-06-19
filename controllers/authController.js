const User = require("../models/User");
const crypto = require("crypto");
const { Op } = require("sequelize");
const nodemailer = require('nodemailer');


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ error: " No existe un usuario con este correo." });
    }

    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    console.log(`\n=================================================`);
    console.log(`NUEVA SOLICITUD DE RECUPERACIÓN DE CONTRASEÑA`);
    console.log(`Para restablecer tu contraseña, haz clic en este enlace:`);
    console.log(`http://localhost:5173/reset-password/${token}`);
    console.log(`=================================================\n`);

    res
      .status(200)
      .json({
        message: "Se ha enviado un enlace de recuperación a tu correo.",
      });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res.status(500).json({ error: "Hubo un error al procesar la solicitud." });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }, //Mayor a la fecha actual
      },
    });
    if (!user) {
      return res
        .status(400)
        .json({ error: "El enlace es invalido o ha expirado." });
    }

    
    user.password = newPassword;

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res
      .status(200)
      .json({ message: "Tu contraseña ha sido actualizada exitosamente" });
  } catch (error) {
    console.error("Error en resetPassword: ", error);
    res.status(500).json({ error: "Error al actualizar la contraseña." });
  }
};

module.exports = { forgotPassword, resetPassword };
