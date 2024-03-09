import express, { Request, Response, NextFunction } from 'express';
import { sayHello, indexFunc } from '../lib/hello.js';
import { getTeam, getTeamSlug, deleteTeamSlug, postTeam, patchTeam } from './teams-router.js';
import { catchErrors } from '../lib/catch-errors.js';
import { returnGame, deleteGames, patchGame, postGame } from './games-router.js';


export const router = express.Router();
export async function hello(req: Request, res: Response, next: NextFunction) {
  res.json({ hello: sayHello('world') });
  next();
}

export async function index(req: Request, res: Response, next: NextFunction) {
  res.json(indexFunc());
  next();
}


export async function bye() {
  console.log('done');
}

export async function error() {
  throw new Error('error');
}

router.get('/', catchErrors(index));

router.get('/teams', getTeam);
router.get('/teams/:slug', getTeamSlug);
router.delete('/teams/:slug', deleteTeamSlug);
router.post('/teams', postTeam);
router.patch('/teams', patchTeam);

router.get('/games', catchErrors(returnGame));
router.delete('/games', catchErrors(deleteGames));
router.patch('/games', catchErrors(patchGame));
router.post('/games', catchErrors(postGame));
