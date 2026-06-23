# Grant data review - 2026-06-23

## Previous hardcoded dataset state

- `src/data/grants.ts` contained 48 hardcoded grant records.
- Most records had hardcoded 2026 `open` and `close` values, including several `Rolling` values.
- The dataset had a top-level `GRANTS_DATASET.reviewedAt` value and note, but individual grant records did not all carry explicit verification metadata.
- No deadline dates were changed during this review because no official-source verification could be completed from the agent environment.

## Firecrawl status and blocker

Required bounded checks were attempted:

```bash
export PATH="$HOME/.npm-global/bin:$PATH"
firecrawl --version --auth-status
timeout 20s firecrawl login --browser || true
firecrawl --version --auth-status
```

Observed output:

```text
version: 1.19.18
authenticated: false

Opening browser for authentication...
If the browser doesn't open, visit: https://firecrawl.dev/cli-auth?code_challenge=...#session_id=...
Waiting for browser authentication
version: 1.19.18
authenticated: false
```

Live verification blocked in agent environment; needs manual official-source review. Per task constraints, no repeated web searches or scrape attempts were made after authentication remained unavailable.

## Verification rules

- Official funder page wins over aggregators, search snippets, cached content, or inferred annual patterns.
- If the next intake is unpublished, show `Closed` or `Check funder site` rather than inventing a future date.
- Use `Rolling` only when the official funder source explicitly says the program is rolling or continuously open.
- Every record must carry per-record metadata:
  - `verifiedAt: '2026-06-23'`
  - `verificationStatus: 'needs-review'` unless official-source Firecrawl verification succeeds.

## High-priority record review table

Because live verification is blocked, all high-priority records below retain their previous local deadline values and are marked for manual official-source review.

| ID | Grant | Funder | Source URL | Local deadline before review | Result |
| --- | --- | --- | --- | --- | --- |
| 1 | Talent to Watch | Telefilm Canada | https://telefilm.ca/en/funding/talent-to-watch | 2026-04-30 | Live verification blocked in agent environment; needs manual official-source review |
| 2 | Development Program | Telefilm Canada | https://telefilm.ca/en/funding/development | Rolling | Live verification blocked in agent environment; needs manual official-source review |
| 3 | Explore and Create | Canada Council for the Arts | https://canadacouncil.ca/funding/grants/explore-and-create | 2026-05-15 | Live verification blocked in agent environment; needs manual official-source review |
| 4 | Engage and Sustain | Canada Council for the Arts | https://canadacouncil.ca/funding/grants/engage-and-sustain | 2026-06-01 | Live verification blocked in agent environment; needs manual official-source review |
| 31 | Creating, Knowing and Sharing | Canada Council for the Arts | https://canadacouncil.ca/funding/grants/creating-knowing-sharing | 2026-06-15 | Live verification blocked in agent environment; needs manual official-source review |
| 32 | Supporting Artistic Practice | Canada Council for the Arts | https://canadacouncil.ca/funding/grants/supporting-artistic-practice | 2026-07-01 | Live verification blocked in agent environment; needs manual official-source review |
| 33 | Arts Across Canada and Abroad | Canada Council for the Arts | https://canadacouncil.ca/funding/grants/arts-across-canada-and-abroad | 2026-08-01 | Live verification blocked in agent environment; needs manual official-source review |
| 5 | Ontario Creates IP Fund | Ontario Creates | https://www.ontariocreates.ca/investment-programs/content-creation/intellectual-property-fund | 2026-05-31 | Live verification blocked in agent environment; needs manual official-source review |
| 6 | IDM Fund | Ontario Creates | https://www.ontariocreates.ca/investment-programs/content-creation/idm-fund-2 | Rolling | Live verification blocked in agent environment; needs manual official-source review |
| 7 | Media Artists Program - Creation | Toronto Arts Council | https://torontoartscouncil.org/grants/media-artists-program-creation/ | 2026-10-15 | Live verification blocked in agent environment; needs manual official-source review |
| 8 | Dance Projects | Toronto Arts Council | https://torontoartscouncil.org/grants/dance-projects/ | 2026-03-16 | Live verification blocked in agent environment; needs manual official-source review |
| 36 | Theatre Projects | Toronto Arts Council | https://torontoartscouncil.org/grants/theatre-projects/ | 2026-03-02 | Live verification blocked in agent environment; needs manual official-source review |
| 37 | Playwrights Program | Toronto Arts Council | https://torontoartscouncil.org/grants/playwrights-program/ | 2026-06-16 | Live verification blocked in agent environment; needs manual official-source review |
| 38 | Music Projects | Toronto Arts Council | https://torontoartscouncil.org/grants/music-projects/ | 2026-03-16 | Live verification blocked in agent environment; needs manual official-source review |
| 39 | Music Creation & Recording | Toronto Arts Council | https://torontoartscouncil.org/grants/music-creation-and-recording/ | 2026-09-03 | Live verification blocked in agent environment; needs manual official-source review |
| 40 | Visual Artists Program - Creation | Toronto Arts Council | https://torontoartscouncil.org/grants/visual-artists-program-creation/ | Rolling | Live verification blocked in agent environment; needs manual official-source review |
| 41 | Writers Program | Toronto Arts Council | https://torontoartscouncil.org/grants/writers-program/ | 2026-06-15 | Live verification blocked in agent environment; needs manual official-source review |
| 42 | Literary Projects | Toronto Arts Council | https://torontoartscouncil.org/grants/literary-projects/ | Rolling | Live verification blocked in agent environment; needs manual official-source review |
| 9 | Convergent Stream - Development | Canada Media Fund (CMF) | https://cmf-fmc.ca/our-programs/ | 2026-04-08 | Live verification blocked in agent environment; needs manual official-source review |
| 10 | Experimental Stream | Canada Media Fund (CMF) | https://cmf-fmc.ca/our-programs/ | 2026-05-01 | Live verification blocked in agent environment; needs manual official-source review |
| 11 | Bell Fund - Digital Media | Bell Fund | https://bellfund.ca/deadlines/ | 2026-06-30 | Live verification blocked in agent environment; needs manual official-source review |
| 12 | Producers Program | Independent Production Fund (IPF) | https://www.ipf.ca/ | 2026-04-20 | Live verification blocked in agent environment; needs manual official-source review |
| 13 | LIFT Production Grant | Liaison of Independent Filmmakers of Toronto | https://lift.ca/ | 2026-05-01 | Live verification blocked in agent environment; needs manual official-source review |
| 14 | Alberta Made Production Grant | Government of Alberta | https://www.alberta.ca/alberta-made-production-grant | Rolling | Live verification blocked in agent environment; needs manual official-source review |
| 34 | Alberta Project Script Development Grant | Government of Alberta | https://www.alberta.ca/alberta-project-script-development-grant | Rolling | Live verification blocked in agent environment; needs manual official-source review |
| 35 | AMF Post Production Grant | Government of Alberta | https://www.alberta.ca/alberta-project-script-development-grant | Rolling | Live verification blocked in agent environment; needs manual official-source review |
| 15 | Film, Sound & Music Grant | Creative BC | https://www.creativebc.com/ | 2026-06-15 | Live verification blocked in agent environment; needs manual official-source review |
| 16 | Manitoba Film & TV Funding Programs | Manitoba Film & Music | https://www.mbfilmmusic.ca/film-tv/film-tv-funding-programs | Rolling | Live verification blocked in agent environment; needs manual official-source review |
| 17 | Filmmaker Assistance Program (FAP) | National Film Board of Canada (NFB) | https://production.nfbonf.ca/en/filmmaker-assistance-program-fap/ | 2026-07-01 | Live verification blocked in agent environment; needs manual official-source review |
| 18 | Saskatchewan Arts Board Project Grant | Saskatchewan Arts Board | https://sk-arts.ca/ | 2026-05-15 | Live verification blocked in agent environment; needs manual official-source review |
| 19 | Project Involve Fellowship | Film Independent | https://www.filmindependent.org/programs/project-involve/ | 2026-10-01 | Live verification blocked in agent environment; needs manual official-source review |
| 20 | Sundance Feature Film Program | Sundance Institute | https://collab.sundance.org/ | 2026-07-01 | Live verification blocked in agent environment; needs manual official-source review |
| 21 | Sundance Documentary Fund | Sundance Institute | https://www.sundance.org/apply | 2026-06-01 | Live verification blocked in agent environment; needs manual official-source review |
| 22 | Berlinale Talents | Berlin International Film Festival | https://www.berlinale-talents.de/ | 2026-11-01 | Live verification blocked in agent environment; needs manual official-source review |
| 23 | TIFF Talent Lab | Toronto International Film Festival | https://tiff.net/themarket/programming/labs-learning | 2026-05-31 | Live verification blocked in agent environment; needs manual official-source review |
| 24 | Locarno Filmmakers Academy | Locarno Film Festival | https://www.locarnofestival.ch/about/factory.html | 2026-06-01 | Live verification blocked in agent environment; needs manual official-source review |
| 25 | IDFA Forum - DocLab | International Documentary Film Festival Amsterdam | https://festival.idfa.nl/en/new-media/ | 2026-08-01 | Live verification blocked in agent environment; needs manual official-source review |
| 26 | TorinoFilmLab - Script & Pitch | Torino Film Lab | https://www.torinofilmlab.it/labs | 2026-04-15 | Live verification blocked in agent environment; needs manual official-source review |
| 27 | IFFR Bright Future | International Film Festival Rotterdam | https://iffr.com/en/iffr-pro/talent-development | 2026-09-01 | Live verification blocked in agent environment; needs manual official-source review |
| 28 | MAC Matchmaker MicroGrant | Mississauga Arts Council | https://www.mississaugaartscouncil.com/ | Rolling | Live verification blocked in agent environment; needs manual official-source review |
| 29 | OAC - Dance | Ontario Arts Council | https://www.arts.on.ca/grants/discipline/dance | 2026-05-01 | Live verification blocked in agent environment; needs manual official-source review |
| 43 | OAC - Literature | Ontario Arts Council | https://www.arts.on.ca/grants/discipline/literature | 2026-05-01 | Live verification blocked in agent environment; needs manual official-source review |
| 44 | OAC - Media Arts | Ontario Arts Council | https://www.arts.on.ca/grants/discipline/media-arts | 2026-05-01 | Live verification blocked in agent environment; needs manual official-source review |
| 45 | OAC - Multi and Inter-Arts | Ontario Arts Council | https://www.arts.on.ca/grants/discipline/multi-and-inter-arts | 2026-05-01 | Live verification blocked in agent environment; needs manual official-source review |
| 46 | OAC - Music | Ontario Arts Council | https://www.arts.on.ca/grants/discipline/music | 2026-05-01 | Live verification blocked in agent environment; needs manual official-source review |
| 47 | OAC - Theatre | Ontario Arts Council | https://www.arts.on.ca/grants/discipline/theatre | 2026-05-01 | Live verification blocked in agent environment; needs manual official-source review |
| 48 | OAC - Visual Arts | Ontario Arts Council | https://www.arts.on.ca/grants/discipline/visual-arts | 2026-05-01 | Live verification blocked in agent environment; needs manual official-source review |
| 30 | NSI Features First | National Screen Institute (NSI) | https://nsi-canada.ca/programs/ | 2026-08-15 | Live verification blocked in agent environment; needs manual official-source review |
