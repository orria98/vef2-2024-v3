import dotenv from 'dotenv';
import { insertTeam, getTeamId, insertGame, query, poolEnd } from '../lib/db.js';
import { parseTeamsJson, parseGamedayFile } from './parse.js';
import { Logger } from '../lib/logger.js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { readFilesFromDir } from '../lib/file.js';
import { Team, Game } from '../types.js';
import slugify from 'slugify';

dotenv.config();

//const SCHEMA_FILE = '/Users/orri/Desktop/Desktop - Orri’s MacBook Pro/Skóli/4_onn/Vefforritun II/Verkefni 3 v2/vef2-2024-v3/src/sql/schema.sql';
//const DROP_SCHEMA_FILE = '/Users/orri/Desktop/Desktop - Orri’s MacBook Pro/Skóli/4_onn/Vefforritun II/Verkefni 3 v2/vef2-2024-v3/src/sql/drop.sql';
//const INPUT_DIR = '/Users/orri/Desktop/Desktop - Orri’s MacBook Pro/Skóli/4_onn/Vefforritun II/Verkefni 3 v2/vef2-2024-v3/data';
const SCHEMA_FILE = '../sql/schema.sql';
const DROP_SCHEMA_FILE = '../sql/drop.sql';
const INPUT_DIR = '../../data';
async function setupData(logger: Logger){
    const dropScript = await readFile(DROP_SCHEMA_FILE);
    const createScript = await readFile(SCHEMA_FILE);

    if(await query(dropScript.toString('utf-8'))){
        logger.info('Dropped schema');
    } else {
        logger.info('Failed to drop schema');
        poolEnd();
        return process.exit(-1);
    }

    if(await query(createScript.toString('utf-8'))){
        logger.info('Created schema');
    } else {
        logger.info('Failed to create schema');
        poolEnd();
        return process.exit(-1);
    }

    const teamsFileData = await readFile(join(INPUT_DIR, 'teams.json'));
    const teamsFileDataString = teamsFileData.toString('utf-8');
    console.log(teamsFileDataString);

    const teams = parseTeamsJson(teamsFileDataString);
    console.log(teams);
    logger.info('Team names read');

    const files = await readFilesFromDir(INPUT_DIR);
    console.log('files er af gerðinni: ', typeof files);
    console.log('er array?', Array.isArray(files));
    const gamedayFiles = files.filter((file) => file.indexOf('gameday-') > 0);
    logger.info('gameday files are found');

    const gamedays = [];

    logger.info('starting to parse gameday files');
    for await(const gamedayFile of gamedayFiles){
        const file = await readFile(gamedayFile);
        const parsedGamedayFiles = parseGamedayFile(file.toString(), logger, teams);
        console.log(parsedGamedayFiles);

        try {
            gamedays.push(parsedGamedayFiles);
        } catch (error) {
            logger.error(`Failed to parse ${gamedayFile}`);
        }
    }
    logger.info('gameday files are parsed');

    for(const team of teams){
        const teamInDb: Team = {
            name: team,
            slug: slugify(team).toLowerCase(),
            description: ''
        };

        const insertedTeam = await insertTeam(teamInDb);

        if(!insertedTeam){
            logger.error(`Failed to insert team ${team}`);
            continue;
        }

        console.info(`Created team ${teamInDb.name}`);
    }

    for(const gameday of gamedays){
        for(const game of gameday.games){
            if (typeof game.home.name !== 'string' || typeof game.away.name !== 'string') {
                logger.error(`Invalid team names: ${game.home.name}, ${game.away.name}`);
                continue;
            }

            if (typeof game.home.score !== 'number' || game.home.score < 0 || typeof game.away.score !== 'number' || game.away.score < 0) {
                logger.error(`Invalid scores: ${game.home.score}, ${game.away.score}`);
                continue;
            }

            if(!teams.includes(game.home.name) || !teams.includes(game.away.name)){
                continue;
            }

            if(game.home.score < 0 || game.away.score < 0 || game.home.score > 100 || game.away.score > 100){
                continue;
            }

            const gameInDb: Game = {
                home: game.home,
                away: game.away,
                homeScore: game.home.score,
                awayScore: game.away.score,
                date: gameday.date
            };
            
            const insertedGameday = await insertGame(gameInDb);
            
            if(!insertedGameday){
                logger.error(`Failed to insert game ${gameInDb.home.name} vs ${gameInDb.away.name}`);
                continue;
            }
            console.info(`Created game ${gameInDb.home.name} vs ${gameInDb.away.name} on ${gameInDb.date}`);
        }
    }
    await poolEnd();
}

setupData(new Logger()).catch((error) => {
    console.error('Failed to setup data', error);
    poolEnd();
});