const User = require("../models/User");
const crypto = require("crypto");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ error: "No existe un usuario con este correo." });
    }

    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // Expira en 1 hora
    await user.save();

    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendURL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "constance.hoeger66@ethereal.email",
        pass: "nwP11fhgfQE833DGgQ",
      },
    });

    const mailOptions = {
      from: '"Soporte Técnico" <soporte@clinicamvp.com>',
      to: email,
      subject: "Recuperación de Contraseña",
      text: `Hola,\n\nHaz clic en el siguiente enlace para restablecer tu contraseña:\n${resetLink}\n\nSi no solicitaste esto, ignora este correo.`,
    };

    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Correo simulado enviado a Ethereal.");
        console.log(
          "Puedes ver el correo aquí:",
          nodemailer.getTestMessageUrl(info),
        );
        console.log("Enlace de recuperación:", resetLink);
      })
      .catch((err) =>
        console.error("Error al enviar correo de recuperación:", err.message),
      );

    res.status(200).json({
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
        resetPasswordExpires: { [Op.gt]: new Date() }, // Mayor a la fecha actual
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
