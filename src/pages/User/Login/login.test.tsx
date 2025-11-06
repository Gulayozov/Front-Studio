// import { TestBrowser } from '@@/testBrowser';
// import { fireEvent, render, waitFor } from '@testing-library/react';
// import React, { act } from 'react';

// // @ts-ignore
// import { startMock } from '@@/requestRecordMock';

// const waitTime = (time: number = 100) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(true);
//     }, time);
//   });
// };

// let server: {
//   close: () => void;
// };

// describe('Login Page', () => {
//   beforeAll(async () => {
//     server = await startMock({
//       port: 8000,
//       scene: 'login',
//     });
//   });

//   afterAll(() => {
//     server?.close();
//   });

//   it('should show login form', async () => {
//     const historyRef = React.createRef<any>();

//     let rootContainer: any;
//     await act(async () => {
//       rootContainer = render(
//         <TestBrowser
//           historyRef={historyRef}
//           location={{
//             pathname: '/user/login',
//           }}
//         />,
//       );
//     });

//     await act(async () => {
//       await rootContainer.findAllByText('Ai Avicenna');
//     });

//     await act(async () => {
//       historyRef.current?.push('/user/login');
//     });

//     expect(rootContainer.baseElement?.querySelector('.ant-pro-form-login-desc')?.textContent).toBe(
//       'Ant Design is the most influential web design specification in Xihu district',
//     );

//     expect(rootContainer.asFragment()).toMatchSnapshot();

//     rootContainer.unmount();
//   });

//   it('should login success', async () => {
//     const historyRef = React.createRef<any>();

//     let rootContainer: any;
//     await act(async () => {
//       rootContainer = render(
//         <TestBrowser
//           historyRef={historyRef}
//           location={{
//             pathname: '/user/login',
//           }}
//         />,
//       );
//     });

//     await act(async () => {
//       await rootContainer.findAllByText('Account Login');
//     });

//     const loginInput = await rootContainer.findByPlaceholderText('Login: admin@gmail.com');

//     await act(async () => {
//       fireEvent.change(loginInput, { target: { value: 'admin@gmail.com' } });
//     });

//     const passwordInput = await rootContainer.findByPlaceholderText('Password: ant.design');

//     await act(async () => {
//       fireEvent.change(passwordInput, { target: { value: 'ant.design' } });
//     });

//     const loginButton = await rootContainer.findByText('Login');

//     await act(async () => {
//       fireEvent.click(loginButton);
//     });

//     // Wait for interface response with proper act wrapping
//     await act(async () => {
//       await waitTime(5000);
//     });

//     await act(async () => {
//       await rootContainer.findAllByText('Ai Avicenna');
//     });

//     expect(rootContainer.asFragment()).toMatchSnapshot();

//     await act(async () => {
//       await waitTime(2000);
//     });

//     rootContainer.unmount();
//   });

//   it('should show signup form and submit', async () => {
//     const historyRef = React.createRef<any>();

//     let rootContainer: any;
//     await act(async () => {
//       rootContainer = render(
//         <TestBrowser
//           historyRef={historyRef}
//           location={{
//             pathname: '/user/login',
//           }}
//         />,
//       );
//     });

//     // Switch to signup tab
//     const signupTab = await rootContainer.findByText('Sign Up');
//     await act(async () => {
//       fireEvent.click(signupTab);
//     });

//     // Fill signup fields
//     const loginInput = await rootContainer.findByPlaceholderText('Login');
//     await act(async () => {
//       fireEvent.change(loginInput, { target: { value: 'test@example.com' } });
//     });

//     const nameInput = await rootContainer.findByPlaceholderText('Name');
//     await act(async () => {
//       fireEvent.change(nameInput, { target: { value: 'Test User' } });
//     });

//     const passwordInput = await rootContainer.findByPlaceholderText('Password');
//     await act(async () => {
//       fireEvent.change(passwordInput, { target: { value: 'password123' } });
//     });

//     const signUpButton = await rootContainer.findByText('Sign Up');
//     await act(async () => {
//       fireEvent.click(signUpButton);
//     });

//     // Wait for success message
//     await act(async () => {
//       await rootContainer.findByText('Sign up successful!');
//     });

//     rootContainer.unmount();
//   });
// });
