const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const lora_packet = require("lora-packet");

server.on('error', (err) => {
  console.log(`Server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`Server received: ${msg.toString('base64')} from ${rinfo.address}:${rinfo.port}`);
  const packet = lora_packet.fromWire(Buffer.from(msg, "base64"));
  console.log("packet.toString()=\n" + packet);
const AppSKey = Buffer.from("E258EE15D4B1F3986AE2213A271D5B17", "hex");
const NwkSKey = Buffer.from("85AD15C00DFC0BB62278255EEC892BB6", "hex");

if(lora_packet.verifyMIC(packet,NwkSKey)){
//déchiffrement du packet
console.log("Message reçu décodé :'" + lora_packet.decrypt(packet, AppSKey).toString() + "'");
}
else {console.log("le MIC ne correspond pas")}
});

server.on('listening', () => {
  const address = server.address();
  console.log(`Server listening ${address.address}:${address.port}`);
});

// Remplacez 41234 par votre port d'écoute
server.bind(41234);
// Le serveur écoute sur le port 41234
