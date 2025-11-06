import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

//The footer component isn't used currently, left it only for future use


const Footer: React.FC = () => {
  return (
    <div>
      <DefaultFooter
        style={{
          background: 'none',
          alignContent: 'center',
        }}
      />
      <div style={{ textAlign: 'center'}}>
        <p>Footer</p>
      </div>
    </div>

  );
};

export default Footer;
