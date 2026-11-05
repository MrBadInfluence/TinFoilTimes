// leak.routes.js — the waiter. It only decides WHICH controller function
// handles each address + method. No database code lives here.
//
// express.Router() is a mini-app that holds a group of related routes.
// server.js plugs it in under "/api/leaks", so the paths below are
// written RELATIVE to that: '/' here really means '/api/leaks'.
// Like a sub-menu: the main menu says "Desserts →", and this file lists
// what's on the dessert page.
import express from 'express';
import { getLeaks, createLeak, voteOnLeak } from '../controllers/leak.controller.js';

const router = express.Router();

router.get('/', getLeaks);              // GET   /api/leaks          — read (with ?category= & ?sort=)
router.post('/', createLeak);           // POST  /api/leaks          — create a new leak
router.patch('/:id/vote', voteOnLeak);  // PATCH /api/leaks/:id/vote — update one vote count
// ":id" is a placeholder — Express fills it with whatever is in that
// part of the address and hands it over as req.params.id.

export default router;
