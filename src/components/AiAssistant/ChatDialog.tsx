import { Modal, Button, FloatButton, Input, Upload, Card, Typography, message, Dropdown } from 'antd';
import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { 
  MessageOutlined, 
  CloseOutlined, 
  PlusOutlined, 
  AudioOutlined, 
  SendOutlined, 
  PaperClipOutlined,
  StopOutlined,
  GlobalOutlined,
  SoundOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { askQuestion, uploadFileForRAG, transcribeAudio } from '@/services/ant-design-pro/rag/api';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { defaultSchema } from 'hast-util-sanitize';
import 'katex/dist/katex.min.css';

const { TextArea } = Input;
const { Paragraph } = Typography;

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

// Message Renderer Component
const MessageRenderer: React.FC<{ content: string; contentType?: string; media?: any }> = ({ 
  content, 
  contentType = 'text',
  media 
}) => {
  // Function to detect if content contains markdown
  const hasMarkdown = (text: string) => {
    const markdownPatterns = [
      /^#{1,6}\s/, // Headers
      /\*\*.*\*\*/, // Bold
      /\*.*\*/, // Italic
      /\[.*\]\(.*\)/, // Links
      /!\[.*\]\(.*\)/, // Images
      /```[\s\S]*```/, // Code blocks
      /`.*`/, // Inline code
      /\$\$[\s\S]*\$\$/, // LaTeX blocks
      /\$.*\$/, // Inline LaTeX
      /^- /, // Lists
      /^\d+\. /, // Numbered lists
    ];
    return markdownPatterns.some(pattern => pattern.test(text));
  };

  // Function to detect media URLs
  const detectMedia = (text: string) => {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)$/i;
    
    // Look for URLs in markdown syntax: ![alt](url) or [text](url)
    const markdownUrlPattern = /\[([^\]]*)\]\(([^)]+)\)/g;
    const matches = [...text.matchAll(markdownUrlPattern)];
    
    for (const match of matches) {
      const [, alt, url] = match;
      if (imageExtensions.test(url)) {
        return { type: 'image' as const, url, alt: alt || 'Image' };
      } else if (videoExtensions.test(url)) {
        console.log('Detected video URL in markdown:', url);
        return { type: 'video' as const, url, alt: alt || 'Video' };
      }
    }
    
    // Also check for plain URLs
    const urlPattern = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlPattern);
    
    if (urls) {
      for (const url of urls) {
        if (imageExtensions.test(url)) {
          return { type: 'image' as const, url, alt: 'Image' };
        } else if (videoExtensions.test(url)) {
          console.log('Detected video URL:', url);
          return { type: 'video' as const, url, alt: 'Video' };
        }
      }
    }
    return null;
  };

  // Determine content type
  const finalContentType = contentType === 'text' && (hasMarkdown(content) || detectMedia(content)) 
    ? 'markdown' 
    : contentType;

  const detectedMedia = detectMedia(content);
  console.log('Content:', content);
  console.log('Detected media:', detectedMedia);

  if (media || detectedMedia) {
    const mediaData = media || detectedMedia;
    return (
      <div>
        {mediaData?.type === 'image' && (
          <div style={{ marginBottom: 8 }}>
            <img 
              src={mediaData.url} 
              alt={mediaData.alt || 'Image'} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '300px', 
                borderRadius: '4px',
                objectFit: 'contain'
              }} 
            />
            {mediaData.caption && (
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '4px',
                textAlign: 'center'
              }}>
                {mediaData.caption}
              </div>
            )}
          </div>
        )}
        {mediaData?.type === 'video' && (
          <div style={{ marginBottom: 8 }}>
            <video 
              controls 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '300px', 
                borderRadius: '4px'
              }}
              onError={(e) => {
                console.warn('Video failed to load:', mediaData.url);
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
              }}
            >
              <source src={mediaData.url} type="video/mp4" />
              <source src={mediaData.url} type="video/webm" />
              <source src={mediaData.url} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
            {mediaData.caption && (
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '4px',
                textAlign: 'center'
              }}>
                {mediaData.caption}
              </div>
            )}
          </div>
        )}
        {content && (
          <div style={{ marginTop: 8 }}>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[
                rehypeKatex,
                rehypeRaw
              ]}
              components={{
                code({ node, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  return !isInline ? (
                    <SyntaxHighlighter
                      style={tomorrow as any}
                      language={match[1]}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                img: ({ src, alt, ...props }) => {
                  // Check if this is a video URL
                  const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)$/i;
                  if (src && videoExtensions.test(src)) {
                    console.log('Rendering video:', src);
                    return (
                      <div>
                        <video 
                          controls 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '200px',
                            borderRadius: '4px'
                          }}
                          onError={(e) => {
                            console.warn('Video failed to load:', src);
                            const target = e.target as HTMLVideoElement;
                            target.style.display = 'none';
                            // Show fallback message
                            const container = target.parentElement;
                            if (container) {
                              const fallback = document.createElement('div');
                              fallback.style.cssText = 'padding: 20px; text-align: center; color: #666; background: #f5f5f5; border-radius: 4px;';
                              fallback.textContent = `Video unavailable: ${src}`;
                              container.appendChild(fallback);
                            }
                          }}
                          onLoad={() => console.log('Video loaded successfully:', src)}
                        >
                          <source src={src} type="video/mp4" />
                          <source src={src} type="video/webm" />
                          <source src={src} type="video/ogg" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    );
                  }
                  
                  // Regular image
                  return (
                    <img 
                      src={src} 
                      alt={alt} 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px',
                        borderRadius: '4px',
                        objectFit: 'contain'
                      }} 
                      {...props} 
                    />
                  );
                },
                          video: ({ src, ...props }) => (
            <div>
              <video 
                controls 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px',
                  borderRadius: '4px'
                }}
                onError={(e) => {
                  console.warn('Video failed to load:', src);
                  const target = e.target as HTMLVideoElement;
                  target.style.display = 'none';
                  // Show fallback message
                  const container = target.parentElement;
                  if (container) {
                    const fallback = document.createElement('div');
                    fallback.style.cssText = 'padding: 20px; text-align: center; color: #666; background: #f5f5f5; border-radius: 4px;';
                    fallback.textContent = `Video unavailable: ${src}`;
                    container.appendChild(fallback);
                  }
                }}
                {...props}
              >
                <source src={src} type="video/mp4" />
                <source src={src} type="video/webm" />
                <source src={src} type="video/ogg" />
                Your browser does not support the video tag.
              </video>
            </div>
          )
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    );
  }

  if (finalContentType === 'markdown') {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[
          rehypeKatex,
          rehypeRaw
        ]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return !isInline ? (
              <SyntaxHighlighter
                style={tomorrow as any}
                language={match[1]}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          img: ({ src, alt, ...props }) => (
            <img 
              src={src} 
              alt={alt} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px',
                borderRadius: '4px',
                objectFit: 'contain'
              }} 
              {...props} 
            />
          ),
          video: ({ src, ...props }) => (
            <video 
              controls 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px',
                borderRadius: '4px'
              }}
              {...props}
            >
              <source src={src} type="video/mp4" />
              <source src={src} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }

  // Default text rendering
  return <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>;
};

// Types
interface Message {
  role: 'user' | 'assistant';
  content: string;
  contentType?: 'text' | 'markdown' | 'media';
  media?: {
    type: 'image' | 'video';
    url: string;
    alt?: string;
    caption?: string;
  };
}

interface ChatDialogProps {
  /**
   * Позиция плавающей кнопки
   * @default { right: 24, bottom: 24 }
   */
  position?: {
    right?: number;
    bottom?: number;
    left?: number;
    top?: number;
  };
  
  /**
   * Размер модального окна
   */
  modalWidth?: number | string;
  modalHeight?: number | string;
  /**
   * Заголовок модального окна
   */
  title?: string;
  
  /**
   * Кастомная иконка для плавающей кнопки
   */
  icon?: React.ReactNode;
  
  /**
   * Показывать ли диалог изначально открытым
   */
  defaultOpen?: boolean;
  
  /**
   * Кастомная функция для отправки сообщений (если не указана, используется дефолтная)
   */
  onSendMessage?: (message: string, files: UploadFile[]) => Promise<string>;
  
  /**
   * Начальные сообщения в диалоге
   */
  initialMessages?: Message[];
  
  /**
   * Стиль для плавающей кнопки
   */
  buttonStyle?: React.CSSProperties;
  
  /**
   * Дополнительные пропсы для модального окна
   */
  modalProps?: any;
}

// Chat Messages Component
const ChatMessages: React.FC<{ 
  messages: Message[];
  currentLanguage: 'en-US' | 'ru-RU' | 'tj-TJ';
}> = ({ messages, currentLanguage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up speech synthesis when component unmounts or messages change
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakMessage = (text: string, messageIndex: number) => {
    if (!window.speechSynthesis) {
      const errorMessages = {
        'en-US': 'Text-to-speech not supported in this browser',
        'ru-RU': 'Синтез речи не поддерживается в этом браузере',
        'tj-TJ': 'Синтези тоҷикӣ дар ин браузер дастгирӣ намешавад'
      };
      message.warning(errorMessages[currentLanguage]);
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();
    setSpeakingMessageIndex(null);

    // If clicking on the same message that was speaking, just stop
    if (speakingMessageIndex === messageIndex) {
      return;
    }

    // Extract plain text from markdown content
    const plainText = text
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove image markdown
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove link markdown
      .replace(/`.*?`/g, '') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\*\*.*?\*\*/g, '') // Remove bold
      .replace(/\*.*?\*/g, '') // Remove italic
      .replace(/#{1,6}\s.*/g, '') // Remove headers
      .replace(/\$\$[\s\S]*?\$\$/g, '') // Remove LaTeX blocks
      .replace(/\$.*?\$/g, '') // Remove inline LaTeX
      .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
      .trim();

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = currentLanguage;
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setSpeakingMessageIndex(messageIndex);
    };

    utterance.onend = () => {
      setSpeakingMessageIndex(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageIndex(null);
      const errorMessages = {
        'en-US': 'Error occurred during speech synthesis',
        'ru-RU': 'Произошла ошибка при синтезе речи',
        'tj-TJ': 'Хато дар синтези тоҷикӣ рух дод'
      };
      message.error(errorMessages[currentLanguage]);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMessageIndex(null);
    }
  };

  return (
    <div style={{ 
      height: '100%', 
      overflowY: 'auto', 
      padding: '1rem', 
      background: '#fafafa',
      boxSizing: 'border-box'
    }}>
      {messages.map((msg, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '1rem',
          }}
        >
          <Card
            style={{
              background: msg.role === 'user' ? '#e6f7ff' : '#f5f5f5',
              maxWidth: '75%',
              borderRadius: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ margin: 0, flex: 1 }}>
                <MessageRenderer 
                  content={msg.content} 
                  contentType={msg.contentType}
                  media={msg.media}
                />
              </div>
              
              {/* Add TTS button only for assistant messages */}
              {msg.role === 'assistant' && (
                <Button
                  type="text"
                  size="small"
                  icon={speakingMessageIndex === idx ? <StopOutlined /> : <SoundOutlined />}
                  onClick={() => speakingMessageIndex === idx ? stopSpeaking() : speakMessage(msg.content, idx)}
                  style={{
                    fontSize: 14,
                    color: speakingMessageIndex === idx ? '#ff4d4f' : '#666',
                    minWidth: 'auto',
                    height: 'auto',
                    padding: '4px',
                    flexShrink: 0,
                  }}
                  title={
                    currentLanguage === 'en-US'
                      ? (speakingMessageIndex === idx ? 'Stop speaking' : 'Listen to message')
                      : (speakingMessageIndex === idx ? 'Остановить воспроизведение' : 'Прослушать сообщение')
                  }
                />
              )}
            </div>
          </Card>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

// Chat Input Component
const ChatInput: React.FC<{
  onSend: (message: string, files: UploadFile[]) => void;
  loading: boolean;
  currentLanguage: 'en-US' | 'ru-RU' | 'tj-TJ';
  onLanguageChange: (language: 'en-US' | 'ru-RU' | 'tj-TJ') => void;
  shouldFocus?: boolean;
}> = ({ onSend, loading, currentLanguage, onLanguageChange, shouldFocus = false }) => {
  const [value, setValue] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [loadingDots, setLoadingDots] = useState(0);
  const textAreaRef = useRef<any>(null);

  // Focus the textarea when shouldFocus changes to true
  useEffect(() => {
    if (shouldFocus && textAreaRef.current) {
      // Use setTimeout to ensure the modal is fully rendered
      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 100);
    }
  }, [shouldFocus]);

  // Animate loading dots when loading is true
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingDots(prev => (prev + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setLoadingDots(0);
    }
  }, [loading]);

  // Language options for dropdown
  const languageOptions = [
    {
      key: 'en-US',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          🇺🇸 English
        </div>
      ),
    },
    {
      key: 'ru-RU',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          🇷🇺 Русский
        </div>
      ),
    },
    {
      key: 'tj-TJ',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          🇹🇯 Тоҷикӣ
        </div>
      ),
    },
  ];

  // Initialize speech recognition for English and Russian
  useEffect(() => {
    if (currentLanguage === 'en-US' || currentLanguage === 'ru-RU') {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = currentLanguage;
        
        recognitionInstance.onstart = () => {
          setIsRecording(true);
        };
        
        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setValue(prev => prev + (prev ? ' ' : '') + transcript);
        };
        
        recognitionInstance.onend = () => {
          setIsRecording(false);
        };
        
        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          const errorMessages = {
            'en-US': 'Speech recognition error: ' + event.error,
            'ru-RU': 'Ошибка распознавания речи: ' + event.error,
            'tj-TJ': 'Хатои таносули тоҷикӣ: ' + event.error
          };
          message.error(errorMessages[currentLanguage]);
        };
        
        setRecognition(recognitionInstance);
      }
    } else {
      // Clear recognition for Tajik language
      setRecognition(null);
    }
  }, [currentLanguage]);

  const startVoiceInput = async () => {
    // Handle Web Speech API for English and Russian
    if (currentLanguage === 'en-US' || currentLanguage === 'ru-RU') {
      if (!recognition) {
        const warningMessages = {
          'en-US': 'Speech recognition not supported in this browser',
          'ru-RU': 'Распознавание речи не поддерживается в этом браузере',
          'tj-TJ': 'Таносули тоҷикӣ дар ин браузер дастгирӣ намешавад'
        };
        message.warning(warningMessages[currentLanguage]);
        return;
      }
      
      if (isRecording) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          const errorMessages = {
            'en-US': 'Failed to start voice recording',
            'ru-RU': 'Не удалось начать запись голоса',
            'tj-TJ': 'Оғози сабти овоз муяссар нашуд'
          };
          message.error(errorMessages[currentLanguage]);
        }
      }
    }
    // Handle MediaRecorder for Tajik
    else if (currentLanguage === 'tj-TJ') {
      if (isRecording) {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          // Try different MIME types for better browser compatibility
          let mimeType = 'audio/webm;codecs=opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/webm';
          }
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/mp4';
          }
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/ogg;codecs=opus';
          }
          
          const recorder = new MediaRecorder(stream, {
            mimeType: mimeType
          });
          
          const chunks: Blob[] = [];
          setAudioChunks(chunks);
          
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };
          
          recorder.onstart = () => {
            setIsRecording(true);
          };
          
          recorder.onstop = async () => {
            setIsRecording(false);
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
            
            if (chunks.length > 0) {
              const audioBlob = new Blob(chunks, { type: mimeType });
              
              try {
                // Show loading message
                message.loading({
                  content: 'Транскрибирую аудио...',
                  key: 'transcribing'
                });
                
                const response = await transcribeAudio(audioBlob);
                
                // Hide loading message
                message.destroy('transcribing');
                
                if (response.text) {
                  setValue(prev => prev + (prev ? ' ' : '') + response.text);
                  message.success('Аудио успешно транскрибировано');
                } else {
                  message.error('Не удалось транскрибировать аудио');
                }
              } catch (error) {
                message.destroy('transcribing');
                console.error('Error transcribing audio:', error);
                message.error('Ошибка при транскрибировании аудио');
              }
            }
          };
          
          recorder.onerror = (event) => {
            console.error('MediaRecorder error:', event);
            setIsRecording(false);
            stream.getTracks().forEach(track => track.stop());
            message.error('Ошибка при записи аудио');
          };
          
          setMediaRecorder(recorder);
          recorder.start();
        } catch (error) {
          console.error('Error starting MediaRecorder:', error);
          message.error('Не удалось получить доступ к микрофону');
        }
      }
    }
  };

  const handleLanguageChange = (language: 'en-US' | 'ru-RU' | 'tj-TJ') => {
    onLanguageChange(language);
    // Stop current recording if active
    if (isRecording) {
      if (recognition) {
        recognition.stop();
      }
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }
    // Stop any current speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() || fileList.length > 0) {
        onSend(value.trim(), fileList);
        setValue('');
        setFileList([]);
      }
    }
  };

  const handleSendClick = () => {
    if (value.trim() || fileList.length > 0) {
      onSend(value.trim(), fileList);
      setValue('');
      setFileList([]);
    }
  };

  const handleUploadChange: UploadProps['onChange'] = (info) => {
    let newFileList = [...info.fileList];
    // Allow up to 5 files for chat context
    newFileList = newFileList.slice(-5);
    setFileList(newFileList);
  };

  const uploadProps: UploadProps = {
    beforeUpload: () => false, // Prevent auto upload
    onChange: handleUploadChange,
    multiple: true,
    showUploadList: false,
    accept: "*/*",
  };

  return (
    <div
      style={{
        border: '1px solid #d9d9d9',
        borderRadius: 8,
        padding: '8px 12px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* File preview */}
      {fileList.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          {fileList.map((file) => (
            <div key={file.uid} style={{ fontSize: 13, color: '#555', display: 'flex', alignItems: 'center', gap: 6 }}>
              <PaperClipOutlined />
              <span>{file.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div style={{ 
          marginBottom: 6, 
          fontSize: 13, 
          color: '#ff4d4f', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6 
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#ff4d4f',
            animation: 'pulse 1.5s infinite'
          }} />
          <span>
            {currentLanguage === 'en-US' 
              ? 'Recording... Click the microphone again to stop'
              : currentLanguage === 'ru-RU'
              ? 'Запись... Нажмите на микрофон еще раз, чтобы остановить'
              : 'Сабт... Барои қатъ кардани сабт боз микрофонро пахш кунед'
            }
          </span>
          <style>
            {`
              @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
              }
            `}
          </style>
        </div>
      )}

      {/* Text area */}
      <TextArea
        ref={textAreaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          loading
            ? (currentLanguage === 'en-US' 
                ? 'Generating response' + '.'.repeat(loadingDots)
                : currentLanguage === 'ru-RU'
                ? 'Генерирую ответ' + '.'.repeat(loadingDots)
                : 'Ҷавоб тайёр карда истодааст' + '.'.repeat(loadingDots))
            : (currentLanguage === 'en-US' 
                ? 'Send a message…'
                : currentLanguage === 'ru-RU'
                ? 'Отправить сообщение…'
                : 'Паём фиристед…')
        }
        autoSize={{ minRows: 2, maxRows: 6 }}
        disabled={loading}
        style={{
          resize: 'none',
          border: 'none',
          padding: 0,
          outline: 'none',
          boxShadow: 'none',
        }}
      />

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 8,
          alignItems: 'center',
        }}
      >
        <Upload {...uploadProps} fileList={fileList}>
          <Button
            type="text"
            shape="circle"
            icon={<PlusOutlined />}
            style={{ fontSize: 18 }}
            title="Attach files (up to 5)"
          />
        </Upload>

        <div style={{ display: 'flex', gap: 8 }}>
          <Dropdown
            menu={{
              items: languageOptions,
              onClick: ({ key }) => handleLanguageChange(key as 'en-US' | 'ru-RU' | 'tj-TJ'),
              selectedKeys: [currentLanguage]
            }}
            trigger={['click']}
            placement="topRight"
          >
            <Button
              type="text"
              shape="circle"
              icon={<GlobalOutlined />}
              style={{ fontSize: 18 }}
              title={
                currentLanguage === 'en-US' 
                  ? 'Select language' 
                  : currentLanguage === 'ru-RU'
                  ? 'Выбрать язык'
                  : 'Забонро интихоб кунед'
              }
            />
          </Dropdown>
          <Button
            type={isRecording ? "primary" : "text"}
            shape="circle"
            icon={isRecording ? <StopOutlined /> : <AudioOutlined />}
            onClick={startVoiceInput}
            style={{ 
              fontSize: 18,
              ...(isRecording && {
                backgroundColor: '#ff4d4f',
                borderColor: '#ff4d4f',
                animation: 'pulse 1.5s infinite'
              })
            }}
            disabled={loading}
            title={
              currentLanguage === 'en-US' 
                ? (isRecording ? 'Stop recording' : 'Start voice recording')
                : currentLanguage === 'ru-RU'
                ? (isRecording ? 'Остановить запись' : 'Начать запись голоса')
                : (isRecording ? 'Қатъи сабт' : 'Оғози сабти овоз')
            }
          />
          <Button
            type="primary"
            shape="circle"
            icon={<SendOutlined />}
            onClick={handleSendClick}
            disabled={loading || (!value.trim() && fileList.length === 0)}
          />
        </div>
      </div>
    </div>
  );
};

// Main Chat Dialog Component
const ChatDialog: React.FC<ChatDialogProps> = ({
  position = { right: 24, bottom: 24 },
  modalWidth = 1000,
  title = 'Чат-помощник',
  icon = <MessageOutlined />,
  defaultOpen = false,
  onSendMessage,
  initialMessages = [],
  buttonStyle,
  modalProps = {},
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en-US' | 'ru-RU' | 'tj-TJ'>('en-US');
  const [shouldFocusInput, setShouldFocusInput] = useState(false);

  // Default message sending function
  const defaultSendMessage = async (userMessage: string, files: UploadFile[]): Promise<string> => {
    try {
      // Call the real backend API
      const response = await askQuestion(userMessage);
      return response.answer;
    } catch (error: any) {
      console.error('Error calling API:', error);
      // Try to extract error message from API error response
      if (error?.data?.detail?.[0]?.msg) {
        throw new Error(error.data.detail[0].msg);
      }
      throw new Error('Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз.');
    }
  };

  const handleSend = async (userMessage: string, files: UploadFile[]) => {
    setLoading(true);
    let fileUploadMessages: Message[] = [];
    try {
      // Upload files if any
      if (files && files.length > 0) {
        // Extract File objects from the fileList
        const filesToUpload = files
          .filter(file => file.originFileObj)
          .map(file => file.originFileObj as File);
        
        if (filesToUpload.length > 0) {
          const response = await uploadFileForRAG(filesToUpload);
          
          // Add individual messages for each uploaded file
          filesToUpload.forEach(file => {
            fileUploadMessages.push({
              role: 'user',
              content: `Uploaded file for context: ${file.name}`,
            });
          });
        }
      }
      // Add file upload messages to chat
      if (fileUploadMessages.length > 0) {
        setMessages((prev) => [...prev, ...fileUploadMessages]);
      }
      // Add user message if present
      if (userMessage) {
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        // Use custom function or default
        const sendFunction = onSendMessage || defaultSendMessage;
        const response = await sendFunction(userMessage, files);
        // Add assistant response
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Произошла ошибка при обработке запроса.',
        },
      ]);
    } finally {
      setLoading(false);
      // Focus input after message is sent and response is received
      setShouldFocusInput(true);
      setTimeout(() => setShouldFocusInput(false), 200);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Focus input when modal opens
      setShouldFocusInput(true);
      setTimeout(() => setShouldFocusInput(false), 200);
    }
  };

  // Stop any ongoing speech when dialog closes
  useEffect(() => {
    if (!isOpen && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating button to open dialog */}
      <FloatButton
        icon={isOpen ? <CloseOutlined /> : icon}
        onClick={() => handleOpenChange(!isOpen)}
        style={{
          position: 'fixed',
          ...position,
          ...buttonStyle,
        }}
        type={isOpen ? 'default' : 'primary'}
        tooltip={isOpen ? 'Закрыть чат' : 'Открыть чат'}
      />

      {/* Modal dialog */}
      <Modal
        title={title}
        open={isOpen}
        onCancel={() => handleOpenChange(false)}
        footer={null}
        width={modalWidth}
        style={{ top: 20 }}
        styles={{
          body: { 
            padding: 0, 
            height: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
        destroyOnHidden={false}
        {...modalProps}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Messages area - takes all available space */}
          <div
            style={{
              flex: 1,
              overflow: 'hidden',
              minHeight: 0,
            }}
          >
            <ChatMessages messages={messages} currentLanguage={currentLanguage} />
          </div>

          {/* Input area - fixed at bottom */}
          <div
            style={{
              flexShrink: 0,
              borderTop: '1px solid #f0f0f0',
              padding: '16px',
              backgroundColor: 'white',
            }}
          >
            <ChatInput 
              onSend={handleSend} 
              loading={loading} 
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
              shouldFocus={shouldFocusInput}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ChatDialog;