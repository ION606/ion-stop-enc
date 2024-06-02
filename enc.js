import { pbkdf2Sync, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const getIVandSalt = () => ({ iv: Buffer.from(process.env.iv, 'hex'), salt: Buffer.from(process.env.salt, 'hex') });

// Function to generate a key from a password
function generateKey(password, salt) {
    return pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

// Function to encrypt a message
export function encryptInitEnc(buffer, password) {
    const salt = randomBytes(16); // Generate a new salt
    const key = generateKey(password, salt);
    const iv = randomBytes(16); // Initialization vector
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        encryptedData: encrypted.toString('base64')
    };
}

/**
 * @param {Buffer} buffer 
 * @param {string} password 
 * @returns 
 */
export function encrypt(buffer, password) {
    try {
        const { iv, salt } = getIVandSalt();
        const key = generateKey(password, salt);
        const cipher = createCipheriv('aes-256-cbc', key, iv);

        return Buffer.concat([cipher.update(buffer), cipher.final()]).toString('base64');
    }
    catch (err) {
        console.error(err);
        return null;
    }
}

// Function to decrypt a message
export function decrypt(encryptedData, password) {
    try {
        const { iv, salt } = getIVandSalt();
        const key = generateKey(password, salt);
        const decipher = createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedData, 'base64')), decipher.final()]);
        return decrypted;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}

// fs.writeFileSync('TODEC.gif', Buffer.from(encrypt(fs.readFileSync('TOENC.gif'), 'egg'), 'base64'));
// fs.writeFileSync('DEC.gif', decrypt(fs.readFileSync('TOENC.gif').toString('base64'), 'egg'));