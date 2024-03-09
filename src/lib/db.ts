import pg from 'pg';
import { Team, Game } from '../types';
import { teamMapper, teamsMapper, gameMapper, gamesMapper } from './mappers.js';
import slugify from 'slugify';


const env = process.env.NODE_ENV ?? 'development';


let savedPool = new pg.Pool;

export function getPool() {
    if(savedPool){
        return savedPool;
    }

    const { DATABASE_URL: connectionString } = process.env;
    if(!connectionString){
        console.error('Vantar DATABASE_URL í .env');
        throw new Error('Missing DATABASE_URL');
    }

    savedPool = new pg.Pool({ connectionString });

    savedPool.on('error', (err) => {
        console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
        throw new Error('Error in database connection');
    });
    return savedPool;
}


export async function query(
    q: string,
    values: Array<unknown> = []
) {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        const client = await pool.connect();
        const result = await client.query(q, values);
        client.release();
        return result;
    } catch (e) {
        console.error('Error running query', q);
        console.error(e);
        throw e;
    } finally {
        pool.end();
    }
}

export async function getTeamId(slug: string): Promise<number> {
    const result = await query('SELECT id FROM teams WHERE slug = $1', [slug]);
    return result.rows[0]?.id;
}

export async function poolEnd() {
    const pool = getPool();
    await pool.end();
}

export async function getTeams(): Promise<Array<Team> | null> {
    const result = await query('SELECT * FROM teams');
    return result.rows;
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
    const result = await query('SELECT * FROM teams WHERE slug = $1', [slug]);
    return result.rows[0];
}

export async function deleteTeamBySlug(slug: string): Promise<boolean> {
    const result = await query('DELETE FROM teams WHERE slug = $1', [slug]);
    if (!result) {
        return false;
    }

    return result.rowCount === 1;
}

export async function insertTeam(team: Team): Promise<Team | null> {
    const result = await query(
        'INSERT INTO teams (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
        [team.name, team.slug, team.description]
    );

    const mapped = teamMapper(result?.rows[0]);

    return mapped;
}

export async function conditionalUpdate(
        table: 'games' | 'teams',
        id: number,
        updateFields: Array<string | null>,
        updateValues: Array<string | number | null>,
        idTag: number | string | object | null | undefined = ''
) {
        const validFields = updateFields.filter((field) => typeof field === 'string');
        const validValues = updateValues.filter(
                (value): value is string | number => typeof value === 'string' || typeof value === 'number',
        );

        if (validFields.length === 0) {
                return false;
        }

        if (validFields.length !== validValues.length) {
                throw new Error('fields and values must be of equal length');
        }

        const updateStatements = validFields.map((field, index) => `${field} = $${index + 2}`);

        const sqlQuery = `
            UPDATE ${table}
                SET ${updateStatements.join(', ')}
            WHERE
                ${idTag}id = $1
            RETURNING *
            `;

        const queryParameters: Array<string | number> = [id, ...validValues];
        const queryResult = await query(sqlQuery, queryParameters);

        return queryResult;
}
export async function updateTeam(team: Team): Promise<Team | null> {
    const result = await query(
        'UPDATE teams SET name = $1, slug = $2, description = $3 RETURNING *',
        [team.name, team.slug, team.description]
    );

    const mapped = teamMapper(result?.rows[0]);

    return mapped;
}
export async function getGames(): Promise<Array<Game> | null> {
    const result = await query('SELECT * FROM games');
    return result.rows;
}

export async function getGame(game: Game): Promise<Game | null> {
    const result = await query('SELECT * FROM games WHERE home = $1 AND away = $2 AND date = $3', [game.home, game.away, game.date]);
    const mapped = gameMapper(result?.rows[0]);
    
    return mapped;
}

export async function deleteGame(game: Game): Promise<boolean> {
    const result = await query('DELETE FROM games WHERE home = $1 AND away = $2 AND date = $3', [game.home, game.away, game.date]);
    if (!result) {
        return false;
    }

    return result.rowCount === 1;
}

export async function insertGame(game: Game): Promise<Game | null> {
    const homeId = await getTeamId(slugify(game.home.name).toLowerCase());
    const awayId = await getTeamId(slugify(game.away.name).toLowerCase());
    const result = await query(
        'INSERT INTO games (home, home_score, away, away_score, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [homeId, game.homeScore, awayId, game.awayScore, game.date]
    );

    const mapped = gameMapper(result?.rows[0]);

    return mapped;
}

export async function updateGame(game: Game): Promise<Game | null> {
    const result = await query(
        'UPDATE games SET home = $1, away = $2, home_score = $3, away_score = $4, date = $5 RETURNING *',
        [game.home, game.away, game.homeScore, game.awayScore, game.date]
    );

    const mapped = gameMapper(result?.rows[0]);

    return mapped;
}

