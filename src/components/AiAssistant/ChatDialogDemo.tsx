import React from 'react';
import ChatDialog from './ChatDialog';

const ChatDialogDemo: React.FC = () => {
  // Example messages with different content types
  const exampleMessages = [
    {
      role: 'user' as const,
      content: 'Привет! Можешь показать мне пример математической формулы?'
    },
    {
      role: 'assistant' as const,
      content: `Конечно! Вот несколько примеров математических формул:

## Основные формулы

### Квадратное уравнение
$$ax^2 + bx + c = 0$$

### Формула дискриминанта
$$D = b^2 - 4ac$$

### Решение квадратного уравнения
$$x = \\frac{-b \\pm \\sqrt{D}}{2a}$$

### Интеграл
$$\\int_{a}^{b} f(x) dx = F(b) - F(a)$$

### Предел
$$\\lim_{x \\to \\infty} \\frac{1}{x} = 0$$

А вот пример кода на Python:

\`\`\`python
def solve_quadratic(a, b, c):
    D = b**2 - 4*a*c
    if D >= 0:
        x1 = (-b + math.sqrt(D)) / (2*a)
        x2 = (-b - math.sqrt(D)) / (2*a)
        return x1, x2
    else:
        return None
\`\`\`

И вот красивая картинка:

![Пример изображения](https://picsum.photos/400/300)

А также видео:

![Пример видео](https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4)`,
      contentType: 'markdown' as const
    },
    {
      role: 'user' as const,
      content: 'Покажи мне еще примеры с кодом'
    },
    {
      role: 'assistant' as const,
      content: `Вот несколько примеров кода:

## JavaScript
\`\`\`javascript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

console.log(fibonacci(10)); // 55
\`\`\`

## TypeScript
\`\`\`typescript
interface User {
    id: number;
    name: string;
    email: string;
}

const user: User = {
    id: 1,
    name: "Иван",
    email: "ivan@example.com"
};
\`\`\`

## CSS
\`\`\`css
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(45deg, #667eea, #764ba2);
}
\`\`\`

## HTML
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Пример</title>
</head>
<body>
    <h1>Привет, мир!</h1>
    <p>Это пример HTML кода.</p>
</body>
</html>
\`\`\`

И еще одна формула - **формула Эйлера**:

$$e^{i\\pi} + 1 = 0$$

Эта формула считается одной из самых красивых в математике!`,
      contentType: 'markdown' as const
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Демонстрация ChatDialog с поддержкой Markdown и LaTeX</h1>
      <p>Этот компонент демонстрирует возможности ChatDialog с поддержкой:</p>
      <ul>
        <li>✅ Markdown разметки</li>
        <li>✅ LaTeX формул</li>
        <li>✅ Подсветки синтаксиса кода</li>
        <li>✅ Отображения изображений</li>
        <li>✅ Воспроизведения видео</li>
        <li>✅ Голосового ввода и вывода</li>
      </ul>
      
      <ChatDialog 
        initialMessages={exampleMessages}
        title="Демо чат с поддержкой Markdown и LaTeX"
        modalWidth={1200}
        defaultOpen={true}
      />
    </div>
  );
};

export default ChatDialogDemo; 