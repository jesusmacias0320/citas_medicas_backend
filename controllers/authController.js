const User = require("../models/User");
const crypto = require("crypto");
const { Op } = require("sequelize");

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
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.save();

   
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendURL}/reset-password/${token}`;

    console.log(`\n=== ENLACE DE RECUPERACIÓN ===`);
    console.log(resetLink);
    console.log(`==============================\n`);

    res.status(200).json({
      message: "Se ha generado el enlace de recuperación. Revisa los logs del servidor.",
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
        resetPasswordExpires: { [Op.gt]: new Date() },
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

    res.status(200).json({ message: "Tu contraseña ha sido actualizada exitosamente" });
  } catch (error) {
    console.error("Error en resetPassword: ", error);
    res.status(500).json({ error: "Error al actualizar la contraseña." });
  }
};

module.exports = { forgotPassword, resetPassword };