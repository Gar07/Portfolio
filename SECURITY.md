# Security

This is a single-owner portfolio. Public API data, the profile photograph, contact links and the downloadable CV are intentionally public. Administrative operations require a PHP session; changes also require CSRF verification.

Report vulnerabilities privately to the contact email shown on the portfolio. Do not include passwords, session cookies, database dumps or other people's personal data in a public issue. This repository does not accept credentials through issues or pull requests.

Keep PHP and frontend dependencies supported. Before deployment, run the verification workflow and follow HOSTINGER.md. Keep configuration, database exports, logs, backups and uploaded files out of Git and outside the public document root. Session storage must remain writable and private. Use a unique administrator password and HTTPS.

The login limit is per IP, shared through MySQL. It is suitable for a personal portfolio and is not a substitute for hosting-level protection against distributed abuse. The audit records tested cases, not a guarantee that every vulnerability has been found.
