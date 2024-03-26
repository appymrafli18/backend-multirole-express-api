import argon2 from 'argon2';
import User from '../models/UsersModels.js';
import path from 'path';
import fs from 'fs';

export const getUsers = async (req, res) => {
  try {
    const response = await User.findAll({
      attributes: ['uuid', 'nm_user', 'username', 'email_user', 'image_user', 'url_user', 'password', 'role'],
    });

    res.status(200).json({
      message: 'Success Get Users',
      status: 200,
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getUsersById = async (req, res) => {
  try {
    const response = await User.findOne({
      attributes: ['uuid', 'nm_user', 'username', 'email_user', 'image_user', 'url_user', 'password', 'role'],
      where: {
        uuid: req.params.id,
      },
    });

    if (!response) return res.status(200).json({ message: 'Users Not Found !' });

    res.status(200).json({
      message: 'Success Get Single Data',
      status: 200,
      data: response,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const createUsers = async (req, res) => {
  if (req.file === null) return res.status(400).json({ message: 'Not File Upload' });
  const { name, username, email, password, confirmPassword, role } = req.body;

  const searchEmail = await User.findOne({
    attributes: ['email_user'],
    where: {
      email_user: email,
    },
  });

  if (searchEmail && searchEmail.email_user === email.toLowerCase()) return res.status(400).json({ message: 'Email is Exist!' });
  if (password !== confirmPassword) return res.status(400).json({ message: 'Password Tidak Sama!' });
  const hashPassword = await argon2.hash(password);

  // File Upload -> Start
  const file = req.files.file;
  const fileSize = file.data.length;
  // path.extname -> mengambil extension file saja [abc.png menjadi .png]
  const extentionFile = path.extname(file.name);
  // const fileName = file.md5 + extentionFile;
  const fileName = `${Date.now()}_${file.md5}${extentionFile}`;
  const url = `${req.protocol}://${req.get('host')}/images/users/${fileName}`;
  const allowedType = ['.jpg', '.png', '.jpeg'];
  // File Upload -> End

  if (!allowedType.includes(extentionFile.toLowerCase())) return res.status(422).json({ message: 'Format File Not Support!' });
  if (fileSize > 5_000_000) return res.status(422).json({ message: 'Image Not Must 5mb' });

  file.mv(`./public/images/users/${fileName}`, async (err) => {
    if (err) return res.status(500).json({ message: err.message });

    try {
      await User.create({
        nm_user: name,
        username: username,
        email_user: email,
        image_user: fileName,
        url_user: url,
        password: hashPassword,
        role: role,
      });
      res.status(201).json({ message: 'Success Created User!' });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  });

  // console.log(`File:`, file);
  // console.log(`Req Files:`, req.files);
};

export const updateUsers = async (req, res) => {
  const response = await User.findOne({
    where: {
      uuid: req.params.id,
    },
  });
  if (!response) return res.status(404).json({ message: 'Users Not Found!' });

  let fileName = response.image_user;
  // File Upload -> Start
  if (req.files !== null) {
    const file = req.files.file;
    const fileSize = file.data.length;
    // path.extname -> mengambil extension file saja [abc.png menjadi .png]
    const extentionFile = path.extname(file.name);
    fileName = `${Date.now()}_${file.md5}${extentionFile}`;
    const allowedType = ['.jpg', '.png', '.jpeg'];

    if (!allowedType.includes(extentionFile.toLowerCase())) return res.status(422).json({ message: 'Format File Not Support!' });
    if (fileSize > 5_000_000) return res.status(422).json({ message: 'Image Not Must 5mb' });

    const filepath = `./public/images/users/${response.image_user}`;
    fs.unlinkSync(filepath);
    file.mv(`./public/images/users/${fileName}`, async (err) => {
      if (err) return res.status(500).json({ message: err.message });
    });
  }
  // File Upload -> End

  const { name, username, email, password, role } = req.body;
  let hashPassword;

  if (password == '' || password == null || password == undefined) {
    hashPassword = response.password;
  } else {
    hashPassword = await argon2.hash(password);
  }

  // if (password !== confirmPassword) return res.status(400).json({ message: 'Password Tidak Sama!' });
  const url = `${req.protocol}://${req.get('host')}/images/users/${fileName}`;
  try {
    await User.update(
      {
        nm_user: name || response.name,
        username: username || response.username,
        email_user: email || response.email,
        image_user: fileName,
        url_user: url,
        password: hashPassword,
        role: role || response.role,
      },
      {
        where: { uuid: req.params.id },
      }
    );
    res.status(200).json({ message: 'Success Updated Data Users!' });
  } catch (error) {
    res.send(400).json({ message: error.message });
  }
};

export const deleteUsers = async (req, res) => {
  const response = await User.findOne({
    where: {
      uuid: req.params.id,
    },
  });

  if (!response) return res.status(404).json({ message: 'Data Users Not Found !' });

  try {
    const filepath = `./public/images/users/${response.image_user}`;

    fs.unlinkSync(filepath);

    await User.destroy({
      where: {
        uuid: req.params.id,
      },
    });

    res.status(200).json({
      message: 'Success Delete Users!',
    });
  } catch (error) {
    res.send(400).json({ message: error.message });
  }
};
