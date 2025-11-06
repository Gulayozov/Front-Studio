import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const VideoTest: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>Video Test Component</Title>
      
      <Card title="Working Video Example" style={{ marginBottom: 16 }}>
        <video 
          controls 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '300px', 
            borderRadius: '4px'
          }}
          onError={(e) => {
            console.warn('Video failed to load');
            const target = e.target as HTMLVideoElement;
            target.style.display = 'none';
          }}
        >
          <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
          <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
        <p style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
          This is a test video from Google's sample video collection.
        </p>
      </Card>

      <Card title="Alternative Video Sources">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <h4>Sample Video 1</h4>
            <video 
              controls 
              style={{ width: '100%', maxHeight: '200px' }}
            >
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div style={{ flex: 1, minWidth: 300 }}>
            <h4>Sample Video 2</h4>
            <video 
              controls 
              style={{ width: '100%', maxHeight: '200px' }}
            >
              <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VideoTest; 