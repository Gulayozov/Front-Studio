# AI Assistant Chat Dialog

A React component that provides a chat interface with AI assistant capabilities, including voice input support for multiple languages.

## Features

- **Multi-language Support**: English (en-US), Russian (ru-RU), and Tajik (tj-TJ)
- **Voice Input**: 
  - **Web Speech API**: For English and Russian (real-time speech-to-text)
  - **MediaRecorder API**: For Tajik (audio recording with backend transcription)
- **Text-to-Speech**: Listen to assistant responses
- **File Upload**: Support for uploading files
- **Markdown Rendering**: Rich text formatting with code syntax highlighting
- **Responsive Design**: Works on desktop and mobile devices

## Voice Input Implementation

### English and Russian (en-US, ru-RU)
- Uses Web Speech API for real-time speech recognition
- Immediate transcription as you speak
- No backend processing required

### Tajik (tj-TJ)
- Uses MediaRecorder API to capture audio
- Sends audio blob to backend `/api/v1/stt/tajik/` endpoint
- Backend processes audio using Vosk for Tajik language transcription
- Shows loading indicator during transcription
- Inserts transcribed text into input field

## API Endpoints

### STT (Speech-to-Text) for Tajik
```typescript
POST /api/v1/stt/tajik/
Content-Type: multipart/form-data
Body: { file: audioBlob }
Response: { text: string }
```

### RAG (Question Answering)
```typescript
POST /rag/query?question={encoded_question}
Response: { answer: string }
```

### File Upload
```typescript
POST /api/v1/rag/upload-file/
Content-Type: multipart/form-data
Body: { file: File }
```

## Usage

```tsx
import ChatDialog from '@/components/AiAssistant/ChatDialog';

function App() {
  return (
    <ChatDialog
      title="AI Assistant"
      defaultOpen={false}
      modalWidth={1000}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `object` | `{ right: 24, bottom: 24 }` | Position of floating button |
| `modalWidth` | `number \| string` | `1000` | Width of modal dialog |
| `title` | `string` | `'Чат-помощник'` | Modal title |
| `icon` | `ReactNode` | `<MessageOutlined />` | Floating button icon |
| `defaultOpen` | `boolean` | `false` | Whether dialog is open by default |
| `onSendMessage` | `function` | `undefined` | Custom message sending function |
| `initialMessages` | `Message[]` | `[]` | Initial messages in chat |
| `buttonStyle` | `CSSProperties` | `undefined` | Custom button styles |
| `modalProps` | `object` | `{}` | Additional modal props |

## Language Support

### English (en-US)
- Voice input: Web Speech API
- Text-to-speech: Browser's speech synthesis
- UI messages: English

### Russian (ru-RU)
- Voice input: Web Speech API
- Text-to-speech: Browser's speech synthesis
- UI messages: Russian

### Tajik (tj-TJ)
- Voice input: MediaRecorder → Backend STT
- Text-to-speech: Browser's speech synthesis
- UI messages: Tajik

## Technical Details

### MediaRecorder Implementation for Tajik
1. User clicks microphone button
2. Browser requests microphone permission
3. MediaRecorder starts recording audio
4. Audio is captured as WebM/Opus format
5. On stop, audio blob is sent to backend
6. Backend processes with Vosk STT
7. Transcribed text is inserted into input

### Error Handling
- Microphone permission denied
- Network errors during transcription
- Backend processing errors
- Browser compatibility issues

## Browser Compatibility

- **Web Speech API**: Chrome, Edge, Safari (English/Russian)
- **MediaRecorder**: Chrome, Firefox, Edge, Safari (Tajik)
- **Text-to-Speech**: All modern browsers

## Dependencies

- React
- Ant Design
- React Markdown
- React Syntax Highlighter
- KaTeX (for math rendering) 