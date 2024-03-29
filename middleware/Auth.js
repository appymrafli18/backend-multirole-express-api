import User from '../models/UsersModels.js';
import jwt from 'jsonwebtoken';

export const verifyUser = async (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Please Login First !' });
  const response = await User.findOne({ where: { uuid: req.session.userId } });
  if (!response) return res.status(404).json({ message: 'User Not Found !' });

  // const authHeader = req.headers['authorization'];
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ message: 'Maaf Anda Tidak Dapat Akses Halaman ini ! - VU' });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Hak akses anda sudah kadaluarsa! - VU_jv' });

    // console.log(`decoded:`, decoded);
    // console.log(`response:`, response);
    // req.userId = response.id;
    // req.role = response.role;
    req.userId = decoded.id;
    req.role = decoded.role;

    console.log('req.userId:', req.userId);
    console.log('req.role:', req.role);

    next();
  });
};

export const AdminOnly = async (req, res, next) => {
  const response = await User.findOne({
    where: {
      uuid: req.session.userId,
    },
  });

  if (!response) return res.status(404).json({ message: 'User Not Found !' });
  if (response.role !== 'admin') return res.status(403).json({ message: 'Page Not Found !' });
  next();
};
