const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const lora_packet = require("lora-packet");
const readline = require('readline');

// Créer une interface readline pour lire depuis le terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Poser une question à l'utilisateur et attendre la réponse
rl.question('Veuillez entrer le payload à transmettre: ', (userInput) => {
  // Création du paquet LoRa avec le payload fourni par l'utilisateur
  const constructedPacket = lora_packet.fromFields(
    {
      MType: "Unconfirmed Data Up", // (default)
      DevAddr: Buffer.from("260BEF25", "hex"), // big-endian
      FCtrl: {
        ADR: true, // default = false
        ACK: false, // default = false
        ADRACKReq: false, // default = false
        FPending: false, // default = false
      },
      FCnt: 41631, // Utilisez le FCnt fourni
      FPort: 2, // Utilisez le FPort fourni
      payload: Buffer.from(userInput), // Utilisez le FRMPayload fourni par l'utilisateur
    },
    Buffer.from("E258EE15D4B1F3986AE2213A271D5B17", "hex"), // AppSKey
    Buffer.from("85AD15C00DFC0BB62278255EEC892BB6", "hex") // NwkSKey
  );

  const wireFormatPacket = constructedPacket.getPHYPayload();

  // Envoi du paquet via UDP
  client.send(wireFormatPacket, 0, wireFormatPacket.length, 41234, 'localhost', (err) => {
    if (err) throw err;
    console.log('Message envoyé:', wireFormatPacket.toString('base64')); // Affiche la chaîne Base64
    console.log('Message transmis non chiffré :' + userInput);
    client.close();
    rl.close(); // Fermer l'interface readline après l'envoi
  });
});
