import { Request, Response, NextFunction } from 'express';
import { getGame, getGames, deleteGame, updateGame, insertGame } from '../lib/db.js';
import { Game } from '../types';

export async function returnGame(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const games = await getGames();
    if(!games){
        return next(new Error('Unable to get games'));
    }
    return res.status(200).json({ games: [] });
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
    if(!game){
        return next(new Error('Unable to get game'));
    }

    return res.status(200).json({ game });
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
    if(!deleted){
        return next(new Error('Unable to delete game'));
    }

    return res.status(200).json({ deleted });    
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
    if(!game){
        return next(new Error('Unable to update game'));
    }
    return res.status(200).json({ game });    
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
    if(!game){
        return next(new Error('Unable to insert game'));
    }
    return res.status(201).json({ game });    
}
