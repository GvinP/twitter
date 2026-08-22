# Разовый логин в X с телефона (через Codespaces)

Нужен только браузер на телефоне и аккаунт на GitHub. Займёт ~10 минут,
дальше эта настройка не понадобится (можно удалить codespace в конце).

1. Открой `github.com/GvinP/twitter` в браузере телефона, переключись на
   ветку `claude/github-scraper-lok0us` (селектор веток над списком файлов).
2. Зелёная кнопка **Code** → вкладка **Codespaces** → **Create codespace on
   claude/github-scraper-lok0us**.
3. Подожди 2–4 минуты, пока соберётся контейнер (ставится Node,
   Playwright, виртуальный рабочий стол) — откроется VS Code в браузере.
4. Внизу открой вкладку **PORTS**, найди порт **6080**, нажми на иконку
   "открыть в браузере" (глобус) рядом с ним — откроется новая вкладка
   noVNC. Пароль (если спросит): `login`.
5. Вернись во вкладку с VS Code, открой терминал (меню ☰ → Terminal →
   New Terminal) и запусти:
   ```
   npm run login
   ```
6. Переключись обратно на вкладку noVNC — там должно появиться окно
   Chromium с `x.com/login`. Залогинься в **отдельный технический**
   X-аккаунт (не в свой основной!) как обычно, дойди до ленты.
7. Вернись во вкладку VS Code (терминал) и нажми **Enter** — скрипт
   сохранит сессию в `storageState.json`.
8. В том же терминале выполни:
   ```
   base64 -w 0 storageState.json > storageState.b64.txt
   cat storageState.b64.txt
   ```
   Выдели и скопируй весь вывод (это одна длинная строка).
9. В GitHub (в этом же репозитории): **Settings → Secrets and variables
   → Actions → New repository secret**.
   - Name: `X_STORAGE_STATE_B64`
   - Secret: вставь скопированное значение
   - **Add secret**
10. Убери за собой: в терминале `rm storageState.b64.txt storageState.json`,
    затем в списке Codespaces (github.com/codespaces) останови или удали
    этот codespace, чтобы не тратить лимит.

Готово — секрет `X_STORAGE_STATE_B64` теперь есть в репозитории, и
GitHub Actions сможет им пользоваться при запуске скрейпера.
