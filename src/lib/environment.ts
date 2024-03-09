import dotenv from 'dotenv';
import { Logger } from './logger';



const DEFAULT_PORT = 3000;

dotenv.config();



interface ParsedEnv {
    port: number;
    sessionSecret: string;
    databaseUrl: string;
}

let parsedEnv: ParsedEnv | null = null;

export function environment(env: NodeJS.ProcessEnv, logger: Logger){

    if(parsedEnv){
        return parsedEnv;
    }

    const {
        PORT: port,
        SESSION_SECRET: sessionSecret,
        DATABASE_URL: databaseUrl,
    } = env;

    let error: Boolean = false;

    if(!sessionSecret || sessionSecret.length < 32){
        logger.error('SESSION_SECRET must be a string and be at least 32 characters long');
        error = true;
    }

    if(!databaseUrl || databaseUrl.length < 1){
        logger.error('DATABASE_URL must be a string');
        error = true;
    }

    let usedPort;
    const parsedPort = Number.parseInt(port ?? '', 10);

    if(port && Number.isNaN(parsedPort)){
        logger.error('PORT must be a number', port);
        usedPort = parsedPort;
        error = true;
    } else if(parsedPort){
        usedPort = parsedPort;
    } else {
        logger.info('PORT not defined, using default', DEFAULT_PORT.toString());
    }
    if(error){
        return null;
    }

    parsedEnv ={
        port: usedPort ?? 0,
        sessionSecret: sessionSecret || '',
        databaseUrl: databaseUrl || '',
    };

    return parsedEnv;
}

