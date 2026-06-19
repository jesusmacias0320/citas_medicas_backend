const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  //Buscar token
  let token = req.headers.authorization;

  
  if (!token) {
    return res
      .status(401)
      .json({ error: "Accesso denegado, No se proporcionó un token " });
  }
  try {
    if (token.startsWith('Bearer')) {
      token = token.slice(7, token.length);
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "firma_secreta_de_respaldo",
    );

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

module.exports = { verifyToken };
