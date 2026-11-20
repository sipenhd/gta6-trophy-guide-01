# Vice City Won't Platinum Itself — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/sipenhd/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/sipenhd/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze. No account, no network, no ads. Just Leonida.

## What it is

- **Checklist tracker** — tick trophies off as you earn them; progress is saved in your browser (localStorage) and can be exported to a JSON file and imported back.
- **Every trophy with its official name, description and grade** as PlayStation publishes them, plus a guide in our own words that names its sources (Exophase, PSNProfiles, GTA Wiki, PowerPyx, PlayStationTrophies.org).
- **Filters** — by grade, by kind (story, missable, collectibles, activities, online), by earned / not earned, and search by name.
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Platinum roadmap in five stages** — story playthrough → missables → collectibles → activities and grinds → cleanup and platinum — built from the official descriptions, with per-stage checklists.
- **Missables flagged** — 9 trophies tied to a story moment or a one-off event, with a warning to attempt them when the chance appears.
- **Honest where it matters** — where a guide states a fact the official description does not pin down, it says so. No invented locations, no copied guide text, no Rockstar logo or official artwork.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — the app is plain static files under `app/` and works with the network off.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library.

## Referral

Made for the make.fun bounty — if you enter too, use this referral link: https://make.fun/r/bjmj9zhr (code `bjmj9zhr`).

## License

MIT — see [LICENSE](LICENSE).
