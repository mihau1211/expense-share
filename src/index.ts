import app from './app'
import dotenv from 'dotenv'
import path from 'path';

const envPath = path.join(__dirname, '../config/dev.env');
dotenv.config({ path: envPath });

app.listen(process.env.PORT, () => {
    console.log('Server is up on port ' + 3000)
})