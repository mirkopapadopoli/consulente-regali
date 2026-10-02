# Consulente Regali — istruzioni di lavoro

Webapp "consulente regali" con AI e link Amazon affiliato. Contesto e decisioni in `docs/context/brief.md` — leggilo prima di proporre qualsiasi cosa.

## Workflow obbligatorio per ogni nuova funzionalità

1. **Branch dedicato** — mai lavorare direttamente su `main`. `git checkout -b feature/<nome-breve>`
2. **Sviluppo**
3. **Test** — la suite deve passare; per flussi utente fare anche una verifica reale nel browser, non solo unit test
4. **Documentazione** — ogni feature nuova o cambiata va documentata in `docs/` (indice in `docs/README.md`)
5. **Commit** — solo su richiesta esplicita dell'utente, messaggi sul perché non sul cosa
6. **Merge/PR/deploy** — solo su richiesta esplicita dell'utente

## Note operative

- Tag affiliato Amazon: `mirkopapadopo-21`, marketplace amazon.it
- Il prodotto nasce anche come contenuto Instagram "build in public": scelte che rendono la demo più chiara contano
- Creators API non disponibile finché l'account Associates non fa 10 vendite qualificate in 30 giorni: progettare in modo che la fonte dati prodotto sia sostituibile
- Progetti collegati: `~/Code/BotTelegram` (bot offerte Telegram, canale @affarialvoloo), `~/Code/offertealvolo` e `~/Code/affarialvolo` (ricerca su policy Amazon e Creators API)
