import argon2 from 'argon2';
import User from '../models/UsersModels.js';
import jwt from 'jsonwebtoken';

export const Login = async (req, res) => {
  const response = await User.findOne({
    where: {
      email_user: req.body.email,
    },
  });
  if (!response) return res.status(404).json({ message: 'Data Not Exist!' });

  const match = await argon2.verify(response.password, req.body.password);
  if (!match) return res.status(400).json({ message: 'Wrong Your Password!' });

  // mengirim uuid di table users ke dalam session -> berfungsi untuk authentication users
  req.session.userId = response.uuid;
  const { id, uuid, role } = response;

  // create token access
  const accessToken = jwt.sign(/* payload */ { id, uuid, role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '60s' });

  // create token refresh
  const refreshToken = jwt.sign({ id, uuid, role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

  await User.update(
    { refresh_token: refreshToken },
    {
      where: {
        uuid: uuid,
      },
    }
  );

  // refreshToken masuk ke dalam cookie
  res.cookie('refreshToken' /* name cookie */, refreshToken /* value cookie */, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    // maxAge: 1000 * 60 * 5 /* 1000ms(1s) * 60ms * 5ms = 300.000ms(5m) */,
  });

  res.status(200).json({ uuid, role, accessToken });
};

export const CheckLogin = async (req, res) => {
  // mengecek uuid di session apakah sudah masuk atau belum -> berfungsi untuk authentication users
  if (!req.session.userId) return res.status(401).json({ message: 'Please Login !' });
  // if (!req.sessionID) return res.status(401).json({ message: 'Please Login!' });
  // console.log(req.sessionID);
  const response = await User.findOne({
    attributes: ['uuid', 'nm_user', 'username', 'email_user', 'role'],
    where: { uuid: req.session.userId },
  });
  if (!response) return res.status(404).json({ message: 'Users Not Found !' });

  res.status(200).json({
    message: 'Success Login',
    status: 200,
    data: response,
  });
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(204).json({ message: 'Not Content!' });

  const response = await User.findOne({
    where: {
      refresh_token: refreshToken,
    },
  });

  if (!response) return res.status(204).json({ message: 'Not Content Response!' });

  await User.update(
    {
      refresh_token: null,
    },
    {
      where: {
        uuid: response.uuid,
      },
    }
  );

  res.clearCookie('refreshToken');

  req.session.destroy((err) => {
    if (err) return res.status(400).json({ message: "Can't Logout" });
    res.status(200).json({ message: 'Success Logout' });
  });
};

export const RefreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Sorry, Not have access to this page!' });

    const response = await User.findOne({ where: { refresh_token: refreshToken } });
    if (!response) return res.status(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Hak akses anda sudah kadaluarsa!' });
      // const { id, uuid, role } = response;
      const { id, uuid, role } = decoded;
      const accessToken = jwt.sign({ id, uuid, role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '60s' });
      res.json({ accessToken });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
