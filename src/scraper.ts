import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { loadState, saveState, isNewer, type State } from "./state.js";

const STORAGE_STATE_PATH = "storageState.json";
const accounts: string[] = JSON.parse(
  readFileSync("src/accounts.json", "utf-8")
);

type Tweet = {
  id: string;
  author: string;
  text: string;
  url: string;
  postedAt: string | null;
};

async function scrapeAccount(page: import("playwright").Page, username: string): Promise<Tweet[]> {
  await page.goto(`https://x.com/${username}`, { waitUntil: "domcontentloaded" });

  // Ждём появления хотя бы одного твита. Если аккаунт закрыт/не грузится —
  // просто пропускаем его, не роняя весь прогон.
  try {
    await page.waitForSelector('article[data-testid="tweet"]', { timeout: 15000 });
  } catch {
    console.warn(`  [!] ${username}: твиты не загрузились (приватный? удалён? rate limit?)`);
    return [];
  }

  // Небольшая случайная пауза и скролл — чуть меньше похоже на робота,
  // чем мгновенное считывание сразу после загрузки.
  await page.waitForTimeout(1000 + Math.random() * 2000);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(500 + Math.random() * 1000);

  const tweets = await page.$$eval(
    'article[data-testid="tweet"]',
    (articles, username) => {
      return articles
        .map((article) => {
          const link = article.querySelector('a[href*="/status/"]') as HTMLAnchorElement | null;
          const href = link?.getAttribute("href") ?? "";
          const match = href.match(/status\/(\d+)/);
          const id = match ? match[1] : null;
          if (!id) return null;

          const textEl = article.querySelector('[data-testid="tweetText"]');
          const timeEl = article.querySelector("time");

          return {
            id,
            author: username,
            text: textEl?.textContent ?? "",
            url: `https://x.com${href}`,
            postedAt: timeEl?.getAttribute("datetime") ?? null,
          };
        })
        .filter((t): t is NonNullable<typeof t> => t !== null);
    },
    username
  );

  return tweets;
}

async function main() {
  const state: State = loadState();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
  const page = await context.newPage();

  const newTweets: Tweet[] = [];

  for (const username of accounts) {
    console.log(`Проверяю @${username}...`);
    const tweets = await scrapeAccount(page, username);

    for (const tweet of tweets) {
      if (isNewer(tweet.id, state[username])) {
        newTweets.push(tweet);
      }
    }

    // Самый свежий твит на странице — первый в списке
    if (tweets.length > 0) {
      const latestId = tweets.reduce((max, t) =>
        BigInt(t.id) > BigInt(max) ? t.id : max, tweets[0].id);
      if (isNewer(latestId, state[username])) {
        state[username] = latestId;
      }
    }

    // Пауза между аккаунтами, тоже с разбросом
    await page.waitForTimeout(2000 + Math.random() * 3000);
  }

  // Сохраняем обновлённую сессию — куки X иногда ротируются на лету
  await context.storageState({ path: STORAGE_STATE_PATH });
  await browser.close();

  saveState(state);

  console.log(`\nНовых твитов: ${newTweets.length}`);
  for (const t of newTweets) {
    console.log(`  @${t.author}: ${t.text.slice(0, 100)}${t.text.length > 100 ? "…" : ""}`);
    console.log(`  ${t.url}\n`);
  }

  const { writeFileSync } = await import("node:fs");
  writeFileSync("data/last-run-new-tweets.json", JSON.stringify(newTweets, null, 2) + "\n");

  await sendToWorker(newTweets);
}

// Отправляем новые твиты в Cloudflare Worker — дальше он сам дедуплицирует,
// скорит, генерирует ответ и шлёт карточку в Telegram (см. cloudflare-changes/).
async function sendToWorker(tweets: Tweet[]) {
  const url = process.env.WORKER_INGEST_URL;
  const secret = process.env.WORKER_INGEST_SECRET;

  if (!url || !secret) {
    console.warn(
      "  [!] WORKER_INGEST_URL / WORKER_INGEST_SECRET не заданы — пропускаю отправку в Worker (только локальный файл)."
    );
    return;
  }

  if (tweets.length === 0) {
    console.log("Новых твитов нет, Worker не дёргаем.");
    return;
  }

  const payload = {
    posts: tweets.map((t) => ({
      postId: t.id,
      authorUsername: t.author,
      text: t.text,
      url: t.url,
      createdAt: t.postedAt ?? new Date().toISOString(),
    })),
  };

  const res = await fetch(`${url.replace(/\/$/, "")}/ingest/tweets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Ingest-Secret": secret,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Worker вернул ${res.status}: ${body}`);
  }

  console.log(`Отправлено в Worker: ${tweets.length} твитов`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
