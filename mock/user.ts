// import Password from 'antd/es/input/Password';
// import { Request, Response } from 'express';

// type Email = string & { __brand: 'email' };

// type User = {
//   id: number;
//   login: Email;
//   name: string;
//   password: string;
//   created_dt?: string;
//   updated_dt?: string;
//   deleted_dt?: string | null;
// };

// const users: User[] = [
//   {
//     id: 1,
//     login: 'john@example.com' as Email,
//     name: 'John',
//     password: '1',
//   },
//   {
//     id: 2,
//     login: 'jim@example.com' as Email,
//     name: 'Jim',
//     password: '1',
//   },
//   {
//     id: 3,
//     login: 'joe@example.com' as Email,
//     name: 'Joe',
//     password: '1',
//   },
// ];

// let nextId = users.length + 1;

// const waitTime = (time: number = 100) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(true);
//     }, time);
//   });
// };

// async function getFakeCaptcha(req: Request, res: Response) {
//   await waitTime(2000);
//   return res.json('captcha-xxx');
// }

// const { ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION } = process.env;

// /**
//  * Current user access, if empty means not logged in
//  * current user access， if is '', user need login
//  * If it's a pro preview, it has permissions by default
//  */
// let access = ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site' ? 'admin' : '';

// const getAccess = () => {
//   return access;
// };

// // Code will be compatible with local service mock and deployed site static data
// export default {
//   // Supports Object and Array values
//   'GET /api/currentUser': (req: Request, res: Response) => {
//     if (!getAccess()) {
//       res.status(401).send({
//         data: {
//           isLogin: false,
//         },
//         errorCode: '401',
//         errorMessage: 'Please login first!',
//         success: true,
//       });
//       return;
//     }
//     res.send({
//       success: true,
//       data: {
//         name: 'Serati Ma',
//         avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
//         userid: '00000001',
//         email: 'antdesign@alipay.com',
//         signature: 'Inclusive and accommodating',
//         title: 'Interaction Expert',
//         group: 'Ant Financial - Business Unit - Platform Department - Technology Department - UED',
//         tags: [
//           {
//             key: '0',
//             label: 'Creative',
//           },
//           {
//             key: '1',
//             label: 'Design Focused',
//           },
//           {
//             key: '2',
//             label: 'Spicy~',
//           },
//           {
//             key: '3',
//             label: 'Long Legs',
//           },
//           {
//             key: '4',
//             label: 'Sichuan Girl',
//           },
//           {
//             key: '5',
//             label: 'Inclusive',
//           },
//         ],
//         notifyCount: 12,
//         unreadCount: 11,
//         country: 'China',
//         access: getAccess(),
//         geographic: {
//           province: {
//             label: 'Zhejiang Province',
//             key: '330000',
//           },
//           city: {
//             label: 'Hangzhou City',
//             key: '330100',
//           },
//         },
//         address: '77 Gongzhuan Road, Xihu District',
//         phone: '0752-268888888',
//       },
//     });
//   },
//   // GET POST can be omitted
//   'GET /api/users': users,

//   // 'POST /api/v1/users/register': async (req: Request, res: Response) => {
//   //   const { login, password, name } = req.body;

//   //   await waitTime(1000); // simulate delay

//   //   // Basic validation
//   //   if (!login || !name || !password) {
//   //     res.status(400).send({ message: 'All fields are required.' });
//   //     return;
//   //   }

//   //   // Check if email already exists
//   //   const existingUser = users.find((u) => u.login === login && !u.deleted_dt);
//   //   if (existingUser) {
//   //     res.status(409).send({ message: 'Email is already registered.' });
//   //     return;
//   //   }

//   //   // Add new user
//   //   const newUser = {
//   //     id: nextId++,
//   //     login: login,
//   //     name,
//   //     password,
//   //     created_dt: new Date().toISOString(),
//   //   };

//   //   users.push(newUser);

//   //   res.status(201).send({
//   //     message: 'User registered successfully.',
//   //     user: {
//   //       id: newUser.id,
//   //       name: newUser.name,
//   //       login: newUser.login,
//   //     },
//   //   });

//   //   console.log('New user registered:', newUser);
//   // },

//   // 'POST /api/login/account': async (req: Request, res: Response) => {
//   //   const { password, login, type } = req.body;
//   //   await waitTime(2000);
//   //   if (password === 'ant.design' && login === 'admin@gmail.com') {
//   //     res.send({
//   //       status: 'ok',
//   //       type,
//   //       currentAuthority: 'admin',
//   //     });
//   //     access = 'admin';
//   //     return;
//   //   }

//   //   const user = users.find((u) => u.login === login && u.password === password && !u.deleted_dt);
//   //   if (user) {
//   //     res.send({
//   //       status: 'ok',
//   //       type,
//   //       currentAuthority: 'user',
//   //     });
//   //     access = 'user';
//   //     return;
//   //   }
//   //   if (type === 'mobile') {
//   //     res.send({
//   //       status: 'ok',
//   //       type,
//   //       currentAuthority: 'admin',
//   //     });
//   //     access = 'admin';
//   //     return;
//   //   }

//   //   res.send({
//   //     status: 'error',
//   //     type,
//   //     currentAuthority: 'guest',
//   //   });
//   //   access = 'guest';
//   // },
//   'POST /api/login/outLogin': (req: Request, res: Response) => {
//     access = '';
//     res.send({ data: {}, success: true });
//   },
//   // 'POST /api/register': (req: Request, res: Response) => {
//   //   res.send({ status: 'ok', currentAuthority: 'user', success: true });
//   // },
//   'GET /api/500': (req: Request, res: Response) => {
//     res.status(500).send({
//       timestamp: 1513932555104,
//       status: 500,
//       error: 'error',
//       message: 'error',
//       path: '/base/category/list',
//     });
//   },
//   'GET /api/404': (req: Request, res: Response) => {
//     res.status(404).send({
//       timestamp: 1513932643431,
//       status: 404,
//       error: 'Not Found',
//       message: 'No message available',
//       path: '/base/category/list/2121212',
//     });
//   },
//   'GET /api/403': (req: Request, res: Response) => {
//     res.status(403).send({
//       timestamp: 1513932555104,
//       status: 403,
//       error: 'Forbidden',
//       message: 'Forbidden',
//       path: '/base/category/list',
//     });
//   },
//   'GET /api/401': (req: Request, res: Response) => {
//     res.status(401).send({
//       timestamp: 1513932555104,
//       status: 401,
//       error: 'Unauthorized',
//       message: 'Unauthorized',
//       path: '/base/category/list',
//     });
//   },

//   'GET  /api/login/captcha': getFakeCaptcha,
// };
