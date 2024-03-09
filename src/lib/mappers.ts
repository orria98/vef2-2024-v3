import {Team, Game, Links, GameDb} from '../types';

export function teamMapper( potentialTeam: unknown): Team | null {
    const team = potentialTeam as Partial<Team> | null;

    if(!team || !team.name || !team.slug) {
        return null;
    }

    const links: Links = {
        self: {
            href: `/departments/${team.slug}`,
        }
    };

    const mapped: Team = {
        name: team.name,
        slug: team.slug,
        description: team.description,
        _links: links,
    };
    return mapped;
}

export function teamsMapper(potentialTeams: unknown): Array<Team>{
    const teams = potentialTeams as Array<unknown> | null;

    if(!teams){
        return [];
    }

    const mapped = teams.map((t) => teamMapper(t));

    return mapped.filter((i): i is Team => Boolean(i));
}

export function gameMapper( potentialGame: unknown): Game | null {
    const game = potentialGame as Partial<GameDb> | null;

    if(!game || !game.home || !game.away || !game.home_score || !game.away_score || !game.date) {
        return null;
    }

    const mapped: Game = {
        home: game.home,
        away: game.away,
        homeScore: game.home_score,
        awayScore: game.away_score,
        date: game.date,
    };
    return mapped;
}

export function gamesMapper(potentialGames: unknown): Array<Game>{
    const games = potentialGames as Array<Partial<Game>> | null;

    if(!games || !Array.isArray(games)){
        return [];
    }

    const mapped = games.map(gameMapper);

    return mapped.filter((i): i is Game => Boolean(i));
}

