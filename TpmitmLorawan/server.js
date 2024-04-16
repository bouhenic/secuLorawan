const dgram = require('dgram');
const fs = require('fs');
const yaml = require('js-yaml');
const lora_packet = require("lora-packet");
const server = dgram.createSocket('udp4');

// Charger les configurations depuis le fichier YAML
const configPath = '/TpmitmLorawan/config.yaml';
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
const AppSKey = Buffer.from(config.AppSKey, "hex");
const NwkSKey = Buffer.from(config.NwkSKey, "hex");

server.on('error', (err) => {
    console.log(`Server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(`Server received: ${msg.toString('hex')} from ${rinfo.address}:${rinfo.port}`);
    const packet = lora_packet.fromWire(msg);

    if(lora_packet.verifyMIC(packet, NwkSKey, AppSKey)) {
        const decryptedPayload = lora_packet.decrypt(packet, AppSKey, NwkSKey);
        console.log("Message reçu décodé :'" + decryptedPayload.toString() + "'");
    } else {
        console.log("Le MIC ne correspond pas.");
    }
});

server.on('listening', () => {
    const address = server.address();
    console.log(`Server listening ${address.address}:${address.port}`);
});

server.bind(12345);  // Assurez-vous que c'est le bon port
