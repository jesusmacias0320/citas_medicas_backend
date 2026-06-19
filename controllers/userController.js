const User = require("../models/User");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const newUser = await User.create({ nombre, email, password, rol });

    res.status(201).json({
      message: "Usuario registradi exitosamente",
      user: {
        id: newUser.id,
        email: newUser.email,
        password: newUser.password,
      },
    });
  } catch (err) {
    console.error("Error al registrar: ", err);
    res.status(500).json({ error: "Hubo un error al registrar el usuario" });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Verificación de correo existente
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JW_SECRET || "firma_secreta_de_respaldo",
      { expiresIn: "1d" }, //El token caducara en 1 día
    );

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
      token,
    });
  } catch (err) {
    console.error("Error en login", err);
    res.status(500).json({ error: "Hubo un error al iniciar sesión" });
  }
};

module.exports = { createUser, loginUser };
