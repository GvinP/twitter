// Запускается ОДИН РАЗ локально (не в GitHub Actions).
// Открывает настоящий (не headless) браузер, ты логинишься в X руками,
// как обычный человек — со своим паролем, с прохождением возможной
// проверки (капча / код на почту). Скрипт сам ничего не подделывает,
// просто ждёт, пока ты закончишь, и сохраняет сессию (куки + localStorage)
// в файл storageState.json.
//
// Дальше этот файл используется в GitHub Actions вместо повторного логина —
// это важно: сам автоматизированный логин с сервера — самый подозрительный
// для X паттерн, поэтому мы его избегаем.
//
// Запуск: npm run login

import { chromium } from "playwright";

const STORAGE_STATE_PATH = "storageState.json";

async function main() {
  // channel: "chrome" запускает настоящий установленный Chrome вместо
  // бандл-Chromium от Playwright — у бандл-версии X (как и Google) иногда
  // распознаёт автоматизационную сигнатуру и молча блокирует шаги логина.
  // Флаг ниже дополнительно убирает признак navigator.webdriver.
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://x.com/login");

  console.log("");
  console.log("→ Залогинься в открывшемся окне браузера как обычно.");
  console.log("→ Дойди до своей ленты (главная страница со списком твитов).");
  console.log("→ После этого вернись в терминал и нажми Enter.");
  console.log("");

  await waitForEnter();

  await context.storageState({ path: STORAGE_STATE_PATH });
  console.log(`Готово. Сессия сохранена в ${STORAGE_STATE_PATH}`);
  console.log(
    "Дальше: закодируй файл в base64 и положи в GitHub Secret X_STORAGE_STATE — см. README.md"
  );

  await browser.close();
}

function waitForEnter(): Promise<void> {
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once("data", () => {
      process.stdin.pause();
      resolve();
    });
  });
}

main();
