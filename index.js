import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import session from 'express-session';
import UserRoute from './routes/UsersRoutes.js';
import ProductRoute from './routes/ProductRoutes.js';
dotenv.config();

const app = express();
const port = process.env.APP_PORT || 5000;

app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: 'auto',
    },
  })
);

app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000/'],
  })
);

app.use(fileUpload());
app.use(express.static('public'));
app.use(express.json());
app.use(UserRoute);
app.use(ProductRoute);

app.listen(port, () => console.log(`Running Server at Port: ${port}!`));
