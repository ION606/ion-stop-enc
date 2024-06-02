import fs, { read } from 'fs';
import express from 'express';
import cors from 'cors';
import { encrypt, decrypt } from './enc.js';
import bodyParser from 'body-parser';
import multer from 'multer';
import stream from 'stream';


const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const upload = multer({ storage: multer.memoryStorage() });


app.get('/', (_, res) => res.sendFile('index.html', { root: '.' }));

app.post('/encrypt', upload.single('file'), (req, res) => {
    const password = req.body.password,
        toEnc = req.file?.buffer || req.body.text;

    if (!password || !toEnc) return res.sendStatus(400);

    const encrypted = encrypt(toEnc, password);
    if (!encrypted) return res.sendStatus(500);

    res.set('Content-disposition', 'attachment; filename=' + req.file.originalname || "file.txt");
    res.set('Content-Type', req.file.mimetype);

    res.send(Buffer.from(encrypted, 'base64'));
});


app.post('/decrypt', upload.single('file'), (req, res) => {
    const password = req.body.password,
        toDec = req.file?.buffer?.toString('base64');

    if (!password || !toDec) return res.sendStatus(400);

    const decrypted = decrypt(toDec, password);
    if (!decrypted) return res.sendStatus(401);

    res.set('Content-disposition', 'attachment; filename=' + req.file.originalname || "file.txt");
    res.set('Content-Type', req.file.mimetype);
    res.send(decrypted);
});


app.listen(PORT, () => console.log(`app listening on port ${PORT}`));