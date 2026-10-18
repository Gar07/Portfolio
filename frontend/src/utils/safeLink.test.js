import assert from 'node:assert/strict';
import { safeLink } from './safeLink.js';
for (const value of ['https://github.com/Gar07/', 'mailto:hello@example.com', 'tel:+628123456']) assert.equal(safeLink(value), value);
for (const value of ['javascript:alert(1)', 'data:text/html,<script>', '//evil.test', '', null, {}]) assert.equal(safeLink(value), undefined);
