# Vaccine Mandate Decision Aid (AU · FR · IT)

This is a static (no-backend) decision aid intended for policy teams to compare vaccine mandate configurations using:

1) The DCE attribute structure from your study (scope, exemptions, coverage threshold to lift the mandate, and expected lives saved per 100,000), and  
2) A transparent cost inventory consistent with your cost-component review.

## Files
- `index.html` – UI and content
- `styles.css` – WHO-inspired styling (no WHO assets/trademarks)
- `script.js` – calculations, storage, exports
- `assets/` – small icons (local)

## How to run locally
Open `index.html` in a browser. No build step.

## How to deploy
Upload the folder to any static host (GitHub Pages, Netlify, S3 static website hosting).

## Preference model inputs (optional)
The tool can compute predicted support if you upload either:
- `coeff` mode: a JSON containing your estimated coefficients by country and outbreak frame, or
- `bundle` mode: a JSON table of predicted support for a set of policy bundles at specified lives-saved values.

See the “Evidence and data formats” tab for the JSON structures.

## Important
- The tool does not include any country preference coefficients by default.
- Cost defaults are blank unless your costing document provides an evidence anchor; all inputs must be reviewed and documented for policy use.


## Built-in preference estimates
This build includes your MXL and latent class estimates (means/shares) for Australia, France, and Italy under mild and severe outbreak contexts.
Select them in Benefits → Public support.
