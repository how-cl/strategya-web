# Strategya.pro · timestamped record of published signals

Every time the signal run publishes, a small manifest is written here and its fingerprint is anchored in the Bitcoin
blockchain with [OpenTimestamps](https://opentimestamps.org). It proves that a signal was published on a given day and
has not been modified since. It does not prove real profit: results shown on the site are a simulated backtest plus
published signals, not real performance and not investment advice.

- `YYYY/YYMMDDHHMM.json`: the manifest of one run (UTC). For each product: decision bar, action, positions, the
  signal's own `checksum` and the SHA-256 of the published `<slug>.signal.json`.
- `YYYY/YYMMDDHHMM.json.ots`: the OpenTimestamps proof of that manifest. It starts as "pending" and is completed a few
  hours later, once a Bitcoin block confirms it.
- `index.json`: the list of manifests and the state of each proof (`pending`, or `bitcoin` with the block height).

## How to check one

1. Download a manifest and its `.ots` file.
2. Drop both on https://opentimestamps.org (or run `ots verify YYMMDDHHMM.json.ots` with the OpenTimestamps client).
   It tells you the Bitcoin block, and therefore the date, by which that exact file existed.
3. To check a signal against the manifest: take the file at
   `https://raw.githubusercontent.com/how-cl/strategya-web/<web_commit>/latest/<slug>.signal.json` and compare its
   SHA-256 with the `sha256` listed for that slug.

Each manifest carries the fingerprint of the previous one (`previous`), so removing or editing one breaks the chain.
