import { Router, Request, Response, NextFunction } from 'express';
import { getTeams, getTeamBySlug, deleteTeamBySlug, insertTeam, conditionalUpdate } from '/Users/orri/Desktop/Desktop - Orri’s MacBook Pro/Skóli/4_onn/Vefforritun II/Verkefni 3 v2/vef2-2024-v3/src/lib/db.js';
import { teamMapper } from '/Users/orri/Desktop/Desktop - Orri’s MacBook Pro/Skóli/4_onn/Vefforritun II/Verkefni 3 v2/vef2-2024-v3/src/lib/mappers.js'
import slugify from 'slugify';
import { getTeamId } from '../lib/db.js';

export async function getTeam(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const teams = await getTeams();
    if(!teams){
        return next(new Error('Unablet to get teams'));
    }
    return res.json({ teams });
}

export async function getTeamSlug(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { slug } = req.params;
    const teamBySlug = await getTeamBySlug(slug);
    if(!teamBySlug){
        return next(new Error('Unable to get team by slug'));
    }
    return res.json({ teamBySlug });
}

export async function deleteTeamSlug(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { slug } = req.params;
    const deleted = await deleteTeamBySlug(slug);
    if(!deleted){
        return next(new Error('Unable to delete team by slug'));
    }
    return res.json({ deleted });
}

export async function postTeam(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { name, slug, description } = req.body;
    const team = await insertTeam({ name, slug, description });
    if(!team){
        return next(new Error('Unable to insert team'));
    }
    return res.json({ team });
}

export async function patchTeam(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { slug } = req.params;
    const team = await getTeamBySlug(slug);

    if(!team){
        return next(new Error('Unable to get team by slug'));
    }

    const { name, description } = req.body;

	const fields = [
		typeof name === 'string' && name ? 'name' : null,
		typeof name === 'string' && name ? 'slug' : null,
		typeof description === 'string' && description ? 'description' : null,
	];

	const values = [
		typeof name === 'string' && name ? name : null,
		typeof name === 'string' && name ? slugify(name).toLowerCase() : null,
		typeof description === 'string' && description ? description : null,
	];

    const teamId = await getTeamId(slug);
    const updated = await conditionalUpdate(
        'teams',
        teamId,
        fields,
        values
    )

    if (!updated) {
        return next(new Error('unable to update team'));
    }

	const teamUpdated = updated.rows[0]
	const responseTeam = teamMapper(teamUpdated)

	return res.json(responseTeam)
    
}





