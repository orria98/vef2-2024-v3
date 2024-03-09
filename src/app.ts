import express from 'express';
import { catchErrors } from './lib/catch-errors.js';
import { router, bye, hello, error, index} from './routes/api.js';
import { logger } from './lib/logger.js';
import { environment } from './lib/environment.js';
import { cors } from './lib/cors.js';

const app = express();
app.get('/', catchErrors(index));
app.use(express.json);

app.use(cors);
app.use(router);



const env = environment(process.env, logger);

if(!env){
  process.exit(1);
}

const {port} = env;


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
