import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import db from './config/Database.js';
import SequelizeStore from 'connect-session-sequelize';
import AuthRoute from './routes/AuthRoutes.js';
import UserRoute from './routes/UsersRoutes.js';
import ProductRoute from './routes/ProductRoutes.js';
dotenv.config();

const app = express();
const port = process.env.APP_PORT || 5000;
const sessionStore = SequelizeStore(session.Store);
const store = new sessionStore({ db });
// store.sync();

app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      secure: 'auto',
      // path: ''
      // httpOnly: ''
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
app.use(cookieParser() /* untuk bisa memanipulasi sebuah cookie */);
app.use(UserRoute);
app.use(ProductRoute);
app.use(AuthRoute);

app.listen(port, () => console.log(`Running Server at Port: ${port}!`));
