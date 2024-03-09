import { Request, Response, NextFunction } from 'express';
import { getGame, getGames, deleteGame, updateGame, insertGame } from '../lib/db.js';
import { Game } from '../types';

export async function returnGame(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const games = await getGames();
    res.status(200).json({ games: [] });
    next();
}

export async function getGameHomeAwayDate(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { home, away, date } = req.body;
    const game = await getGame({
        home, away, date,
        homeScore: 0,
        awayScore: 0
    });
    res.status(200).json({ game });
    next();
}

export async function deleteGames(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { home, away, date } = req.body;
    const deleted = await deleteGame({
        home, away, date,
        homeScore: 0,
        awayScore: 0
    });
    res.status(200).json({ deleted });
    next();
}

export async function patchGame(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { home, away, date, homeScore, awayScore } = req.body;
    const game = await updateGame({
        home, away, date, homeScore, awayScore
    });
    res.status(200).json({ game });
    next();
}

export async function postGame(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { home, away, date, homeScore, awayScore } = req.body;
    const game = await insertGame({
        home, away, date, homeScore, awayScore
    });
    res.status(201).json({ game });
    next();
}
