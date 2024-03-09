export type Team = {
    name: string;
    slug: string;
    description?: string;
    _links?: Links;
}

export type Game = {
    home: Omit<Team, 'slug'>;
    away: Omit<Team, 'slug'>;
    homeScore: number;
    awayScore: number;
    date: Date;
}

export type Link = {
    href: string;
}

export type Links = {
    self?: Link;
    next?: Link;
    prev?: Link;
    first?: Link;
    last?: Link;
    games?: Link;
}

export type GameDb = {
    home: Team;
    away: Team;
    home_score: number;
    away_score: number;
    date: Date;
}