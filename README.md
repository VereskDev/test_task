# 🛒 DummyJSON Carts SPA

SPA для работы с корзинами пользователей через [DummyJSON API](https://dummyjson.com/docs/carts).

 **Демо:** [test-task-theta-two.vercel.app](https://test-task-theta-two.vercel.app)

---

## Запуск

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev
После запуска приложение будет доступно по адресу http://localhost:5173

Структура проекта
text
src/
├── api/          # Запросы к API и TypeScript типы
├── components/   # Переиспользуемые компоненты
├── pages/        # Страницы приложения
├── store/        # Zustand стор для UI состояния
├── App.tsx       # Настройка роутинга
└── main.tsx      # Точка входа
🛠 Стек технологий
Технология	Назначение
React + Vite + TypeScript	Основа приложения, быстрая сборка, типизация
React Query	Работа с API, кеширование данных
Zustand	Управление UI состоянием (пагинация, фильтры)
React Router	Навигация между страницами
Emotion/styled	Стилизация компонентов
Axios	HTTP-клиент для запросов к API
