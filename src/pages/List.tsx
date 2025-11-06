import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Button, Upload, List as AntList, message } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { listFiles, uploadFile, downloadFile } from '@/services/ant-design-pro/rag/api';

const List: React.FC = () => {
  const intl = useIntl();
  const [files, setFiles] = useState<Array<{ filename: string; path: string; download_url: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await listFiles();
      setFiles(res);
    } catch (err) {
      message.error('Failed to fetch files');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (info: any) => {
    console.log('handleUpload called with:', info);
    console.log('File status:', info.file.status);
    console.log('File list:', info.fileList);
    
    if (info.file.status === 'uploading') {
      console.log('File is uploading...');
      return;
    }
    if (info.file.status === 'done') {
      console.log('File upload completed');
      if (info.fileList && info.fileList.length > 1) {
        message.success(`${info.fileList.length} files uploaded successfully`);
      } else {
        message.success(`${info.file.name} uploaded successfully`);
      }
      fetchFiles();
    } else if (info.file.status === 'error') {
      console.log('File upload failed');
      message.error(`${info.file.name} upload failed.`);
    }
  };

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    try {
      setUploading(true);
      console.log('customRequest called with options:', options);
      console.log('File to upload:', file);
      
      // Ensure we have a valid file object
      const fileObj = file.originFileObj || file;
      if (!fileObj) {
        throw new Error('No valid file object found');
      }
      
      console.log('Processing file:', file.name, 'File object:', fileObj);
      
      // Show progress
      if (onProgress) {
        onProgress({ percent: 50 });
      }
      
      // Upload the file
      console.log('Calling uploadFile API...');
      const result = await uploadFile([fileObj]);
      console.log('Upload API result:', result);
      
      // Show completion
      if (onProgress) {
        onProgress({ percent: 100 });
      }
      
      console.log('Upload completed successfully');
      onSuccess(null, file);
    } catch (err: any) {
      console.error('Upload error:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (item: { filename: string; path: string; download_url: string }) => {
    downloadFile(item.filename);
  };

  return (
    <PageContainer title={false}>
      <div style={{ padding: '24px' }}>
        <Card>
          <Upload
            showUploadList={false}
            onChange={handleUpload}
            multiple={true}
            accept="*/*"
            disabled={uploading}
            action="#"
            beforeUpload={(file) => {
              console.log('beforeUpload called with:', file);
              // Handle upload manually
              customRequest({
                file: { originFileObj: file, name: file.name },
                onSuccess: () => {
                  console.log('Upload success');
                  message.success(`${file.name} uploaded successfully`);
                  fetchFiles();
                },
                onError: (err: any) => {
                  console.log('Upload error:', err);
                  message.error(`${file.name} upload failed`);
                },
                onProgress: (progress: any) => {
                  console.log('Upload progress:', progress);
                }
              });
              return false; // Prevent default upload
            }}
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              {uploading ? intl.formatMessage({ id: 'pages.list.uploading' }) : intl.formatMessage({ id: 'pages.list.uploadFiles' })}
            </Button>
          </Upload>
        </Card>
        <Card style={{ marginTop: 24 }} loading={loading}>
          <AntList
            header={<div>{intl.formatMessage({ id: 'pages.list.uploadedFiles' })}</div>}
            dataSource={files}
            renderItem={item => (
              <AntList.Item
                actions={[
                  <Button
                    key="download"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(item)}
                  >
                    {intl.formatMessage({ id: 'pages.list.download' })}
                  </Button>
                ]}
              >
                {item.filename}
              </AntList.Item>
            )}
          />
        </Card>
      </div>
    </PageContainer>
  );
};

export default List;